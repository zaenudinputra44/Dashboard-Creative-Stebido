import React, { useState, useEffect } from 'react';
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiX, FiBox } from 'react-icons/fi';
import { teamData } from '../data/dummyData.js';
import '../tables.css';

const Aset = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [teamMembers, setTeamMembers] = useState(teamData);

  // Filters
  const [filterKategori, setFilterKategori] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    nama_aset: '',
    kategori: 'Digital',
    jumlah: 1,
    pemegang_aset: '',
    status: 'Aktif',
    tanggal_masuk: '',
    keterangan: ''
  });

  const fetchData = () => {
    fetch('/api/assets')
      .then(res => res.ok ? res.json() : [])
      .then(dbData => {
        setData(Array.isArray(dbData) ? dbData : []);
        setIsLoading(false);
      })
      .catch(err => {
        console.warn('Gagal memuat data aset', err);
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
  }, []);

  const filteredData = data.filter(item => {
    const matchesSearch = (item.nama_aset || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (item.pemegang_aset || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesKategori = filterKategori === 'All' || item.kategori === filterKategori;
    const matchesStatus = filterStatus === 'All' || item.status === filterStatus;
    
    return matchesSearch && matchesKategori && matchesStatus;
  });

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData(item);
    } else {
      setEditingItem(null);
      setFormData({
        nama_aset: '',
        kategori: 'Digital',
        jumlah: 1,
        pemegang_aset: '',
        status: 'Aktif',
        tanggal_masuk: new Date().toISOString().split('T')[0],
        keterangan: ''
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
    setIsSaving(true);
    try {
      if (editingItem) {
        // Update existing via API
        const res = await fetch('/api/assets', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...formData, id: editingItem.id })
        });
        if (!res.ok) throw new Error('Gagal update data');
        const updatedItem = await res.json();
        setData(prev => prev.map(item => item.id === editingItem.id ? updatedItem : item));
      } else {
        // Create new via API
        const res = await fetch('/api/assets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        if (!res.ok) throw new Error('Gagal menambah data');
        const newItem = await res.json();
        setData(prev => [newItem, ...prev]);
      }
      handleCloseModal();
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan data. Pastikan server API berjalan.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus data aset ini?")) {
      try {
        const res = await fetch(`/api/assets?id=${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Gagal menghapus data');
        setData(prev => prev.filter(item => item.id !== id));
      } catch (err) {
        console.error(err);
        alert('Gagal menghapus data.');
      }
    }
  };

  const getUserStyle = (name) => {
    if (!name) return { padding: '0.35rem', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', width: '100%', cursor: 'pointer' };
    
    const colors = [
      '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e', 
      '#10b981', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1', 
      '#8b5cf6', '#d946ef', '#f43f5e', '#ec4899', '#14b8a6',
      '#eab308', '#a855f7', '#0284c7', '#ea580c', '#65a30d',
      '#be123c', '#4338ca', '#047857', '#b45309', '#7e22ce'
    ];

    let index = teamMembers.findIndex(u => u.name === name);
    if (index === -1) {
      let hash = 0;
      for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
      }
      index = Math.abs(hash);
    }
    
    const baseColor = colors[index % colors.length];
    
    return {
      padding: '0.35rem', 
      borderRadius: '4px', 
      border: `1px solid ${baseColor}50`, 
      backgroundColor: `${baseColor}15`, 
      color: baseColor,
      fontWeight: '600',
      width: '100%', 
      cursor: 'pointer'
    };
  };

  return (
    <div className="page-container" style={{ position: 'relative' }}>
      <div className="flex-between mb-4">
        <h2><FiBox style={{ marginRight: '0.5rem' }} /> Management Aset</h2>
        <button className="action-btn" onClick={() => handleOpenModal()}>
          <FiPlus /> Tambah Aset
        </button>
      </div>

      <div className="filters-bar" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <div className="search-box" style={{ flex: '1' }}>
          <FiSearch className="search-icon" />
          <input 
            type="text" 
            placeholder="Cari nama aset, PIC..." 
            className="filter-input pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <select 
          className="filter-input"
          value={filterKategori}
          onChange={(e) => setFilterKategori(e.target.value)}
        >
          <option value="All">Semua Kategori</option>
          <option value="Digital">Digital</option>
          <option value="Non-Digital">Non-Digital</option>
        </select>
        
        <select 
          className="filter-input"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="All">Semua Status</option>
          <option value="Aktif">Aktif</option>
          <option value="Rusak">Rusak</option>
          <option value="Hilang">Hilang</option>
          <option value="Dipinjam">Dipinjam</option>
        </select>
      </div>

      <div className="table-container">
        {isLoading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Memuat data aset...</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>No</th>
                <th>Nama Aset</th>
                <th>Kategori</th>
                <th>Jumlah</th>
                <th>Pemegang Aset (PIC)</th>
                <th>Status</th>
                <th>Tanggal Masuk</th>
                <th>Keterangan</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item, index) => (
                <tr key={item.id}>
                  <td>{index + 1}</td>
                  <td className="font-medium">{item.nama_aset}</td>
                  <td>
                    <span className={`badge ${item.kategori === 'Digital' ? 'badge-primary' : 'badge-warning'}`}>
                      {item.kategori}
                    </span>
                  </td>
                  <td>{item.jumlah}</td>
                  <td>
                    <div style={getUserStyle(item.pemegang_aset)}>
                      {item.pemegang_aset || '-'}
                    </div>
                  </td>
                  <td>
                    <span className="badge" style={{
                      backgroundColor: item.status === 'Aktif' ? 'var(--success-color)' :
                                       item.status === 'Rusak' ? 'var(--danger-color)' :
                                       item.status === 'Hilang' ? 'var(--text-muted)' : 'var(--warning-color)'
                    }}>
                      {item.status}
                    </span>
                  </td>
                  <td>{item.tanggal_masuk || '-'}</td>
                  <td style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.keterangan || '-'}
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
                  <td colSpan="9" style={{ textAlign: 'center', padding: '2rem' }}>Tidak ada data aset ditemukan.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="modal-overlay" style={{ padding: '1rem' }}>
          <div className="modal-content" style={{ width: '100%', maxWidth: '600px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            <div className="modal-header">
              <h3>{editingItem ? "Edit Data Aset" : "Tambah Data Aset"}</h3>
              <button className="modal-close" onClick={handleCloseModal}><FiX size={24} /></button>
            </div>
            
            <form onSubmit={handleSave} className="modal-form" style={{ overflowY: 'auto' }}>
              <div className="form-group">
                <label>Nama Aset</label>
                <input type="text" name="nama_aset" value={formData.nama_aset} onChange={handleInputChange} required className="login-input" placeholder="Masukkan nama aset..." />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Kategori</label>
                  <select name="kategori" value={formData.kategori} onChange={handleInputChange} required className="login-input">
                    <option value="Digital">Digital (Software, Akun, dll)</option>
                    <option value="Non-Digital">Non-Digital (Hardware, Fisik)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Jumlah</label>
                  <input type="number" name="jumlah" value={formData.jumlah} min="1" onChange={handleInputChange} required className="login-input" />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Status</label>
                  <select name="status" value={formData.status} onChange={handleInputChange} required className="login-input">
                    <option value="Aktif">Aktif / Berfungsi</option>
                    <option value="Dipinjam">Dipinjam</option>
                    <option value="Rusak">Rusak</option>
                    <option value="Hilang">Hilang</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Tanggal Masuk / Beli</label>
                  <input type="date" name="tanggal_masuk" value={formData.tanggal_masuk} onChange={handleInputChange} className="login-input" />
                </div>
              </div>

              <div className="form-group">
                <label>Pemegang Aset (PIC)</label>
                <select 
                  name="pemegang_aset" 
                  value={formData.pemegang_aset} 
                  onChange={handleInputChange} 
                  required 
                  className="login-input"
                  style={{ cursor: 'pointer', appearance: 'auto' }}
                >
                  <option value="" disabled>-- Pilih PIC --</option>
                  {teamMembers.map(user => (
                    <option key={`pic-${user.id || user.name}`} value={user.name}>{user.name} ({user.role})</option>
                  ))}
                  {formData.pemegang_aset && !teamMembers.some(u => u.name === formData.pemegang_aset) && (
                    <option value={formData.pemegang_aset}>{formData.pemegang_aset}</option>
                  )}
                  <option value="Kantor/Studio">Kantor / Studio (Standby)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Keterangan Tambahan</label>
                <textarea 
                  name="keterangan" 
                  value={formData.keterangan} 
                  onChange={handleInputChange} 
                  className="login-input" 
                  placeholder="Opsional: Tuliskan spesifikasi, serial number, atau detail lainnya..."
                  rows="3"
                ></textarea>
              </div>

              <div className="modal-actions mt-4">
                <button type="button" className="btn-secondary" onClick={handleCloseModal}>Batal</button>
                <button type="submit" className="login-button mt-0" style={{ marginTop: 0 }} disabled={isSaving}>
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

export default Aset;
