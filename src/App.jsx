import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { FiHome, FiCalendar, FiUsers, FiTrendingUp, FiAward, FiAlertCircle, FiTool, FiCheckSquare, FiSettings, FiSun, FiMoon, FiLogOut } from 'react-icons/fi';
import Dashboard from './pages/Dashboard';
import Monitoring from './pages/Monitoring';
import Productivity from './pages/Productivity';
import Performance from './pages/Performance';
import Winning from './pages/Winning';
import Technical from './pages/Technical';
import Evaluation from './pages/Evaluation';
import Settings from './pages/Settings';
import Login from './pages/Login';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import './App.css';

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();
  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  return children;
};

// Layout Component
const Layout = ({ children, theme, toggleTheme }) => {
  const location = useLocation();
  const { currentUser, logout } = useAuth();
  
  const menuItems = [
    { path: '/', name: 'Dashboard Utama', icon: <FiHome /> },
    { path: '/monitoring', name: 'Monitoring Pekerjaan', icon: <FiCalendar /> },
    { path: '/productivity', name: 'Produktivitas Tim', icon: <FiUsers /> },
    { path: '/performance', name: 'Performa Konten', icon: <FiTrendingUp /> },
    { path: '/winning', name: 'Winning Content', icon: <FiAward /> },
    { path: '/technical', name: 'Kendala Teknis', icon: <FiTool /> },
    { path: '/evaluation', name: 'Evaluasi & Rekomendasi', icon: <FiCheckSquare /> },
    { path: '/settings', name: 'Pengaturan', icon: <FiSettings /> },
  ];

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>Dashboard</h2>
          <p>Creative Stebido</p>
        </div>
        <nav className="sidebar-nav">
          <ul>
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link to={item.path} className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}>
                  <span className="nav-icon">{item.icon}</span>
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
      
      <main className="main-content">
        <header className="header">
          <div className="header-title">
            <h1>{menuItems.find(item => item.path === location.pathname)?.name || 'Dashboard'}</h1>
          </div>
          <div className="header-actions">
            <select className="period-selector">
              <option value="today">Hari Ini</option>
              <option value="this-week">Minggu Ini</option>
              <option value="this-month">Bulan Ini</option>
            </select>
            <button className="theme-toggle" onClick={toggleTheme}>
              {theme === 'light' ? <FiMoon size={20} /> : <FiSun size={20} />}
            </button>
            <div className="user-profile" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{currentUser?.name || 'User'}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{currentUser?.role || 'Role'}</div>
              </div>
              <div className="avatar">{currentUser?.name?.charAt(0) || 'U'}</div>
              <button 
                onClick={logout}
                title="Keluar"
                style={{ marginLeft: '0.5rem', color: 'var(--danger-color)', display: 'flex', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <FiLogOut size={20} />
              </button>
            </div>
          </div>
        </header>
        
        <div className="page-content">
          {children}
        </div>
      </main>
    </div>
  );
};

const AppRoutes = () => {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/*" element={
        <ProtectedRoute>
          <Layout theme={theme} toggleTheme={toggleTheme}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/monitoring" element={<Monitoring />} />
              <Route path="/productivity" element={<Productivity />} />
              <Route path="/performance" element={<Performance />} />
              <Route path="/winning" element={<Winning />} />
              <Route path="/technical" element={<Technical />} />
              <Route path="/evaluation" element={<Evaluation />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </Layout>
        </ProtectedRoute>
      } />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
