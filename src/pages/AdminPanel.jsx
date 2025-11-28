import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../utils/supabase';
import { useAuth } from '../context/AuthContext';
import { DEFAULT_THEME, useTheme } from '../context/ThemeContext';
import DateTimePicker from '../components/DateTimePicker';
import { formatTimeLabel, parseDateTimeValue } from '../utils/dateTime';
import { THEME_PRESETS } from '../constants/themePresets';
import {
  ShieldCheck, CalendarRange, Palette, Save, Sparkles, Users, Pencil, Loader2,
  ClipboardList, SunMedium, MoonStar, ArrowLeft, CheckCircle2, AlertTriangle,
  Info, X, Trash2, Upload, Wand2, Grid, Layout, Type, Droplet, Monitor, Undo,
  MapPin, Clock, DollarSign
} from 'lucide-react';

// --- HELPER OBJECTS & FUNCTIONS ---
const emptyClass = { id: '', title: '', date: '', duration: '', location: '', instructor: '', price: 0, capacity: 10, waitlist_capacity: 5, description: '' };
const emptyRetreat = { id: '', title: '', start_date: '', end_date: '', location: '', description: '', price: 0, capacity: 12, waitlist_capacity: 6, image_url: '', date_label: '' };

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
  time: row?.time || formatTimeLabel(row?.date)
});

