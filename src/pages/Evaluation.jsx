import React, { useState, useEffect } from 'react';
import { FiCheckSquare, FiSquare, FiSave, FiTrash2 } from 'react-icons/fi';

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

  const handleToggleCheck = async (evalId, notesArray, noteIndex) => {
    const updatedNotes = notesArray.map((note, idx) => {
      if (idx === noteIndex) {
        const isObject = typeof note === 'object' && note !== null;
        return isObject 
          ? { ...note, checked: !note.checked } 
          : { text: note, checked: true };
      }
      return note;
    });

    setEvaluations(prev => prev.map(ev => 
      ev.id === evalId ? { ...ev, notes: updatedNotes } : ev
    ));

    try {
      await fetch('/api/evaluation', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: evalId, notes: updatedNotes })
      });
    } catch (err) {
      console.warn("Gagal update checked status", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus evaluasi ini?')) return;
    try {
      const res = await fetch(`/api/evaluation?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Gagal menghapus evaluasi');
      setEvaluations(prev => prev.filter(e => e.id !== id));
    } catch (err) {
      setEvaluations(prev => prev.filter(e => e.id !== id));
    }
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
              <div className="card" key={evalItem.id} style={{ position: 'relative' }}>
                <h3 className="card-title" style={{ color: 'var(--primary-color)', fontSize: '1.1rem', marginBottom: '1rem', paddingRight: '2rem' }}>
                  Evaluasi {evalItem.week}
                </h3>
                
                <button 
                  onClick={() => handleDelete(evalItem.id)}
                  style={{ position: 'absolute', top: '1.2rem', right: '1.2rem', background: 'none', border: 'none', color: 'var(--danger-color)', cursor: 'pointer', fontSize: '1.1rem' }}
                  title="Hapus Evaluasi"
                >
                  <FiTrash2 />
                </button>

                <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingLeft: '0.5rem' }}>
                  {notesArray.map((note, idx) => {
                    const isObject = typeof note === 'object' && note !== null;
                    const text = isObject ? note.text : note;
                    const isChecked = isObject ? note.checked : false;

                    return (
                      <li key={idx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                        <div 
                          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                          onClick={() => handleToggleCheck(evalItem.id, notesArray, idx)}
                        >
                          {isChecked ? (
                            <FiCheckSquare style={{ color: 'var(--success-color)', marginTop: '0.25rem', flexShrink: 0, fontSize: '1.1rem' }} />
                          ) : (
                            <FiSquare style={{ color: 'var(--border-color)', marginTop: '0.25rem', flexShrink: 0, fontSize: '1.1rem' }} />
                          )}
                        </div>
                        <span style={{ 
                          fontSize: '0.9rem', 
                          textDecoration: isChecked ? 'line-through' : 'none', 
                          color: isChecked ? 'var(--text-muted)' : 'inherit',
                          flex: 1
                        }}>
                          {text}
                        </span>
                      </li>
                    );
                  })}
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
