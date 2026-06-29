import React, { useState, useEffect, useRef } from 'react';
import { FiBell } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';

const NotificationBell = () => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  // Audio file for ping
  const pingAudio = useRef(new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'));

  useEffect(() => {
    if (!currentUser) return;

    const fetchNotifications = async () => {
      try {
        const res = await fetch(`/api/notifications?user_name=${encodeURIComponent(currentUser.name)}`);
        if (!res.ok) return;
        const data = await res.json();
        
        setNotifications(prev => {
          // Check if there's any new unread notification that wasn't in the previous state
          const newUnread = data.filter(n => !n.is_read);
          const prevUnreadIds = prev.filter(n => !n.is_read).map(n => n.id);
          
          const hasNew = newUnread.some(n => !prevUnreadIds.includes(n.id));
          if (hasNew && prev.length > 0) {
            // Play sound only if preference is true (default is true)
            const soundEnabled = localStorage.getItem('pref_sound') !== 'false';
            if (soundEnabled) {
              pingAudio.current.play().catch(e => console.warn('Audio play failed:', e));
            }
          }
          
          return data;
        });
      } catch (err) {
        console.error('Failed to fetch notifications:', err);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // poll every 10 seconds

    return () => clearInterval(interval);
  }, [currentUser]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      // Optimistic update
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: 'none', 
          border: 'none', 
          cursor: 'pointer', 
          position: 'relative',
          padding: '0.5rem',
          color: 'var(--text-main)',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <FiBell size={22} />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '0',
            right: '0',
            backgroundColor: 'var(--danger-color)',
            color: 'white',
            fontSize: '0.7rem',
            fontWeight: 'bold',
            borderRadius: '50%',
            padding: '2px 6px',
            minWidth: '18px',
            textAlign: 'center'
          }}>
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: '0',
          marginTop: '0.5rem',
          width: '350px',
          backgroundColor: 'var(--card-bg)',
          borderRadius: '8px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          zIndex: 1000,
          border: '1px solid var(--border-color)',
          maxHeight: '400px',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', fontWeight: 'bold' }}>
            Notifikasi
          </div>
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                Belum ada notifikasi
              </div>
            ) : (
              notifications.map(notif => (
                <div 
                  key={notif.id} 
                  onClick={() => !notif.is_read && handleMarkAsRead(notif.id)}
                  style={{ 
                    padding: '1rem', 
                    borderBottom: '1px solid var(--border-color)',
                    backgroundColor: notif.is_read ? 'transparent' : 'rgba(var(--primary-color-rgb), 0.05)',
                    cursor: notif.is_read ? 'default' : 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.25rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: notif.is_read ? 'normal' : 'bold', fontSize: '0.9rem' }}>{notif.title}</span>
                    {!notif.is_read && (
                      <span style={{ width: '8px', height: '8px', backgroundColor: 'var(--primary-color)', borderRadius: '50%' }}></span>
                    )}
                  </div>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{notif.message}</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    {new Date(notif.created_at).toLocaleString('id-ID')}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
