import React, { useState, useEffect } from 'react';
import { winningContent } from '../data/dummyData';
import { FiTrendingUp, FiCopy, FiCheck, FiPlus } from 'react-icons/fi';

const Winning = () => {
  const [data, setData] = useState([]);
  const [copiedId, setCopiedId] = useState(null);
  
  // State form
  const [newTitle, setNewTitle] = useState('');
  const [newCtr, setNewCtr] = useState('');
  const [newSales, setNewSales] = useState('');
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
        ctr: newCtr || '0.00',
        transactions: newSales || '0',
        faktorSukses: newFactor || 'Tidak ada keterangan'
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
      setNewCtr('');
      setNewSales('');
      setNewFactor('');
    } catch (err) {
      console.warn('Mode Lokal: Menyimpan ke localStorage karena DB tidak tersedia');
      const newId = data.length > 0 ? Math.max(...data.map(d => d.id)) + 1 : 1;
      const newItem = {
        id: newId,
        title: newTitle + ' (Local)',
        ctr: newCtr || '0.00',
        transactions: newSales || '0',
        faktorSukses: newFactor || 'Tidak ada keterangan'
      };

      const updatedData = [newItem, ...data];
      setData(updatedData);
      localStorage.setItem('winningData', JSON.stringify(updatedData));

      setNewTitle('');
      setNewCtr('');
      setNewSales('');
      setNewFactor('');
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
          <div style={{ flex: '1 1 100px' }}>
            <label style={{ fontSize: '0.875rem', marginBottom: '0.5rem', display: 'block' }}>CTR (%)</label>
            <input type="number" step="0.01" className="filter-input" style={{ width: '100%' }} value={newCtr} onChange={(e) => setNewCtr(e.target.value)} placeholder="Contoh: 3.50" />
          </div>
          <div style={{ flex: '1 1 100px' }}>
            <label style={{ fontSize: '0.875rem', marginBottom: '0.5rem', display: 'block' }}>Sales (Konversi)</label>
            <input type="number" className="filter-input" style={{ width: '100%' }} value={newSales} onChange={(e) => setNewSales(e.target.value)} placeholder="Jumlah sales" />
          </div>
          <div style={{ flex: '1 1 250px' }}>
            <label style={{ fontSize: '0.875rem', marginBottom: '0.5rem', display: 'block' }}>Faktor Sukses</label>
            <input type="text" className="filter-input" style={{ width: '100%' }} value={newFactor} onChange={(e) => setNewFactor(e.target.value)} placeholder="Contoh: Hook kuat di 3 detik awal" />
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
                    {item.faktorSukses || 'Hook di 3 detik pertama sangat kuat'}
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
          ))
        )}
      </div>
    </div>
  );
};

export default Winning;
