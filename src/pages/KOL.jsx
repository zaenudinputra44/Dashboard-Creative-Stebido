import React, { useState, useEffect } from 'react';
import { kolData as initialData, teamData } from '../data/dummyData';
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiExternalLink, FiX, FiUsers, FiDollarSign, FiDownload } from 'react-icons/fi';
import '../tables.css';

const KOL = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterPlatform, setFilterPlatform] = useState('All');
  const [teamMembers, setTeamMembers] = useState(teamData);

  const fetchData = () => {
    fetch('/api/kol')
      .then(res => res.ok ? res.json() : [])
      .then(dbData => {
        setData(dbData);
        setIsLoading(false);
      })
      .catch(err => {
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
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, []);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
    nama_kol: '',
    platform: 'TikTok',
    tingkat: 'Micro',
    pic: '',
    status: 'Negosiasi',
    jadwal_tayang: '',
    biaya: '',
    link_hasil: ''
  });

  const filteredData = data.filter(item => {
    const matchesSearch = (item.nama_kol || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (item.pic || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || item.status === filterStatus;
    const matchesPlatform = filterPlatform === 'All' || item.platform === filterPlatform;
    return matchesSearch && matchesStatus && matchesPlatform;
  });

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData(item);
    } else {
      setEditingItem(null);
      setFormData({
        nama_kol: '',
        platform: 'TikTok',
        tingkat: 'Micro',
        pic: '',
        status: 'Negosiasi',
        jadwal_tayang: '',
        biaya: '',
        link_hasil: ''
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
    // Format biaya ke angka murni jika input adalah biaya
    if (name === 'biaya') {
      const numericValue = value.replace(/\D/g, '');
      setFormData(prev => ({ ...prev, [name]: numericValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        const res = await fetch('/api/kol', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...formData, id: editingItem.id })
        });
        if (!res.ok) throw new Error('Gagal update data');
        const updatedItem = await res.json();
        setData(prev => prev.map(item => item.id === editingItem.id ? updatedItem : item));
      } else {
        const res = await fetch('/api/kol', {
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
      if (editingItem) {
        setData(prev => prev.map(item => item.id === editingItem.id ? { ...formData, id: item.id } : item));
      } else {
        setData(prev => [{ ...formData, id: Date.now() }, ...prev]);
      }
    }
    handleCloseModal();
  };

  const handleDelete = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus data KOL ini?")) {
      try {
        const res = await fetch(`/api/kol?id=${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Gagal menghapus data');
        setData(prev => prev.filter(item => item.id !== id));
      } catch (err) {
        setData(prev => prev.filter(item => item.id !== id));
      }
    }
  };

  const handleInlineChange = async (item, field, newValue) => {
    const updatedItem = { ...item, [field]: newValue };
    setData(prev => prev.map(d => d.id === item.id ? updatedItem : d));

    try {
      const res = await fetch('/api/kol', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedItem)
      });
      if (!res.ok) throw new Error('Gagal update inline');
    } catch (err) {}
  };

  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number || 0);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Selesai': return 'var(--success-color)';
      case 'Tayang': return 'var(--info-color)';
      case 'Menunggu Konten': return 'var(--warning-color)';
      case 'Batal': return 'var(--danger-color)';
      default: return 'var(--text-muted)';
    }
  };

  const handleExportExcel = () => {
    if (filteredData.length === 0) {
      alert("Tidak ada data untuk diekspor.");
      return;
    }

    let tableHtml = `
      <html xmlns:x="urn:schemas-microsoft-com:office:excel">
        <head>
          <meta charset="utf-8">
          <style>
            table { border-collapse: collapse; font-family: sans-serif; }
            th { 
              background-color: #4f46e5; 
              color: #ffffff; 
              font-weight: bold; 
              border: 1px solid #c7d2fe; 
              padding: 10px;
              text-align: center;
            }
            td { 
              border: 1px solid #e5e7eb; 
              padding: 8px; 
              vertical-align: middle;
            }
            .title {
              font-size: 18px;
              font-weight: bold;
              text-align: center;
              color: #374151;
            }
          </style>
        </head>
        <body>
          <table>
            <tr><td colspan="8" class="title">Laporan Data KOL (Influencer)</td></tr>
            <tr><td colspan="8" style="text-align: center; color: #6b7280;">Dicetak pada: ${new Date().toLocaleString('id-ID')}</td></tr>
            <tr><td colspan="8"></td></tr>
            <tr>
              <th>Nama KOL</th>
              <th>Platform</th>
              <th>Tingkat</th>
              <th>Jadwal Tayang</th>
              <th>Status</th>
              <th>Biaya (Rp)</th>
              <th>Link Hasil</th>
              <th>PIC Internal</th>
            </tr>
    `;

    filteredData.forEach((item, index) => {
      const bgColor = index % 2 === 0 ? '#ffffff' : '#f9fafb';
      
      let statusColor = '#ffffff';
      let statusTextColor = '#374151';
      if(item.status === 'Selesai') { statusColor = '#dcfce7'; statusTextColor = '#166534'; }
      else if(item.status === 'Tayang') { statusColor = '#dbeafe'; statusTextColor = '#1e40af'; }
      else if(item.status === 'Batal') { statusColor = '#fee2e2'; statusTextColor = '#991b1b'; }
      else if(item.status === 'Menunggu Konten') { statusColor = '#fef3c7'; statusTextColor = '#92400e'; }

      tableHtml += `
            <tr style="background-color: ${bgColor};">
              <td style="font-weight: bold;">${item.nama_kol || '-'}</td>
              <td style="text-align: center; color: #2563eb;">${item.platform || '-'}</td>
              <td style="text-align: center;">${item.tingkat || '-'}</td>
              <td style="text-align: center;">${item.jadwal_tayang ? new Date(item.jadwal_tayang).toLocaleDateString('id-ID') : '-'}</td>
              <td style="background-color: ${statusColor}; color: ${statusTextColor}; font-weight: bold; text-align: center;">${item.status || '-'}</td>
              <td style="text-align: right;">${item.biaya || 0}</td>
              <td>${item.link_hasil || '-'}</td>
              <td style="text-align: center;">${item.pic || '-'}</td>
            </tr>
      `;
    });

    tableHtml += `
          </table>
        </body>
      </html>
    `;

    const blob = new Blob([tableHtml], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Laporan_KOL_${new Date().toISOString().split('T')[0]}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // KPI Calculations
  const totalActiveKol = data.filter(item => item.status !== 'Batal').length;
  const totalBudgetSpent = data.reduce((acc, curr) => acc + (parseFloat(curr.biaya) || 0), 0);

  return (
    <div className="page-container">
      <div className="flex-between mb-4">
        <div>
          <h2>Divisi KOL (Influencer)</h2>
          <p className="text-muted" style={{ marginTop: '0.25rem' }}>Pantau kerjasama, jadwal tayang, dan budget influencer.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn-secondary" onClick={handleExportExcel} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#10b981', color: 'white', borderColor: '#10b981' }}>
            <FiDownload /> Export Excel
          </button>
          <button className="action-btn" onClick={() => handleOpenModal()}>
            <FiPlus /> Tambah KOL
          </button>
        </div>
      </div>

      <div className="kpi-grid mb-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem' }}>
          <div style={{ backgroundColor: 'rgba(79, 70, 229, 0.1)', padding: '1rem', borderRadius: '12px', color: 'var(--primary-color)' }}>
            <FiUsers size={28} />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Total KOL Aktif</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-main)' }}>{totalActiveKol}</div>
          </div>
        </div>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem' }}>
          <div style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', padding: '1rem', borderRadius: '12px', color: 'var(--success-color)' }}>
            <FiDollarSign size={28} />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Total Budget Terpakai</div>
            <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)' }}>{formatRupiah(totalBudgetSpent)}</div>
          </div>
        </div>
      </div>

      <div className="filters-bar" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        <div className="search-box" style={{ flex: '1' }}>
          <FiSearch className="search-icon" />
          <input 
            type="text" 
            placeholder="Cari Nama KOL atau PIC..." 
            className="filter-input pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select className="filter-input" value={filterPlatform} onChange={(e) => setFilterPlatform(e.target.value)}>
          <option value="All">Semua Platform</option>
          <option value="TikTok">TikTok</option>
          <option value="Instagram">Instagram</option>
          <option value="YouTube">YouTube</option>
          <option value="X">X (Twitter)</option>
          <option value="Meta">Meta</option>
          <option value="All Kanal">All Kanal</option>
        </select>
        <select className="filter-input" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="All">Semua Status</option>
          <option value="Negosiasi">Negosiasi</option>
          <option value="Deal">Deal</option>
          <option value="Menunggu Konten">Menunggu Konten</option>
          <option value="Tayang">Tayang</option>
          <option value="Selesai">Selesai</option>
          <option value="Batal">Batal</option>
        </select>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Nama KOL / Username</th>
              <th>Platform</th>
              <th>Tingkat</th>
              <th>Jadwal Tayang</th>
              <th>Status</th>
              <th>Biaya (Rp)</th>
              <th>Link Hasil</th>
              <th>PIC Internal</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map(item => (
              <tr key={item.id}>
                <td className="font-medium" style={{ color: 'var(--text-main)' }}>{item.nama_kol}</td>
                <td><span className="badge badge-info">{item.platform}</span></td>
                <td>{item.tingkat}</td>
                <td>{item.jadwal_tayang ? new Date(item.jadwal_tayang).toLocaleDateString('id-ID') : '-'}</td>
                <td>
                  <select 
                    value={item.status}
                    onChange={(e) => handleInlineChange(item, 'status', e.target.value)}
                    style={{
                      padding: '0.35rem 0.5rem',
                      borderRadius: '4px',
                      border: 'none',
                      backgroundColor: getStatusColor(item.status),
                      color: 'white',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      outline: 'none',
                      width: '100%',
                      appearance: 'auto'
                    }}
                  >
                    <option value="Negosiasi" style={{color: '#333', background: 'white'}}>Negosiasi</option>
                    <option value="Deal" style={{color: '#333', background: 'white'}}>Deal</option>
                    <option value="Menunggu Konten" style={{color: '#333', background: 'white'}}>Menunggu Konten</option>
                    <option value="Tayang" style={{color: '#333', background: 'white'}}>Tayang</option>
                    <option value="Selesai" style={{color: '#333', background: 'white'}}>Selesai</option>
                    <option value="Batal" style={{color: '#333', background: 'white'}}>Batal</option>
                  </select>
                </td>
                <td style={{ fontWeight: '500' }}>{formatRupiah(item.biaya)}</td>
                <td>
                  {item.link_hasil ? (
                    <a href={item.link_hasil} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-color)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                      Lihat <FiExternalLink />
                    </a>
                  ) : "-"}
                </td>
                <td>{item.pic}</td>
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
                <td colSpan="9" style={{ textAlign: 'center', padding: '2rem' }}>Tidak ada data KOL ditemukan.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="modal-overlay" style={{ padding: '1rem' }}>
          <div className="modal-content" style={{ width: '100%', maxWidth: '600px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            <div className="modal-header">
              <h3>{editingItem ? "Edit Data KOL" : "Tambah Data KOL"}</h3>
              <button className="modal-close" onClick={handleCloseModal}><FiX size={24} /></button>
            </div>
            
            <form onSubmit={handleSave} className="modal-form" style={{ overflowY: 'auto' }}>
              <div className="form-group">
                <label>Nama KOL / Username</label>
                <input type="text" name="nama_kol" value={formData.nama_kol} onChange={handleInputChange} required className="login-input" placeholder="Contoh: @jhondoe" />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Platform</label>
                  <select name="platform" value={formData.platform} onChange={handleInputChange} required className="login-input">
                    <option value="TikTok">TikTok</option>
                    <option value="Instagram">Instagram</option>
                    <option value="YouTube">YouTube</option>
                    <option value="X">X (Twitter)</option>
                    <option value="Meta">Meta</option>
                    <option value="All Kanal">All Kanal</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Tingkat KOL</label>
                  <select name="tingkat" value={formData.tingkat} onChange={handleInputChange} required className="login-input">
                    <option value="Nano (1k-10k)">Nano (1k-10k)</option>
                    <option value="Micro (10k-100k)">Micro (10k-100k)</option>
                    <option value="Macro (100k-1M)">Macro (100k-1M)</option>
                    <option value="Mega (>1M)">Mega (&gt;1M)</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>PIC Internal</label>
                  <select name="pic" value={formData.pic} onChange={handleInputChange} required className="login-input">
                    <option value="" disabled>-- Pilih PIC --</option>
                    {teamMembers.map(user => (
                      <option key={user.id} value={user.name}>{user.name}</option>
                    ))}
                    {formData.pic && !teamMembers.some(u => u.name === formData.pic) && (
                      <option value={formData.pic}>{formData.pic}</option>
                    )}
                  </select>
                </div>
                <div className="form-group">
                  <label>Status Kerjasama</label>
                  <select name="status" value={formData.status} onChange={handleInputChange} required className="login-input">
                    <option value="Negosiasi">Negosiasi</option>
                    <option value="Deal">Deal</option>
                    <option value="Menunggu Konten">Menunggu Konten</option>
                    <option value="Tayang">Tayang</option>
                    <option value="Selesai">Selesai</option>
                    <option value="Batal">Batal</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Jadwal Tayang</label>
                  <input type="date" name="jadwal_tayang" value={formData.jadwal_tayang ? formData.jadwal_tayang.split('T')[0] : ''} onChange={handleInputChange} className="login-input" />
                </div>
                <div className="form-group">
                  <label>Biaya / Rate Card (Rp)</label>
                  <input type="text" name="biaya" value={new Intl.NumberFormat('id-ID').format(formData.biaya || 0)} onChange={handleInputChange} className="login-input" placeholder="0" />
                </div>
              </div>
              
              <div className="form-group">
                <label>Link Hasil Konten</label>
                <input type="url" name="link_hasil" value={formData.link_hasil} onChange={handleInputChange} className="login-input" placeholder="https://..." />
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

export default KOL;
