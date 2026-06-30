import React, { useState, useEffect } from 'react';
import { monitoringData as initialData, teamData } from '../data/dummyData';
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiExternalLink, FiX, FiBell, FiCheckCircle } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import '../tables.css';

const Monitoring = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('CWM'); // 'CWM' or 'KOL'
  
  const [data, setData] = useState([]);
  const [dataKol, setDataKol] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [teamMembers, setTeamMembers] = useState(teamData); 
  const [notification, setNotification] = useState(null);

  const fetchData = () => {
    fetch('/api/monitoring')
      .then(res => res.ok ? res.json() : [])
      .then(dbData => {
        setData(Array.isArray(dbData) && dbData.length > 0 ? dbData : initialData);
      })
      .catch(err => {
        setData(initialData);
      });

    fetch('/api/monitoring?type=kol')
      .then(res => res.ok ? res.json() : [])
      .then(dbData => {
        setDataKol(Array.isArray(dbData) ? dbData : []);
      })
      .catch(err => {
        console.warn(err);
      });
      
    setIsLoading(false);
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
  const [formData, setFormData] = useState({});
  const [formDataKol, setFormDataKol] = useState({});

  const filteredData = data.filter(item => {
    const matchesSearch = (item.judulKonten || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (item.executorCWM || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (item.produk || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesWeek = filterWeek === 'All' || (item.week || '').includes(filterWeek);
    const matchesExecutor = filterExecutor === 'All' || item.executorCWM === filterExecutor;
    const matchesPic = filterPic === 'All' || item.picKonten === filterPic;
    return matchesSearch && matchesWeek && matchesExecutor && matchesPic;
  });

  const filteredKolData = dataKol.filter(item => {
    const matchesSearch = (item.namaKol || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (item.picKol || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (item.namaProduk || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesWeek = filterWeek === 'All' || (item.week || '').includes(filterWeek);
    const matchesExecutor = filterExecutor === 'All' || item.picKol === filterExecutor; // re-use executor filter for pic_kol
    return matchesSearch && matchesWeek && matchesExecutor;
  });

  const handleOpenModal = (item = null) => {
    if (activeTab === 'CWM') {
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
    } else {
      if (item) {
        setEditingItem(item);
        setFormDataKol(item);
      } else {
        setEditingItem(null);
        setFormDataKol({
          week: 'Week 1 (1-7)',
          namaKol: '',
          platform: 'TikTok',
          linkAkun: '',
          namaProduk: '',
          jenisKerjasama: 'Endorsement',
          picKol: '',
          status: 'Pendekatan'
        });
      }
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (activeTab === 'CWM') {
      setFormData(prev => ({ ...prev, [name]: value }));
    } else {
      setFormDataKol(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (activeTab === 'CWM') {
      try {
        if (editingItem) {
          const res = await fetch('/api/monitoring', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...formData, id: editingItem.id })
          });
          if (!res.ok) throw new Error('Gagal update data');
          const updatedItem = await res.json();
          setData(prev => prev.map(item => item.id === editingItem.id ? updatedItem : item));
        } else {
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
      }
    } else {
      try {
        if (editingItem) {
          const res = await fetch('/api/monitoring?type=kol', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...formDataKol, id: editingItem.id })
          });
          if (!res.ok) throw new Error('Gagal update data KOL');
          const updatedItem = await res.json();
          setDataKol(prev => prev.map(item => item.id === editingItem.id ? updatedItem : item));
        } else {
          const res = await fetch('/api/monitoring?type=kol', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formDataKol)
          });
          if (!res.ok) throw new Error('Gagal menambah data KOL');
          const newItem = await res.json();
          setDataKol(prev => [newItem, ...prev]);
        }
      } catch (err) {
        console.error(err);
      }
    }
    handleCloseModal();
  };

  const handleDelete = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus data ini?")) {
      const endpoint = activeTab === 'CWM' ? '/api/monitoring' : '/api/monitoring?type=kol';
      try {
        const res = await fetch(`${endpoint}?id=${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Gagal menghapus data');
        if (activeTab === 'CWM') {
          setData(prev => prev.filter(item => item.id !== id));
        } else {
          setDataKol(prev => prev.filter(item => item.id !== id));
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleInlineChange = async (item, field, newValue) => {
    if (activeTab === 'CWM') {
      const updatedItem = { ...item, [field]: newValue };
      setData(prev => prev.map(d => d.id === item.id ? updatedItem : d));

      if (field === 'status' && newValue === 'Selesai') {
        playNotifSound();
        setNotification('Pekerjaan CWM diselesaikan! 🎉');
        setTimeout(() => setNotification(null), 4000);
      }
      try {
        await fetch('/api/monitoring', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updatedItem) });
      } catch (err) {}
    } else {
      const updatedItem = { ...item, [field]: newValue };
      setDataKol(prev => prev.map(d => d.id === item.id ? updatedItem : d));

      if (field === 'status' && newValue === 'Selesai') {
        playNotifSound();
        setNotification('Pekerjaan KOL diselesaikan! 🎉');
        setTimeout(() => setNotification(null), 4000);
      }
      try {
        await fetch('/api/monitoring?type=kol', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updatedItem) });
      } catch (err) {}
    }
  };

  const playNotifSound = () => {
    try {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
      audio.volume = 0.5;
      audio.play().catch(e => console.warn(e));
    } catch (e) {}
  };

  const getUserStyle = (name) => {
    if (!name) return { padding: '0.35rem', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', width: '100%', minWidth: '120px', cursor: 'pointer' };
    const colors = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e', '#10b981', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef', '#f43f5e', '#ec4899', '#14b8a6'];
    let index = teamMembers.findIndex(u => u.name === name);
    if (index === -1) {
      let hash = 0;
      for (let i = 0; i < name.length; i++) { hash = name.charCodeAt(i) + ((hash << 5) - hash); }
      index = Math.abs(hash);
    }
    const baseColor = colors[index % colors.length];
    return { padding: '0.35rem', borderRadius: '4px', border: `1px solid ${baseColor}50`, backgroundColor: `${baseColor}15`, color: baseColor, fontWeight: '600', width: '100%', minWidth: '120px', cursor: 'pointer' };
  };

  const renderLink = (link) => {
    if (!link || link === '-') return '-';
    let href = String(link).trim();
    if (href === '') return '-';
    if (!href.startsWith('http://') && !href.startsWith('https://')) {
      href = 'https://' + href;
    }
    return <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-color)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontWeight: '500' }}>Link <FiExternalLink /></a>;
  };

  return (
    <div className="page-container" style={{ position: 'relative' }}>
      <div className="flex-between mb-4">
        <div>
          <h2>Monitoring Pekerjaan</h2>
          <p className="text-muted" style={{ marginTop: '0.25rem' }}>Pantau progres harian tim konten dan KOL.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', backgroundColor: 'var(--bg-color)', padding: '0.25rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <button 
              onClick={() => setActiveTab('CWM')}
              style={{ padding: '0.4rem 1rem', borderRadius: '6px', border: 'none', backgroundColor: activeTab === 'CWM' ? 'var(--primary-color)' : 'transparent', color: activeTab === 'CWM' ? 'white' : 'var(--text-main)', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s' }}
            >
              Tim Konten (CWM)
            </button>
            <button 
              onClick={() => setActiveTab('KOL')}
              style={{ padding: '0.4rem 1rem', borderRadius: '6px', border: 'none', backgroundColor: activeTab === 'KOL' ? 'var(--primary-color)' : 'transparent', color: activeTab === 'KOL' ? 'white' : 'var(--text-main)', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s' }}
            >
              Tim KOL
            </button>
          </div>
          <button className="action-btn" onClick={() => handleOpenModal()}>
            <FiPlus /> Tambah Data {activeTab}
          </button>
        </div>
      </div>

      <div className="filters-bar" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <div className="search-box" style={{ flex: '1' }}>
          <FiSearch className="search-icon" />
          <input 
            type="text" 
            placeholder={activeTab === 'CWM' ? "Cari judul, PIC, produk..." : "Cari KOL, produk, PIC..."}
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
        
        <select 
          className="filter-input"
          value={filterExecutor}
          onChange={(e) => setFilterExecutor(e.target.value)}
        >
          <option value="All">{activeTab === 'CWM' ? "Semua Executor CWM" : "Semua PIC KOL"}</option>
          {teamMembers.map(user => (
            <option key={`filter-exec-${user.id || user.name}`} value={user.name}>{user.name}</option>
          ))}
        </select>

        {activeTab === 'CWM' && (
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
        )}
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            {activeTab === 'CWM' ? (
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
            ) : (
              <tr>
                <th>Status</th>
                <th>Week</th>
                <th>Nama KOL</th>
                <th>Platform</th>
                <th>Link Akun</th>
                <th>Nama Produk</th>
                <th>Jenis Kerjasama</th>
                <th>PIC KOL</th>
                <th>Aksi</th>
              </tr>
            )}
          </thead>
          <tbody>
            {activeTab === 'CWM' ? (
              filteredData.map(item => (
                <tr key={item.id}>
                  <td style={{ textAlign: 'center' }}>
                    <select 
                      value={item.status}
                      onChange={(e) => handleInlineChange(item, 'status', e.target.value)}
                      style={{ padding: '0.35rem 0.5rem', borderRadius: '4px', border: 'none', backgroundColor: item.status === 'Selesai' ? 'var(--success-color)' : item.status === 'Revisi' ? 'var(--danger-color)' : 'var(--warning-color)', color: 'white', fontWeight: 'bold', cursor: 'pointer', outline: 'none', width: '100%', appearance: 'auto' }}
                    >
                      <option value="Proses" style={{color: '#333', background: 'white'}}>Proses</option>
                      <option value="Revisi" style={{color: '#333', background: 'white'}}>Revisi</option>
                      <option value="Selesai" style={{color: '#333', background: 'white'}}>Selesai</option>
                    </select>
                  </td>
                  <td><span className="badge badge-info">{item.week}</span></td>
                  <td>{item.produk}</td>
                  <td>{renderLink(item.linkKonten)}</td>
                  <td>{item.tanggalKonten}</td>
                  <td className="font-medium" style={{ textDecoration: item.status === 'Selesai' ? 'line-through' : 'none', opacity: item.status === 'Selesai' ? 0.6 : 1 }}>{item.judulKonten}</td>
                  <td>{item.jenisKonten}</td>
                  <td>{item.ratio}</td>
                  <td>{item.funnel}</td>
                  <td>
                    <select value={item.executorCWM || ''} onChange={(e) => handleInlineChange(item, 'executorCWM', e.target.value)} style={getUserStyle(item.executorCWM)}>
                      <option value="" disabled>-- Pilih --</option>
                      {teamMembers.map(u => <option key={u.name} value={u.name}>{u.name}</option>)}
                    </select>
                  </td>
                  <td>
                    <select value={item.picKonten || ''} onChange={(e) => handleInlineChange(item, 'picKonten', e.target.value)} style={getUserStyle(item.picKonten)}>
                      <option value="" disabled>-- Pilih --</option>
                      {teamMembers.map(u => <option key={u.name} value={u.name}>{u.name}</option>)}
                    </select>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button style={{ color: 'var(--text-muted)' }} onClick={() => handleOpenModal(item)} title="Edit"><FiEdit2 /></button>
                      <button style={{ color: 'var(--danger-color)' }} onClick={() => handleDelete(item.id)} title="Hapus"><FiTrash2 /></button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              filteredKolData.map(item => (
                <tr key={item.id}>
                  <td style={{ textAlign: 'center' }}>
                    <select 
                      value={item.status}
                      onChange={(e) => handleInlineChange(item, 'status', e.target.value)}
                      style={{ padding: '0.35rem 0.5rem', borderRadius: '4px', border: 'none', backgroundColor: item.status === 'Selesai' ? 'var(--success-color)' : item.status === 'Batal' ? 'var(--danger-color)' : 'var(--primary-color)', color: 'white', fontWeight: 'bold', cursor: 'pointer', outline: 'none', width: '100%', appearance: 'auto' }}
                    >
                      <option value="Pendekatan" style={{color: '#333', background: 'white'}}>Pendekatan</option>
                      <option value="Negosiasi" style={{color: '#333', background: 'white'}}>Negosiasi</option>
                      <option value="Kirim Produk" style={{color: '#333', background: 'white'}}>Kirim Produk</option>
                      <option value="Draft Video" style={{color: '#333', background: 'white'}}>Draft Video</option>
                      <option value="Selesai" style={{color: '#333', background: 'white'}}>Selesai</option>
                      <option value="Batal" style={{color: '#333', background: 'white'}}>Batal</option>
                    </select>
                  </td>
                  <td><span className="badge badge-info">{item.week}</span></td>
                  <td className="font-medium">{item.namaKol}</td>
                  <td>{item.platform}</td>
                  <td>{renderLink(item.linkAkun)}</td>
                  <td>{item.namaProduk}</td>
                  <td><span className="badge" style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-main)', border: '1px solid var(--border-color)' }}>{item.jenisKerjasama}</span></td>
                  <td>
                    <select value={item.picKol || ''} onChange={(e) => handleInlineChange(item, 'picKol', e.target.value)} style={getUserStyle(item.picKol)}>
                      <option value="" disabled>-- Pilih --</option>
                      {teamMembers.map(u => <option key={u.name} value={u.name}>{u.name}</option>)}
                    </select>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button style={{ color: 'var(--text-muted)' }} onClick={() => handleOpenModal(item)} title="Edit"><FiEdit2 /></button>
                      <button style={{ color: 'var(--danger-color)' }} onClick={() => handleDelete(item.id)} title="Hapus"><FiTrash2 /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
            
            {activeTab === 'CWM' && filteredData.length === 0 && (
              <tr><td colSpan="12" style={{ textAlign: 'center', padding: '2rem' }}>Tidak ada data monitoring CWM.</td></tr>
            )}
            {activeTab === 'KOL' && filteredKolData.length === 0 && (
              <tr><td colSpan="9" style={{ textAlign: 'center', padding: '2rem' }}>Tidak ada data monitoring KOL.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="modal-overlay" style={{ padding: '1rem' }}>
          <div className="modal-content" style={{ width: '100%', maxWidth: '800px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            <div className="modal-header">
              <h3>{editingItem ? `Edit Pekerjaan ${activeTab}` : `Tambah Data ${activeTab}`}</h3>
              <button className="modal-close" onClick={handleCloseModal}><FiX size={24} /></button>
            </div>
            
            <form onSubmit={handleSave} className="modal-form" style={{ overflowY: 'auto' }}>
              <div className="form-row">
                <div className="form-group">
                  <label>Week</label>
                  <select name="week" value={activeTab === 'CWM' ? formData.week : formDataKol.week} onChange={handleInputChange} required className="login-input">
                    <option value="Week 1 (1-7)">Week 1 (1-7)</option>
                    <option value="Week 2 (8-14)">Week 2 (8-14)</option>
                    <option value="Week 3 (15-21)">Week 3 (15-21)</option>
                    <option value="Week 4 (22-31)">Week 4 (22-31)</option>
                  </select>
                </div>
                {activeTab === 'CWM' ? (
                  <div className="form-group">
                    <label>Tanggal Konten</label>
                    <input type="date" name="tanggalKonten" value={formData.tanggalKonten} onChange={handleInputChange} required className="login-input" />
                  </div>
                ) : (
                  <div className="form-group">
                    <label>Nama Produk</label>
                    <input type="text" name="namaProduk" value={formDataKol.namaProduk} onChange={handleInputChange} required className="login-input" placeholder="Nama Produk..." />
                  </div>
                )}
              </div>

              {activeTab === 'CWM' ? (
                <>
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
                      <select name="executorCWM" value={formData.executorCWM} onChange={handleInputChange} required className="login-input" style={{ cursor: 'pointer', appearance: 'auto' }}>
                        <option value="" disabled>-- Pilih Executor CWM --</option>
                        {teamMembers.map(user => <option key={user.name} value={user.name}>{user.name} ({user.role})</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>PIC Konten (Adv/Skripter)</label>
                      <select name="picKonten" value={formData.picKonten} onChange={handleInputChange} required className="login-input" style={{ cursor: 'pointer', appearance: 'auto' }}>
                        <option value="" disabled>-- Pilih PIC Konten --</option>
                        {teamMembers.map(user => <option key={user.name} value={user.name}>{user.name} ({user.role})</option>)}
                      </select>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Nama KOL</label>
                      <input type="text" name="namaKol" value={formDataKol.namaKol} onChange={handleInputChange} required className="login-input" placeholder="Nama KOL..." />
                    </div>
                    <div className="form-group">
                      <label>Platform</label>
                      <select name="platform" value={formDataKol.platform} onChange={handleInputChange} required className="login-input">
                        <option value="TikTok">TikTok</option>
                        <option value="Instagram">Instagram</option>
                        <option value="YouTube">YouTube</option>
                        <option value="Lainnya">Lainnya</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Link Akun KOL</label>
                    <input type="url" name="linkAkun" value={formDataKol.linkAkun} className="login-input" placeholder="https://..." onChange={handleInputChange} />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Jenis Kerjasama</label>
                      <select name="jenisKerjasama" value={formDataKol.jenisKerjasama} onChange={handleInputChange} required className="login-input">
                        <option value="Endorsement">Endorsement</option>
                        <option value="Affiliate">Affiliate</option>
                        <option value="Barter Value">Barter Value</option>
                        <option value="UGC">UGC</option>
                        <option value="Buzzer">Buzzer</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>PIC KOL</label>
                      <select name="picKol" value={formDataKol.picKol} onChange={handleInputChange} required className="login-input" style={{ cursor: 'pointer', appearance: 'auto' }}>
                        <option value="" disabled>-- Pilih PIC KOL --</option>
                        {teamMembers.map(user => <option key={user.name} value={user.name}>{user.name} ({user.role})</option>)}
                      </select>
                    </div>
                  </div>
                </>
              )}

              <div className="modal-actions mt-4">
                <button type="button" className="btn-secondary" onClick={handleCloseModal}>Batal</button>
                <button type="submit" className="login-button mt-0" style={{ marginTop: 0 }}>Simpan Data</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {notification && (
        <div style={{ position: 'fixed', bottom: '30px', right: '30px', backgroundColor: 'var(--success-color)', color: 'white', padding: '1rem 1.5rem', borderRadius: '8px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', gap: '0.75rem', zIndex: 9999, animation: 'slideInRight 0.3s ease-out', borderLeft: '4px solid rgba(255,255,255,0.5)' }}>
          <FiCheckCircle size={24} />
          <span style={{ fontWeight: 600, fontSize: '1rem' }}>{notification}</span>
        </div>
      )}
    </div>
  );
};

export default Monitoring;
 
