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

const getInitialDarkMode = () => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('zenflow_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  return false;
};

export const ThemeProvider = ({ children }) => {
  const initialDarkMode = getInitialDarkMode();
  const [darkMode, setDarkMode] = useState(initialDarkMode);
  const [theme, setTheme] = useState(() => getStoredTheme());
  const [themeLoading, setThemeLoading] = useState(true);
  const [appliedPalette, setAppliedPalette] = useState(() => {
    const stored = getStoredTheme();
    return initialDarkMode ? stored.dark : stored.light;
  });

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
    if (typeof window !== 'undefined') {
      localStorage.setItem('zenflow_theme_palette', JSON.stringify(theme));
    }
  }, [theme]);

  useEffect(() => {
    setAppliedPalette(palette);
  }, [palette]);

  useEffect(() => {
    if (appliedPalette) applyPalette(appliedPalette);
  }, [appliedPalette]);

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
          setAppliedPalette(darkMode ? data.theme.dark : data.theme.light);
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
    setAppliedPalette(darkMode ? nextTheme.dark : nextTheme.light);
  };

  const resetPreviewTheme = () => {
    setAppliedPalette(darkMode ? theme.dark : theme.light);
  };

  const saveTheme = async (nextTheme) => {
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

    if (error) {
      if (error?.message?.includes("Could not find the table 'public.theme_settings'")) {
        throw new Error('Theme storage table missing. Apply the SQL in supabase/schema/theme_settings.sql to create it.');
      }
      setAppliedPalette(palette);
      throw error;
    }

    const persistedTheme = data?.theme || nextTheme;
    setTheme(persistedTheme);
    setAppliedPalette(darkMode ? persistedTheme.dark : persistedTheme.light);
    if (typeof window !== 'undefined') {
      localStorage.setItem('zenflow_theme_palette', JSON.stringify(persistedTheme));
    }
  };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleTheme, theme, previewTheme, resetPreviewTheme, saveTheme, themeLoading }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);