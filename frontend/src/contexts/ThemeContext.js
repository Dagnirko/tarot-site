import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const ThemeContext = createContext();

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get(`${API}/settings`);
      setSettings(response.data);
      setTheme(response.data.theme || 'light');
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    }
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'mystical' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, settings, refreshSettings: fetchSettings }}>
      <div className={`theme-${theme}`}>
        {theme === 'mystical' && (
          <div className="mystical-bg">
            <div className="stars"></div>
            <div className="moon"></div>
          </div>
        )}
        {children}
      </div>
    </ThemeContext.Provider>
  );
};