import React, { useState, useEffect } from 'react';
import { FiCheckSquare, FiSave } from 'react-icons/fi';

const Evaluation = () => {
  const [evaluations, setEvaluations] = useState([]);
  const [newEval, setNewEval] = useState({ week: '', note1: '', note2: '' });

  useEffect(() => {
    fetch('/api/evaluation')
      .then(res => res.json())
      .then(data => {
        // Fallback or API data
        if (data.length > 0) {
          setEvaluations(data);
        } else {
          setEvaluations([
            {
              id: 1,
              week: 'Minggu Ke-2, Juni 2026',
              notes: [
                'CTR Video Edukasi meningkat 2% setelah thumbnail diganti.',
                'Tim skripter sudah memenuhi target mingguan.',
                'Perlu perbaikan pada server hosting karena sempat down 2 jam.'
              ]
            }
          ]);
        }
      })
      .catch(err => console.error(err));
  }, []);

  const handleAddEvaluation = async (e) => {
    e.preventDefault();
    if (!newEval.week || !newEval.note1) return;
    
    const notes = [newEval.note1];
    if (newEval.note2) notes.push(newEval.note2);

    try {
      const res = await fetch('/api/evaluation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ week: newEval.week, notes })
      });
      if (!res.ok) throw new Error('Gagal menambah evaluasi');
      const savedEval = await res.json();
      setEvaluations(prev => [savedEval, ...prev]);
    } catch (err) {
      const id = evaluations.length > 0 ? Math.max(...evaluations.map(e => e.id)) + 1 : 1;
      setEvaluations(prev => [{ id, week: newEval.week, notes }, ...prev]);
    }

    setNewEval({ week: '', note1: '', note2: '' });
  };

  return (
    <div className="page-container">
      <div className="mb-4">
        <h2>Evaluasi & Rekomendasi</h2>
        <p className="text-muted" style={{ marginTop: '0.5rem' }}>Ringkasan evaluasi mingguan dan saran tindak lanjut.</p>
      </div>

      <div className="dashboard-main-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {evaluations.map((evalItem) => {
            let notesArray = [];
            try {
              notesArray = Array.isArray(evalItem.notes) 
                ? evalItem.notes 
                : (typeof evalItem.notes === 'string' ? JSON.parse(evalItem.notes) : []);
            } catch (e) {
              notesArray = [evalItem.notes];
            }

            return (
              <div className="card" key={evalItem.id}>
                <h3 className="card-title" style={{ color: 'var(--primary-color)', fontSize: '1.1rem', marginBottom: '1rem' }}>
                  Evaluasi {evalItem.week}
                </h3>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingLeft: '0.5rem' }}>
                  {notesArray.map((note, idx) => (
                    <li key={idx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                      <FiCheckSquare style={{ color: 'var(--success-color)', marginTop: '0.25rem', flexShrink: 0 }} />
                      <span style={{ fontSize: '0.9rem' }}>{note}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        <div>
          <div className="card sticky-card">
            <h3 className="card-title mb-4">Tambah Hasil Evaluasi Mingguan</h3>
            <form onSubmit={handleAddEvaluation} className="form-group" style={{ gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.875rem', marginBottom: '0.5rem', display: 'block' }}>Periode Minggu</label>
                <input 
                  type="text" 
                  className="filter-input" 
                  style={{ width: '100%' }} 
                  placeholder="Contoh: Minggu Ke-3, Juni 2026" 
                  value={newEval.week}
                  onChange={e => setNewEval({...newEval, week: e.target.value})}
                  required
                />
              </div>
              <div>
                <label style={{ fontSize: '0.875rem', marginBottom: '0.5rem', display: 'block' }}>Poin Evaluasi Utama</label>
                <textarea 
                  className="filter-input" 
                  style={{ width: '100%', minHeight: '80px', resize: 'vertical' }} 
                  placeholder="Masukkan poin evaluasi..."
                  value={newEval.note1}
                  onChange={e => setNewEval({...newEval, note1: e.target.value})}
                  required
                ></textarea>
              </div>
              <div>
                <label style={{ fontSize: '0.875rem', marginBottom: '0.5rem', display: 'block' }}>Poin Rekomendasi (Opsional)</label>
                <textarea 
                  className="filter-input" 
                  style={{ width: '100%', minHeight: '80px', resize: 'vertical' }} 
                  placeholder="Masukkan poin rekomendasi..."
                  value={newEval.note2}
                  onChange={e => setNewEval({...newEval, note2: e.target.value})}
                ></textarea>
              </div>
              <button type="submit" className="action-btn" style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}>
                <FiSave /> Simpan Evaluasi
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Evaluation;
