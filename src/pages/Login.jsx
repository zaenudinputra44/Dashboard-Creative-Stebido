import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // States for Reset Password feature
  const [isResetView, setIsResetView] = useState(false);
  const [isOtpView, setIsOtpView] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');
  const [otpToken, setOtpToken] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(username, password);
      navigate('/'); // Redirect to dashboard on success
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    setResetSuccess('');

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'forgot', email: resetEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Terjadi kesalahan saat mengirim email.');
      }

      setResetSuccess(data.message);
      setIsOtpView(true); // Move to OTP verification step
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    setResetSuccess('');

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'reset', 
          email: resetEmail, 
          token: otpToken, 
          newPassword: newPassword 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Kode OTP tidak valid.');
      }

      // Success
      setResetSuccess(data.message);
      // Wait 2 seconds then go back to login
      setTimeout(() => {
        setIsResetView(false);
        setIsOtpView(false);
        setResetEmail('');
        setOtpToken('');
        setNewPassword('');
        setResetSuccess('');
      }, 3000);

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h2>Dashboard</h2>
          <p>Creative Stebido</p>
        </div>

        {!isResetView ? (
          // LOGIN FORM
          <>
            <form onSubmit={handleLoginSubmit} className="login-form">
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input 
                  type="text" 
                  id="username" 
                  className="login-input" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username Anda"
                  required
                />
              </div>
              
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <label htmlFor="password" style={{ marginBottom: 0 }}>Password</label>
                  <button 
                    type="button" 
                    onClick={() => { setIsResetView(true); setIsOtpView(false); setError(''); setResetSuccess(''); }}
                    style={{ background: 'none', border: 'none', color: 'var(--primary-color)', fontSize: '0.85rem', cursor: 'pointer', padding: 0 }}
                  >
                    Lupa Password?
                  </button>
                </div>
                <input 
                  type="password" 
                  id="password" 
                  className="login-input" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password Anda"
                  required
                />
              </div>

              {error && <div className="login-error">{error}</div>}

              <button type="submit" className="login-button" disabled={isLoading}>
                {isLoading ? 'Sedang Masuk...' : 'Masuk ke Dashboard'}
              </button>
            </form>
          </>
        ) : !isOtpView ? (
          // RESET PASSWORD FORM (Request OTP)
          <>
            <form onSubmit={handleResetSubmit} className="login-form">
              <h3 style={{ marginBottom: '1rem', color: 'var(--text-main)', textAlign: 'center' }}>Reset Password</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem', textAlign: 'center' }}>
                Masukkan alamat email Anda. Kami akan mengirimkan Kode OTP untuk mengatur ulang password.
              </p>
              
              <div className="form-group">
                <label htmlFor="resetEmail">Email Terdaftar</label>
                <input 
                  type="email" 
                  id="resetEmail" 
                  className="login-input" 
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="contoh@creativestebido.local"
                  required
                />
              </div>

              {error && <div className="login-error">{error}</div>}
              {resetSuccess && (
                <div style={{ padding: '0.75rem', backgroundColor: 'var(--success-color)', color: 'white', borderRadius: '4px', fontSize: '0.875rem', marginBottom: '1rem', textAlign: 'center' }}>
                  {resetSuccess}
                </div>
              )}

              <button type="submit" className="login-button" disabled={isLoading}>
                {isLoading ? 'Mengirim Kode...' : 'Kirim Kode OTP'}
              </button>
              
              <button 
                type="button" 
                onClick={() => { setIsResetView(false); setError(''); setResetSuccess(''); }}
                style={{ width: '100%', background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.9rem', cursor: 'pointer', marginTop: '1rem', padding: '0.5rem' }}
              >
                Kembali ke halaman Login
              </button>
            </form>
          </>
        ) : (
          // OTP & NEW PASSWORD FORM
          <>
            <form onSubmit={handleOtpSubmit} className="login-form">
              <h3 style={{ marginBottom: '1rem', color: 'var(--text-main)', textAlign: 'center' }}>Masukkan Kode OTP</h3>
              
              <div className="form-group">
                <label htmlFor="otpToken">Kode OTP (6 Angka)</label>
                <input 
                  type="text" 
                  id="otpToken" 
                  className="login-input" 
                  style={{ letterSpacing: '5px', textAlign: 'center', fontSize: '1.2rem', fontWeight: 'bold' }}
                  value={otpToken}
                  onChange={(e) => setOtpToken(e.target.value)}
                  placeholder="------"
                  maxLength={6}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="newPassword">Password Baru</label>
                <input 
                  type="password" 
                  id="newPassword" 
                  className="login-input" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Masukkan password baru"
                  required
                />
              </div>

              {error && <div className="login-error">{error}</div>}
              {resetSuccess && (
                <div style={{ padding: '0.75rem', backgroundColor: 'var(--success-color)', color: 'white', borderRadius: '4px', fontSize: '0.875rem', marginBottom: '1rem', textAlign: 'center' }}>
                  {resetSuccess}
                </div>
              )}

              <button type="submit" className="login-button" disabled={isLoading}>
                {isLoading ? 'Menyimpan...' : 'Simpan Password Baru'}
              </button>
              
              <button 
                type="button" 
                onClick={() => { setIsResetView(false); setIsOtpView(false); setError(''); setResetSuccess(''); }}
                style={{ width: '100%', background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.9rem', cursor: 'pointer', marginTop: '1rem', padding: '0.5rem' }}
              >
                Batal & Kembali ke Login
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default Login;
