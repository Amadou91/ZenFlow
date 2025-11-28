/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../utils/supabase';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Update: Parse comma-separated list of admin emails
  const adminEmails = useMemo(() => {
    const envVar = import.meta.env.VITE_ADMIN_EMAIL || '';
    return envVar.split(',').map(email => email.trim().toLowerCase()).filter(Boolean);
  }, []);

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

    // Check if session is null (implies email confirmation is required)
    if (data.user && !data.session) {
       return { user: data.user, session: null, confirmationRequired: true };
    }

    // If we got a session, create profile immediately
    if (data.user) {
      // Update: Check if email is in the list of admin emails
      const adminFlag = adminEmails.includes(data.user.email?.toLowerCase());
      await supabase.from('profiles').upsert([
        { id: data.user.id, full_name: name, email, is_admin: adminFlag }
      ]);
    }
    
    return { ...data, confirmationRequired: false };
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

    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
      if (error) throw error;
      if (data) setProfile(data);
      return data;
    } catch (error) {
      console.error('Failed to load profile', error);
      return null;
    }
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

        if (session?.user) {
            setCurrentUser(session.user);
            loadProfile(session.user.id);
        } else {
            setCurrentUser(null);
            setProfile(null);
        }
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
      if (session?.user) {
          setCurrentUser(session.user);
          loadProfile(session.user.id);
      } else {
          setCurrentUser(null);
          setProfile(null);
      }
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  const isAdmin = useMemo(() => {
    const email = currentUser?.email?.toLowerCase();
    const profileAdmin = profile?.is_admin;
    // Update: Check against array of admin emails
    return (email && adminEmails.includes(email)) || Boolean(profileAdmin);
  }, [adminEmails, currentUser, profile]);

  const value = { currentUser, profile, signup, login, logout, isAdmin, authLoading: loading };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};