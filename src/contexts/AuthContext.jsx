import React, { createContext, useContext, useState, useEffect } from 'react';
import { teamData } from '../data/dummyData';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local storage for saved session
    const savedUser = localStorage.getItem('dashboardUser');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = (username, password) => {
    // Simulate API call
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = teamData.find(u => u.username === username && u.password === password);
        if (user) {
          const userSession = {
            id: user.id,
            name: user.name,
            role: user.role,
            username: user.username
          };
          setCurrentUser(userSession);
          localStorage.setItem('dashboardUser', JSON.stringify(userSession));
          resolve(userSession);
        } else {
          reject(new Error('Username atau password salah!'));
        }
      }, 500); // 500ms artificial delay for realism
    });
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('dashboardUser');
  };

  const value = {
    currentUser,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
