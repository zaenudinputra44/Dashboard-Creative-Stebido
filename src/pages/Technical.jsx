import React, { useState, useEffect } from 'react';
import { technicalIssues as initialData } from '../data/dummyData';
import { FiCheckCircle, FiTool, FiPlus, FiX, FiTrash2, FiInfo } from 'react-icons/fi';

const Technical = () => {
  const [issues, setIssues] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newIssue, setNewIssue] = useState({ issue: '', severity: 'Rendah' });
  const [detailIssue, setDetailIssue] = useState(null);

  useEffect(() => {
    fetch('/api/technical')
      .then(res => {
        if (!res.ok) throw new Error('API offline');
        return res.json();
      })
      .then(data => {
        setIssues(data);
        setIsLoading(false);
      })
      .catch(err => {
        setIssues(initialData);
        setIsLoading(false);
      });
  }, []);

  const handleMarkResolved = async (id) => {
    try {
      const res = await fetch('/api/technical', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'Selesai' })
      });
      if (!res.ok) throw new Error('Gagal update');
      const updatedItem = await res.json();
      setIssues(prev => prev.map(issue => issue.id === id ? updatedItem : issue));
    } catch (err) {
      setIssues(prev => prev.map(issue => issue.id === id ? { ...issue, status: 'Selesai' } : issue));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus kendala ini?')) return;
    try {
      const res = await fetch(`/api/technical?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Gagal menghapus');
      setIssues(prev => prev.filter(issue => issue.id !== id));
    } catch (err) {
      setIssues(prev => prev.filter(issue => issue.id !== id));
    }
  };

  const handleAddIssue = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/technical', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newIssue)
      });
      if (!res.ok) throw new Error('Gagal menambah');
      const newItem = await res.json();
      setIssues(prev => [newItem, ...prev]);
    } catch (err) {
      const id = issues.length > 0 ? Math.max(...issues.map(i => i.id)) + 1 : 1;
      setIssues(prev => [{ ...newIssue, id, status: 'Baru Masuk' }, ...prev]);
    }
    setIsModalOpen(false);
    setNewIssue({ issue: '', severity: 'Rendah' });
  };

  return (
    <div className="page-container">
      <div className="flex-between mb-4">
        <div>
          <h2>Kendala Teknis</h2>
          <p className="text-muted" style={{ marginTop: '0.5rem' }}>Pantau dan selesaikan kendala teknis yang menghambat produksi.</p>
        </div>
        <button className="action-btn" onClick={() => setIsModalOpen(true)}>
          <FiPlus /> Lapor Kendala Baru
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {issues.map((item) => (
          <div className="card" key={item.id} style={{ position: 'relative', opacity: item.status === 'Selesai' ? 0.6 : 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'flex-start' }}>
              <span className={`badge ${item.severity === 'Kritis' ? 'badge-danger' : item.severity === 'Tinggi' ? 'badge-warning' : item.severity === 'Sedang' ? 'badge-info' : 'badge-gray'}`}>
                {item.severity}
              </span>
              <button 
                onClick={() => handleDelete(item.id)} 
                style={{ background: 'none', border: 'none', color: 'var(--danger-color)', cursor: 'pointer', fontSize: '1.1rem' }}
                title="Hapus Kendala"
              >
                <FiTrash2 />
              </button>
            </div>
            
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Kendala #{item.id}</div>
            
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', fontWeight: 500, lineHeight: '1.4', flex: 1, color: 'var(--text-main)' }}>
              {item.issue}
            </h3>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
              <span className={`badge ${item.status === 'Selesai' ? 'badge-success' : 'badge-gray'}`}>
                {item.status}
              </span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  className="action-btn secondary"
                  onClick={() => setDetailIssue(item)}
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                >
                  <FiInfo /> Detail
                </button>
                {item.status !== 'Selesai' && (
                  <button 
                    className="action-btn"
                    onClick={() => handleMarkResolved(item.id)}
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', backgroundColor: 'var(--success-color)' }}
                  >
                    <FiCheckCircle /> Selesai
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        {issues.length === 0 && (
          <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem' }}>
            <p className="text-muted">Belum ada laporan kendala teknis.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h3>Lapor Kendala Baru</h3>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}><FiX size={24} /></button>
            </div>
            <form onSubmit={handleAddIssue} className="modal-form">
              <div className="form-group mb-4">
                <label>Deskripsi Kendala</label>
                <input 
                  type="text" 
                  className="login-input" 
                  value={newIssue.issue} 
                  onChange={(e) => setNewIssue({...newIssue, issue: e.target.value})} 
                  required 
                  placeholder="Contoh: Hosting lambat..."
                />
              </div>
              <div className="form-group">
                <label>Tingkat Keparahan</label>
                <select 
                  className="login-input"
                  value={newIssue.severity}
                  onChange={(e) => setNewIssue({...newIssue, severity: e.target.value})}
                >
                  <option value="Rendah">Rendah</option>
                  <option value="Sedang">Sedang</option>
                  <option value="Tinggi">Tinggi</option>
                  <option value="Kritis">Kritis</option>
                </select>
              </div>
              <div className="modal-actions mt-4">
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Batal</button>
                <button type="submit" className="login-button mt-0" style={{ marginTop: 0 }}>Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {detailIssue && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3>Detail Kendala Teknis</h3>
              <button className="modal-close" onClick={() => setDetailIssue(null)}><FiX size={24} /></button>
            </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1.5rem', padding: '0 0.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                  <div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>ID Kendala</div>
                    <div style={{ fontWeight: '600', fontSize: '1.1rem', color: 'var(--primary-color)' }}>#{detailIssue.id}</div>
                  </div>
                  
                  <div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Status</div>
                    <span className={`badge ${detailIssue.status === 'Selesai' ? 'badge-success' : 'badge-gray'}`}>
                      {detailIssue.status}
                    </span>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Keparahan</div>
                    <span className={`badge ${detailIssue.severity === 'Kritis' ? 'badge-danger' : detailIssue.severity === 'Tinggi' ? 'badge-warning' : detailIssue.severity === 'Sedang' ? 'badge-info' : 'badge-gray'}`}>
                      {detailIssue.severity}
                    </span>
                  </div>
                </div>

                <div style={{ backgroundColor: '#f9fafb', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem', fontWeight: '500' }}>Rincian Kendala Teknis</div>
                  <div style={{ lineHeight: '1.7', color: 'var(--text-main)', whiteSpace: 'pre-wrap', fontSize: '0.95rem' }}>
                    {detailIssue.issue}
                  </div>
                </div>
              </div>
              <div className="modal-actions" style={{ marginTop: '2rem' }}>
                <button className="action-btn secondary" style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }} onClick={() => setDetailIssue(null)}>Tutup Detail</button>
              </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Technical;
