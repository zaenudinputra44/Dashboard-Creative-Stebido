import React, { useState, useEffect } from 'react';
import { winningContent } from '../data/dummyData';
import { FiTrendingUp, FiCopy, FiCheck, FiPlus } from 'react-icons/fi';

const Winning = () => {
  const [data, setData] = useState([]);
  const [copiedId, setCopiedId] = useState(null);
  
  // State form
  const [newTitle, setNewTitle] = useState('');
  const [newAdId, setNewAdId] = useState('');
  const [newCtr, setNewCtr] = useState('');
  const [newSales, setNewSales] = useState('');
  const [newBudget, setNewBudget] = useState('');
  const [newRoas, setNewRoas] = useState('');
  const [newFactor, setNewFactor] = useState('');

  useEffect(() => {
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
        } else {
          setData([]);
        }
      });
  }, []);

  const handleDuplicate = (id) => {
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!newTitle) return;

    try {
      const payload = {
        title: newTitle,
        adId: newAdId,
        ctr: newCtr || '0.00',
        transactions: newSales || '0',
        budgetSpent: newBudget || '0',
        roas: newRoas || '0.00',
        faktorSukses: newFactor || 'Tidak ada keterangan',
        skalaTindakan: 'Scale Up Budget'
      };

      const res = await fetch('/api/winning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Gagal simpan ke DB');
      const newItem = await res.json();
      
      setData([newItem, ...data]);
      setNewTitle('');
      setNewAdId('');
      setNewCtr('');
      setNewSales('');
      setNewBudget('');
      setNewRoas('');
      setNewFactor('');
    } catch (err) {
      console.warn('Mode Lokal: Menyimpan ke localStorage karena DB tidak tersedia');
      const newId = data.length > 0 ? Math.max(...data.map(d => d.id)) + 1 : 1;
      const newItem = {
        id: newId,
        title: newTitle + ' (Local)',
        adId: newAdId,
        ctr: newCtr || '0.00',
        transactions: newSales || '0',
        budgetSpent: newBudget || '0',
        roas: newRoas || '0.00',
        faktorSukses: newFactor || 'Tidak ada keterangan',
        skalaTindakan: 'Scale Up Budget'
      };

      const updatedData = [newItem, ...data];
      setData(updatedData);
      localStorage.setItem('winningData', JSON.stringify(updatedData));

      setNewTitle('');
      setNewAdId('');
      setNewCtr('');
      setNewSales('');
      setNewBudget('');
      setNewRoas('');
      setNewFactor('');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus data ini?')) return;
    
    try {
      const res = await fetch(`/api/winning?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Gagal menghapus di DB');
      
      const updatedData = data.filter(item => item.id !== id);
      setData(updatedData);
    } catch (err) {
      console.warn('Mode Lokal: Menghapus dari localStorage');
      const updatedData = data.filter(item => item.id !== id);
      setData(updatedData);
      localStorage.setItem('winningData', JSON.stringify(updatedData));
    }
  };

  return (
    <div className="page-container">
      <div className="mb-4">
        <h2>Winning Content</h2>
        <p className="text-muted" style={{ marginTop: '0.5rem' }}>Konten dengan performa terbaik bulan ini. Replikasi pola suksesnya.</p>
      </div>

      <div className="card mb-4">
        <h3 className="card-title mb-4" style={{ fontSize: '1.1rem' }}>Tambah Winning Content Manual</h3>
        <form onSubmit={handleAddSubmit} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: '1 1 200px' }}>
            <label style={{ fontSize: '0.875rem', marginBottom: '0.5rem', display: 'block' }}>Judul Konten</label>
            <input type="text" className="filter-input" style={{ width: '100%' }} value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Masukkan judul..." required />
          </div>
          <div style={{ flex: '1 1 150px' }}>
            <label style={{ fontSize: '0.875rem', marginBottom: '0.5rem', display: 'block' }}>Ad ID / Campaign ID</label>
            <input type="text" className="filter-input" style={{ width: '100%' }} value={newAdId} onChange={(e) => setNewAdId(e.target.value)} placeholder="Opsional" />
          </div>
          <div style={{ flex: '1 1 100px' }}>
            <label style={{ fontSize: '0.875rem', marginBottom: '0.5rem', display: 'block' }}>Budget (Rp)</label>
            <input type="number" className="filter-input" style={{ width: '100%' }} value={newBudget} onChange={(e) => setNewBudget(e.target.value)} placeholder="0" />
          </div>
          <div style={{ flex: '1 1 100px' }}>
            <label style={{ fontSize: '0.875rem', marginBottom: '0.5rem', display: 'block' }}>CTR (%)</label>
            <input type="number" step="0.01" className="filter-input" style={{ width: '100%' }} value={newCtr} onChange={(e) => setNewCtr(e.target.value)} placeholder="3.50" />
          </div>
          <div style={{ flex: '1 1 100px' }}>
            <label style={{ fontSize: '0.875rem', marginBottom: '0.5rem', display: 'block' }}>Sales</label>
            <input type="number" className="filter-input" style={{ width: '100%' }} value={newSales} onChange={(e) => setNewSales(e.target.value)} placeholder="0" />
          </div>
          <div style={{ flex: '1 1 100px' }}>
            <label style={{ fontSize: '0.875rem', marginBottom: '0.5rem', display: 'block' }}>ROAS</label>
            <input type="number" step="0.01" className="filter-input" style={{ width: '100%' }} value={newRoas} onChange={(e) => setNewRoas(e.target.value)} placeholder="2.5" />
          </div>
          <div style={{ flex: '1 1 250px' }}>
            <label style={{ fontSize: '0.875rem', marginBottom: '0.5rem', display: 'block' }}>Faktor Sukses</label>
            <input type="text" className="filter-input" style={{ width: '100%' }} value={newFactor} onChange={(e) => setNewFactor(e.target.value)} placeholder="Contoh: Hook kuat" />
          </div>
          <button type="submit" className="action-btn" style={{ minWidth: '120px', justifyContent: 'center' }}>
            <FiPlus /> Tambah
          </button>
        </form>
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
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <span className="text-muted" style={{ fontSize: '0.875rem' }}>Faktor Sukses:</span>
                  <span className="font-medium" style={{ fontSize: '0.875rem', lineHeight: '1.4' }}>
                    {item.faktorSukses || 'Tidak ada analisis'}
                  </span>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem', display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span className="text-muted" style={{ fontSize: '0.875rem' }}>Tindakan Skalasi:</span>
                  <span className="badge badge-warning">{item.skalaTindakan || 'Scale Up Budget'}</span>
                </div>
                <button 
                  className={`action-btn ${copiedId === item.id ? 'secondary' : ''}`} 
                  style={{ width: '100%', justifyContent: 'center', backgroundColor: copiedId === item.id ? 'var(--success-color)' : '', color: copiedId === item.id ? 'white' : '' }}
                  onClick={() => handleDuplicate(item.id)}
                >
                  {copiedId === item.id ? <><FiCheck /> Berhasil Diduplikasi</> : <><FiCopy /> Duplikat Konten Ini</>}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Winning;
