/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../utils/supabase';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const adminEmail = useMemo(() => (import.meta.env.VITE_ADMIN_EMAIL || '').toLowerCase(), []);

  const ensureConfigured = () => {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
    }
  };

  const signup = async (email, password, name) => {
    ensureConfigured();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });
    if (error) throw error;

    if (data.user) {
      const adminFlag = data.user.email?.toLowerCase() === adminEmail;
      await supabase.from('profiles').upsert([
        { id: data.user.id, full_name: name, email, is_admin: adminFlag }
      ]);
    }
    return data;
  };

  const login = async (email, password) => {
    ensureConfigured();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  const logout = async () => {
    ensureConfigured();
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const loadProfile = async (userId) => {
    if (!userId) return null;
    if (!isSupabaseConfigured || !supabase) return null;
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
    if (error) throw error;
    if (data) setProfile(data);
    return data;
  };

  useEffect(() => {
    const checkSession = async () => {
      if (!isSupabaseConfigured || !supabase) {
        setLoading(false);
        return;
      }
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;

        setCurrentUser(session?.user || null);
        if (session?.user) await loadProfile(session.user.id);
      } catch (err) {
        console.error('Failed to fetch auth session', err);
        setCurrentUser(null);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };
    checkSession();

    if (!isSupabaseConfigured || !supabase) return undefined;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setCurrentUser(session?.user || null);
      if (session?.user) await loadProfile(session.user.id);
      else setProfile(null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const isAdmin = useMemo(() => {
    const email = currentUser?.email?.toLowerCase();
    const profileAdmin = profile?.is_admin;
    return Boolean(email && email === adminEmail) || Boolean(profileAdmin);
  }, [adminEmail, currentUser, profile]);

  const value = { currentUser, profile, signup, login, logout, isAdmin, authLoading: loading };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};