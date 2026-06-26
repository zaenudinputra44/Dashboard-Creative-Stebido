import React, { useState } from 'react';
import { winningContent } from '../data/dummyData';
import { FiTrendingUp, FiCopy, FiCheck } from 'react-icons/fi';

const Winning = () => {
  const [copiedId, setCopiedId] = useState(null);

  const handleDuplicate = (id) => {
    setCopiedId(id);
    // You could also add an actual item to monitoringData here if it was a global context
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  return (
    <div className="page-container">
      <div className="mb-4">
        <h2>Winning Content</h2>
        <p className="text-muted" style={{ marginTop: '0.5rem' }}>Konten dengan performa terbaik bulan ini. Replikasi pola suksesnya.</p>
      </div>

      <div className="dashboard-main-grid">
        {winningContent.map((item) => (
          <div className="card" key={item.id} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div className="flex-between mb-4">
              <h3 className="card-title" style={{ color: 'var(--text-main)', fontSize: '1.1rem' }}>{item.title}</h3>
              <span className="badge badge-success">Winning</span>
            </div>
            
            <div style={{ marginBottom: '1.5rem', flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span className="text-muted" style={{ fontSize: '0.875rem' }}>CTR</span>
                <span className="font-medium" style={{ color: 'var(--success-color)' }}>{item.ctr}%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span className="text-muted" style={{ fontSize: '0.875rem' }}>Konversi</span>
                <span className="font-medium">{item.transactions} Sales</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="text-muted" style={{ fontSize: '0.875rem' }}>Faktor Sukses</span>
                <span className="font-medium" style={{ fontSize: '0.875rem', textAlign: 'right' }}>
                  Hook di 3 detik pertama sangat kuat
                </span>
              </div>
            </div>

            <button 
              className={`action-btn ${copiedId === item.id ? 'secondary' : ''}`} 
              style={{ width: '100%', justifyContent: 'center', backgroundColor: copiedId === item.id ? 'var(--success-color)' : '', color: copiedId === item.id ? 'white' : '' }}
              onClick={() => handleDuplicate(item.id)}
            >
              {copiedId === item.id ? <><FiCheck /> Berhasil Diduplikasi</> : <><FiCopy /> Gunakan Ulang Konsep</>}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Winning;
