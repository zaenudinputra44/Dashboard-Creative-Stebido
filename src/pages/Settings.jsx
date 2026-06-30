import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FiSave, FiBell, FiUser, FiVolume2, FiVolumeX, FiTrash2 } from 'react-icons/fi';

const Settings = () => {
  const { currentUser } = useAuth();
  
  // States for Settings
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [desktopNotif, setDesktopNotif] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Load preferences from localStorage
    const savedSound = localStorage.getItem('pref_sound');
    if (savedSound !== null) setSoundEnabled(savedSound === 'true');
    
    const savedDesktop = localStorage.getItem('pref_desktop');
    if (savedDesktop !== null) setDesktopNotif(savedDesktop === 'true');
  }, []);

  const handleSavePreferences = (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Save to local storage (since it's user-specific browser preferences)
    localStorage.setItem('pref_sound', soundEnabled);
    localStorage.setItem('pref_desktop', desktopNotif);
    
    setTimeout(() => {
      setIsSaving(false);
      alert('Preferensi berhasil disimpan!');
    }, 500);
  };



  return (
    <div className="page-container">
      <div className="mb-4">
        <h2>Pengaturan</h2>
      </div>

      <div className="dashboard-main-grid">
        {/* Profil Pengguna */}
        <div className="card">
          <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FiUser /> Profil Pengguna
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
            <div>
              <label className="text-muted" style={{ fontSize: '0.875rem' }}>Nama Lengkap</label>
              <input 
                type="text" 
                className="filter-input" 
                value={currentUser?.name || ''} 
                disabled 
                style={{ width: '100%', marginTop: '0.25rem', backgroundColor: 'var(--bg-color)' }} 
              />
            </div>
            <div>
              <label className="text-muted" style={{ fontSize: '0.875rem' }}>Role (Peran)</label>
              <input 
                type="text" 
                className="filter-input" 
                value={currentUser?.role || ''} 
                disabled 
                style={{ width: '100%', marginTop: '0.25rem', backgroundColor: 'var(--bg-color)' }} 
              />
            </div>
            <div>
              <label className="text-muted" style={{ fontSize: '0.875rem' }}>Username Login</label>
              <input 
                type="text" 
                className="filter-input" 
                value={currentUser?.username || ''} 
                disabled 
                style={{ width: '100%', marginTop: '0.25rem', backgroundColor: 'var(--bg-color)' }} 
              />
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              *Data profil saat ini dikelola oleh Administrator Server.
            </span>
          </div>
        </div>

        {/* Preferensi Sistem & Notifikasi */}
        <div className="card">
          <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FiBell /> Preferensi Notifikasi & Tampilan
          </h3>
          <p className="text-muted" style={{ fontSize: '0.875rem', marginTop: '0.5rem', marginBottom: '1rem' }}>
            Atur bagaimana sistem dasbor ini memberitahu Anda mengenai pembaruan pekerjaan dan konten.
          </p>
          <form onSubmit={handleSavePreferences} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            <div className="flex-between">
              <div>
                <strong style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {soundEnabled ? <FiVolume2 /> : <FiVolumeX />}
                  Suara Peringatan (Ping)
                </strong>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Mainkan suara ping saat ada notifikasi baru</div>
              </div>
              <input 
                type="checkbox" 
                checked={soundEnabled} 
                onChange={(e) => setSoundEnabled(e.target.checked)}
                style={{ transform: 'scale(1.2)' }}
              />
            </div>

            <div className="flex-between">
              <div>
                <strong style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FiBell /> Notifikasi Desktop (Browser)
                </strong>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Tampilkan pop-up notifikasi di luar browser</div>
              </div>
              <input 
                type="checkbox" 
                checked={desktopNotif} 
                onChange={(e) => setDesktopNotif(e.target.checked)}
                style={{ transform: 'scale(1.2)' }}
              />
            </div>

            <button type="submit" className="action-btn" style={{ width: 'fit-content', marginTop: '1rem' }} disabled={isSaving}>
              {isSaving ? 'Menyimpan...' : <><FiSave /> Simpan Preferensi</>}
            </button>
          </form>
        </div>



      </div>
    </div>
  );
};

export default Settings;
