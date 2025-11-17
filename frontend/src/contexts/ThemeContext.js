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
    // Используем только включенные темы из настроек
    const enabledThemes = settings?.enabled_themes || ['light', 'mystical'];
    const currentIndex = enabledThemes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % enabledThemes.length;
    setTheme(enabledThemes[nextIndex]);
  };

  // Определяем, является ли тема темной
  const isDarkTheme = ['mystical', 'mars', 'jupiter', 'neptune', 'pluto'].includes(theme);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, settings, refreshSettings: fetchSettings }}>
      <div className={`theme-${theme}`}>
        {/* Light theme decorations */}
        {theme === 'light' && (
          <div className="light-bg">
            <div className="clouds"></div>
            <div className="sun"></div>
          </div>
        )}
        {/* Dark theme decorations */}
        {isDarkTheme && theme === 'mystical' && (
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