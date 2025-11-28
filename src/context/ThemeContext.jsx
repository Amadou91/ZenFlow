/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../utils/supabase';

const ThemeContext = createContext();

export const DEFAULT_THEME = {
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
    glowIntensity: 0.55,
    glowSoftness: 42,
    glowEnabled: true,
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
    glowIntensity: 0.45,
    glowSoftness: 46,
    glowEnabled: true,
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

const sanitizeTheme = (incoming) => ({
  light: { ...DEFAULT_THEME.light, ...(incoming?.light || {}) },
  dark: { ...DEFAULT_THEME.dark, ...(incoming?.dark || {}) },
});

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
  
  // "theme" holds the committed/saved state of both modes
  const [theme, setTheme] = useState(() => sanitizeTheme(getStoredTheme()));
  
  // "previewState" holds ephemeral changes (e.g. hovering a preset or tweaking a picker)
  // If null, we simply render "theme".
  const [previewState, setPreviewState] = useState(null);
  
  const [themeLoading, setThemeLoading] = useState(true);

  // The actual palette to display (preview takes precedence)
  const activeThemeObject = useMemo(() => previewState || theme, [previewState, theme]);
  const activePalette = useMemo(() => (darkMode ? activeThemeObject.dark : activeThemeObject.light), [darkMode, activeThemeObject]);

  const applyPalette = useCallback((paletteToApply) => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    const { glowIntensity, glowSoftness, glowEnabled, ...colorPalette } = paletteToApply || {};

    // 1. Apply standard colors
    Object.entries(colorPalette).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });

    // 2. Apply Glow Variables
    // We default to the provided intensity, or fall back to safe defaults if missing
    const safeIntensity = typeof glowIntensity === 'number' ? glowIntensity : 0.5;
    const safeSoftness = typeof glowSoftness === 'number' ? glowSoftness : 40;
    
    // Crucial: If disabled, force strength to 0 so it vanishes
    const appliedStrength = glowEnabled === false ? 0 : safeIntensity;

    root.style.setProperty('--glow-strength', appliedStrength);
    root.style.setProperty('--glow-softness', `${safeSoftness}px`);
    
    // We also set a flag for CSS usage if needed (0 or 1)
    root.style.setProperty('--glow-enabled', glowEnabled === false ? '0' : '1');
  }, []);

  // Update CSS variables whenever the active palette changes
  useEffect(() => {
    if (activePalette) applyPalette(activePalette);
  }, [activePalette, applyPalette]);

  // Handle Dark Mode toggling class
  useEffect(() => {
    localStorage.setItem('zenflow_theme', darkMode ? 'dark' : 'light');
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Persist "theme" to local storage whenever it changes (auto-save locally)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('zenflow_theme_palette', JSON.stringify(theme));
    }
  }, [theme]);

  // Initial Load from Supabase
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
          const hydrated = sanitizeTheme(data.theme);
          setTheme(hydrated);
        }
      } catch (err) {
        console.warn('Using default theme palette:', err.message);
      } finally {
        setThemeLoading(false);
      }
    };

    fetchTheme();
  }, []);

  const toggleTheme = useCallback(() => setDarkMode(prev => !prev), []);

  // Updates the PREVIEW state only (does not save)
  const previewTheme = useCallback((nextThemeState) => {
    const hydrated = sanitizeTheme(nextThemeState);
    setPreviewState(hydrated);
  }, []);

  // Reverts preview to the last saved "theme"
  const resetPreviewTheme = useCallback(() => {
    setPreviewState(null);
  }, []);

  // Persists the current state (or a passed state) to Supabase & LocalStorage
  const saveTheme = useCallback(async (themeToSave) => {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured; cannot save theme globally.');
    }

    // Use the passed theme, or fall back to current preview, or fall back to current saved
    const finalTheme = sanitizeTheme(themeToSave || previewState || theme);

    const { data, error } = await supabase
      .from('theme_settings')
      .upsert([
        { id: 'global', theme: finalTheme, updated_at: new Date().toISOString() },
      ])
      .select('theme')
      .maybeSingle();

    if (error) {
      console.error("Save Theme Error:", error);
      throw error;
    }

    // Update local state to match the saved data
    const persisted = sanitizeTheme(data?.theme || finalTheme);
    setTheme(persisted);
    setPreviewState(null); // Clear preview since we are now "saved"
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('zenflow_theme_palette', JSON.stringify(persisted));
    }
  }, [previewState, theme]);

  return (
    <ThemeContext.Provider value={{ 
      darkMode, 
      toggleTheme, 
      theme: activeThemeObject, // Consumers see the active preview
      savedTheme: theme,        // Explicit access to saved state if needed
      previewTheme, 
      resetPreviewTheme, 
      saveTheme, 
      themeLoading 
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);