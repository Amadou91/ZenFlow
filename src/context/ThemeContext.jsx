/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../utils/supabase';

const ThemeContext = createContext();

const DEFAULT_THEME = {
  light: {
    primary: '#c8748f',
    secondary: '#7f6c9f',
    accent: '#f2d3c2',
    surface: '#fdf6f3',
    card: '#f9f1ed',
    muted: '#6a5c5f',
    text: '#2f2729',
    gradientFrom: '#f7d4dd',
    gradientTo: '#c8d8d0',
    glow: '#f2c4cf',
  },
  dark: {
    primary: '#f0b7c6',
    secondary: '#b7accf',
    accent: '#d4b7a6',
    surface: '#14161b',
    card: '#1d2027',
    muted: '#b8b1ad',
    text: '#ece8e4',
    gradientFrom: '#7c8c9f',
    gradientTo: '#c59aa8',
    glow: '#9eb8c6',
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
      if (!isSupabaseConfigured || !supabase) {
        setThemeLoading(false);
        return;
      }
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
    const appliedPalette = darkMode ? nextTheme.dark : nextTheme.light;
    setTheme(nextTheme);
    applyPalette(appliedPalette);

    if (typeof window !== 'undefined') {
      localStorage.setItem('zenflow_theme_palette', JSON.stringify(nextTheme));
    }

    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured; please add Supabase environment variables to persist the theme.');
    }

    const { data, error } = await supabase
      .from('theme_settings')
      .upsert([
        { id: 'global', theme: nextTheme, updated_at: new Date().toISOString() },
      ])
      .select('theme')
      .maybeSingle();

    if (error) throw error;

    if (data?.theme) {
      setTheme(data.theme);
      applyPalette(darkMode ? data.theme.dark : data.theme.light);
      if (typeof window !== 'undefined') {
        localStorage.setItem('zenflow_theme_palette', JSON.stringify(data.theme));
      }
    }
  };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleTheme, theme, previewTheme, saveTheme, themeLoading }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);