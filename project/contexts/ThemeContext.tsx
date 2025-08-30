import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { Theme, ThemeContextType } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useLocalStorage<Theme>('theme', () => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? Theme.DARK : Theme.LIGHT;
    }
    return Theme.LIGHT;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(theme === Theme.LIGHT ? Theme.DARK : Theme.LIGHT);
    root.classList.add(theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === Theme.LIGHT ? Theme.DARK : Theme.LIGHT);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
