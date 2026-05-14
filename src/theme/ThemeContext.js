import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const loadTheme = async () => {
      const saved = await AsyncStorage.getItem('theme');
      if (saved === 'dark') setIsDarkMode(true);
    };
    loadTheme();
  }, []);

  const toggleTheme = async () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    await AsyncStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

  const theme = {
    isDarkMode,
    colors: isDarkMode ? {
      background: ['#0f172a', '#1e1b4b'], // Deep Midnight Blue to Indigo
      card: 'rgba(30, 41, 59, 0.7)',     // Translucent Slate
      text: '#f8fafc',
      textSecondary: '#94a3b8',
      primary: '#8b5cf6',                // Vibrant Violet
      primaryDark: '#6d28d9',
      border: 'rgba(255,255,255,0.1)',
      inputBg: 'rgba(15, 23, 42, 0.5)',
      danger: '#f43f5e',                 // Rose
      success: '#10b981',                // Emerald
      chipBg: 'rgba(30, 41, 59, 0.8)',
      headerIcon: '#f8fafc',
      shadow: '#000',
    } : {
      background: ['#f8fafc', '#f1f5f9'], // Soft Pearl
      card: '#ffffff',
      text: '#0f172a',
      textSecondary: '#64748b',
      primary: '#6366f1',                // Sleek Indigo
      primaryDark: '#4f46e5',
      border: '#e2e8f0',
      inputBg: '#f8fafc',
      danger: '#ef4444',
      success: '#10b981',
      chipBg: '#ffffff',
      headerIcon: '#0f172a',
      shadow: 'rgba(99, 102, 241, 0.15)', // Tinted shadow
    }
  };

  return (
    <ThemeContext.Provider value={{ ...theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
