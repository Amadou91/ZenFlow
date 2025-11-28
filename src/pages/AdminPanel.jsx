import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '../utils/supabase';
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
} from 'lucide-react';

const emptyClass = {
  id: '',
  title: '',
  date: '',
  time: '',
  duration: '',
  location: '',
  instructor: '',
  price: 0,
  capacity: 10,
  waitlist_capacity: 5,
  description: '',
};

const AdminPanel = () => {
  const { currentUser, isAdmin } = useAuth();
  const { theme, previewTheme, saveTheme, darkMode, toggleTheme } = useTheme();
  const [classes, setClasses] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingClass, setSavingClass] = useState(false);
  const [savingTheme, setSavingTheme] = useState(false);
  const [draftClass, setDraftClass] = useState(emptyClass);
  const [draftTheme, setDraftTheme] = useState(theme);
  const [message, setMessage] = useState('');

  const themeFields = useMemo(() => [
    { key: 'primary', label: 'Primary' },
    { key: 'secondary', label: 'Secondary' },
    { key: 'accent', label: 'Accent' },
    { key: 'surface', label: 'Surface' },
    { key: 'card', label: 'Card' },
    { key: 'muted', label: 'Muted' },
    { key: 'text', label: 'Typography' },
    { key: 'gradientFrom', label: 'Gradient From' },
    { key: 'gradientTo', label: 'Gradient To' },
    { key: 'glow', label: 'Ambient Glow' },
  ], []);

  useEffect(() => setDraftTheme(theme), [theme]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [{ data: classData, error: classError }, { data: bookingData, error: bookingError }] = await Promise.all([
          supabase.from('classes').select('*').order('date', { ascending: true }),
          supabase.from('bookings').select('*').order('created_at', { ascending: false }),
        ]);

        if (classError) throw classError;
        if (bookingError) throw bookingError;
        setClasses(classData || []);
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
    const payload = { ...draftClass };
    if (!payload.id) payload.id = crypto.randomUUID();
    try {
      const { data, error } = await supabase.from('classes').upsert([payload]).select();
      if (error) throw error;
      const savedRow = data?.[0] || payload;
      setClasses(prev => {
        const existingIdx = prev.findIndex(c => c.id === savedRow.id);
        if (existingIdx >= 0) {
          const clone = [...prev];
          clone[existingIdx] = savedRow;
          return clone;
        }
        return [savedRow, ...prev];
      });
      setMessage('Class saved successfully.');
      resetForm();
    } catch (err) {
      setMessage(`Unable to save class: ${err.message}`);
    } finally {
      setSavingClass(false);
    }
  };

  const deleteBooking = async (bookingId) => {
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
          <div className="flex gap-3">
            <button
              onClick={toggleTheme}
              className="px-4 py-2 rounded-xl border border-black/5 bg-[var(--color-card)] shadow-card text-sm font-semibold flex items-center gap-2"
            >
              {darkMode ? <SunMedium size={16} /> : <MoonStar size={16} />}
              Toggle {darkMode ? 'Light' : 'Dark'}
            </button>
            <button
              onClick={() => previewTheme(theme)}
              className="px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white shadow-lg shadow-teal-900/20 text-sm font-semibold flex items-center gap-2"
            >
              <Sparkles size={16} />
              Refresh Palette
            </button>
          </div>
        </header>

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
                className="w-full rounded-xl border border-black/5 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                required
              />
              <label className="text-xs text-[var(--color-muted)] font-semibold">Date</label>
              <input
                type="datetime-local"
                value={draftClass.date}
                onChange={(e) => handleClassChange('date', e.target.value)}
                className="w-full rounded-xl border border-black/5 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                required
              />
              <label className="text-xs text-[var(--color-muted)] font-semibold">Duration</label>
              <input
                type="text"
                value={draftClass.duration}
                onChange={(e) => handleClassChange('duration', e.target.value)}
                className="w-full rounded-xl border border-black/5 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                placeholder="75 min"
              />
              <label className="text-xs text-[var(--color-muted)] font-semibold">Location</label>
              <input
                type="text"
                value={draftClass.location}
                onChange={(e) => handleClassChange('location', e.target.value)}
                className="w-full rounded-xl border border-black/5 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
              <label className="text-xs text-[var(--color-muted)] font-semibold">Instructor</label>
              <input
                type="text"
                value={draftClass.instructor}
                onChange={(e) => handleClassChange('instructor', e.target.value)}
                className="w-full rounded-xl border border-black/5 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                placeholder="Jocelyn"
              />
              <label className="text-xs text-[var(--color-muted)] font-semibold">Description</label>
              <textarea
                value={draftClass.description}
                onChange={(e) => handleClassChange('description', e.target.value)}
                className="w-full rounded-xl border border-black/5 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                rows={3}
              />
            </div>

            <div className="space-y-3">
              <label className="text-xs text-[var(--color-muted)] font-semibold">Time</label>
              <input
                type="text"
                value={draftClass.time}
                onChange={(e) => handleClassChange('time', e.target.value)}
                className="w-full rounded-xl border border-black/5 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                placeholder="07:00 PM"
              />
              <label className="text-xs text-[var(--color-muted)] font-semibold">Price</label>
              <input
                type="number"
                value={draftClass.price}
                onChange={(e) => handleClassChange('price', Number(e.target.value))}
                className="w-full rounded-xl border border-black/5 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
              <label className="text-xs text-[var(--color-muted)] font-semibold">Capacity</label>
              <input
                type="number"
                value={draftClass.capacity}
                onChange={(e) => handleClassChange('capacity', Number(e.target.value))}
                className="w-full rounded-xl border border-black/5 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
              <label className="text-xs text-[var(--color-muted)] font-semibold">Waitlist Capacity</label>
              <input
                type="number"
                value={draftClass.waitlist_capacity}
                onChange={(e) => handleClassChange('waitlist_capacity', Number(e.target.value))}
                className="w-full rounded-xl border border-black/5 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
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
                  className="px-4 py-3 rounded-xl border border-black/5 bg-white font-semibold text-[var(--color-muted)]"
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
                  <div key={cls.id} className="p-4 rounded-2xl border border-black/5 bg-white shadow-sm">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-muted)]">{new Date(cls.date).toLocaleDateString()}</p>
                        <h4 className="text-lg font-serif font-bold">{cls.title}</h4>
                        <p className="text-sm text-[var(--color-muted)]">{cls.time} • {cls.location}</p>
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
                <div key={booking.id} className="p-4 rounded-2xl border border-black/5 bg-white shadow-sm flex items-center justify-between">
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
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-[var(--color-accent)]/20 text-[var(--color-primary)]">
                <Palette size={18} />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-muted)]">Theme Studio</p>
                <h2 className="text-xl font-serif font-bold">Light & Dark Palettes</h2>
              </div>
            </div>
            <button
              onClick={persistTheme}
              disabled={savingTheme}
              className="px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white shadow-lg shadow-teal-900/20 text-sm font-semibold flex items-center gap-2"
            >
              {savingTheme ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
              Save Theme
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {['light', 'dark'].map((mode) => (
              <div key={mode} className="p-4 rounded-2xl border border-black/5 bg-white shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-serif font-bold flex items-center gap-2">
                    {mode === 'light' ? <SunMedium size={18} /> : <MoonStar size={18} />}
                    {mode === 'light' ? 'Light mode' : 'Dark mode'}
                  </h3>
                  <span className="text-xs text-[var(--color-muted)] uppercase tracking-[0.2em]">{mode}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {themeFields.map((field) => (
                    <label key={`${mode}-${field.key}`} className="text-xs text-[var(--color-muted)] font-semibold flex flex-col gap-1">
                      {field.label}
                      <input
                        type="color"
                        value={draftTheme?.[mode]?.[field.key] || '#000000'}
                        onChange={(e) => updateThemeField(mode, field.key, e.target.value)}
                        className="h-10 w-full rounded-lg border border-black/5"
                      />
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 grid md:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl border border-black/5 bg-white shadow-sm">
              <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-muted)]">Live Preview</p>
              <h4 className="text-lg font-serif font-bold mb-2">Buttons & Badges</h4>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-2 rounded-xl bg-[var(--color-primary)] text-white text-sm font-semibold">Primary</span>
                <span className="px-3 py-2 rounded-xl bg-[var(--color-secondary)] text-white text-sm font-semibold">Secondary</span>
                <span className="px-3 py-2 rounded-xl bg-[var(--color-accent)] text-[var(--color-text)] text-sm font-semibold">Accent</span>
              </div>
            </div>
            <div className="p-4 rounded-2xl border border-black/5 bg-white shadow-sm">
              <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-muted)]">Cards</p>
              <h4 className="text-lg font-serif font-bold mb-2">Surface & Glow</h4>
              <div
                className="p-4 rounded-xl border border-black/5"
                style={{ boxShadow: `0 10px 40px -10px ${draftTheme?.light?.glow || 'rgba(0,0,0,0.08)'}` }}
              >
                <p className="text-sm text-[var(--color-muted)]">This area follows the live palette.</p>
              </div>
            </div>
            <div className="p-4 rounded-2xl border border-black/5 bg-white shadow-sm">
              <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-muted)]">Gradient</p>
              <h4 className="text-lg font-serif font-bold mb-2">Ambient</h4>
              <div className="h-16 rounded-xl accent-gradient" />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminPanel;
