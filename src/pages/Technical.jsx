import React, { useState } from 'react';
import { technicalIssues } from '../data/dummyData';
import { FiCheckCircle, FiTool, FiPlus, FiX } from 'react-icons/fi';

const Technical = () => {
  const [issues, setIssues] = useState(technicalIssues);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newIssue, setNewIssue] = useState({ issue: '', severity: 'Rendah' });

  const handleMarkResolved = (id) => {
    setIssues(prev => prev.map(issue => 
      issue.id === id ? { ...issue, status: 'Selesai' } : issue
    ));
  };

  const handleAddIssue = (e) => {
    e.preventDefault();
    const id = issues.length > 0 ? Math.max(...issues.map(i => i.id)) + 1 : 1;
    setIssues(prev => [...prev, { ...newIssue, id, status: 'Baru Masuk' }]);
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

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Deskripsi Kendala</th>
              <th>Tingkat Keparahan</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {issues.map((item) => (
              <tr key={item.id} style={{ opacity: item.status === 'Selesai' ? 0.6 : 1 }}>
                <td>#{item.id}</td>
                <td className="font-medium">{item.issue}</td>
                <td>
                  <span className={`badge ${item.severity === 'Kritis' ? 'badge-danger' : item.severity === 'Tinggi' ? 'badge-warning' : item.severity === 'Sedang' ? 'badge-info' : 'badge-gray'}`}>
                    {item.severity}
                  </span>
                </td>
                <td>
                  <span className={`badge ${item.status === 'Selesai' ? 'badge-success' : 'badge-gray'}`}>
                    {item.status}
                  </span>
                </td>
                <td>
                  {item.status !== 'Selesai' && (
                    <button 
                      className="action-btn secondary"
                      onClick={() => handleMarkResolved(item.id)}
                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
                    >
                      <FiCheckCircle /> Tandai Selesai
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
    </div>
  );
};

export default Technical;
