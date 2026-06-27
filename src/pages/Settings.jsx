import React, { useState, useEffect } from 'react';

const Settings = () => {
  const [metaToken, setMetaToken] = useState('');
  const [adAccountId, setAdAccountId] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.META_ACCESS_TOKEN) setMetaToken(data.META_ACCESS_TOKEN);
        if (data.META_AD_ACCOUNT_ID) setAdAccountId(data.META_AD_ACCOUNT_ID);
      })
      .catch(err => console.error('Failed to load settings:', err));
  }, []);

  const handleSaveMeta = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settings: {
            META_ACCESS_TOKEN: metaToken,
            META_AD_ACCOUNT_ID: adAccountId
          }
        })
      });
      if (!res.ok) throw new Error('Failed to save settings');
      alert('Kredensial Meta berhasil disimpan!');
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
          <h3 className="card-title">Integrasi Meta API</h3>
          <p className="text-muted" style={{ fontSize: '0.875rem', marginTop: '0.5rem', marginBottom: '1rem' }}>
            Masukkan kredensial Meta Graph API untuk menarik data performa (CTR, ROAS, dll) secara real-time.
          </p>
          <form onSubmit={handleSaveMeta} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
            <button type="submit" className="action-btn" style={{ width: 'fit-content' }} disabled={isSaving}>
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
