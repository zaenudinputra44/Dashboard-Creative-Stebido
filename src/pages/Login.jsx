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
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');

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

  const handleResetSubmit = (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    setResetSuccess('');

    // Simulate sending reset email (1.5 seconds)
    setTimeout(() => {
      if (resetEmail.includes('@')) {
        setResetSuccess(`Tautan untuk mereset password telah dikirim ke: ${resetEmail}`);
        setResetEmail('');
      } else {
        setError('Mohon masukkan alamat email yang valid.');
      }
      setIsLoading(false);
    }, 1500);
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
                    onClick={() => { setIsResetView(true); setError(''); setResetSuccess(''); }}
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
        ) : (
          // RESET PASSWORD FORM
          <>
            <form onSubmit={handleResetSubmit} className="login-form">
              <h3 style={{ marginBottom: '1rem', color: 'var(--text-main)', textAlign: 'center' }}>Reset Password</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem', textAlign: 'center' }}>
                Masukkan alamat email yang terdaftar. Kami akan mengirimkan instruksi untuk membuat password baru.
              </p>
              
              <div className="form-group">
                <label htmlFor="resetEmail">Email Anda</label>
                <input 
                  type="email" 
                  id="resetEmail" 
                  className="login-input" 
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="contoh@gmail.com"
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
                {isLoading ? 'Memproses...' : 'Kirim Link Reset'}
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
        )}
      </div>
    </div>
  );
};

export default Login;
