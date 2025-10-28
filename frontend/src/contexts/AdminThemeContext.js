import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AdminThemeContext = createContext();

export const AdminThemeProvider = ({ children }) => {
  const [adminTheme, setAdminTheme] = useState('light');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (token) {
        const response = await axios.get(`${API}/admin/preferences`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAdminTheme(response.data.admin_theme || 'light');
      }
    } catch (error) {
      console.error('Failed to load admin preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAdminTheme = async () => {
    const newTheme = adminTheme === 'light' ? 'dark' : 'light';
    setAdminTheme(newTheme);
    
    try {
      const token = localStorage.getItem('auth_token');
      if (token) {
        await axios.put(
          `${API}/admin/preferences`,
          { admin_theme: newTheme },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
    } catch (error) {
      console.error('Failed to save admin theme preference:', error);
    }
  };

  // Apply theme class to body for admin pages
  useEffect(() => {
    if (window.location.pathname.startsWith('/admin')) {
      // Remove site theme classes
      document.body.className = '';
      
      // Add admin theme class
      if (adminTheme === 'dark') {
        document.body.classList.add('admin-theme-dark');
        document.documentElement.classList.add('dark');
      } else {
        document.body.classList.add('admin-theme-light');
        document.documentElement.classList.remove('dark');
      }
    }
  }, [adminTheme]);

  return (
    <AdminThemeContext.Provider value={{ adminTheme, toggleAdminTheme, loading }}>
      {children}
    </AdminThemeContext.Provider>
  );
};

export const useAdminTheme = () => {
  const context = useContext(AdminThemeContext);
  if (!context) {
    throw new Error('useAdminTheme must be used within AdminThemeProvider');
  }
  return context;
};
