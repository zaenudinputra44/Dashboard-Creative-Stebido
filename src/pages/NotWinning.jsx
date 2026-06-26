import React, { useState } from 'react';
import { notWinningContent } from '../data/dummyData';
import { FiAlertCircle, FiSave, FiCheck } from 'react-icons/fi';

const NotWinning = () => {
  const [data, setData] = useState(
    notWinningContent.map(item => ({ ...item, decision: 'Belum Ditentukan' }))
  );
  const [savedStatus, setSavedStatus] = useState({});

  const handleDecisionChange = (id, newDecision) => {
    setData(prev => prev.map(item => item.id === id ? { ...item, decision: newDecision } : item));
    setSavedStatus(prev => ({ ...prev, [id]: false })); // Mark as unsaved
  };

  const handleSave = (id) => {
    // Simulate save
    setSavedStatus(prev => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setSavedStatus(prev => ({ ...prev, [id]: false }));
    }, 2000);
  };

  return (
    <div className="page-container">
      <div className="flex-between mb-4">
        <div>
          <h2>Konten Tidak Winning</h2>
          <p className="text-muted" style={{ marginTop: '0.5rem' }}>Evaluasi dan ambil tindakan untuk konten dengan performa rendah.</p>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Konten</th>
              <th>Metrik Rendah</th>
              <th>Indikasi Masalah</th>
              <th>Rekomendasi Tindakan</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, idx) => (
              <tr key={item.id}>
                <td className="font-medium">{item.title}</td>
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <span className="badge badge-danger">CTR: {item.ctr}%</span>
                    <span className="badge badge-warning">CVR: {item.conversionRate}%</span>
                  </div>
                </td>
                <td>
                  {idx % 2 === 0 ? "Thumbnail kurang menarik" : "Hook video tidak kuat"}
                </td>
                <td>
                  <select 
                    className="filter-input" 
                    style={{ minWidth: '150px', padding: '0.4rem 0.8rem' }}
                    value={item.decision}
                    onChange={(e) => handleDecisionChange(item.id, e.target.value)}
                  >
                    <option value="Belum Ditentukan">-- Pilih Tindakan --</option>
                    <option value="Revisi Video">Revisi Video</option>
                    <option value="Ganti Thumbnail">Ganti Thumbnail</option>
                    <option value="Ubah Copywriting">Ubah Copywriting</option>
                    <option value="Retest">Retest (Uji Ulang)</option>
                    <option value="Stop Iklan">Stop Iklan</option>
                  </select>
                </td>
                <td>
                  <button 
                    className={`action-btn ${savedStatus[item.id] ? 'secondary' : ''}`}
                    onClick={() => handleSave(item.id)}
                    style={{ backgroundColor: savedStatus[item.id] ? 'var(--success-color)' : '', color: savedStatus[item.id] ? 'white' : '' }}
                  >
                    {savedStatus[item.id] ? <><FiCheck /> Tersimpan</> : <><FiSave /> Simpan</>}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default NotWinning;
