import React, { useState, useEffect } from 'react';
import { monitoringData as initialData, teamData } from '../data/dummyData';
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiExternalLink, FiX, FiBell, FiDownload } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import '../tables.css';

const Monitoring = () => {
  const { currentUser } = useAuth();
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [teamMembers, setTeamMembers] = useState(teamData); // Default fallback


  const fetchData = () => {
    fetch('/api/monitoring')
      .then(res => {
        if (!res.ok) throw new Error('API not available locally without Vercel CLI');
        return res.json();
      })
      .then(dbData => {
        setData(dbData);
        setIsLoading(false);
      })
      .catch(err => {
        console.warn('Falling back to dummy data:', err.message);
        setData(initialData);
        setIsLoading(false);
      });
  };
  
  const fetchUsers = () => {
    fetch('/api/users')
      .then(res => res.ok ? res.json() : [])
      .then(users => {
        if (Array.isArray(users) && users.length > 0) {
          setTeamMembers(users);
        }
      })
      .catch(err => console.warn('Gagal memuat data tim', err));
  };

  useEffect(() => {
    fetchData();
    fetchUsers();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const [filterWeek, setFilterWeek] = useState('All');
  const [filterExecutor, setFilterExecutor] = useState('All');
  const [filterPic, setFilterPic] = useState('All');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
    week: 'Week 1 (1-7)',
    produk: '',
    linkKonten: '',
    tanggalKonten: '',
    judulKonten: '',
    jenisKonten: 'Gambar',
    ratio: '1:1',
    funnel: 'Cold',
    executorCWM: '',
    picKonten: '',
    status: 'Baru Masuk'
  });

  const filteredData = data.filter(item => {
    const matchesSearch = (item.judulKonten || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (item.executorCWM || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (item.produk || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesWeek = filterWeek === 'All' || (item.week || '').includes(filterWeek);
    const matchesExecutor = filterExecutor === 'All' || item.executorCWM === filterExecutor;
    const matchesPic = filterPic === 'All' || item.picKonten === filterPic;
    return matchesSearch && matchesWeek && matchesExecutor && matchesPic;
  });

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData(item);
    } else {
      setEditingItem(null);
      setFormData({
        week: 'Week 1 (1-7)',
        produk: '',
        linkKonten: '',
        tanggalKonten: '',
        judulKonten: '',
        jenisKonten: 'Gambar',
        ratio: '1:1',
        funnel: 'Cold',
        executorCWM: '',
        picKonten: '',
        status: 'Baru Masuk'
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        // Update existing via API
        const res = await fetch('/api/monitoring', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...formData, id: editingItem.id })
        });
        if (!res.ok) throw new Error('Gagal update data');
        const updatedItem = await res.json();
        setData(prev => prev.map(item => item.id === editingItem.id ? updatedItem : item));
      } else {
        // Create new via API
        const res = await fetch('/api/monitoring', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        if (!res.ok) throw new Error('Gagal menambah data');
        const newItem = await res.json();
        setData(prev => [newItem, ...prev]);
      }
    } catch (err) {
      console.error(err);
      alert('Mode Lokal: Gagal menyimpan ke database (pastikan Anda sudah deploy ke Vercel atau jalankan server lokal). Data hanya tersimpan sementara.');
      // Local fallback
      if (editingItem) {
        setData(prev => prev.map(item => item.id === editingItem.id ? { ...formData, id: item.id } : item));
      } else {
        setData(prev => [{ ...formData, id: Date.now() }, ...prev]);
      }
    }
    handleCloseModal();
  };

  const handleDelete = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus data ini?")) {
      try {
        const res = await fetch(`/api/monitoring?id=${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Gagal menghapus data');
        setData(prev => prev.filter(item => item.id !== id));
      } catch (err) {
        console.error(err);
        alert('Mode Lokal: Menghapus sementara di layar.');
        setData(prev => prev.filter(item => item.id !== id));
      }
    }
  };

  const handleInlineChange = async (item, field, newValue) => {
    const updatedItem = { ...item, [field]: newValue };
    
    // Optimistic UI update
    setData(prev => prev.map(d => d.id === item.id ? updatedItem : d));

    try {
      const res = await fetch('/api/monitoring', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedItem)
      });
      if (!res.ok) throw new Error('Gagal update inline');
    } catch (err) {
      console.warn('Fallback lokal update inline', err);
    }
  };

  const handleToggleStatus = async (item) => {
    const newStatus = item.status === 'Selesai' ? 'Proses' : 'Selesai';
    const updatedItem = { ...item, status: newStatus };
    
    // Optimistic UI update
    setData(prev => prev.map(d => d.id === item.id ? updatedItem : d));

    try {
      const res = await fetch('/api/monitoring', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedItem)
      });
      if (!res.ok) throw new Error('Gagal update status');
    } catch (err) {
      console.warn('Fallback lokal update status', err);
    }
  };

  const handleExportCSV = () => {
    if (filteredData.length === 0) {
      alert("Tidak ada data untuk diekspor!");
      return;
    }

    const headers = [
      "Status", "Week", "Produk", "Tanggal Konten", "Judul Konten", 
      "Jenis Konten", "Ratio", "Funnel", "Executor CWM", "PIC Konten (Adv/Skripter)", "Link Konten"
    ];

    const csvContent = [
      headers.join(","),
      ...filteredData.map(item => [
        `"${item.status || ''}"`,
        `"${item.week || ''}"`,
        `"${item.produk || ''}"`,
        `"${item.tanggalKonten || ''}"`,
        `"${item.judulKonten || ''}"`,
        `"${item.jenisKonten || ''}"`,
        `"${item.ratio || ''}"`,
        `"${item.funnel || ''}"`,
        `"${item.executorCWM || ''}"`,
        `"${item.picKonten || ''}"`,
        `"${item.linkKonten || ''}"`
      ].join(","))
    ].join("\\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Monitoring_Pekerjaan_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="page-container" style={{ position: 'relative' }}>
      <div className="flex-between mb-4">
        <h2>Monitoring Pekerjaan</h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="action-btn" onClick={handleExportCSV} style={{ backgroundColor: 'var(--success-color)' }}>
            <FiDownload /> Export CSV
          </button>
          <button className="action-btn" onClick={() => handleOpenModal()}>
            <FiPlus /> Tambah Data Pekerjaan
          </button>
        </div>
      </div>

      <div className="filters-bar" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <div className="search-box" style={{ flex: '1' }}>
          <FiSearch className="search-icon" />
          <input 
            type="text" 
            placeholder="Cari judul, PIC, produk..." 
            className="filter-input pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select 
          className="filter-input"
          value={filterWeek}
          onChange={(e) => setFilterWeek(e.target.value)}
        >
          <option value="All">Semua Week</option>
          <option value="Week 1">Week 1 (1-7)</option>
          <option value="Week 2">Week 2 (8-14)</option>
          <option value="Week 3">Week 3 (15-21)</option>
          <option value="Week 4">Week 4 (22-31)</option>
        </select>
        
        {/* Dropdown Filter Executor CWM */}
        <select 
          className="filter-input"
          value={filterExecutor}
          onChange={(e) => setFilterExecutor(e.target.value)}
        >
          <option value="All">Semua Executor CWM</option>
          {teamMembers.map(user => (
            <option key={`filter-exec-${user.id || user.name}`} value={user.name}>{user.name}</option>
          ))}
        </select>

        {/* Dropdown Filter PIC Konten */}
        <select 
          className="filter-input"
          value={filterPic}
          onChange={(e) => setFilterPic(e.target.value)}
        >
          <option value="All">Semua PIC Konten</option>
          {teamMembers.map(user => (
            <option key={`filter-pic-${user.id || user.name}`} value={user.name}>{user.name}</option>
          ))}
        </select>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Status</th>
              <th>Week</th>
              <th>Produk</th>
              <th>Link Konten</th>
              <th>Tanggal Konten</th>
              <th>Judul Konten</th>
              <th>Jenis Konten</th>
              <th>Ratio</th>
              <th>Funnel</th>
              <th>Executor CWM</th>
              <th>PIC Konten (Adv/Skripter)</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map(item => (
              <tr key={item.id}>
                <td style={{ textAlign: 'center' }}>
                  <input 
                    type="checkbox" 
                    checked={item.status === 'Selesai'} 
                    onChange={() => handleToggleStatus(item)}
                    style={{ transform: 'scale(1.5)', cursor: 'pointer' }}
                    title={item.status === 'Selesai' ? "Tandai Belum Selesai" : "Tandai Selesai"}
                  />
                  <div style={{ fontSize: '0.75rem', marginTop: '0.25rem', color: item.status === 'Selesai' ? 'var(--success-color)' : 'var(--warning-color)' }}>
                    {item.status === 'Selesai' ? 'Selesai' : 'Proses'}
                  </div>
                </td>
                <td><span className="badge badge-info">{item.week}</span></td>
                <td>{item.produk}</td>
                <td>
                  {item.linkKonten ? (
                    <a href={item.linkKonten} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-color)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                      Link <FiExternalLink />
                    </a>
                  ) : "-"}
                </td>
                <td>{item.tanggalKonten}</td>
                <td className="font-medium" style={{ textDecoration: item.status === 'Selesai' ? 'line-through' : 'none', opacity: item.status === 'Selesai' ? 0.6 : 1 }}>{item.judulKonten}</td>
                <td>{item.jenisKonten}</td>
                <td>{item.ratio}</td>
                <td>{item.funnel}</td>
                <td>
                  <select 
                    value={item.executorCWM || ''} 
                    onChange={(e) => handleInlineChange(item, 'executorCWM', e.target.value)}
                    style={{ padding: '0.35rem', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', width: '100%', minWidth: '120px', cursor: 'pointer' }}
                  >
                    <option value="" disabled>-- Pilih --</option>
                    {teamMembers.map(user => (
                      <option key={`inline-exec-${user.id || user.name}`} value={user.name}>{user.name}</option>
                    ))}
                    {item.executorCWM && !teamMembers.some(u => u.name === item.executorCWM) && (
                      <option value={item.executorCWM}>{item.executorCWM}</option>
                    )}
                  </select>
                </td>
                <td>
                  <select 
                    value={item.picKonten || ''} 
                    onChange={(e) => handleInlineChange(item, 'picKonten', e.target.value)}
                    style={{ padding: '0.35rem', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', width: '100%', minWidth: '120px', cursor: 'pointer' }}
                  >
                    <option value="" disabled>-- Pilih --</option>
                    {teamMembers.map(user => (
                      <option key={`inline-pic-${user.id || user.name}`} value={user.name}>{user.name}</option>
                    ))}
                    {item.picKonten && !teamMembers.some(u => u.name === item.picKonten) && (
                      <option value={item.picKonten}>{item.picKonten}</option>
                    )}
                  </select>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button style={{ color: 'var(--text-muted)' }} onClick={() => handleOpenModal(item)} title="Edit"><FiEdit2 /></button>
                    <button style={{ color: 'var(--danger-color)' }} onClick={() => handleDelete(item.id)} title="Hapus"><FiTrash2 /></button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredData.length === 0 && (
              <tr>
                <td colSpan="12" style={{ textAlign: 'center', padding: '2rem' }}>Tidak ada data monitoring ditemukan.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="modal-overlay" style={{ padding: '1rem' }}>
          <div className="modal-content" style={{ width: '100%', maxWidth: '800px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            <div className="modal-header">
              <h3>{editingItem ? "Edit Pekerjaan" : "Tambah Data Pekerjaan"}</h3>
              <button className="modal-close" onClick={handleCloseModal}><FiX size={24} /></button>
            </div>
            
            <form onSubmit={handleSave} className="modal-form" style={{ overflowY: 'auto' }}>
              <div className="form-row">
                <div className="form-group">
                  <label>Week</label>
                  <select name="week" value={formData.week} onChange={handleInputChange} required className="login-input">
                    <option value="Week 1 (1-7)">Week 1 (1-7)</option>
                    <option value="Week 2 (8-14)">Week 2 (8-14)</option>
                    <option value="Week 3 (15-21)">Week 3 (15-21)</option>
                    <option value="Week 4 (22-31)">Week 4 (22-31)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Tanggal Konten</label>
                  <input type="date" name="tanggalKonten" value={formData.tanggalKonten} onChange={handleInputChange} required className="login-input" />
                </div>
              </div>

              <div className="form-group">
                <label>Judul Konten</label>
                <input type="text" name="judulKonten" value={formData.judulKonten} onChange={handleInputChange} required className="login-input" placeholder="Masukkan judul konten..." />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Produk</label>
                  <input type="text" name="produk" value={formData.produk} onChange={handleInputChange} required className="login-input" placeholder="Nama Produk" />
                </div>
                <div className="form-group">
                  <label>Link Konten</label>
                  <input type="url" name="linkKonten" value={formData.linkKonten} className="login-input" placeholder="https://..." onChange={handleInputChange} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Jenis Konten</label>
                  <select name="jenisKonten" value={formData.jenisKonten} onChange={handleInputChange} required className="login-input">
                    <option value="Gambar">Gambar</option>
                    <option value="Video">Video</option>
                    <option value="Landing Page">Landing Page</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Ratio</label>
                  <select name="ratio" value={formData.ratio} onChange={handleInputChange} required className="login-input">
                    <option value="1:1">1:1</option>
                    <option value="4:5">4:5</option>
                    <option value="9:16">9:16</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Funnel</label>
                  <select name="funnel" value={formData.funnel} onChange={handleInputChange} required className="login-input">
                    <option value="Cold">Cold</option>
                    <option value="Warm">Warm</option>
                    <option value="Hot">Hot</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Executor CWM</label>
                  <select 
                    name="executorCWM" 
                    value={formData.executorCWM} 
                    onChange={handleInputChange} 
                    required 
                    className="login-input"
                    style={{ cursor: 'pointer', appearance: 'auto' }}
                  >
                    <option value="" disabled>-- Pilih Executor CWM --</option>
                    {teamMembers.map(user => (
                      <option key={`exec-${user.id || user.name}`} value={user.name}>{user.name} ({user.role})</option>
                    ))}
                    {formData.executorCWM && !teamMembers.some(u => u.name === formData.executorCWM) && (
                      <option value={formData.executorCWM}>{formData.executorCWM}</option>
                    )}
                  </select>
                </div>
                <div className="form-group">
                  <label>PIC Konten (Adv/Skripter)</label>
                  <select 
                    name="picKonten" 
                    value={formData.picKonten} 
                    onChange={handleInputChange} 
                    required 
                    className="login-input"
                    style={{ cursor: 'pointer', appearance: 'auto' }}
                  >
                    <option value="" disabled>-- Pilih PIC Konten --</option>
                    {teamMembers.map(user => (
                      <option key={`pic-${user.id || user.name}`} value={user.name}>{user.name} ({user.role})</option>
                    ))}
                    {formData.picKonten && !teamMembers.some(u => u.name === formData.picKonten) && (
                      <option value={formData.picKonten}>{formData.picKonten}</option>
                    )}
                  </select>
                </div>
              </div>

              <div className="modal-actions mt-4">
                <button type="button" className="btn-secondary" onClick={handleCloseModal}>Batal</button>
                <button type="submit" className="login-button mt-0" style={{ marginTop: 0 }}>Simpan Data</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Monitoring;