const AdminPanel = () => {
  const { currentUser, isAdmin } = useAuth();
  
  // We use "theme" (which might be a preview) and "savedTheme" (the committed state)
  const { theme, savedTheme, previewTheme, resetPreviewTheme, saveTheme, darkMode, toggleTheme } = useTheme();
  
  // --- DATA STATE ---
  const [classes, setClasses] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [retreats, setRetreats] = useState([]);
  const [retreatSignups, setRetreatSignups] = useState([]);
  const [users, setUsers] = useState([]);
  
  // --- UI STATE ---
  const [activeTab, setActiveTab] = useState('classes'); 
  const [themeTab, setThemeTab] = useState('presets'); 
  const [editorSection, setEditorSection] = useState('brand'); 
  
  // Derived State for Retreats
  const retreatSignupCounts = useMemo(() => {
    const counts = new Map();
    retreatSignups.forEach((entry) => { counts.set(entry.retreat_id, (counts.get(entry.retreat_id) || 0) + 1); });
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
  
  // Form & Action State
  const [loading, setLoading] = useState(true);
  const [savingClass, setSavingClass] = useState(false);
  const [savingTheme, setSavingTheme] = useState(false);
  const [draftClass, setDraftClass] = useState(emptyClass);
  const [editClassDraft, setEditClassDraft] = useState(null);
  const [draftRetreat, setDraftRetreat] = useState(emptyRetreat);
  
  // Local state for the theme editor form to avoid jitter
  // We sync this with the global "theme" context
  const [draftTheme, setDraftTheme] = useState(theme);

  const [toasts, setToasts] = useState([]);
  const [classToDelete, setClassToDelete] = useState(null);
  const [retreatToDelete, setRetreatToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState('');
  const toastRegionRef = useRef(null);

  const activePaletteKey = darkMode ? 'dark' : 'light';
  const activePaletteLabel = darkMode ? 'Dark' : 'Light';
  
  // --- THEME EDITOR CONFIG ---
  const themeGroups = {
    brand: {
      label: 'Brand Colors',
      icon: Droplet,
      desc: 'Main colors used for buttons, links, and highlights.',
      fields: [
        { key: 'primary', label: 'Primary', desc: 'Main buttons, links, active states.' },
        { key: 'secondary', label: 'Secondary', desc: 'Subtle accents, secondary buttons.' },
        { key: 'accent', label: 'Accent', desc: 'Highlights, selections, special elements.' },
      ]
    },
    surfaces: {
      label: 'Surfaces & Backgrounds',
      icon: Layout,
      desc: 'The canvas of your application.',
      fields: [
        { key: 'surface', label: 'Page Background', desc: 'The main background color of the page.' },
        { key: 'card', label: 'Card Background', desc: 'Background for panels, modals, and inputs.' },
      ]
    },
    content: {
      label: 'Typography & Content',
      icon: Type,
      desc: 'Text readability and hierarchy.',
      fields: [
        { key: 'text', label: 'Primary Text', desc: 'Main headings and body text.' },
        { key: 'muted', label: 'Muted Text', desc: 'Subtitles, captions, and secondary info.' },
      ]
    },
    effects: {
      label: 'Atmosphere & Glow',
      icon: Sparkles,
      desc: 'Gradients and ambient lighting effects.',
      fields: [
        { key: 'gradientFrom', label: 'Gradient Start', desc: 'Start color of background gradients.' },
        { key: 'gradientTo', label: 'Gradient End', desc: 'End color of background gradients.' },
        { key: 'glow', label: 'Glow Color', desc: 'Ambient light effects behind elements.' },
      ]
    }
  };

  // Sync draft theme when the global theme changes (e.g. after save or reset)
  useEffect(() => {
    setDraftTheme(theme);
  }, [theme]);

  const addToast = useCallback((type, text) => {
    if (!text) return;
    const id = crypto.randomUUID();
    const tone = type || 'info';
    setToasts((prev) => [...prev, { id, type: tone, text }]);
    setTimeout(() => { setToasts((prev) => prev.filter((toast) => toast.id !== id)); }, 5200);
  }, []);

  useEffect(() => { if (!toasts.length) return; toastRegionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }); }, [toasts.length]);

  useEffect(() => {
    const load = async () => {
      if (!isSupabaseConfigured || !supabase) { addToast('info', 'Configure Supabase to manage classes and bookings.'); setLoading(false); return; }
      try {
        setLoading(true);
        
        // Fetch data independently to avoid 400 errors from missing foreign keys
        const [ { data: classData }, { data: bookingData }, { data: retreatData }, { data: signupData } ] = await Promise.all([
          supabase.from('classes').select('*').order('date', { ascending: true }),
          supabase.from('bookings').select('*').order('created_at', { ascending: false }),
          supabase.from('retreats').select('*').order('start_date', { ascending: true }),
          supabase.from('retreat_signups').select('*').order('created_at', { ascending: false }),
        ]);
        
        // Fetch profiles separately to avoid join errors
        const { data: profilesData, error: profilesError } = await supabase.from('profiles').select('*');
        
        if (profilesError) {
             console.warn("Profile fetch error (table might be empty or RLS blocking):", profilesError.message);
        }
        
        // --- MERGE USERS STRATEGY ---
        // Combine real profiles with "ghost" users from bookings who might not have profiles yet
        const userMap = new Map();

        // 1. Add known profiles
        (profilesData || []).forEach(p => {
            userMap.set(p.id, { ...p, source: 'Registered' });
        });

        // 2. Add users from bookings (if we have any user info attached to bookings in future, or just IDs)
        // Currently bookings only store user_id, so we can only list the ID if no profile exists
        (bookingData || []).forEach(b => {
            if (b.user_id && !userMap.has(b.user_id)) {
                userMap.set(b.user_id, { id: b.user_id, email: 'Unknown (No Profile)', full_name: 'Guest User', source: 'Booking' });
            }
        });

        // 3. Add users from retreat signups (these often have direct name/email fields)
        (signupData || []).forEach(s => {
             // If signed up with a user_id
             if (s.user_id && !userMap.has(s.user_id)) {
                 userMap.set(s.user_id, { id: s.user_id, email: s.email || 'Unknown', full_name: s.name || 'Guest', source: 'Retreat' });
             }
             // If it's a guest signup (no user_id), we can't really "list" them as a registered user, 
             // but we could list them as a lead if we wanted. For now, we stick to user_ids.
        });

        setClasses((classData || []).map(normalizeClassRow));
        setBookings(bookingData || []);
        setRetreats(retreatData || []);
        setRetreatSignups(signupData || []);
        setUsers(Array.from(userMap.values()));

      } catch (err) { console.warn('Data load error:', err.message); } finally { setLoading(false); }
    };
    if (isAdmin && currentUser) load();
  }, [addToast, currentUser, isAdmin]);

  // --- CRUD ACTIONS (Classes/Retreats) ---
  const handleClassChange = (field, value) => setDraftClass((prev) => ({ ...prev, [field]: value }));
  const handleEditClassChange = (field, value) => setEditClassDraft((prev) => ({ ...prev, [field]: value }));
  const handleRetreatChange = (field, value) => setDraftRetreat((prev) => ({ ...prev, [field]: value }));
  const resetForm = () => setDraftClass(emptyClass);
  const closeEditModal = () => setEditClassDraft(null);
  const startEdit = (cls) => setEditClassDraft({ ...cls });
  const startRetreatEdit = (retreat) => setDraftRetreat({ ...retreat });
  const resetRetreatForm = () => setDraftRetreat(emptyRetreat);

  const persistClassDraft = async (draft, onSuccess) => {
    setSavingClass(true);
    const parsedDate = parseDateTimeValue(draft.date);
    if (!draft.title || !parsedDate) { addToast('error', 'Title and date required.'); setSavingClass(false); return; }
    if (!isSupabaseConfigured || !supabase) { addToast('error', 'Supabase offline.'); setSavingClass(false); return; }
    const payload = { ...draft, id: draft.id || crypto.randomUUID(), date: parsedDate.toISOString(), time: formatTimeLabel(parsedDate) };
    try {
      const { data, error } = await supabase.from('classes').upsert([payload]).select();
      if (error) throw error;
      const savedRow = normalizeClassRow(data?.[0] || payload);
      setClasses(prev => { const idx = prev.findIndex(c => c.id === savedRow.id); if (idx >= 0) { const copy = [...prev]; copy[idx] = savedRow; return copy; } return [savedRow, ...prev]; });
      addToast('success', 'Class saved.'); onSuccess?.();
    } catch (err) { addToast('error', err.message); } finally { setSavingClass(false); }
  };

  const saveClass = (e) => { e.preventDefault(); persistClassDraft(draftClass, resetForm); };
  const saveEditedClass = () => persistClassDraft(editClassDraft, closeEditModal);
  
  const saveRetreat = async (e) => {
    e.preventDefault(); setSavingClass(true);
    if (!draftRetreat.title) { setSavingClass(false); return; }
    if (!isSupabaseConfigured || !supabase) { setSavingClass(false); return; }
    try {
      const payload = { ...draftRetreat, id: draftRetreat.id || crypto.randomUUID() };
      const { data, error } = await supabase.from('retreats').upsert([payload]).select();
      if (error) throw error;
      const saved = data?.[0] || payload;
      setRetreats(prev => { const idx = prev.findIndex(r => r.id === saved.id); if (idx >= 0) { const copy = [...prev]; copy[idx] = saved; return copy; } return [saved, ...prev]; });
      addToast('success', 'Retreat saved.'); resetRetreatForm();
    } catch (err) { addToast('error', err.message); } finally { setSavingClass(false); }
  };

  const deleteBooking = async (id) => {
    if (!supabase) return;
    try {
      await supabase.from('bookings').delete().eq('id', id);
      setBookings(prev => prev.filter(b => b.id !== id));
      addToast('success', 'Booking cancelled.');
    } catch (e) { addToast('error', 'Could not delete booking.'); }
  };

  const confirmDeleteClass = async () => {
    if (!classToDelete || !supabase) return;
    setDeleting(true);
    try {
      await supabase.from('classes').delete().eq('id', classToDelete.id);
      setClasses(prev => prev.filter(c => c.id !== classToDelete.id));
      addToast('success', 'Class deleted.');
    } catch(e) { addToast('error', 'Delete failed.'); }
    finally { setDeleting(false); setClassToDelete(null); }
  };

  const confirmDeleteRetreat = async () => {
    if (!retreatToDelete || !supabase) return;
    setDeleting(true);
    try {
      await supabase.from('retreats').delete().eq('id', retreatToDelete.id);
      setRetreats(prev => prev.filter(r => r.id !== retreatToDelete.id));
      addToast('success', 'Retreat deleted.');
    } catch(e) { addToast('error', 'Delete failed.'); }
    finally { setDeleting(false); setRetreatToDelete(null); }
  };

  // --- THEME LOGIC ---

  // Updates a specific field for the ACTIVE mode only
  const updateThemeField = (key, value) => {
    const nextTheme = {
      ...draftTheme,
      [activePaletteKey]: {
        ...draftTheme[activePaletteKey],
        [key]: value
      }
    };
    setDraftTheme(nextTheme); 
    previewTheme(nextTheme); // Live preview
    setSelectedPreset(''); // User is customizing, so clear preset selection
  };

  // Applies a preset to the ACTIVE mode only
  const applyPreset = (preset) => {
    const nextTheme = {
      ...draftTheme,
      [activePaletteKey]: {
        ...DEFAULT_THEME[activePaletteKey], // Ensure we have all keys
        ...preset.palette[activePaletteKey] // Overwrite with preset values
      }
    };
    setSelectedPreset(preset.name);
    setDraftTheme(nextTheme);
    previewTheme(nextTheme);
    addToast('info', `${preset.name} applied to ${activePaletteKey} mode.`);
  };

  // Restores the ACTIVE mode to the last saved state
  const restoreSavedTheme = () => {
    const nextTheme = {
      ...draftTheme,
      [activePaletteKey]: { ...savedTheme[activePaletteKey] }
    };
    setDraftTheme(nextTheme);
    previewTheme(nextTheme); // Revert preview
    setSelectedPreset('');
    addToast('success', `Restored saved ${activePaletteKey} theme.`);
  };

  // Saves the FULL state (both light and dark) to the database
  const persistTheme = async () => {
    setSavingTheme(true);
    try { 
      // We save "draftTheme" which contains the latest edits for both modes
      await saveTheme(draftTheme); 
      addToast('success', 'Theme published globally.'); 
    } 
    catch (err) { addToast('error', `Save failed: ${err.message}`); } 
    finally { setSavingTheme(false); }
  };

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-[var(--color-surface)] text-[var(--color-text)] transition-colors duration-300 pb-20">
      <div className="bg-grain" />
      
      {/* Toast Notification */}
      <div ref={toastRegionRef} className="fixed inset-x-4 bottom-5 md:bottom-8 md:right-6 md:left-auto z-50 flex flex-col gap-3 items-stretch md:items-end pointer-events-none">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto w-full md:w-[360px] rounded-2xl border shadow-lg px-4 py-3 flex items-start gap-3 backdrop-blur-xl bg-[var(--color-card)] border-[var(--color-text)]/10 text-[var(--color-text)]">
            <div className="mt-0.5 shrink-0 text-[var(--color-primary)]">{toast.type === 'error' ? <AlertTriangle size={18}/> : <CheckCircle2 size={18}/>}</div>
            <div className="flex-1 text-sm font-semibold">{toast.text}</div>
            <button onClick={() => setToasts(p => p.filter(t => t.id !== toast.id))}><X size={16}/></button>
          </div>
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)]"><ShieldCheck size={24} /></div>
              <h1 className="text-3xl font-serif font-bold">Admin Portal</h1>
            </div>
            <p className="text-sm text-[var(--color-muted)] font-medium">Manage studio operations and design.</p>
          </div>
          <Link to="/" className="px-5 py-2.5 rounded-xl border border-[var(--color-text)]/10 bg-[var(--color-card)] hover:bg-[var(--color-text)]/5 transition-colors text-sm font-bold flex items-center gap-2 shadow-sm">
            <ArrowLeft size={16} /> Back to Site
          </Link>
        </header>

        {/* --- MAIN NAVIGATION TABS --- */}
        <div className="flex overflow-x-auto gap-2 mb-8 pb-2 scrollbar-none">
          {[
            { id: 'classes', label: 'Classes', icon: CalendarRange },
            { id: 'bookings', label: 'Bookings', icon: Users },
            { id: 'retreats', label: 'Retreats', icon: MapPin },
            { id: 'theme', label: 'Theme Studio', icon: Palette },
            { id: 'users', label: 'Users', icon: Users },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'bg-[var(--color-text)] text-[var(--color-surface)] shadow-lg' 
                  : 'bg-[var(--color-card)] text-[var(--color-muted)] hover:text-[var(--color-text)] border border-[var(--color-text)]/5'
              }`}
            >
              <tab.icon size={18} /> {tab.label}
            </button>
          ))}
        </div>

        {/* --- TAB CONTENT: CLASSES --- */}
        {activeTab === 'classes' && (
          <div className="grid md:grid-cols-[1fr,360px] gap-6 animate-in fade-in">
            {/* ... (Existing Classes Code, truncated for brevity, remains unchanged) ... */}
            <div className="space-y-6">
              <div className="bg-[var(--color-card)] rounded-3xl p-6 border border-[var(--color-text)]/5 shadow-sm">
                <h3 className="text-lg font-serif font-bold mb-4 flex items-center gap-2"><ClipboardList size={20}/> Upcoming Schedule</h3>
                {loading ? <p className="text-sm p-4">Loading...</p> : (
                  <div className="space-y-3">
                    {classes.map(cls => (
                      <div key={cls.id} className="p-4 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-text)]/5 flex justify-between items-center group hover:border-[var(--color-primary)]/30 transition-colors">
                        <div>
                          <div className="flex items-center gap-2 text-xs font-bold text-[var(--color-muted)] uppercase tracking-wider mb-1">
                            <span>{new Date(cls.date).toLocaleDateString()}</span>
                            <span>•</span>
                            <span>{cls.time}</span>
                          </div>
                          <h4 className="font-bold text-lg">{cls.title}</h4>
                          <p className="text-xs text-[var(--color-muted)]">{cls.instructor} • {cls.capacity} spots</p>
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => startEdit(cls)} className="p-2 hover:bg-[var(--color-text)]/5 rounded-lg text-[var(--color-primary)]"><Pencil size={16}/></button>
                          <button onClick={() => setClassToDelete(cls)} className="p-2 hover:bg-rose-50 text-rose-500 rounded-lg"><Trash2 size={16}/></button>
                        </div>
                      </div>
                    ))}
                    {classes.length === 0 && <p className="text-sm text-[var(--color-muted)] italic">No classes found.</p>}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-[var(--color-card)] rounded-3xl p-6 border border-[var(--color-text)]/5 shadow-sm h-fit sticky top-6">
              <h3 className="text-lg font-serif font-bold mb-4">Create Class</h3>
              <form onSubmit={saveClass} className="space-y-4">
                <input type="text" placeholder="Title" required value={draftClass.title} onChange={e => handleClassChange('title', e.target.value)} className="admin-input" />
                <DateTimePicker value={draftClass.date} onChange={val => handleClassChange('date', val)} required />
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" placeholder="Duration (e.g. 60m)" value={draftClass.duration} onChange={e => handleClassChange('duration', e.target.value)} className="admin-input" />
                  <input type="number" placeholder="Price" value={draftClass.price} onChange={e => handleClassChange('price', Number(e.target.value))} className="admin-input" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input type="number" placeholder="Cap." value={draftClass.capacity} onChange={e => handleClassChange('capacity', Number(e.target.value))} className="admin-input" />
                  <input type="number" placeholder="Waitlist" value={draftClass.waitlist_capacity} onChange={e => handleClassChange('waitlist_capacity', Number(e.target.value))} className="admin-input" />
                </div>
                <input type="text" placeholder="Instructor" value={draftClass.instructor} onChange={e => handleClassChange('instructor', e.target.value)} className="admin-input" />
                <input type="text" placeholder="Location" value={draftClass.location} onChange={e => handleClassChange('location', e.target.value)} className="admin-input" />
                <textarea placeholder="Description (optional)" value={draftClass.description} onChange={e => handleClassChange('description', e.target.value)} className="admin-input" rows={2} />
                
                <button type="submit" disabled={savingClass} className="w-full py-3 bg-[var(--color-primary)] text-white font-bold rounded-xl shadow-lg hover:brightness-110 transition-all flex justify-center items-center gap-2">
                  {savingClass ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} Add to Schedule
                </button>
              </form>
            </div>
          </div>
        )}

        {/* --- TAB CONTENT: BOOKINGS --- */}
        {activeTab === 'bookings' && (
          <div className="space-y-6 animate-in fade-in">
            {/* ... (Existing Bookings Code) ... */}
            <div className="bg-[var(--color-card)] rounded-3xl p-6 border border-[var(--color-text)]/5 shadow-sm">
              <h3 className="text-lg font-serif font-bold mb-4 flex items-center gap-2"><Users size={20}/> Student Reservations</h3>
              {loading ? <p className="text-sm p-4">Loading bookings...</p> : (
                <div className="grid gap-3">
                  {bookings.map((booking) => {
                    const studentName = booking.profiles?.full_name || 'Guest User'; // Will be just "Guest User" until we fix foreign keys
                    const studentEmail = booking.profiles?.email || 'No email';
                    return (
                      <div key={booking.id} className="p-4 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-text)]/5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-[var(--color-primary)]/30 transition-colors">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 text-xs font-bold text-[var(--color-muted)] uppercase tracking-wider mb-1">
                            <span>{new Date(booking.class_date).toLocaleDateString()}</span>
                            <span>•</span>
                            <span>{new Date(booking.class_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <h4 className="font-bold text-lg">{studentName}</h4>
                          <p className="text-sm text-[var(--color-muted)]">{booking.class_name} • {studentEmail}</p>
                        </div>
                        <button 
                          onClick={() => deleteBooking(booking.id)}
                          className="px-4 py-2 rounded-xl border border-rose-200 text-rose-600 bg-rose-50 hover:bg-rose-100 text-xs font-bold uppercase tracking-wider transition-colors"
                        >
                          Cancel Booking
                        </button>
                      </div>
                    );
                  })}
                  {bookings.length === 0 && (
                    <div className="p-8 text-center text-[var(--color-muted)] italic border border-dashed border-[var(--color-text)]/10 rounded-2xl">
                      No active bookings found.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- TAB CONTENT: RETREATS --- */}
        {activeTab === 'retreats' && (
          <div className="grid md:grid-cols-[1fr,360px] gap-6 animate-in fade-in">
            {/* ... (Existing Retreats Code) ... */}
            <div className="space-y-6">
              <div className="bg-[var(--color-card)] rounded-3xl p-6 border border-[var(--color-text)]/5 shadow-sm">
                <h3 className="text-lg font-serif font-bold mb-4 flex items-center gap-2"><MapPin size={20}/> Upcoming Retreats</h3>
                <div className="space-y-4">
                  {retreats.map((retreat) => {
                    const attendees = retreatSignupMap.get(retreat.id) || [];
                    return (
                      <div key={retreat.id} className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-text)]/5 overflow-hidden">
                        <div className="p-5 flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2 text-xs font-bold text-[var(--color-muted)] uppercase tracking-wider mb-1">
                              {retreat.date_label || formatDateRange(retreat.start_date, retreat.end_date)}
                            </div>
                            <h4 className="font-bold text-xl mb-1">{retreat.title}</h4>
                            <p className="text-sm text-[var(--color-muted)] mb-3">{retreat.location}</p>
                            <div className="flex gap-4 text-xs font-medium text-[var(--color-muted)]">
                              <span className="flex items-center gap-1"><Users size={14}/> {attendees.length} / {retreat.capacity}</span>
                              <span className="flex items-center gap-1"><DollarSign size={14}/> ${retreat.price}</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => startRetreatEdit(retreat)} className="p-2 hover:bg-[var(--color-text)]/5 rounded-lg text-[var(--color-primary)]"><Pencil size={16}/></button>
                            <button onClick={() => setRetreatToDelete(retreat)} className="p-2 hover:bg-rose-50 text-rose-500 rounded-lg"><Trash2 size={16}/></button>
                          </div>
                        </div>
                        {/* Signups List */}
                        {attendees.length > 0 && (
                          <div className="bg-[var(--color-card)]/50 border-t border-[var(--color-text)]/5 p-4">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-muted)] mb-2">Attendee List</p>
                            <div className="space-y-2">
                              {attendees.map(a => (
                                <div key={a.id} className="flex justify-between items-center text-sm">
                                  <span className="font-medium">{a.profiles?.full_name || a.name || 'Guest'}</span>
                                  <span className="text-[var(--color-muted)] text-xs">{a.profiles?.email || a.email}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {retreats.length === 0 && <p className="text-sm text-[var(--color-muted)]">No retreats scheduled.</p>}
                </div>
              </div>
            </div>

            <div className="bg-[var(--color-card)] rounded-3xl p-6 border border-[var(--color-text)]/5 shadow-sm h-fit sticky top-6">
              <h3 className="text-lg font-serif font-bold mb-4">Create Retreat</h3>
              <form onSubmit={saveRetreat} className="space-y-4">
                <input type="text" placeholder="Retreat Title" required value={draftRetreat.title} onChange={e => handleRetreatChange('title', e.target.value)} className="admin-input" />
                <input type="text" placeholder="Location" value={draftRetreat.location} onChange={e => handleRetreatChange('location', e.target.value)} className="admin-input" />
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-[var(--color-muted)]">Start</label>
                    <input type="date" value={draftRetreat.start_date} onChange={e => handleRetreatChange('start_date', e.target.value)} className="admin-input" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-[var(--color-muted)]">End</label>
                    <input type="date" value={draftRetreat.end_date} onChange={e => handleRetreatChange('end_date', e.target.value)} className="admin-input" />
                  </div>
                </div>
                <input type="text" placeholder="Date Label (e.g. Sept 12-14)" value={draftRetreat.date_label} onChange={e => handleRetreatChange('date_label', e.target.value)} className="admin-input" />
                <div className="grid grid-cols-2 gap-3">
                  <input type="number" placeholder="Price" value={draftRetreat.price} onChange={e => handleRetreatChange('price', Number(e.target.value))} className="admin-input" />
                  <input type="number" placeholder="Capacity" value={draftRetreat.capacity} onChange={e => handleRetreatChange('capacity', Number(e.target.value))} className="admin-input" />
                </div>
                <input type="text" placeholder="Image URL" value={draftRetreat.image_url} onChange={e => handleRetreatChange('image_url', e.target.value)} className="admin-input" />
                <textarea placeholder="Description" value={draftRetreat.description} onChange={e => handleRetreatChange('description', e.target.value)} className="admin-input" rows={3} />
                
                <button type="submit" disabled={savingClass} className="w-full py-3 bg-[var(--color-primary)] text-white font-bold rounded-xl shadow-lg hover:brightness-110 transition-all flex justify-center items-center gap-2">
                  {savingClass ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} Save Retreat
                </button>
              </form>
            </div>
          </div>
        )}

        {/* --- TAB CONTENT: THEME STUDIO --- */}
        {activeTab === 'theme' && (
          <div className="grid lg:grid-cols-[280px,1fr] gap-8 items-start animate-in fade-in">
            {/* Sidebar Navigation */}
            <div className="bg-[var(--color-card)] rounded-3xl p-2 border border-[var(--color-text)]/5 h-fit">
              <div className="flex flex-col gap-1">
                <button onClick={() => setThemeTab('presets')} className={`text-left px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-3 transition-all ${themeTab === 'presets' ? 'bg-[var(--color-surface)] text-[var(--color-primary)] shadow-sm' : 'text-[var(--color-muted)] hover:bg-[var(--color-surface)]/50'}`}>
                  <Grid size={18} /> Presets
                </button>
                <div className="h-px bg-[var(--color-text)]/5 my-1 mx-2" />
                <div className="px-4 py-2 text-[10px] uppercase tracking-widest font-bold text-[var(--color-muted)]">Customize</div>
                {Object.entries(themeGroups).map(([key, group]) => (
                  <button key={key} onClick={() => { setThemeTab('editor'); setEditorSection(key); }} className={`text-left px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-3 transition-all ${themeTab === 'editor' && editorSection === key ? 'bg-[var(--color-surface)] text-[var(--color-primary)] shadow-sm font-bold' : 'text-[var(--color-muted)] hover:bg-[var(--color-surface)]/50'}`}>
                    <group.icon size={18} /> {group.label}
                  </button>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-[var(--color-text)]/10 px-2 space-y-2">
                <button onClick={persistTheme} disabled={savingTheme} className="w-full py-3 bg-[var(--color-primary)] text-white font-bold rounded-xl shadow-md hover:brightness-110 flex items-center justify-center gap-2">
                  {savingTheme ? <Loader2 className="animate-spin" size={16}/> : <Save size={16}/>} Save Theme
                </button>
                <button onClick={restoreSavedTheme} className="w-full py-3 bg-[var(--color-surface)] text-[var(--color-muted)] font-bold rounded-xl hover:bg-[var(--color-text)]/5 flex items-center justify-center gap-2 text-xs">
                  <Undo size={14}/> Revert {activePaletteLabel}
                </button>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="space-y-6">
              
              {/* Header / Mode Switcher */}
              <div className="flex justify-between items-center bg-[var(--color-card)] p-4 rounded-2xl border border-[var(--color-text)]/5">
                <div>
                  <h2 className="text-xl font-serif font-bold">{themeTab === 'presets' ? 'Theme Library' : themeGroups[editorSection].label}</h2>
                  <p className="text-sm text-[var(--color-muted)]">{themeTab === 'presets' ? `Instant looks for ${activePaletteLabel} mode.` : `${themeGroups[editorSection].desc} (${activePaletteLabel})`}</p>
                </div>
                <button onClick={toggleTheme} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--color-surface)] border border-[var(--color-text)]/10 text-xs font-bold uppercase tracking-wider hover:bg-[var(--color-text)]/5 transition-all">
                  {darkMode ? <MoonStar size={16}/> : <SunMedium size={16}/>} {darkMode ? 'Dark Mode' : 'Light Mode'}
                </button>
              </div>

              {/* PRESETS GRID */}
              {themeTab === 'presets' && (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {THEME_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => applyPreset(preset)}
                      className={`relative text-left p-1 rounded-3xl transition-all duration-300 group hover:-translate-y-1 ${selectedPreset === preset.name ? 'ring-2 ring-[var(--color-primary)]' : 'hover:shadow-lg'}`}
                    >
                      <div className="bg-[var(--color-card)] rounded-[1.3rem] p-5 h-full border border-[var(--color-text)]/5 overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="bg-[var(--color-primary)] text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase">Apply</div>
                        </div>
                        <div className="flex gap-2 mb-4">
                          <div className="w-8 h-8 rounded-full shadow-sm" style={{ background: preset.palette[activePaletteKey].primary }} />
                          <div className="w-8 h-8 rounded-full shadow-sm" style={{ background: preset.palette[activePaletteKey].secondary }} />
                          <div className="w-8 h-8 rounded-full shadow-sm" style={{ background: preset.palette[activePaletteKey].surface, border: '1px solid rgba(0,0,0,0.1)' }} />
                        </div>
                        <h3 className="font-bold text-lg mb-1">{preset.name}</h3>
                        <p className="text-xs text-[var(--color-muted)] leading-relaxed">{preset.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* EDITOR PANELS */}
              {themeTab === 'editor' && (
                <div className="bg-[var(--color-card)] rounded-3xl p-6 border border-[var(--color-text)]/5 shadow-sm">
                  <div className="grid gap-6">
                    {themeGroups[editorSection].fields.map((field) => (
                      <div key={field.key} className="flex items-center justify-between p-4 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-text)]/5">
                        <div className="flex gap-4 items-center">
                          <div 
                            className="w-12 h-12 rounded-xl shadow-inner border border-[var(--color-text)]/10" 
                            style={{ background: draftTheme[activePaletteKey][field.key] }} 
                          />
                          <div>
                            <label className="font-bold text-sm block">{field.label}</label>
                            <p className="text-xs text-[var(--color-muted)]">{field.desc}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-xs text-[var(--color-muted)] bg-[var(--color-card)] px-2 py-1 rounded">
                            {draftTheme[activePaletteKey][field.key]}
                          </span>
                          <input
                            type="color"
                            value={draftTheme[activePaletteKey][field.key]}
                            onChange={(e) => updateThemeField(field.key, e.target.value)}
                            className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0 p-0"
                          />
                        </div>
                      </div>
                    ))}

                    {/* Special Controls for Effects Section */}
                    {editorSection === 'effects' && (
                      <div className="p-4 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-text)]/5 space-y-4">
                        <div className="flex justify-between items-center">
                          <label className="font-bold text-sm">Ambient Glow</label>
                          <button 
                            onClick={() => updateThemeField('glowEnabled', !draftTheme[activePaletteKey].glowEnabled)}
                            className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${draftTheme[activePaletteKey].glowEnabled !== false ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--color-muted)]/20 text-[var(--color-muted)]'}`}
                          >
                            {draftTheme[activePaletteKey].glowEnabled !== false ? 'On' : 'Off'}
                          </button>
                        </div>
                        <div>
                          <div className="flex justify-between text-xs text-[var(--color-muted)] mb-2">
                            <span>Intensity</span>
                            <span>{Math.round((draftTheme[activePaletteKey].glowIntensity || 0.5) * 100)}%</span>
                          </div>
                          <input 
                            type="range" min="0" max="1" step="0.05" 
                            value={draftTheme[activePaletteKey].glowIntensity || 0.5}
                            onChange={(e) => updateThemeField('glowIntensity', parseFloat(e.target.value))}
                            className="w-full accent-[var(--color-primary)]"
                          />
                        </div>
                        <div>
                          <div className="flex justify-between text-xs text-[var(--color-muted)] mb-2">
                            <span>Softness</span>
                            <span>{Math.round((draftTheme[activePaletteKey].glowSoftness || 40))}px</span>
                          </div>
                          <input 
                            type="range" min="16" max="100" step="2"
                            value={draftTheme[activePaletteKey].glowSoftness || 40}
                            onChange={(e) => updateThemeField('glowSoftness', parseFloat(e.target.value))}
                            className="w-full accent-[var(--color-primary)]"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- TAB CONTENT: USERS --- */}
        {activeTab === 'users' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="bg-[var(--color-card)] rounded-3xl p-6 border border-[var(--color-text)]/5 shadow-sm">
              <h3 className="text-lg font-serif font-bold mb-4 flex items-center gap-2"><Users size={20}/> Registered Users</h3>
              {loading ? <p className="text-sm p-4">Loading users...</p> : (
                <div className="grid gap-3">
                  {users.map((user) => {
                    return (
                      <div key={user.id} className="p-4 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-text)]/5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-[var(--color-primary)]/30 transition-colors">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                              <h4 className="font-bold text-lg">{user.full_name || 'Guest User'}</h4>
                              {user.source && <span className="px-2 py-0.5 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-[10px] font-bold uppercase tracking-widest">{user.source}</span>}
                          </div>
                          <p className="text-sm text-[var(--color-muted)]">{user.email}</p>
                          {user.created_at && <p className="text-xs text-[var(--color-muted)] mt-1">Joined: {new Date(user.created_at).toLocaleDateString()}</p>}
                        </div>
                      </div>
                    );
                  })}
                  {users.length === 0 && (
                    <div className="p-8 text-center text-[var(--color-muted)] italic border border-dashed border-[var(--color-text)]/10 rounded-2xl">
                      No registered users found.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* MODALS: EDIT CLASS */}
        {editClassDraft && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={closeEditModal}>
            <div className="bg-[var(--color-card)] rounded-3xl max-w-lg w-full p-6 shadow-2xl animate-in fade-in-up" onClick={e => e.stopPropagation()}>
              <h3 className="text-xl font-bold mb-4">Edit Class</h3>
              <div className="space-y-4">
                <input value={editClassDraft.title} onChange={e => handleEditClassChange('title', e.target.value)} className="admin-input" placeholder="Title" />
                <DateTimePicker value={editClassDraft.date} onChange={val => handleEditClassChange('date', val)} />
                <div className="grid grid-cols-2 gap-3">
                  <input value={editClassDraft.duration} onChange={e => handleEditClassChange('duration', e.target.value)} className="admin-input" placeholder="Duration" />
                  <input type="number" value={editClassDraft.price} onChange={e => handleEditClassChange('price', Number(e.target.value))} className="admin-input" placeholder="Price" />
                </div>
                <input value={editClassDraft.location} onChange={e => handleEditClassChange('location', e.target.value)} className="admin-input" placeholder="Location" />
                <div className="flex gap-3 mt-4">
                  <button onClick={closeEditModal} className="flex-1 py-3 bg-[var(--color-surface)] font-bold rounded-xl border border-[var(--color-text)]/10">Cancel</button>
                  <button onClick={saveEditedClass} className="flex-1 py-3 bg-[var(--color-primary)] text-white font-bold rounded-xl shadow-lg hover:brightness-110">Save</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODALS: CONFIRM DELETE CLASS */}
        {classToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setClassToDelete(null)}>
            <div className="bg-[var(--color-card)] rounded-3xl max-w-sm w-full p-6 shadow-2xl animate-in fade-in-up" onClick={e => e.stopPropagation()}>
              <h3 className="text-xl font-bold mb-2">Delete Class?</h3>
              <p className="text-sm text-[var(--color-muted)] mb-6">Are you sure you want to remove <strong>{classToDelete.title}</strong>?</p>
              <div className="flex gap-3">
                <button onClick={() => setClassToDelete(null)} className="flex-1 py-3 bg-[var(--color-surface)] font-bold rounded-xl border border-[var(--color-text)]/10">Cancel</button>
                <button onClick={confirmDeleteClass} className="flex-1 py-3 bg-rose-600 text-white font-bold rounded-xl shadow-lg hover:bg-rose-700">Delete</button>
              </div>
            </div>
          </div>
        )}

        {/* MODALS: CONFIRM DELETE RETREAT */}
        {retreatToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setRetreatToDelete(null)}>
            <div className="bg-[var(--color-card)] rounded-3xl max-w-sm w-full p-6 shadow-2xl animate-in fade-in-up" onClick={e => e.stopPropagation()}>
              <h3 className="text-xl font-bold mb-2">Delete Retreat?</h3>
              <p className="text-sm text-[var(--color-muted)] mb-6">Are you sure you want to remove <strong>{retreatToDelete.title}</strong>?</p>
              <div className="flex gap-3">
                <button onClick={() => setRetreatToDelete(null)} className="flex-1 py-3 bg-[var(--color-surface)] font-bold rounded-xl border border-[var(--color-text)]/10">Cancel</button>
                <button onClick={confirmDeleteRetreat} className="flex-1 py-3 bg-rose-600 text-white font-bold rounded-xl shadow-lg hover:bg-rose-700">Delete</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;