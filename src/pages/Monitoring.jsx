import React, { useState, useEffect } from 'react';
import { monitoringData as initialData } from '../data/dummyData';
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiExternalLink, FiX } from 'react-icons/fi';
import '../tables.css';

const Monitoring = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
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
  }, []);
  const [filterWeek, setFilterWeek] = useState('All');
  
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
    picKonten: ''
  });

  const filteredData = data.filter(item => {
    const matchesSearch = item.judulKonten.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.executorCWM.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.produk.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesWeek = filterWeek === 'All' || item.week.includes(filterWeek);
    return matchesSearch && matchesWeek;
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
        picKonten: ''
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

  const handleSave = (e) => {
    e.preventDefault();
    if (editingItem) {
      // Update existing
      setData(prev => prev.map(item => item.id === editingItem.id ? { ...formData, id: item.id } : item));
    } else {
      // Create new
      const newId = data.length > 0 ? Math.max(...data.map(d => d.id)) + 1 : 1;
      setData(prev => [{ ...formData, id: newId }, ...prev]);
    }
    handleCloseModal();
  };

  const handleDelete = (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus data ini?")) {
      setData(prev => prev.filter(item => item.id !== id));
    }
  };

  return (
    <div className="page-container" style={{ position: 'relative' }}>
      <div className="flex-between mb-4">
        <h2>Monitoring Pekerjaan</h2>
        <button className="action-btn" onClick={() => handleOpenModal()}>
          <FiPlus /> Tambah Data Pekerjaan
        </button>
      </div>

      <div className="filters-bar">
        <div className="search-box">
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
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
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
                <td className="font-medium">{item.judulKonten}</td>
                <td>{item.jenisKonten}</td>
                <td>{item.ratio}</td>
                <td>{item.funnel}</td>
                <td>{item.executorCWM}</td>
                <td>{item.picKonten}</td>
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
                <td colSpan="11" style={{ textAlign: 'center', padding: '2rem' }}>Tidak ada data monitoring ditemukan.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingItem ? "Edit Pekerjaan" : "Tambah Data Pekerjaan"}</h3>
              <button className="modal-close" onClick={handleCloseModal}><FiX size={24} /></button>
            </div>
            
            <form onSubmit={handleSave} className="modal-form">
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
                  <input type="url" name="linkKonten" value={formData.linkKonten} onChange={handleInputChange} className="login-input" placeholder="https://..." />
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
                  <input type="text" name="executorCWM" value={formData.executorCWM} onChange={handleInputChange} required className="login-input" placeholder="Nama Executor" />
                </div>
                <div className="form-group">
                  <label>PIC Konten (Adv/Skripter)</label>
                  <input type="text" name="picKonten" value={formData.picKonten} onChange={handleInputChange} required className="login-input" placeholder="Nama PIC" />
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
