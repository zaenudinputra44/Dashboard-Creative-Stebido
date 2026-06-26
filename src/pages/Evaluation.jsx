import React, { useState } from 'react';
import { FiCheckSquare, FiSave } from 'react-icons/fi';

const Evaluation = () => {
  const [evaluations, setEvaluations] = useState([
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

  const [newEval, setNewEval] = useState({ week: '', note1: '', note2: '' });

  const handleAddEvaluation = (e) => {
    e.preventDefault();
    if (!newEval.week || !newEval.note1) return;
    
    const id = evaluations.length > 0 ? Math.max(...evaluations.map(e => e.id)) + 1 : 1;
    const notes = [newEval.note1];
    if (newEval.note2) notes.push(newEval.note2);

    setEvaluations(prev => [{ id, week: newEval.week, notes }, ...prev]);
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
          {evaluations.map((evalItem) => (
            <div className="card" key={evalItem.id}>
              <h3 className="card-title" style={{ color: 'var(--primary-color)', fontSize: '1.1rem', marginBottom: '1rem' }}>
                Evaluasi {evalItem.week}
              </h3>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingLeft: '0.5rem' }}>
                {evalItem.notes.map((note, idx) => (
                  <li key={idx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                    <FiCheckSquare style={{ color: 'var(--success-color)', marginTop: '0.25rem', flexShrink: 0 }} />
                    <span style={{ fontSize: '0.9rem' }}>{note}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
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
