import React, { useState, useEffect } from 'react';

const Settings = () => {
  const [metaToken, setMetaToken] = useState('');
  const [adAccountId, setAdAccountId] = useState('');
  const [gmailUser, setGmailUser] = useState('');
  const [gmailPass, setGmailPass] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.META_ACCESS_TOKEN) setMetaToken(data.META_ACCESS_TOKEN);
        if (data.META_AD_ACCOUNT_ID) setAdAccountId(data.META_AD_ACCOUNT_ID);
        if (data.GMAIL_USER) setGmailUser(data.GMAIL_USER);
        if (data.GMAIL_PASS) setGmailPass(data.GMAIL_PASS);
      })
      .catch(err => console.error('Failed to load settings:', err));
  }, []);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settings: {
            META_ACCESS_TOKEN: metaToken,
            META_AD_ACCOUNT_ID: adAccountId,
            GMAIL_USER: gmailUser,
            GMAIL_PASS: gmailPass
          }
        })
      });
      if (!res.ok) throw new Error('Failed to save settings');
      alert('Pengaturan berhasil disimpan!');
    } catch (err) {
      alert('Mode Lokal: Kredensial hanya disimpan sementara di layar.');
    }
    setIsSaving(false);
  };

  return (
    <div className="page-container">
      <div className="mb-4">
        <h2>Pengaturan</h2>
      </div>

      <div className="dashboard-main-grid">
        <div className="card">
          <h3 className="card-title">Profil Pengguna</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
            <div>
              <label className="text-muted" style={{ fontSize: '0.875rem' }}>Nama Lengkap</label>
              <input type="text" className="filter-input" defaultValue="Budi (Leader)" style={{ width: '100%', marginTop: '0.25rem' }} />
            </div>
            <div>
              <label className="text-muted" style={{ fontSize: '0.875rem' }}>Role</label>
              <input type="text" className="filter-input" defaultValue="Leader Content Web Marketing" disabled style={{ width: '100%', marginTop: '0.25rem', backgroundColor: 'var(--bg-color)' }} />
            </div>
            <button className="action-btn" style={{ width: 'fit-content' }}>Simpan Perubahan</button>
          </div>
        </div>

        <div className="card">
          <h3 className="card-title">Integrasi API & SMTP</h3>
          <p className="text-muted" style={{ fontSize: '0.875rem', marginTop: '0.5rem', marginBottom: '1rem' }}>
            Masukkan kredensial API pihak ketiga dan email (Sandi Aplikasi) untuk menjalankan fungsi otomatis di dashboard.
          </p>
          <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label className="text-muted" style={{ fontSize: '0.875rem', display: 'block', marginBottom: '0.25rem' }}>Meta Access Token</label>
              <input 
                type="password" 
                className="filter-input" 
                style={{ width: '100%' }} 
                placeholder="EAAI..." 
                value={metaToken}
                onChange={(e) => setMetaToken(e.target.value)}
              />
            </div>
            <div>
              <label className="text-muted" style={{ fontSize: '0.875rem', display: 'block', marginBottom: '0.25rem' }}>Ad Account ID</label>
              <input 
                type="text" 
                className="filter-input" 
                style={{ width: '100%' }} 
                placeholder="act_123456789" 
                value={adAccountId}
                onChange={(e) => setAdAccountId(e.target.value)}
              />
            </div>
            
            <hr style={{ borderTop: '1px solid var(--border-color)', margin: '0.5rem 0' }} />
            <h4 style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>Email Reset Password (Gmail SMTP)</h4>
            
            <div>
              <label className="text-muted" style={{ fontSize: '0.875rem', display: 'block', marginBottom: '0.25rem' }}>Email Pengirim (Gmail)</label>
              <input 
                type="email" 
                className="filter-input" 
                style={{ width: '100%' }} 
                placeholder="admin@gmail.com" 
                value={gmailUser}
                onChange={(e) => setGmailUser(e.target.value)}
              />
            </div>
            <div>
              <label className="text-muted" style={{ fontSize: '0.875rem', display: 'block', marginBottom: '0.25rem' }}>Sandi Aplikasi (App Password)</label>
              <input 
                type="password" 
                className="filter-input" 
                style={{ width: '100%' }} 
                placeholder="xxxx xxxx xxxx xxxx" 
                value={gmailPass}
                onChange={(e) => setGmailPass(e.target.value)}
              />
            </div>

            <button type="submit" className="action-btn" style={{ width: 'fit-content', marginTop: '0.5rem' }} disabled={isSaving}>
              {isSaving ? 'Menyimpan...' : 'Simpan Kredensial'}
            </button>
          </form>
        </div>

        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <h3 className="card-title">Preferensi Dashboard</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
            <div className="flex-between">
              <span>Notifikasi Pekerjaan Mendekati Deadline</span>
              <input type="checkbox" defaultChecked />
            </div>
            <div className="flex-between">
              <span>Notifikasi Pekerjaan Terlambat</span>
              <input type="checkbox" defaultChecked />
            </div>
            <div className="flex-between">
              <span>Notifikasi Kendala Belum Selesai</span>
              <input type="checkbox" defaultChecked />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
