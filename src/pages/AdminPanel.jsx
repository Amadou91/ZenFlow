import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../utils/supabase';
import { useAuth } from '../context/AuthContext';
import { DEFAULT_THEME, useTheme } from '../context/ThemeContext';
import DateTimePicker from '../components/DateTimePicker';
import { formatTimeLabel, parseDateTimeValue } from '../utils/dateTime';
import { THEME_PRESETS } from '../constants/themePresets';
import {
  ShieldCheck,
  CalendarRange,
  Palette,
  Save,
  Sparkles,
  Users,
  Pencil,
  Loader2,
  ClipboardList,
  SunMedium,
  MoonStar,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Info,
  X,
  Trash2,
  Upload,
  Wand2,
} from 'lucide-react';

const emptyClass = {
  id: '',
  title: '',
  date: '',
  duration: '',
  location: '',
  instructor: '',
  price: 0,
  capacity: 10,
  waitlist_capacity: 5,
  description: '',
};

const emptyRetreat = {
  id: '',
  title: '',
  start_date: '',
  end_date: '',
  location: '',
  description: '',
  price: 0,
  capacity: 12,
  waitlist_capacity: 6,
  image_url: '',
  date_label: '',
};

const formatDateRange = (start, end) => {
  if (!start && !end) return '';
  const startDate = start ? new Date(start) : null;
  const endDate = end ? new Date(end) : null;
  if (!startDate && endDate) return endDate.toLocaleDateString();
  if (startDate && !endDate) return startDate.toLocaleDateString();
  return `${startDate.toLocaleDateString()} – ${endDate.toLocaleDateString()}`;
};

const normalizeClassRow = (row) => ({
  ...row,
  time: row?.time || formatTimeLabel(row?.date),
});

