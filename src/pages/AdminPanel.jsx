import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../utils/supabase';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
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

const formatTimeLabel = (value) => {
  const parsed = value ? new Date(value) : null;
  if (!parsed || Number.isNaN(parsed.getTime())) return '';
  return parsed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const normalizeClassRow = (row) => ({
  ...row,
  time: row?.time || formatTimeLabel(row?.date),
});

const AdminPanel = () => {
  const { currentUser, isAdmin } = useAuth();
  const { theme, previewTheme, resetPreviewTheme, saveTheme, darkMode, toggleTheme } = useTheme();
  const [classes, setClasses] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingClass, setSavingClass] = useState(false);
  const [savingTheme, setSavingTheme] = useState(false);
  const [draftClass, setDraftClass] = useState(emptyClass);
  const [draftTheme, setDraftTheme] = useState(theme);
  const [message, setMessage] = useState('');
  const [notice, setNotice] = useState(null);

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

  useEffect(() => {
    const load = async () => {
      if (!isSupabaseConfigured || !supabase) {
        setMessage('Configure Supabase to manage classes and bookings.');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const [{ data: classData, error: classError }, { data: bookingData, error: bookingError }] = await Promise.all([
          supabase.from('classes').select('*').order('date', { ascending: true }),
          supabase.from('bookings').select('*').order('created_at', { ascending: false }),
        ]);

        if (classError) throw classError;
        if (bookingError) throw bookingError;
        setClasses((classData || []).map(normalizeClassRow));
        setBookings(bookingData || []);
      } catch (err) {
        console.warn('Falling back to in-memory classes:', err.message);
        setClasses([]);
        setBookings([]);
      setMessage('Supabase tables are not ready yet. Data will load once they exist.');
    } finally {
      setLoading(false);
    }
    };
    if (isAdmin && currentUser) load();
  }, [currentUser, isAdmin]);

  useEffect(() => {
    if (!isAdmin || !isSupabaseConfigured || !supabase) return undefined;

    const bookingsChannel = supabase.channel('admin-bookings-stream')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setBookings((prev) => [payload.new, ...prev]);
        }
        if (payload.eventType === 'UPDATE') {
          setBookings((prev) => prev.map((item) => (item.id === payload.new.id ? payload.new : item)));
        }
        if (payload.eventType === 'DELETE') {
          setBookings((prev) => prev.filter((item) => item.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(bookingsChannel);
    };
  }, [isAdmin]);

  useEffect(() => {
    if (!notice) return undefined;
    const timer = setTimeout(() => setNotice(null), 4500);
    return () => clearTimeout(timer);
  }, [notice]);

  const startEdit = (cls) => {
    setDraftClass({ ...cls });
  };

  const resetForm = () => {
    setDraftClass(emptyClass);
  };

  const handleClassChange = (field, value) => {
    setDraftClass(prev => ({ ...prev, [field]: value }));
  };

  const saveClass = async (e) => {
    e.preventDefault();
    setSavingClass(true);

    const requiredFields = ['title', 'date', 'duration', 'location', 'instructor'];
    const missing = requiredFields.filter((key) => !draftClass[key]);
    if (missing.length) {
      setNotice({ type: 'error', text: `Please complete: ${missing.join(', ')}.` });
      setSavingClass(false);
      return;
    }

    const parsedDate = draftClass.date ? new Date(draftClass.date) : null;
    if (!parsedDate || Number.isNaN(parsedDate.getTime())) {
      setNotice({ type: 'error', text: 'Provide a valid date & time for the class.' });
      setSavingClass(false);
      return;
    }

    if (!isSupabaseConfigured || !supabase) {
      setNotice({ type: 'error', text: 'Supabase is not configured. Add credentials to save classes.' });
      setSavingClass(false);
      return;
    }

    const payload = {
      ...draftClass,
      id: draftClass.id || crypto.randomUUID(),
      date: parsedDate.toISOString(),
      time: formatTimeLabel(parsedDate),
    };

    try {
      const { data, error } = await supabase.from('classes').upsert([payload]).select();
      if (error) {
        if (error?.message?.includes("Could not find the table 'public.classes'")) {
          setNotice({ type: 'error', text: 'Classes table is missing. Apply supabase/schema/classes.sql to create it.' });
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
      setNotice({ type: 'success', text: 'Class saved successfully.' });
      resetForm();
    } catch (err) {
      setNotice({ type: 'error', text: `Unable to save class: ${err.message}` });
    } finally {
      setSavingClass(false);
    }
  };

  const deleteBooking = async (bookingId) => {
    if (!isSupabaseConfigured || !supabase) {
      setMessage('Supabase is not configured.');
      return;
    }
    try {
      await supabase.from('bookings').delete().eq('id', bookingId);
      setBookings(prev => prev.filter(b => b.id !== bookingId));
    } catch (err) {
      setMessage(`Unable to update booking: ${err.message}`);
    }
  };

  const updateThemeField = (mode, key, value) => {
    const next = {
      ...draftTheme,
      [mode]: { ...draftTheme[mode], [key]: value },
    };
    setDraftTheme(next);
    previewTheme(next);
  };

  const restoreSavedTheme = () => {
    setDraftTheme(theme);
    previewTheme(theme);
    setMessage('Restored the saved palette and preview.');
  };

  const persistTheme = async () => {
    setSavingTheme(true);
    try {
      await saveTheme(draftTheme);
      setMessage('Theme saved and applied globally.');
    } catch (err) {
      setMessage(`Unable to save theme: ${err.message}`);
    } finally {
      setSavingTheme(false);
    }
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
            {message && (
              <p className="text-xs text-[var(--color-muted)] mt-2 bg-[var(--color-card)] border border-black/5 rounded-lg px-3 py-2 inline-block">
                {message}
              </p>
            )}
          </div>
          <div className="flex gap-3 items-center">
            <Link
              to="/"
              className="px-4 py-2 rounded-xl border border-black/5 bg-[var(--color-card)] shadow-card text-sm font-semibold flex items-center gap-2"
            >
              <ArrowLeft size={16} />
              Back to Site
            </Link>
          </div>
        </header>

        {notice && (
          <div
            className={`fixed bottom-6 right-6 z-20 px-4 py-3 rounded-xl shadow-lg text-sm font-semibold border ${notice.type === 'success' ? 'bg-[var(--color-card)] border-black/5 text-[var(--color-text)]' : 'bg-rose-50 border-rose-200 text-rose-700'}`}
          >
            {notice.text}
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-4">
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
              <label className="text-xs text-[var(--color-muted)] font-semibold">Date & Time</label>
              <input
                type="datetime-local"
                value={draftClass.date}
                onChange={(e) => handleClassChange('date', e.target.value)}
                className="admin-input"
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
                      <button
                        onClick={() => startEdit(cls)}
                        className="p-2 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/20"
                        title="Edit class"
                      >
                        <Pencil size={16} />
                      </button>
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
                    <p className="text-sm text-[var(--color-muted)]">User: {booking.user_id}</p>
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
              <button
                onClick={restoreSavedTheme}
                className="px-4 py-2 rounded-xl border border-black/5 bg-[var(--color-card)] shadow-card text-sm font-semibold flex items-center gap-2"
                title="Reset the editor back to the saved palette"
              >
                <Sparkles size={16} />
                Restore Saved Theme
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
                        value={draftTheme?.[activePaletteKey]?.[field.key] || '#000000'}
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
