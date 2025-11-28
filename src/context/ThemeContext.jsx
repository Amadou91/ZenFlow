/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '../utils/supabase';

const ThemeContext = createContext();

const DEFAULT_THEME = {
  light: {
    primary: '#0f766e',
    secondary: '#7c3aed',
    accent: '#fbbf24',
    surface: '#f9fafb',
    card: '#ffffff',
    muted: '#475569',
    text: '#0f172a',
    gradientFrom: '#99f6e4',
    gradientTo: '#f0abfc',
    glow: '#99f6e4',
  },
  dark: {
    primary: '#5eead4',
    secondary: '#c4b5fd',
    accent: '#fb7185',
    surface: '#0b101b',
    card: '#111827',
    muted: '#cbd5e1',
    text: '#e5e7eb',
    gradientFrom: '#0ea5e9',
    gradientTo: '#6366f1',
    glow: '#0ea5e9',
  },
};

const getStoredTheme = () => {
  if (typeof window === 'undefined') return DEFAULT_THEME;
  const cached = localStorage.getItem('zenflow_theme_palette');
  if (!cached) return DEFAULT_THEME;
  try {
    return JSON.parse(cached);
  } catch (e) {
    console.warn('Failed to parse saved theme palette', e);
    return DEFAULT_THEME;
  }
};

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('zenflow_theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });
  const [theme, setTheme] = useState(() => getStoredTheme());
  const [themeLoading, setThemeLoading] = useState(true);

  const palette = useMemo(() => (darkMode ? theme.dark : theme.light), [darkMode, theme]);

  const applyPalette = (nextPalette) => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    Object.entries(nextPalette).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });
  };

  useEffect(() => {
    localStorage.setItem('zenflow_theme', darkMode ? 'dark' : 'light');
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    applyPalette(palette);
    if (typeof window !== 'undefined') {
      localStorage.setItem('zenflow_theme_palette', JSON.stringify(theme));
    }
  }, [palette, theme]);

  useEffect(() => {
    const fetchTheme = async () => {
      try {
        const { data, error } = await supabase
          .from('theme_settings')
          .select('theme')
          .eq('id', 'global')
          .maybeSingle();

        if (error) throw error;
        if (data?.theme) {
          setTheme(data.theme);
          applyPalette(darkMode ? data.theme.dark : data.theme.light);
        }
      } catch (err) {
        console.warn('Using default theme palette:', err.message);
      } finally {
        setThemeLoading(false);
      }
    };

    fetchTheme();
  }, [darkMode]);

  const toggleTheme = () => setDarkMode(!darkMode);

  const previewTheme = (nextTheme) => {
    setTheme(nextTheme);
    applyPalette(darkMode ? nextTheme.dark : nextTheme.light);
  };

  const saveTheme = async (nextTheme) => {
    setTheme(nextTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('zenflow_theme_palette', JSON.stringify(nextTheme));
    }

    await supabase.from('theme_settings').upsert([
      { id: 'global', theme: nextTheme, updated_at: new Date().toISOString() },
    ]);
  };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleTheme, theme, previewTheme, saveTheme, themeLoading }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);