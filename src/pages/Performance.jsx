import React, { useState, useMemo, useEffect } from 'react';
import { FiSearch, FiDownload, FiChevronDown, FiChevronUp, FiLink, FiRefreshCw, FiPlus, FiX } from 'react-icons/fi';
import '../tables.css';

const Performance = () => {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFunnel, setFilterFunnel] = useState('All');
  const [filterRatio, setFilterRatio] = useState('All');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // State untuk form manual
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    metaLink: '',
    funnel: 'Cold',
    ratio: '1:1',
    impressions: '',
    clicks: '',
    transactions: '',
    roas: ''
  });

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
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveManual = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const payload = {
        title: formData.title,
        metaLink: formData.metaLink,
        funnel: formData.funnel,
        ratio: formData.ratio,
        impressions: parseInt(formData.impressions || 0, 10),
        clicks: parseInt(formData.clicks || 0, 10),
        transactions: parseInt(formData.transactions || 0, 10),
        roas: parseFloat(formData.roas || 0).toFixed(2)
      };

      const res = await fetch('/api/performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Gagal simpan ke DB');
      
      setIsModalOpen(false);
      setFormData({ title: '', metaLink: '', funnel: 'Cold', ratio: '1:1', impressions: '', clicks: '', transactions: '', roas: '' });
      fetchData(); // Refresh UI langsung
    } catch (err) {
      console.warn('Mode Lokal: Menyimpan ke localStorage karena DB tidak tersedia');
      
      const newId = data.length > 0 ? Math.max(...data.map(d => d.id)) + 1 : 1;
      const ctr = formData.impressions ? ((formData.clicks / formData.impressions) * 100).toFixed(2) : '0.00';
      const conversionRate = formData.clicks ? ((formData.transactions / formData.clicks) * 100).toFixed(2) : '0.00';
      
      const newData = {
        id: newId,
        title: formData.title,
        funnel: formData.funnel,
        ratio: formData.ratio,
        impressions: parseInt(formData.impressions || 0, 10),
        clicks: parseInt(formData.clicks || 0, 10),
        ctr,
        transactions: parseInt(formData.transactions || 0, 10),
        conversionRate,
        roas: parseFloat(formData.roas || 0).toFixed(2),
        metaLink: formData.metaLink
      };

      const updatedData = [newData, ...data];
      setData(updatedData);
      localStorage.setItem('performanceData_v2', JSON.stringify(updatedData));
      
      setIsModalOpen(false);
      setFormData({ title: '', metaLink: '', funnel: 'Cold', ratio: '1:1', impressions: '', clicks: '', transactions: '', roas: '' });
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
    try {
      const payload = {
        title: item.title,
        adId: item.metaLink,
        ctr: item.ctr,
        transactions: item.transactions,
        budgetSpent: 0,
        roas: item.roas,
        faktorSukses: 'Dipindah otomatis dari Performa Konten',
        skalaTindakan: 'Scale Up Budget'
      };
      await fetch('/api/winning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      alert('Berhasil dipindahkan ke Winning Content!');
    } catch (err) {
      alert('Gagal memindahkan data.');
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
      const matchSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchFunnel = filterFunnel === 'All' || item.funnel === filterFunnel;
      const matchRatio = filterRatio === 'All' || item.ratio === filterRatio;
      return matchSearch && matchFunnel && matchRatio;
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
  }, [searchTerm, filterFunnel, filterRatio, sortConfig, data]);

  const renderSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? <FiChevronUp /> : <FiChevronDown />;
  };

  const handleExportCSV = () => {
    const headers = ["Konten", "Link Konten", "Funnel", "Ratio", "Impressions", "Clicks", "CTR (%)", "Konversi", "CVR (%)", "ROAS"];
    
    const csvRows = [
      headers.join(","),
      ...processedData.map(item => [
        `"${item.title}"`,
        `"${item.metaLink || '-'}"`,
        `"${item.funnel}"`,
        `"${item.ratio}"`,
        item.impressions,
        item.clicks,
        item.ctr,
        item.transactions,
        item.conversionRate,
        item.roas
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
        <select className="filter-input" value={filterFunnel} onChange={(e) => setFilterFunnel(e.target.value)}>
          <option value="All">Semua Funnel</option>
          <option value="Cold">Cold</option>
          <option value="Warm">Warm</option>
          <option value="Hot">Hot</option>
        </select>
        <select className="filter-input" value={filterRatio} onChange={(e) => setFilterRatio(e.target.value)}>
          <option value="All">Semua Ratio</option>
          <option value="1:1">1:1</option>
          <option value="4:5">4:5</option>
          <option value="9:16">9:16</option>
        </select>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('title')} style={{cursor: 'pointer'}}>Konten {renderSortIcon('title')}</th>
              <th>Link Konten</th>
              <th onClick={() => handleSort('funnel')} style={{cursor: 'pointer'}}>Funnel {renderSortIcon('funnel')}</th>
              <th onClick={() => handleSort('ratio')} style={{cursor: 'pointer'}}>Ratio {renderSortIcon('ratio')}</th>
              <th onClick={() => handleSort('impressions')} style={{cursor: 'pointer'}}>Impressions {renderSortIcon('impressions')}</th>
              <th onClick={() => handleSort('clicks')} style={{cursor: 'pointer'}}>Clicks {renderSortIcon('clicks')}</th>
              <th onClick={() => handleSort('ctr')} style={{cursor: 'pointer'}}>CTR (%) {renderSortIcon('ctr')}</th>
              <th onClick={() => handleSort('transactions')} style={{cursor: 'pointer'}}>Konversi {renderSortIcon('transactions')}</th>
              <th onClick={() => handleSort('conversionRate')} style={{cursor: 'pointer'}}>CVR (%) {renderSortIcon('conversionRate')}</th>
              <th onClick={() => handleSort('roas')} style={{cursor: 'pointer'}}>ROAS {renderSortIcon('roas')}</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {processedData.map((item) => (
              <tr key={item.id}>
                <td className="font-medium">{item.title}</td>
                <td>
                  {item.metaLink && item.metaLink !== '-' ? (
                    <a href={item.metaLink} target="_blank" rel="noreferrer" style={{ color: 'var(--primary-color)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <FiLink size={14} /> Meta Ads
                    </a>
                  ) : (
                    <span className="text-muted">-</span>
                  )}
                </td>
                <td><span className={`badge ${item.funnel === 'Hot' ? 'badge-danger' : item.funnel === 'Warm' ? 'badge-warning' : 'badge-info'}`}>{item.funnel}</span></td>
                <td>{item.ratio}</td>
                <td>{item.impressions.toLocaleString()}</td>
                <td>{item.clicks.toLocaleString()}</td>
                <td>
                  <span style={{ color: parseFloat(item.ctr) > 2 ? 'var(--success-color)' : 'inherit' }}>
                    {item.ctr}%
                  </span>
                </td>
                <td>{item.transactions}</td>
                <td>{item.conversionRate}%</td>
                <td>
                  <span style={{ color: parseFloat(item.roas) >= 3 ? 'var(--success-color)' : parseFloat(item.roas) < 1.5 ? 'var(--danger-color)' : 'inherit', fontWeight: 'bold' }}>
                    {item.roas}x
                  </span>
                </td>
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
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3>Tambah Data Performa Konten</h3>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}><FiX /></button>
            </div>
            <form onSubmit={handleSaveManual}>
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
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Funnel</label>
                  <select name="funnel" className="filter-input" style={{ width: '100%', boxSizing: 'border-box' }} value={formData.funnel} onChange={handleInputChange}>
                    <option value="Cold">Cold</option>
                    <option value="Warm">Warm</option>
                    <option value="Hot">Hot</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Ratio</label>
                  <select name="ratio" className="filter-input" style={{ width: '100%', boxSizing: 'border-box' }} value={formData.ratio} onChange={handleInputChange}>
                    <option value="1:1">1:1</option>
                    <option value="4:5">4:5</option>
                    <option value="9:16">9:16</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Impressions</label>
                  <input type="number" name="impressions" className="filter-input" style={{ width: '100%', boxSizing: 'border-box' }} value={formData.impressions} onChange={handleInputChange} required />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Clicks</label>
                  <input type="number" name="clicks" className="filter-input" style={{ width: '100%', boxSizing: 'border-box' }} value={formData.clicks} onChange={handleInputChange} required />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Konversi (Transactions)</label>
                  <input type="number" name="transactions" className="filter-input" style={{ width: '100%', boxSizing: 'border-box' }} value={formData.transactions} onChange={handleInputChange} required />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>ROAS</label>
                  <input type="number" step="0.01" name="roas" className="filter-input" style={{ width: '100%', boxSizing: 'border-box' }} value={formData.roas} onChange={handleInputChange} required />
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
