import React from 'react';

const Settings = () => {
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
