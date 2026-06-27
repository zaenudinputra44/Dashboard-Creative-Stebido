import React, { useState, useEffect } from 'react';
import { notWinningContent } from '../data/dummyData';
import { FiAlertCircle, FiSave, FiCheck, FiPlus } from 'react-icons/fi';

const NotWinning = () => {
  const [data, setData] = useState([]);
  const [savedStatus, setSavedStatus] = useState({});

  // State form
  const [newTitle, setNewTitle] = useState('');
  const [newCtr, setNewCtr] = useState('');
  const [newCvr, setNewCvr] = useState('');
  const [newIssue, setNewIssue] = useState('');

  useEffect(() => {
    fetch('/api/not_winning')
      .then(res => {
        if (!res.ok) throw new Error('API not available');
        return res.json();
      })
      .then(dbData => setData(dbData))
      .catch(err => {
        console.warn('Gagal fetch API, fallback ke localStorage:', err.message);
        const saved = localStorage.getItem('notWinningData');
        if (saved) {
          setData(JSON.parse(saved));
        } else {
          setData([]);
        }
      });
  }, []);

  const handleDecisionChange = (id, newDecision) => {
    const updatedData = data.map(item => item.id === id ? { ...item, decision: newDecision } : item);
    setData(updatedData);
    setSavedStatus(prev => ({ ...prev, [id]: false })); // Mark as unsaved
  };

  const handleSave = async (id) => {
    setSavedStatus(prev => ({ ...prev, [id]: true }));
    
    const itemToUpdate = data.find(item => item.id === id);
    if (!itemToUpdate) return;

    try {
      const res = await fetch('/api/not_winning', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, decision: itemToUpdate.decision })
      });
      if (!res.ok) throw new Error('Gagal update ke DB');
    } catch (err) {
      console.warn('Mode Lokal: Menyimpan ke localStorage');
      localStorage.setItem('notWinningData', JSON.stringify(data));
    }

    setTimeout(() => {
      setSavedStatus(prev => ({ ...prev, [id]: false }));
    }, 2000);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!newTitle) return;

    try {
      const payload = {
        title: newTitle,
        ctr: newCtr || '0.00',
        conversionRate: newCvr || '0.00',
        indikasiMasalah: newIssue || 'Perlu dianalisis',
        decision: 'Belum Ditentukan'
      };

      const res = await fetch('/api/not_winning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Gagal simpan ke DB');
      const newItem = await res.json();
      
      setData([newItem, ...data]);
      setNewTitle('');
      setNewCtr('');
      setNewCvr('');
      setNewIssue('');
    } catch (err) {
      console.warn('Mode Lokal: Menyimpan ke localStorage');
      const newId = data.length > 0 ? Math.max(...data.map(d => d.id)) + 1 : 1;
      const newItem = {
        id: newId,
        title: newTitle + ' (Local)',
        ctr: newCtr || '0.00',
        conversionRate: newCvr || '0.00',
        indikasiMasalah: newIssue || 'Perlu dianalisis',
        decision: 'Belum Ditentukan'
      };

      const updatedData = [newItem, ...data];
      setData(updatedData);
      localStorage.setItem('notWinningData', JSON.stringify(updatedData));

      setNewTitle('');
      setNewCtr('');
      setNewCvr('');
      setNewIssue('');
    }
  };

  return (
    <div className="page-container">
      <div className="flex-between mb-4">
        <div>
          <h2>Konten Tidak Winning</h2>
          <p className="text-muted" style={{ marginTop: '0.5rem' }}>Evaluasi dan ambil tindakan untuk konten dengan performa rendah.</p>
        </div>
      </div>

      <div className="card mb-4">
        <h3 className="card-title mb-4" style={{ fontSize: '1.1rem' }}>Tambah Konten Tidak Winning Manual</h3>
        <form onSubmit={handleAddSubmit} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: '1 1 200px' }}>
            <label style={{ fontSize: '0.875rem', marginBottom: '0.5rem', display: 'block' }}>Judul Konten</label>
            <input type="text" className="filter-input" style={{ width: '100%' }} value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Masukkan judul..." required />
          </div>
          <div style={{ flex: '1 1 100px' }}>
            <label style={{ fontSize: '0.875rem', marginBottom: '0.5rem', display: 'block' }}>CTR (%)</label>
            <input type="number" step="0.01" className="filter-input" style={{ width: '100%' }} value={newCtr} onChange={(e) => setNewCtr(e.target.value)} placeholder="Contoh: 0.50" />
          </div>
          <div style={{ flex: '1 1 100px' }}>
            <label style={{ fontSize: '0.875rem', marginBottom: '0.5rem', display: 'block' }}>CVR (%)</label>
            <input type="number" step="0.01" className="filter-input" style={{ width: '100%' }} value={newCvr} onChange={(e) => setNewCvr(e.target.value)} placeholder="Contoh: 1.20" />
          </div>
          <div style={{ flex: '1 1 250px' }}>
            <label style={{ fontSize: '0.875rem', marginBottom: '0.5rem', display: 'block' }}>Indikasi Masalah</label>
            <input type="text" className="filter-input" style={{ width: '100%' }} value={newIssue} onChange={(e) => setNewIssue(e.target.value)} placeholder="Contoh: Thumbnail kurang menarik" />
          </div>
          <button type="submit" className="action-btn" style={{ minWidth: '120px', justifyContent: 'center' }}>
            <FiPlus /> Tambah
          </button>
        </form>
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
            {data.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }} className="text-muted">
                  Belum ada evaluasi konten tidak winning.
                </td>
              </tr>
            ) : (
              data.map((item) => (
                <tr key={item.id}>
                  <td className="font-medium">{item.title}</td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <span className="badge badge-danger">CTR: {item.ctr}%</span>
                      <span className="badge badge-warning">CVR: {item.conversionRate}%</span>
                    </div>
                  </td>
                  <td>
                    {item.indikasiMasalah || "Thumbnail kurang menarik"}
                  </td>
                  <td>
                    <select 
                      className="filter-input" 
                      style={{ minWidth: '150px', padding: '0.4rem 0.8rem' }}
                      value={item.decision || 'Belum Ditentukan'}
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
                  <td style={{ display: 'flex', gap: '0.5rem' }}>
                    <button 
                      className={`action-btn ${savedStatus[item.id] ? 'secondary' : ''}`}
                      onClick={() => handleSave(item.id)}
                      style={{ backgroundColor: savedStatus[item.id] ? 'var(--success-color)' : '', color: savedStatus[item.id] ? 'white' : '' }}
                    >
                      {savedStatus[item.id] ? <><FiCheck /> Tersimpan</> : <><FiSave /> Simpan</>}
                    </button>
                    <button 
                      className="action-btn"
                      onClick={() => handleDelete(item.id)}
                      style={{ backgroundColor: 'var(--danger-color)', color: 'white' }}
                      title="Hapus Data"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default NotWinning;
