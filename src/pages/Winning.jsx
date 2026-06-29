import React, { useState, useEffect } from 'react';
import { winningContent } from '../data/dummyData';
import { FiTrendingUp, FiPlus } from 'react-icons/fi';

const Winning = () => {
  const [data, setData] = useState([]);

  const fetchData = () => {
    fetch('/api/winning')
      .then(res => {
        if (!res.ok) throw new Error('API not available');
        return res.json();
      })
      .then(dbData => setData(dbData))
      .catch(err => {
        console.warn('Gagal fetch API, fallback ke localStorage:', err.message);
        const saved = localStorage.getItem('winningData');
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



  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus data ini?')) return;
    
    try {
      const res = await fetch(`/api/winning?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Gagal menghapus di DB');
      
      fetchData();
    } catch (err) {
      const updatedData = data.filter(item => item.id !== id);
      setData(updatedData);
      localStorage.setItem('winningData', JSON.stringify(updatedData));
    }
  };

  return (
    <div className="page-container">
      <div className="mb-4">
        <h2>Winning Content</h2>
        <p className="text-muted" style={{ marginTop: '0.5rem' }}>Konten dengan performa terbaik bulan ini. Data ini disinkronisasikan langsung dari menu Performa Konten.</p>
      </div>

      <div className="dashboard-main-grid">
        {data.length === 0 ? (
          <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem' }}>
            <p className="text-muted">Belum ada konten yang berstatus Winning.</p>
          </div>
        ) : (
          data.map((item) => (
            <div className="card" key={item.id} style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
              <div className="flex-between mb-4">
                <h3 className="card-title" style={{ color: 'var(--text-main)', fontSize: '1.1rem', paddingRight: '2rem' }}>{item.title}</h3>
                <span className="badge badge-success">Winning</span>
              </div>
              
              <button 
                onClick={() => handleDelete(item.id)}
                style={{ position: 'absolute', top: '1.2rem', right: '1.2rem', background: 'none', border: 'none', color: 'var(--danger-color)', cursor: 'pointer', fontSize: '1.1rem' }}
                title="Hapus Data"
              >
                &times;
              </button>
              
              {item.adId && (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem', marginTop: '-0.5rem' }}>
                  Ad ID: {item.adId}
                </div>
              )}
              
              <div style={{ marginBottom: '1.5rem', flex: 1 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem', backgroundColor: 'var(--bg-color)', padding: '1rem', borderRadius: '8px' }}>
                  <div>
                    <div className="text-muted" style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>BUDGET SPENT</div>
                    <div className="font-medium">Rp {parseInt(item.budgetSpent || 0).toLocaleString('id-ID')}</div>
                  </div>
                  <div>
                    <div className="text-muted" style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>ROAS</div>
                    <div className="font-medium" style={{ color: 'var(--success-color)' }}>{item.roas}x</div>
                  </div>
                  <div>
                    <div className="text-muted" style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>CTR</div>
                    <div className="font-medium" style={{ color: 'var(--primary-color)' }}>{item.ctr}%</div>
                  </div>
                  <div>
                    <div className="text-muted" style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>SALES</div>
                    <div className="font-medium">{item.transactions}</div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Winning;
