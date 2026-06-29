import React, { useState, useMemo, useEffect } from 'react';
import { FiSearch, FiDownload, FiChevronDown, FiChevronUp, FiLink, FiRefreshCw, FiPlus, FiX } from 'react-icons/fi';
import '../tables.css';

const Performance = () => {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFunnel, setFilterFunnel] = useState('All');
  const [filterRatio, setFilterRatio] = useState('All');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // State untuk form manual
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    metaLink: '',
    budget: '',
    kontak: '',
    biayaKontak: '',
    closing: '',
    cac: '',
    cpm: '',
    cpc: '',
    ctrManual: '',
    klikTautan: '',
    tayanganLandas: '',
    roas: '',
    rasioLandas: '',
    biayaLandas: ''
  });

  // Helper fungsi untuk fitur otomatis
  const parseNumber = (val) => {
    if (!val) return 0;
    let clean = String(val).replace(/Rp\s?/ig, '').replace(/\./g, '').replace(/,/g, '.').replace(/%/g, '').trim();
    const num = parseFloat(clean);
    return isNaN(num) ? 0 : num;
  };

  const formatRp = (num) => {
    if (!num || !isFinite(num)) return '';
    return 'Rp ' + Math.round(num).toLocaleString('id-ID');
  };

  const formatPercent = (num) => {
    if (!num || !isFinite(num)) return '';
    return (num * 100).toFixed(2).replace('.', ',') + '%';
  };

  // Fitur Kalkulasi Otomatis
  useEffect(() => {
    if (!isModalOpen) return;
    
    const budget = parseNumber(formData.budget);
    const kontak = parseNumber(formData.kontak);
    const closing = parseNumber(formData.closing);
    const klikTautan = parseNumber(formData.klikTautan);
    const tayanganLandas = parseNumber(formData.tayanganLandas);

    setFormData(prev => {
      const updates = {};
      
      updates.biayaKontak = (budget > 0 && kontak > 0) ? formatRp(budget / kontak) : '';
      updates.cac = (kontak > 0 && closing > 0) ? formatPercent(closing / kontak) : '';
      updates.cpc = (budget > 0 && klikTautan > 0) ? formatRp(budget / klikTautan) : '';
      updates.rasioLandas = (klikTautan > 0 && tayanganLandas > 0) ? formatPercent(tayanganLandas / klikTautan) : '';
      updates.biayaLandas = (budget > 0 && tayanganLandas > 0) ? formatRp(budget / tayanganLandas) : '';
      
      let hasChanges = false;
      Object.keys(updates).forEach(k => {
        if (updates[k] !== prev[k]) hasChanges = true;
      });
      
      return hasChanges ? { ...prev, ...updates } : prev;
    });
  }, [formData.budget, formData.kontak, formData.closing, formData.klikTautan, formData.tayanganLandas, isModalOpen]);

  // Load dari API Vercel / Neon DB
  const fetchData = () => {
    fetch('/api/performance')
      .then(res => {
        if (!res.ok) throw new Error('API not available');
        return res.json();
      })
      .then(dbData => setData(dbData))
      .catch(err => {
        console.warn('Gagal fetch API, fallback ke localStorage:', err.message);
        const saved = localStorage.getItem('performanceData_v2');
        if (saved) {
          setData(JSON.parse(saved));
        }
      });
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // Polling setiap 10 detik
    return () => clearInterval(interval);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    const currencyFields = ['budget', 'biayaKontak', 'cpm', 'cpc', 'biayaLandas'];
    const numberFields = ['kontak', 'closing', 'klikTautan', 'tayanganLandas'];
    
    if (currencyFields.includes(name)) {
      const raw = value.replace(/\D/g, '');
      if (raw) {
        const formatted = 'Rp ' + parseInt(raw, 10).toLocaleString('id-ID');
        setFormData(prev => ({ ...prev, [name]: formatted }));
      } else {
        setFormData(prev => ({ ...prev, [name]: '' }));
      }
    } else if (numberFields.includes(name)) {
      const raw = value.replace(/\D/g, '');
      if (raw) {
        const formatted = parseInt(raw, 10).toLocaleString('id-ID');
        setFormData(prev => ({ ...prev, [name]: formatted }));
      } else {
        setFormData(prev => ({ ...prev, [name]: '' }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSaveManual = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const payload = { ...formData };

      const res = await fetch('/api/performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Gagal simpan ke DB');
      
      setIsModalOpen(false);
      setFormData({ title: '', metaLink: '', budget: '', kontak: '', biayaKontak: '', closing: '', cac: '', cpm: '', cpc: '', ctrManual: '', klikTautan: '', tayanganLandas: '', roas: '', rasioLandas: '', biayaLandas: '' });
      fetchData(); // Refresh UI langsung
    } catch (err) {
      console.warn('Mode Lokal: Menyimpan ke localStorage karena DB tidak tersedia');
      
      const newId = data.length > 0 ? Math.max(...data.map(d => d.id)) + 1 : 1;
      const newData = { id: newId, ...formData };

      const updatedData = [newData, ...data];
      setData(updatedData);
      localStorage.setItem('performanceData_v2', JSON.stringify(updatedData));
      
      setIsModalOpen(false);
      setFormData({ title: '', metaLink: '', budget: '', kontak: '', biayaKontak: '', closing: '', cac: '', cpm: '', cpc: '', ctrManual: '', klikTautan: '', tayanganLandas: '', roas: '', rasioLandas: '', biayaLandas: '' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus data sinkronisasi ini?')) return;
    
    try {
      const res = await fetch(`/api/performance?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Gagal menghapus di DB');
      
      fetchData();
    } catch (err) {
      const updatedData = data.filter(item => item.id !== id);
      setData(updatedData);
      localStorage.setItem('performanceData_v2', JSON.stringify(updatedData));
    }
  };

  const handleMakeWinning = async (item) => {
    if (!window.confirm(`Jadikan "${item.title}" sebagai Winning Content?`)) return;
    
    // Sinkronisasi data dari Performa ke Winning
    const payload = {
      title: item.title,
      adId: item.metaLink || '-',
      ctr: (item.ctrManual || '0').replace('%', ''), // Menghilangkan persen untuk disimpan
      transactions: item.closing || '0',
      budgetSpent: item.budget ? item.budget.replace(/\D/g, '') : 0, // Ambil angka murninya
      roas: item.roas || '0',
      faktorSukses: 'Dipindah otomatis dari Performa Konten',
      skalaTindakan: 'Scale Up Budget'
    };

    try {
      const res = await fetch('/api/winning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Gagal memindahkan ke DB');
      alert('Berhasil disinkronkan ke Winning Content!');
    } catch (err) {
      // Fallback ke localStorage
      const saved = localStorage.getItem('winningData');
      const winningList = saved ? JSON.parse(saved) : [];
      const newId = winningList.length > 0 ? Math.max(...winningList.map(d => d.id)) + 1 : 1;
      const newData = { id: newId, ...payload };
      winningList.unshift(newData);
      localStorage.setItem('winningData', JSON.stringify(winningList));
      
      alert('Berhasil disinkronkan ke Winning Content (Mode Lokal)!');
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const processedData = useMemo(() => {
    let filtered = data.filter(item => {
      return item.title.toLowerCase().includes(searchTerm.toLowerCase());
    });

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];
        
        if (sortConfig.key === 'ctr' || sortConfig.key === 'conversionRate' || sortConfig.key === 'roas') {
          aValue = parseFloat(aValue);
          bValue = parseFloat(bValue);
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return filtered;
  }, [searchTerm, sortConfig, data]);

  const renderSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? <FiChevronUp /> : <FiChevronDown />;
  };

  const handleExportCSV = () => {
    const headers = ["Judul Konten", "Link Konten", "Budget", "Kontak", "Biaya Kontak", "Closing", "CAC", "CPM", "CPC", "CTR", "Klik Tautan", "Tayangan Landas", "ROAS", "Rasio Landas", "Biaya Landas"];
    
    const csvRows = [
      headers.join(","),
      ...processedData.map(item => [
        `"${item.title}"`,
        `"${item.metaLink || '-'}"`,
        `"${item.budget || '-'}"`,
        `"${item.kontak || '-'}"`,
        `"${item.biayaKontak || '-'}"`,
        `"${item.closing || '-'}"`,
        `"${item.cac || '-'}"`,
        `"${item.cpm || '-'}"`,
        `"${item.cpc || '-'}"`,
        `"${item.ctrManual || '-'}"`,
        `"${item.klikTautan || '-'}"`,
        `"${item.tayanganLandas || '-'}"`,
        `"${item.roas || '-'}"`,
        `"${item.rasioLandas || '-'}"`,
        `"${item.biayaLandas || '-'}"`
      ].join(","))
    ];

    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "Laporan_Performa_Konten.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="page-container">
      <div className="flex-between mb-4">
        <h2>Performa Konten</h2>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="action-btn" onClick={() => setIsModalOpen(true)}>
            <FiPlus /> Tambah Data
          </button>
          <button className="action-btn secondary" onClick={handleExportCSV}>
            <FiDownload /> Export CSV
          </button>
        </div>
      </div>

      <div className="filters-bar">
        <div className="search-box">
          <FiSearch className="search-icon" />
          <input 
            type="text" 
            placeholder="Cari konten..." 
            className="filter-input pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('title')} style={{cursor: 'pointer'}}>Konten {renderSortIcon('title')}</th>
              <th onClick={() => handleSort('budget')} style={{cursor: 'pointer'}}>Budget {renderSortIcon('budget')}</th>
              <th onClick={() => handleSort('kontak')} style={{cursor: 'pointer'}}>Kontak {renderSortIcon('kontak')}</th>
              <th onClick={() => handleSort('biayaKontak')} style={{cursor: 'pointer'}}>Biaya Kontak {renderSortIcon('biayaKontak')}</th>
              <th onClick={() => handleSort('closing')} style={{cursor: 'pointer'}}>Closing {renderSortIcon('closing')}</th>
              <th onClick={() => handleSort('cac')} style={{cursor: 'pointer'}}>CAC {renderSortIcon('cac')}</th>
              <th onClick={() => handleSort('cpm')} style={{cursor: 'pointer'}}>CPM {renderSortIcon('cpm')}</th>
              <th onClick={() => handleSort('cpc')} style={{cursor: 'pointer'}}>CPC {renderSortIcon('cpc')}</th>
              <th onClick={() => handleSort('ctrManual')} style={{cursor: 'pointer'}}>CTR {renderSortIcon('ctrManual')}</th>
              <th onClick={() => handleSort('klikTautan')} style={{cursor: 'pointer'}}>Klik Tautan {renderSortIcon('klikTautan')}</th>
              <th onClick={() => handleSort('tayanganLandas')} style={{cursor: 'pointer'}}>Tayangan Landas {renderSortIcon('tayanganLandas')}</th>
              <th onClick={() => handleSort('roas')} style={{cursor: 'pointer'}}>ROAS {renderSortIcon('roas')}</th>
              <th onClick={() => handleSort('rasioLandas')} style={{cursor: 'pointer'}}>Rasio Landas {renderSortIcon('rasioLandas')}</th>
              <th onClick={() => handleSort('biayaLandas')} style={{cursor: 'pointer'}}>Biaya Landas {renderSortIcon('biayaLandas')}</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {processedData.map((item) => (
              <tr key={item.id}>
                <td className="font-medium">
                  {item.title}
                  {item.metaLink && item.metaLink !== '-' && (
                    <div style={{ marginTop: '0.25rem' }}>
                      <a href={item.metaLink} target="_blank" rel="noreferrer" style={{ fontSize: '0.75rem', color: 'var(--primary-color)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <FiLink size={12} /> Meta Ads
                      </a>
                    </div>
                  )}
                </td>
                <td>{item.budget || '-'}</td>
                <td>{item.kontak || '-'}</td>
                <td>{item.biayaKontak || '-'}</td>
                <td>{item.closing || '-'}</td>
                <td>{item.cac || '-'}</td>
                <td>{item.cpm || '-'}</td>
                <td>{item.cpc || '-'}</td>
                <td>{item.ctrManual || '-'}</td>
                <td>{item.klikTautan || '-'}</td>
                <td>{item.tayanganLandas || '-'}</td>
                <td>{item.roas || '-'}</td>
                <td>{item.rasioLandas || '-'}</td>
                <td>{item.biayaLandas || '-'}</td>
                <td style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                  <button 
                    className="action-btn"
                    onClick={() => handleMakeWinning(item)}
                    style={{ backgroundColor: 'var(--success-color)', color: 'white', padding: '0.4rem 0.6rem', fontSize: '0.75rem', minWidth: 'auto' }}
                    title="Jadikan Winning"
                  >
                    🏆
                  </button>
                  <button 
                    className="action-btn"
                    onClick={() => handleDelete(item.id)}
                    style={{ backgroundColor: 'var(--danger-color)', color: 'white', padding: '0.4rem 0.6rem', fontSize: '0.75rem', minWidth: 'auto' }}
                    title="Hapus Data"
                  >
                    &times;
                  </button>
                </td>
              </tr>
            ))}
            {processedData.length === 0 && (
              <tr>
                <td colSpan="11" style={{ textAlign: 'center', padding: '2rem' }}>Tidak ada data yang cocok dengan pencarian Anda.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="modal-overlay" style={{ padding: '1rem' }}>
          <div className="modal-content" style={{ width: '100%', maxWidth: '800px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            <div className="modal-header">
              <h3>Tambah Data Performa Konten</h3>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}><FiX /></button>
            </div>
            <form onSubmit={handleSaveManual} style={{ padding: '1.5rem', overflowY: 'auto' }}>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Judul Konten</label>
                <input type="text" name="title" className="filter-input" style={{ width: '100%', boxSizing: 'border-box' }} value={formData.title} onChange={handleInputChange} required />
              </div>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Link Referensi / Meta Link (Opsional)</label>
                <input type="text" name="metaLink" className="filter-input" style={{ width: '100%', boxSizing: 'border-box' }} value={formData.metaLink} onChange={handleInputChange} />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Budget</label>
                  <input type="text" name="budget" className="filter-input" style={{ width: '100%', boxSizing: 'border-box' }} value={formData.budget} onChange={handleInputChange} placeholder="Contoh: Rp 18.272.227" />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Kontak</label>
                  <input type="text" name="kontak" className="filter-input" style={{ width: '100%', boxSizing: 'border-box' }} value={formData.kontak} onChange={handleInputChange} placeholder="Contoh: 225" />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Biaya Kontak</label>
                  <input type="text" name="biayaKontak" className="filter-input" style={{ width: '100%', boxSizing: 'border-box' }} value={formData.biayaKontak} onChange={handleInputChange} placeholder="Contoh: Rp 81.210" />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Closing</label>
                  <input type="text" name="closing" className="filter-input" style={{ width: '100%', boxSizing: 'border-box' }} value={formData.closing} onChange={handleInputChange} placeholder="Contoh: 81" />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>CAC</label>
                  <input type="text" name="cac" className="filter-input" style={{ width: '100%', boxSizing: 'border-box' }} value={formData.cac} onChange={handleInputChange} placeholder="Contoh: 61,84%" />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>CPM</label>
                  <input type="text" name="cpm" className="filter-input" style={{ width: '100%', boxSizing: 'border-box' }} value={formData.cpm} onChange={handleInputChange} placeholder="Contoh: Rp 29.495" />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>CPC</label>
                  <input type="text" name="cpc" className="filter-input" style={{ width: '100%', boxSizing: 'border-box' }} value={formData.cpc} onChange={handleInputChange} placeholder="Contoh: Rp 2.316" />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>CTR</label>
                  <input type="text" name="ctrManual" className="filter-input" style={{ width: '100%', boxSizing: 'border-box' }} value={formData.ctrManual} onChange={handleInputChange} placeholder="Contoh: 1,27%" />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Klik Tautan</label>
                  <input type="text" name="klikTautan" className="filter-input" style={{ width: '100%', boxSizing: 'border-box' }} value={formData.klikTautan} onChange={handleInputChange} placeholder="Contoh: 7.889" />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Tayangan Landas</label>
                  <input type="text" name="tayanganLandas" className="filter-input" style={{ width: '100%', boxSizing: 'border-box' }} value={formData.tayanganLandas} onChange={handleInputChange} placeholder="Contoh: 5.013" />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>ROAS</label>
                  <input type="text" name="roas" className="filter-input" style={{ width: '100%', boxSizing: 'border-box' }} value={formData.roas} onChange={handleInputChange} placeholder="Contoh: 1.8" />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Rasio Landas</label>
                  <input type="text" name="rasioLandas" className="filter-input" style={{ width: '100%', boxSizing: 'border-box' }} value={formData.rasioLandas} onChange={handleInputChange} placeholder="Contoh: 63,54%" />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Biaya Landas</label>
                  <input type="text" name="biayaLandas" className="filter-input" style={{ width: '100%', boxSizing: 'border-box' }} value={formData.biayaLandas} onChange={handleInputChange} placeholder="Contoh: Rp 3.645" />
                </div>
              </div>
              <div className="modal-footer" style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" className="action-btn secondary" onClick={() => setIsModalOpen(false)}>Batal</button>
                <button type="submit" className="action-btn" disabled={isSaving}>
                  {isSaving ? 'Menyimpan...' : 'Simpan Data'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Performance;
