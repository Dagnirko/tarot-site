import React, { createContext, useContext, useEffect } from 'react';

const AdminThemeContext = createContext();

export const AdminThemeProvider = ({ children }) => {
  const adminTheme = 'light'; // Fixed light theme for admin

  // Apply theme class to body for admin pages
  useEffect(() => {
    if (window.location.pathname.startsWith('/admin')) {
      // Remove site theme classes
      document.body.className = '';
      
      // Always use light theme for admin
      document.body.classList.add('admin-theme-light');
      document.documentElement.classList.remove('dark');
    }
  }, []);

  return (
    <AdminThemeContext.Provider value={{ adminTheme, loading: false }}>
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