const AdminPanel = () => {
  const navigate = useNavigate();
  const { currentUser, isAdmin } = useAuth();
  const { theme, previewTheme, resetPreviewTheme, saveTheme, darkMode, toggleTheme } = useTheme();
  const [classes, setClasses] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [retreats, setRetreats] = useState([]);
  const [retreatSignups, setRetreatSignups] = useState([]);
  const retreatSignupCounts = useMemo(() => {
    const counts = new Map();
    retreatSignups.forEach((entry) => {
      counts.set(entry.retreat_id, (counts.get(entry.retreat_id) || 0) + 1);
    });
    return counts;
  }, [retreatSignups]);
  const retreatSignupMap = useMemo(() => {
    const map = new Map();
    retreatSignups.forEach((entry) => {
      const existing = map.get(entry.retreat_id) || [];
      existing.push(entry);
      map.set(entry.retreat_id, existing);
    });
    return map;
  }, [retreatSignups]);
  const [loading, setLoading] = useState(true);
  const [savingClass, setSavingClass] = useState(false);
  const [savingTheme, setSavingTheme] = useState(false);
  const [draftClass, setDraftClass] = useState(emptyClass);
  const [editClassDraft, setEditClassDraft] = useState(null);
  const [draftRetreat, setDraftRetreat] = useState(emptyRetreat);
  const [draftTheme, setDraftTheme] = useState(theme);
  const [toasts, setToasts] = useState([]);
  const [classToDelete, setClassToDelete] = useState(null);
  const [retreatToDelete, setRetreatToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [presetPreview, setPresetPreview] = useState('');
  const [randomizing, setRandomizing] = useState(false);
  const toastRegionRef = useRef(null);

  const activePaletteKey = darkMode ? 'dark' : 'light';
  const activePaletteLabel = darkMode ? 'Dark' : 'Light';
  const activePalette = draftTheme?.[activePaletteKey] || {};

  const paletteGroups = useMemo(() => [
    {
      title: 'Brand & Actions',
      description: 'Primary accents, CTAs, and supportive highlights.',
      fields: [
        { key: 'primary', label: 'Primary' },
        { key: 'secondary', label: 'Secondary' },
        { key: 'accent', label: 'Accent' },
      ],
    },
    {
      title: 'Surfaces & Text',
      description: 'Backgrounds, cards, muted text, and body copy.',
      fields: [
        { key: 'surface', label: 'Surface' },
        { key: 'card', label: 'Card' },
        { key: 'muted', label: 'Muted Text' },
        { key: 'text', label: 'Primary Text' },
      ],
    },
    {
      title: 'Depth & Glow',
      description: 'Gradients and ambient glows used in decorative areas.',
      fields: [
        { key: 'gradientFrom', label: 'Gradient From' },
        { key: 'gradientTo', label: 'Gradient To' },
        { key: 'glow', label: 'Ambient Glow' },
      ],
    },
  ], []);

  useEffect(() => setDraftTheme(theme), [theme]);

  useEffect(() => {
    previewTheme(draftTheme);
  }, [darkMode, draftTheme, previewTheme]);

  const addToast = useCallback((type, text) => {
    if (!text) return;
    const id = crypto.randomUUID();
    const tone = type || 'info';
    setToasts((prev) => [...prev, { id, type: tone, text }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 5200);
  }, []);

  useEffect(() => {
    if (!toasts.length) return;
    toastRegionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [toasts.length]);

  useEffect(() => {
    const load = async () => {
      if (!isSupabaseConfigured || !supabase) {
        addToast('info', 'Configure Supabase to manage classes and bookings.');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const [
          { data: classData, error: classError },
          { data: bookingData, error: bookingError },
          { data: retreatData, error: retreatError },
          { data: signupData, error: signupError },
        ] = await Promise.all([
          supabase.from('classes').select('*').order('date', { ascending: true }),
          supabase.from('bookings').select('*').order('created_at', { ascending: false }),
          supabase.from('retreats').select('*').order('start_date', { ascending: true }),
          supabase.from('retreat_signups').select('*').order('created_at', { ascending: false }),
        ]);

        if (classError) throw classError;
        if (bookingError) throw bookingError;
        if (retreatError && !`${retreatError.message}`.includes('does not exist')) throw retreatError;
        if (signupError && !`${signupError.message}`.includes('does not exist')) throw signupError;

        const classRows = (classData || []).map(normalizeClassRow);
        const bookingRows = bookingData || [];
        const retreatRows = retreatData || [];
        const signupRows = signupData || [];

        const userIds = new Set([
          ...bookingRows.map((row) => row.user_id).filter(Boolean),
          ...signupRows.map((row) => row.user_id).filter(Boolean),
        ]);

        let profileMap = {};
        if (userIds.size) {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, full_name, email')
            .in('id', Array.from(userIds));
          profileMap = Object.fromEntries((profiles || []).map((p) => [p.id, p]));
        }

        setClasses(classRows);
        setBookings(bookingRows.map((row) => ({ ...row, profile: profileMap[row.user_id] })));
        setRetreats(retreatRows);
        setRetreatSignups(signupRows.map((row) => ({ ...row, profile: profileMap[row.user_id] })));
      } catch (err) {
        console.warn('Falling back to in-memory classes:', err.message);
        setClasses([]);
        setBookings([]);
        setRetreats([]);
        setRetreatSignups([]);
        addToast('warning', 'Supabase tables are not ready yet. Data will load once they exist.');
      } finally {
        setLoading(false);
      }
    };
    if (isAdmin && currentUser) load();
  }, [addToast, currentUser, isAdmin]);

  useEffect(() => {
    if (!isAdmin || !isSupabaseConfigured || !supabase) return undefined;

    const bookingsChannel = supabase.channel('admin-bookings-stream')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, (payload) => {
        const mergeProfile = async (row) => {
          if (!row?.user_id) return row;
          const { data: profile } = await supabase
            .from('profiles')
            .select('id, full_name, email')
            .eq('id', row.user_id)
            .maybeSingle();
          return { ...row, profile: profile || null };
        };

        if (payload.eventType === 'INSERT') {
          mergeProfile(payload.new).then((row) => setBookings((prev) => [row, ...prev]));
        }
        if (payload.eventType === 'UPDATE') {
          mergeProfile(payload.new).then((row) => setBookings((prev) => prev.map((item) => (item.id === row.id ? row : item))));
        }
        if (payload.eventType === 'DELETE') {
          setBookings((prev) => prev.filter((item) => item.id !== payload.old.id));
        }
      })
      .subscribe();

    const retreatsChannel = supabase
      .channel('admin-retreats-stream')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'retreats' }, (payload) => {
        if (payload.eventType === 'INSERT') setRetreats((prev) => [payload.new, ...prev]);
        if (payload.eventType === 'UPDATE') setRetreats((prev) => prev.map((r) => (r.id === payload.new.id ? payload.new : r)));
        if (payload.eventType === 'DELETE') setRetreats((prev) => prev.filter((r) => r.id !== payload.old.id));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(bookingsChannel);
      supabase.removeChannel(retreatsChannel);
    };
  }, [isAdmin]);

  const startEdit = (cls) => {
    setEditClassDraft({ ...cls });
  };

  const resetForm = () => {
    setDraftClass(emptyClass);
  };

  const closeEditModal = () => {
    setEditClassDraft(null);
  };

  const startRetreatEdit = (retreat) => {
    setDraftRetreat({ ...retreat });
  };

  const resetRetreatForm = () => {
    setDraftRetreat(emptyRetreat);
  };

  const handleClassChange = (field, value) => {
    setDraftClass((prev) => ({ ...prev, [field]: value }));
  };

  const handleEditClassChange = (field, value) => {
    setEditClassDraft((prev) => ({ ...prev, [field]: value }));
  };

  const handleRetreatChange = (field, value) => {
    setDraftRetreat((prev) => ({ ...prev, [field]: value }));
  };

  const persistClassDraft = async (draft, onSuccess) => {
    setSavingClass(true);

    const requiredFields = ['title', 'date', 'duration', 'location', 'instructor'];
    const missing = requiredFields.filter((key) => !draft?.[key]);
    if (missing.length) {
      addToast('error', `Please complete: ${missing.join(', ')}.`);
      setSavingClass(false);
      return;
    }

    const parsedDate = parseDateTimeValue(draft.date);
    if (!parsedDate) {
      addToast('error', 'Provide a valid date & time for the class.');
      setSavingClass(false);
      return;
    }

    if (!isSupabaseConfigured || !supabase) {
      addToast('error', 'Supabase is not configured. Add credentials to save classes.');
      setSavingClass(false);
      return;
    }

    const payload = {
      ...draft,
      id: draft.id || crypto.randomUUID(),
      date: parsedDate.toISOString(),
      time: formatTimeLabel(parsedDate),
    };

    try {
      const { data, error } = await supabase.from('classes').upsert([payload]).select();
      if (error) {
        if (error?.message?.includes("Could not find the table 'public.classes'")) {
          addToast('error', 'Classes table is missing. Apply supabase/schema/classes.sql to create it.');
        }
        throw error;
      }
      const savedRow = normalizeClassRow(data?.[0] || payload);
      setClasses((prev) => {
        const existingIdx = prev.findIndex((c) => c.id === savedRow.id);
        if (existingIdx >= 0) {
          const clone = [...prev];
          clone[existingIdx] = savedRow;
          return clone;
        }
        return [savedRow, ...prev];
      });
      addToast('success', 'Class saved successfully.');
      onSuccess?.();
    } catch (err) {
      addToast('error', `Unable to save class: ${err.message}`);
    } finally {
      setSavingClass(false);
    }
  };

  const saveClass = async (e) => {
    e.preventDefault();
    await persistClassDraft(draftClass, resetForm);
  };

  const saveEditedClass = async () => {
    await persistClassDraft(editClassDraft, closeEditModal);
  };

  const uploadRetreatImage = async (retreatId, file) => {
    if (!file) return null;
    setUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `retreats/${retreatId}/${crypto.randomUUID()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('retreat-images').upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('retreat-images').getPublicUrl(filePath);
      return data?.publicUrl || null;
    } finally {
      setUploadingImage(false);
    }
  };

  const saveRetreat = async (e) => {
    e.preventDefault();
    setSavingClass(true);

    const required = ['title', 'location'];
    const missing = required.filter((key) => !draftRetreat[key]);
    if (missing.length) {
      addToast('error', `Please complete: ${missing.join(', ')}`);
      setSavingClass(false);
      return;
    }

    if (!isSupabaseConfigured || !supabase) {
      addToast('error', 'Supabase is not configured. Add credentials to save retreats.');
      setSavingClass(false);
      return;
    }

    const retreatId = draftRetreat.id || crypto.randomUUID();
    let imageUrl = draftRetreat.image_url;
    const imageInput = document.getElementById('retreat-image-input');
    const file = imageInput?.files?.[0];

    try {
      if (file) {
        imageUrl = await uploadRetreatImage(retreatId, file);
      }

      const payload = {
        ...draftRetreat,
        id: retreatId,
        image_url: imageUrl,
        date_label: draftRetreat.date_label || formatDateRange(draftRetreat.start_date, draftRetreat.end_date),
      };

      const { data, error } = await supabase.from('retreats').upsert([payload]).select();
      if (error) throw error;

      const saved = data?.[0] || payload;
      setRetreats((prev) => {
        const exists = prev.findIndex((r) => r.id === saved.id);
        if (exists >= 0) {
          const copy = [...prev];
          copy[exists] = saved;
          return copy;
        }
        return [saved, ...prev];
      });
      addToast('success', 'Retreat saved successfully.');
      resetRetreatForm();
      if (imageInput) imageInput.value = '';
    } catch (err) {
      addToast('error', `Unable to save retreat: ${err.message}`);
    } finally {
      setSavingClass(false);
    }
  };

  const deleteBooking = async (bookingId) => {
    if (!isSupabaseConfigured || !supabase) {
      addToast('error', 'Supabase is not configured.');
      return;
    }
    try {
      await supabase.from('bookings').delete().eq('id', bookingId);
      setBookings(prev => prev.filter(b => b.id !== bookingId));
    } catch (err) {
      addToast('error', `Unable to update booking: ${err.message}`);
    }
  };

  const confirmDeleteClass = async () => {
    if (!classToDelete) return;
    if (!isSupabaseConfigured || !supabase) {
      addToast('error', 'Supabase is not configured.');
      return;
    }
    setDeleting(true);
    try {
      await supabase.from('bookings').delete().eq('class_id', classToDelete.id);
      await supabase.from('classes').delete().eq('id', classToDelete.id);
      setClasses((prev) => prev.filter((c) => c.id !== classToDelete.id));
      setBookings((prev) => prev.filter((b) => b.class_id !== classToDelete.id));
      addToast('success', 'Class deleted and related bookings cleared.');
    } catch (err) {
      addToast('error', `Unable to delete class: ${err.message}`);
    } finally {
      setDeleting(false);
      setClassToDelete(null);
    }
  };

  const confirmDeleteRetreat = async () => {
    if (!retreatToDelete) return;
    if (!isSupabaseConfigured || !supabase) {
      addToast('error', 'Supabase is not configured.');
      return;
    }
    setDeleting(true);
    try {
      await supabase.from('retreat_signups').delete().eq('retreat_id', retreatToDelete.id);
      await supabase.from('retreats').delete().eq('id', retreatToDelete.id);
      setRetreats((prev) => prev.filter((r) => r.id !== retreatToDelete.id));
      setRetreatSignups((prev) => prev.filter((s) => s.retreat_id !== retreatToDelete.id));
      addToast('success', 'Retreat deleted. Associated signups removed.');
    } catch (err) {
      addToast('error', `Unable to delete retreat: ${err.message}`);
    } finally {
      setDeleting(false);
      setRetreatToDelete(null);
    }
  };

  const updateThemeField = (mode, key, value) => {
    const next = {
      ...DEFAULT_THEME,
      ...draftTheme,
      [mode]: { ...DEFAULT_THEME[mode], ...(draftTheme?.[mode] || {}), [key]: value },
    };
    setDraftTheme(next);
    previewTheme(next);
  };

  const applyThemeToEditor = (nextTheme) => {
    const hydrated = {
      light: { ...DEFAULT_THEME.light, ...(nextTheme?.light || {}) },
      dark: { ...DEFAULT_THEME.dark, ...(nextTheme?.dark || {}) },
    };
    setPresetPreview('');
    setDraftTheme(hydrated);
    previewTheme(hydrated);
  };

  const restoreSavedTheme = () => {
    setDraftTheme(theme);
    previewTheme(theme);
    setPresetPreview('');
    addToast('success', 'Restored the saved palette and preview.');
  };

  const persistTheme = async () => {
    setSavingTheme(true);
    try {
      await saveTheme(draftTheme);
      addToast('success', 'Theme saved and applied globally.');
    } catch (err) {
      addToast('error', `Unable to save theme: ${err.message}`);
    } finally {
      setSavingTheme(false);
    }
  };

  const generateHarmoniousPalette = () => {
    const baseHue = Math.floor(Math.random() * 360);
    const offset = (delta) => (baseHue + delta + 360) % 360;

    const light = {
      primary: `hsl(${offset(12)} 58% 52%)`,
      secondary: `hsl(${offset(220)} 32% 38%)`,
      accent: `hsl(${offset(46)} 62% 78%)`,
      surface: 'hsl(24 38% 96%)',
      card: 'hsl(26 36% 92%)',
      muted: 'hsl(20 14% 45%)',
      text: 'hsl(18 20% 16%)',
      gradientFrom: `hsl(${offset(25)} 52% 84%)`,
      gradientTo: `hsl(${offset(190)} 36% 78%)`,
      glow: `hsl(${offset(15)} 58% 72%)`,
    };

    const dark = {
      primary: `hsl(${offset(10)} 65% 72%)`,
      secondary: `hsl(${offset(215)} 34% 70%)`,
      accent: `hsl(${offset(40)} 52% 64%)`,
      surface: 'hsl(225 16% 11%)',
      card: 'hsl(225 16% 16%)',
      muted: 'hsl(220 14% 68%)',
      text: 'hsl(210 30% 94%)',
      gradientFrom: `hsl(${offset(210)} 32% 42%)`,
      gradientTo: `hsl(${offset(25)} 44% 58%)`,
      glow: `hsl(${offset(15)} 60% 52%)`,
    };

    return { light, dark };
  };

  const randomizeTheme = () => {
    setRandomizing(true);
    const palette = generateHarmoniousPalette();
    applyThemeToEditor(palette);
    addToast('info', 'Generated a new balanced palette. Save to keep it.');
    setRandomizing(false);
  };

  const previewPreset = (palette, name) => {
    setPresetPreview(name);
    previewTheme(palette);
  };

  const stopPresetPreview = () => {
    setPresetPreview('');
    previewTheme(draftTheme);
  };

  useEffect(() => () => resetPreviewTheme(), [resetPreviewTheme]);

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-[var(--color-surface)] text-[var(--color-text)]">
      <div className="bg-grain" />
      <div className="max-w-6xl mx-auto px-4 py-14 space-y-8 relative z-10">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="p-2 rounded-xl bg-[var(--color-card)] border border-black/5 shadow-card">
                <ShieldCheck className="text-[var(--color-primary)]" size={20} />
              </span>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-muted)]">Admin / Teacher</p>
                <h1 className="text-3xl font-serif font-bold">Control Center</h1>
              </div>
            </div>
            <p className="text-sm text-[var(--color-muted)]">Signed in as {currentUser?.email}</p>
          </div>
          <div className="flex gap-3 items-center">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-4 py-2 rounded-xl border border-black/5 bg-[var(--color-card)] shadow-card text-sm font-semibold flex items-center gap-2"
            >
              <ArrowLeft size={16} />
              Back to Site
            </button>
          </div>
        </header>

        <div
          ref={toastRegionRef}
          className="fixed inset-x-4 bottom-5 md:bottom-8 md:right-6 md:left-auto z-50 flex flex-col gap-3 items-stretch md:items-end pointer-events-none"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {toasts.map((toast) => {
            const tone = toast.type;
            const toneStyles = {
              success: 'bg-[var(--color-card)] text-[var(--color-text)] border-black/5',
              error: 'bg-rose-100 text-rose-900 border-rose-200 dark:bg-rose-900/80 dark:text-rose-50 dark:border-rose-700',
              warning: 'bg-amber-50 text-amber-900 border-amber-200 dark:bg-amber-900/70 dark:text-amber-50 dark:border-amber-700',
              info: 'bg-[var(--color-card)] text-[var(--color-text)] border-black/5',
            };
            const Icon = tone === 'success' ? CheckCircle2 : tone === 'error' ? AlertTriangle : tone === 'warning' ? AlertTriangle : Info;

            return (
              <div
                key={toast.id}
                className={`pointer-events-auto w-full md:w-[360px] rounded-2xl border shadow-lg shadow-black/10 dark:shadow-black/40 px-4 py-3 flex items-start gap-3 backdrop-blur-xl ${toneStyles[tone] || toneStyles.info}`}
              >
                <div className="mt-0.5 shrink-0">
                  <Icon size={18} />
                </div>
                <div className="flex-1 text-sm font-semibold leading-relaxed">{toast.text}</div>
                <button
                  type="button"
                  onClick={() => setToasts((prev) => prev.filter((item) => item.id !== toast.id))}
                  className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-[var(--color-muted)]"
                  aria-label="Dismiss notification"
                >
                  <X size={16} />
                </button>
              </div>
            );
          })}
        </div>

        <div className="grid md:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-[var(--color-card)] border border-black/5 shadow-card">
            <p className="text-[var(--color-muted)] text-xs uppercase tracking-[0.3em]">Classes</p>
            <p className="text-3xl font-serif font-bold mt-1">{classes.length}</p>
            <p className="text-xs text-[var(--color-muted)]">Upcoming experiences to manage.</p>
          </div>
          <div className="p-4 rounded-2xl bg-[var(--color-card)] border border-black/5 shadow-card">
            <p className="text-[var(--color-muted)] text-xs uppercase tracking-[0.3em]">Bookings</p>
            <p className="text-3xl font-serif font-bold mt-1">{bookings.length}</p>
            <p className="text-xs text-[var(--color-muted)]">Student reservations.</p>
          </div>
          <div className="p-4 rounded-2xl bg-[var(--color-card)] border border-black/5 shadow-card">
            <p className="text-[var(--color-muted)] text-xs uppercase tracking-[0.3em]">Retreats</p>
            <p className="text-3xl font-serif font-bold mt-1">{retreats.length}</p>
            <p className="text-xs text-[var(--color-muted)]">Immersive getaways.</p>
          </div>
          <div className="p-4 rounded-2xl bg-[var(--color-card)] border border-black/5 shadow-card">
            <p className="text-[var(--color-muted)] text-xs uppercase tracking-[0.3em]">Theme</p>
            <p className="text-3xl font-serif font-bold mt-1">Live</p>
            <p className="text-xs text-[var(--color-muted)]">Preview updates instantly.</p>
          </div>
        </div>

        {/* Teacher Tools */}
        <section className="bg-[var(--color-card)] border border-black/5 rounded-3xl shadow-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                <CalendarRange size={18} />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-muted)]">Scheduling</p>
                <h2 className="text-xl font-serif font-bold">Classes & Capacity</h2>
              </div>
            </div>
            <span className="text-xs font-semibold bg-[var(--color-primary)]/10 text-[var(--color-primary)] px-3 py-1 rounded-full">Teacher tools</span>
          </div>

          <form className="grid md:grid-cols-2 gap-4" onSubmit={saveClass}>
            <div className="space-y-3">
              <label className="text-xs text-[var(--color-muted)] font-semibold">Title</label>
              <input
                type="text"
                value={draftClass.title}
                onChange={(e) => handleClassChange('title', e.target.value)}
                className="admin-input"
                required
              />
              <DateTimePicker
                value={draftClass.date}
                onChange={(value) => handleClassChange('date', value)}
                required
              />
              <label className="text-xs text-[var(--color-muted)] font-semibold">Duration</label>
              <input
                type="text"
                value={draftClass.duration}
                onChange={(e) => handleClassChange('duration', e.target.value)}
                className="admin-input"
                placeholder="75 min"
              />
              <label className="text-xs text-[var(--color-muted)] font-semibold">Location</label>
              <input
                type="text"
                value={draftClass.location}
                onChange={(e) => handleClassChange('location', e.target.value)}
                className="admin-input"
              />
              <label className="text-xs text-[var(--color-muted)] font-semibold">Instructor</label>
              <input
                type="text"
                value={draftClass.instructor}
                onChange={(e) => handleClassChange('instructor', e.target.value)}
                className="admin-input"
                placeholder="Jocelyn"
              />
              <label className="text-xs text-[var(--color-muted)] font-semibold">Description</label>
              <textarea
                value={draftClass.description}
                onChange={(e) => handleClassChange('description', e.target.value)}
                className="admin-input"
                rows={3}
              />
            </div>

            <div className="space-y-3">
              <label className="text-xs text-[var(--color-muted)] font-semibold">Price</label>
              <input
                type="number"
                value={draftClass.price}
                onChange={(e) => handleClassChange('price', Number(e.target.value))}
                className="admin-input"
              />
              <label className="text-xs text-[var(--color-muted)] font-semibold">Capacity</label>
              <input
                type="number"
                value={draftClass.capacity}
                onChange={(e) => handleClassChange('capacity', Number(e.target.value))}
                className="admin-input"
              />
              <label className="text-xs text-[var(--color-muted)] font-semibold">Waitlist Capacity</label>
              <input
                type="number"
                value={draftClass.waitlist_capacity}
                onChange={(e) => handleClassChange('waitlist_capacity', Number(e.target.value))}
                className="admin-input"
              />

              <div className="flex gap-3 mt-4">
                <button
                  type="submit"
                  disabled={savingClass}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[var(--color-primary)] text-white font-bold shadow-lg shadow-teal-900/20"
                >
                  {savingClass ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                  {draftClass.id ? 'Update Class' : 'Create Class'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-3 rounded-xl border border-black/5 bg-[var(--color-card)] text-[var(--color-text)] font-semibold shadow-card"
                >
                  Clear
                </button>
              </div>
            </div>
          </form>

          <div className="mt-8 space-y-3">
            <h3 className="text-lg font-serif font-bold flex items-center gap-2">
              <ClipboardList size={18} className="text-[var(--color-primary)]" />
              Upcoming Classes
            </h3>
            {loading ? (
              <p className="text-sm text-[var(--color-muted)]">Loading classes...</p>
            ) : (
              <div className="grid md:grid-cols-2 gap-3">
                {classes.map((cls) => (
                  <div key={cls.id} className="p-4 rounded-2xl border border-black/5 bg-[var(--color-card)] shadow-card">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-muted)]">{cls.date ? new Date(cls.date).toLocaleDateString() : 'Date TBA'}</p>
                        <h4 className="text-lg font-serif font-bold">{cls.title}</h4>
                        <p className="text-sm text-[var(--color-muted)]">{formatTimeLabel(cls.date) || 'Time TBA'} • {cls.location || 'Location TBA'}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEdit(cls)}
                          className="p-2 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/20"
                          title="Edit class"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => setClassToDelete(cls)}
                          className="p-2 rounded-full bg-rose-50 text-rose-600 hover:bg-rose-100"
                          title="Delete class"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3 text-sm text-[var(--color-muted)]">
                      <span className="inline-flex items-center gap-2"><Users size={14} /> {cls.capacity} seats</span>
                      <span className="inline-flex items-center gap-2"><Sparkles size={14} /> Waitlist {cls.waitlist_capacity}</span>
                    </div>
                  </div>
                ))}
                {classes.length === 0 && (
                  <div className="p-4 rounded-2xl border border-dashed border-black/10 text-[var(--color-muted)] text-sm">
                    No classes yet. Create your first offering above.
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Booking oversight */}
        <section className="bg-[var(--color-card)] border border-black/5 rounded-3xl shadow-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl bg-[var(--color-secondary)]/10 text-[var(--color-secondary)]">
              <Users size={18} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-muted)]">Bookings</p>
              <h2 className="text-xl font-serif font-bold">Attendance & Waitlists</h2>
            </div>
          </div>
          {loading ? (
            <p className="text-sm text-[var(--color-muted)]">Loading bookings...</p>
          ) : (
            <div className="space-y-3">
              {bookings.map((booking) => (
                <div key={booking.id} className="p-4 rounded-2xl border border-black/5 bg-[var(--color-card)] shadow-card flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-muted)]">{new Date(booking.class_date).toLocaleDateString()}</p>
                    <p className="text-lg font-serif font-bold">{booking.class_name}</p>
                    <p className="text-sm text-[var(--color-muted)]" title={`User ID: ${booking.user_id}`}>
                      User: {booking?.profile?.full_name || booking?.profile?.email || booking.user_id}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => deleteBooking(booking.id)}
                      className="px-3 py-2 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ))}
              {bookings.length === 0 && (
                <div className="p-4 rounded-2xl border border-dashed border-black/10 text-[var(--color-muted)] text-sm">
                  No bookings yet. They will appear once students reserve spots.
                </div>
              )}
            </div>
          )}
        </section>

        {/* Retreat tools */}
        <section className="bg-[var(--color-card)] border border-black/5 rounded-3xl shadow-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-[var(--color-secondary)]/10 text-[var(--color-secondary)]">
                <CalendarRange size={18} />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-muted)]">Retreats</p>
                <h2 className="text-xl font-serif font-bold">Immersive Getaways</h2>
                <p className="text-xs text-[var(--color-muted)]">Create, update, or remove retreat offerings.</p>
              </div>
            </div>
          </div>

          <form onSubmit={saveRetreat} className="grid md:grid-cols-3 gap-4 items-start">
            <div className="md:col-span-2 grid md:grid-cols-2 gap-3">
              <label className="text-xs text-[var(--color-muted)] font-semibold">Title</label>
              <input
                type="text"
                value={draftRetreat.title}
                onChange={(e) => handleRetreatChange('title', e.target.value)}
                className="admin-input md:col-span-2"
                placeholder="Restorative Weekend"
              />
              <label className="text-xs text-[var(--color-muted)] font-semibold">Location</label>
              <input
                type="text"
                value={draftRetreat.location}
                onChange={(e) => handleRetreatChange('location', e.target.value)}
                className="admin-input"
                placeholder="Lake Placid, NY"
              />
              <label className="text-xs text-[var(--color-muted)] font-semibold">Date Range</label>
              <div className="flex gap-3">
                <input
                  type="date"
                  value={draftRetreat.start_date}
                  onChange={(e) => handleRetreatChange('start_date', e.target.value)}
                  className="admin-input flex-1"
                />
                <input
                  type="date"
                  value={draftRetreat.end_date}
                  onChange={(e) => handleRetreatChange('end_date', e.target.value)}
                  className="admin-input flex-1"
                />
              </div>
              <label className="text-xs text-[var(--color-muted)] font-semibold">Custom Date Label</label>
              <input
                type="text"
                value={draftRetreat.date_label}
                onChange={(e) => handleRetreatChange('date_label', e.target.value)}
                className="admin-input"
                placeholder="September 18-22, 2025"
              />
              <label className="text-xs text-[var(--color-muted)] font-semibold">Description</label>
              <textarea
                value={draftRetreat.description}
                onChange={(e) => handleRetreatChange('description', e.target.value)}
                className="admin-input md:col-span-2"
                rows={4}
              />
            </div>

            <div className="space-y-3">
              <label className="text-xs text-[var(--color-muted)] font-semibold">Price</label>
              <input
                type="number"
                value={draftRetreat.price}
                onChange={(e) => handleRetreatChange('price', Number(e.target.value))}
                className="admin-input"
              />
              <label className="text-xs text-[var(--color-muted)] font-semibold">Capacity</label>
              <input
                type="number"
                value={draftRetreat.capacity}
                onChange={(e) => handleRetreatChange('capacity', Number(e.target.value))}
                className="admin-input"
              />
              <label className="text-xs text-[var(--color-muted)] font-semibold">Waitlist Capacity</label>
              <input
                type="number"
                value={draftRetreat.waitlist_capacity}
                onChange={(e) => handleRetreatChange('waitlist_capacity', Number(e.target.value))}
                className="admin-input"
              />
              <label className="text-xs text-[var(--color-muted)] font-semibold">Hero Image</label>
              <label className="admin-input flex items-center gap-2 cursor-pointer">
                <Upload size={16} />
                <span className="text-sm font-semibold">Upload</span>
                <input id="retreat-image-input" type="file" accept="image/*" className="hidden" />
              </label>
              <div className="text-xs text-[var(--color-muted)]">{uploadingImage ? 'Uploading...' : draftRetreat.image_url ? 'Existing image linked' : 'JPEG, PNG. Stored in Supabase storage.'}</div>

              <div className="flex gap-3 mt-4">
                <button
                  type="submit"
                  disabled={savingClass || uploadingImage}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[var(--color-primary)] text-white font-bold shadow-lg shadow-teal-900/20"
                >
                  {savingClass ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                  {draftRetreat.id ? 'Update Retreat' : 'Create Retreat'}
                </button>
                <button
                  type="button"
                  onClick={resetRetreatForm}
                  className="px-4 py-3 rounded-xl border border-black/5 bg-[var(--color-card)] text-[var(--color-text)] font-semibold shadow-card"
                >
                  Clear
                </button>
              </div>
            </div>
          </form>

          <div className="mt-8 space-y-3">
            <h3 className="text-lg font-serif font-bold flex items-center gap-2">
              <ClipboardList size={18} className="text-[var(--color-primary)]" />
              Upcoming Retreats
            </h3>
            {loading ? (
              <p className="text-sm text-[var(--color-muted)]">Loading retreats...</p>
            ) : (
              <div className="grid md:grid-cols-2 gap-3">
                {retreats.map((retreat) => {
                  const reserved = retreatSignupCounts.get(retreat.id) || 0;
                  const available = retreat.capacity ? Math.max(0, retreat.capacity - reserved) : null;
                  return (
                  <div key={retreat.id} className="p-4 rounded-2xl border border-black/5 bg-[var(--color-card)] shadow-card">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-muted)]">{retreat.date_label || formatDateRange(retreat.start_date, retreat.end_date) || 'Date TBA'}</p>
                        <h4 className="text-lg font-serif font-bold">{retreat.title}</h4>
                        <p className="text-sm text-[var(--color-muted)]">{retreat.location || 'Location TBA'}</p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => startRetreatEdit(retreat)}
                          className="p-2 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/20"
                          title="Edit retreat"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => setRetreatToDelete(retreat)}
                          className="p-2 rounded-full bg-rose-50 text-rose-600 hover:bg-rose-100"
                          title="Delete retreat"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3 text-sm text-[var(--color-muted)]">
                      <span className="inline-flex items-center gap-2"><Users size={14} /> {retreat.capacity || 0} spots</span>
                      {available !== null && <span className="inline-flex items-center gap-2"><Sparkles size={14} /> {available} open</span>}
                      <span className="inline-flex items-center gap-2"><Sparkles size={14} /> Waitlist {retreat.waitlist_capacity || 0}</span>
                    </div>
                    {retreat.image_url && (
                      <div className="mt-3 aspect-video rounded-xl overflow-hidden border border-black/5 bg-[var(--color-surface)]">
                        <img src={retreat.image_url} alt={retreat.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                  );
                })}
                {retreats.length === 0 && (
                  <div className="p-4 rounded-2xl border border-dashed border-black/10 text-[var(--color-muted)] text-sm">
                    No retreats yet. Create your first experience above.
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="mt-8 space-y-3">
            <h3 className="text-lg font-serif font-bold flex items-center gap-2">
              <Users size={18} className="text-[var(--color-primary)]" />
              Retreat Signups & Waitlists
            </h3>
            {loading ? (
              <p className="text-sm text-[var(--color-muted)]">Loading retreat signups...</p>
            ) : (
              <div className="space-y-3">
                {retreats.map((retreat) => {
                  const roster = retreatSignupMap.get(retreat.id) || [];
                  return (
                    <div key={`${retreat.id}-signups`} className="p-4 rounded-2xl border border-black/5 bg-[var(--color-card)] shadow-card">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-muted)]">{retreat.title}</p>
                          <p className="text-sm text-[var(--color-muted)]">{retreat.location || 'Location TBA'}</p>
                        </div>
                        <div className="text-xs font-semibold text-[var(--color-muted)]">
                          {roster.length} attendee{roster.length === 1 ? '' : 's'}
                        </div>
                      </div>
                      {roster.length === 0 ? (
                        <p className="text-sm text-[var(--color-muted)] mt-3">No signups yet for this retreat.</p>
                      ) : (
                        <div className="mt-3 space-y-2">
                          {roster.map((entry) => {
                            const displayName = entry?.profile?.full_name || entry?.name || entry?.profile?.email || entry?.email || 'Guest';
                            const email = entry?.profile?.email || entry?.email || 'Email not provided';
                            return (
                              <div
                                key={entry.id}
                                className="flex items-center justify-between px-3 py-2 rounded-xl bg-[var(--color-surface)] border border-black/5"
                              >
                                <div>
                                  <p className="text-sm font-semibold">{displayName}</p>
                                  <p className="text-xs text-[var(--color-muted)]">{email}</p>
                                </div>
                                <span className="px-2 py-1 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-[10px] font-semibold uppercase tracking-[0.2em]">
                                  Signup
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
                {retreats.length === 0 && (
                  <div className="p-4 rounded-2xl border border-dashed border-black/10 text-[var(--color-muted)] text-sm">
                    Add a retreat above to see attendance here.
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {editClassDraft && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={closeEditModal}>
            <div className="theme-card rounded-3xl max-w-3xl w-full p-6" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-muted)]">Edit Class</p>
                  <h3 className="text-xl font-serif font-bold">{editClassDraft.title || 'Update class'}</h3>
                </div>
                <button onClick={closeEditModal} className="p-2 rounded-full hover:bg-black/5" aria-label="Close">
                  <X size={18} />
                </button>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <label className="text-xs text-[var(--color-muted)] font-semibold">Title</label>
                  <input
                    type="text"
                    value={editClassDraft.title}
                    onChange={(e) => handleEditClassChange('title', e.target.value)}
                    className="admin-input"
                  />
                  <DateTimePicker
                    value={editClassDraft.date}
                    onChange={(value) => handleEditClassChange('date', value)}
                    required
                  />
                  <label className="text-xs text-[var(--color-muted)] font-semibold">Duration</label>
                  <input
                    type="text"
                    value={editClassDraft.duration}
                    onChange={(e) => handleEditClassChange('duration', e.target.value)}
                    className="admin-input"
                  />
                  <label className="text-xs text-[var(--color-muted)] font-semibold">Description</label>
                  <textarea
                    value={editClassDraft.description}
                    onChange={(e) => handleEditClassChange('description', e.target.value)}
                    className="admin-input"
                    rows={3}
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-xs text-[var(--color-muted)] font-semibold">Location</label>
                  <input
                    type="text"
                    value={editClassDraft.location}
                    onChange={(e) => handleEditClassChange('location', e.target.value)}
                    className="admin-input"
                  />
                  <label className="text-xs text-[var(--color-muted)] font-semibold">Instructor</label>
                  <input
                    type="text"
                    value={editClassDraft.instructor}
                    onChange={(e) => handleEditClassChange('instructor', e.target.value)}
                    className="admin-input"
                  />
                  <label className="text-xs text-[var(--color-muted)] font-semibold">Price</label>
                  <input
                    type="number"
                    value={editClassDraft.price}
                    onChange={(e) => handleEditClassChange('price', Number(e.target.value))}
                    className="admin-input"
                  />
                  <label className="text-xs text-[var(--color-muted)] font-semibold">Capacity</label>
                  <input
                    type="number"
                    value={editClassDraft.capacity}
                    onChange={(e) => handleEditClassChange('capacity', Number(e.target.value))}
                    className="admin-input"
                  />
                  <label className="text-xs text-[var(--color-muted)] font-semibold">Waitlist Capacity</label>
                  <input
                    type="number"
                    value={editClassDraft.waitlist_capacity}
                    onChange={(e) => handleEditClassChange('waitlist_capacity', Number(e.target.value))}
                    className="admin-input"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="flex-1 px-4 py-3 rounded-xl border border-black/5 bg-[var(--color-card)] text-[var(--color-text)] font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={saveEditedClass}
                  disabled={savingClass}
                  className="flex-1 px-4 py-3 rounded-xl bg-[var(--color-primary)] text-white font-bold shadow-lg shadow-teal-900/20"
                >
                  {savingClass ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        )}

        {classToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setClassToDelete(null)}>
            <div className="theme-card rounded-3xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-serif font-bold">Delete this class?</h3>
                <button onClick={() => setClassToDelete(null)} className="p-2 rounded-full hover:bg-black/5" aria-label="Close">
                  <X size={18} />
                </button>
              </div>
              <p className="theme-muted text-sm mb-4">{classToDelete.title}</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setClassToDelete(null)}
                  className="flex-1 px-4 py-3 rounded-xl border border-black/5 bg-[var(--color-card)] text-[var(--color-text)] font-semibold"
                >
                  Keep class
                </button>
                <button
                  onClick={confirmDeleteClass}
                  disabled={deleting}
                  className="flex-1 px-4 py-3 rounded-xl bg-rose-600 text-white font-bold shadow-lg shadow-rose-900/20"
                >
                  {deleting ? 'Deleting…' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}

        {retreatToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setRetreatToDelete(null)}>
            <div className="theme-card rounded-3xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-serif font-bold">Delete this retreat?</h3>
                <button onClick={() => setRetreatToDelete(null)} className="p-2 rounded-full hover:bg-black/5" aria-label="Close">
                  <X size={18} />
                </button>
              </div>
              <p className="theme-muted text-sm mb-4">{retreatToDelete.title}</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setRetreatToDelete(null)}
                  className="flex-1 px-4 py-3 rounded-xl border border-black/5 bg-[var(--color-card)] text-[var(--color-text)] font-semibold"
                >
                  Keep retreat
                </button>
                <button
                  onClick={confirmDeleteRetreat}
                  disabled={deleting}
                  className="flex-1 px-4 py-3 rounded-xl bg-rose-600 text-white font-bold shadow-lg shadow-rose-900/20"
                >
                  {deleting ? 'Deleting…' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Theme controls */}
        <section className="bg-[var(--color-card)] border border-black/5 rounded-3xl shadow-card p-6">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-[var(--color-accent)]/20 text-[var(--color-primary)]">
                <Palette size={18} />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-muted)]">Theme Studio</p>
                <h2 className="text-xl font-serif font-bold">Light & Dark Palettes</h2>
                <p className="text-xs text-[var(--color-muted)]">Use the toggle below to jump between the two palettes. Changes preview instantly here but only publish after you press Save.</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap justify-end">
              {presetPreview && (
                <span className="px-3 py-2 rounded-xl bg-[var(--color-secondary)]/10 text-[var(--color-secondary)] text-xs font-semibold">
                  Previewing {presetPreview}
                </span>
              )}
              <button
                onClick={stopPresetPreview}
                className="px-4 py-2 rounded-xl border border-black/5 bg-[var(--color-card)] shadow-card text-sm font-semibold flex items-center gap-2"
                title="Return to the editable palette"
              >
                <Sparkles size={16} />
                Stop Preview
              </button>
              <button
                onClick={restoreSavedTheme}
                className="px-4 py-2 rounded-xl border border-black/5 bg-[var(--color-card)] shadow-card text-sm font-semibold flex items-center gap-2"
                title="Reset the editor back to the saved palette"
              >
                <Sparkles size={16} />
                Restore Saved Theme
              </button>
              <button
                onClick={randomizeTheme}
                disabled={randomizing}
                className="px-4 py-2 rounded-xl border border-black/5 bg-[var(--color-card)] shadow-card text-sm font-semibold flex items-center gap-2"
              >
                {randomizing ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
                Randomize Theme
              </button>
              <button
                onClick={persistTheme}
                disabled={savingTheme}
                className="px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white shadow-lg shadow-teal-900/20 text-sm font-semibold flex items-center gap-2"
              >
                {savingTheme ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                Save Theme
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--color-card)] border border-black/5 text-xs font-semibold text-[var(--color-muted)]">
              <span className="flex items-center gap-2">
                {darkMode ? <MoonStar size={14} /> : <SunMedium size={14} />}
                Editing {activePaletteLabel} Palette
              </span>
              <span className="text-[var(--color-muted)]">•</span>
              <span className="text-[var(--color-muted)]">Toggle to switch to the other mode</span>
            </div>
            <button
              type="button"
              onClick={toggleTheme}
              className="px-4 py-2 rounded-xl border border-black/5 bg-[var(--color-card)] text-[var(--color-text)] shadow-card text-sm font-semibold flex items-center gap-2"
              aria-pressed={darkMode}
            >
              {darkMode ? <SunMedium size={16} /> : <MoonStar size={16} />}
              Switch to {darkMode ? 'Light' : 'Dark'} Palette
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-3 mb-4">
            {THEME_PRESETS.map((preset) => (
              <div key={preset.name} className="p-4 rounded-2xl border border-black/5 bg-[var(--color-card)] shadow-card flex flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-muted)]">Preset</p>
                    <h4 className="text-lg font-serif font-bold">{preset.name}</h4>
                    <p className="text-xs text-[var(--color-muted)]">{preset.description}</p>
                  </div>
                  <div className="h-12 w-16 rounded-xl overflow-hidden border border-black/5" style={{ background: `linear-gradient(120deg, ${preset.palette.light.gradientFrom}, ${preset.palette.light.gradientTo})` }} />
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => previewPreset(preset.palette, preset.name)}
                    className="px-3 py-2 rounded-xl border border-black/5 bg-[var(--color-card)] text-[var(--color-text)] text-sm font-semibold"
                  >
                    Preview
                  </button>
                  <button
                    type="button"
                    onClick={() => applyThemeToEditor(preset.palette)}
                    className="px-3 py-2 rounded-xl bg-[var(--color-primary)] text-white text-sm font-semibold shadow-card"
                  >
                    Load into Editor
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {paletteGroups.map((group) => (
              <div key={group.title} className="p-4 rounded-2xl border border-black/5 bg-[var(--color-card)] shadow-card">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-serif font-bold flex items-center gap-2">
                    {darkMode ? <MoonStar size={18} /> : <SunMedium size={18} />}
                    {group.title}
                  </h3>
                  <span className="text-[10px] text-[var(--color-muted)] uppercase tracking-[0.2em]">{activePaletteLabel} Palette</span>
                </div>
                <p className="text-xs text-[var(--color-muted)] mb-3 leading-relaxed">{group.description}</p>
                <div className="grid grid-cols-1 gap-2">
                  {group.fields.map((field) => (
                    <label key={`${activePaletteKey}-${field.key}`} className="text-xs text-[var(--color-muted)] font-semibold flex flex-col gap-1">
                      {field.label}
                      <input
                        type="color"
                        value={draftTheme?.[activePaletteKey]?.[field.key] || DEFAULT_THEME[activePaletteKey][field.key]}
                        onChange={(e) => updateThemeField(activePaletteKey, field.key, e.target.value)}
                        className="admin-input h-11 cursor-pointer p-1"
                      />
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 grid md:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl border border-black/5 bg-[var(--color-card)] shadow-card">
              <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-muted)]">Live Preview</p>
              <h4 className="text-lg font-serif font-bold mb-2">Buttons & Badges</h4>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-2 rounded-xl bg-[var(--color-primary)] text-white text-sm font-semibold">Primary</span>
                <span className="px-3 py-2 rounded-xl bg-[var(--color-secondary)] text-white text-sm font-semibold">Secondary</span>
                <span className="px-3 py-2 rounded-xl bg-[var(--color-accent)] text-[var(--color-text)] text-sm font-semibold">Accent</span>
              </div>
            </div>
            <div className="p-4 rounded-2xl border border-black/5 bg-[var(--color-card)] shadow-card">
              <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-muted)]">Cards</p>
              <h4 className="text-lg font-serif font-bold mb-2">Surface & Glow</h4>
              <div
                className="p-4 rounded-xl border border-black/5 bg-[var(--color-surface)]"
                style={{ boxShadow: `0 20px 45px -18px ${activePalette.glow || 'rgba(0,0,0,0.12)'}` }}
              >
                <p className="text-sm text-[var(--color-muted)]">This area follows the live palette.</p>
              </div>
            </div>
            <div className="p-4 rounded-2xl border border-black/5 bg-[var(--color-card)] shadow-card">
              <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-muted)]">Gradient</p>
              <h4 className="text-lg font-serif font-bold mb-2">Ambient</h4>
              <div
                className="h-16 rounded-xl"
                style={{ background: `linear-gradient(120deg, ${activePalette.gradientFrom || '#f7d4dd'}, ${activePalette.gradientTo || '#c8d8d0'})` }}
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminPanel;
