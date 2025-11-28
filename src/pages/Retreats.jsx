import React, { useEffect, useMemo, useState } from 'react';
import { Calendar, Clock, MapPin, Star, Users, X, ArrowRight, Check, AlertCircle } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../utils/supabase';
import { useAuth } from '../context/AuthContext';

const Retreats = () => {
  const { isAdmin } = useAuth();
  const [retreats, setRetreats] = useState([]);
  const [signups, setSignups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedRetreat, setSelectedRetreat] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [submitting, setSubmitting] = useState(false);

  const supabaseReady = isSupabaseConfigured && Boolean(supabase);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        if (!supabaseReady) {
          setError('Connect Supabase to load live retreats.');
          setRetreats([]);
          return;
        }

        const [retreatRes, signupRes] = await Promise.all([
          supabase.from('retreats').select('*').order('start_date', { ascending: true }),
          supabase.from('retreat_signups').select('*'),
        ]);

        if (retreatRes.error) throw retreatRes.error;
        if (signupRes.error && !`${signupRes.error.message}`.includes('does not exist')) throw signupRes.error;

        setRetreats(retreatRes.data || []);
        setSignups(signupRes.data || []);
        setError('');
      } catch (err) {
        console.error('Unable to load retreats', err);
        setError('We could not load retreats right now. Please try again soon.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [supabaseReady]);

  const bookingCounts = useMemo(() => {
    const counts = new Map();
    signups.forEach((entry) => {
      counts.set(entry.retreat_id, (counts.get(entry.retreat_id) || 0) + 1);
    });
    return counts;
  }, [signups]);

  const openModal = (retreat) => {
    setSelectedRetreat(retreat);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedRetreat(null);
    setFormData({ name: '', email: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRetreat) return;
    if (!supabaseReady) {
      alert('Supabase is not configured. Retreat signups are offline.');
      return;
    }
    setSubmitting(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const payload = {
        id: crypto.randomUUID(),
        retreat_id: selectedRetreat.id,
        name: formData.name,
        email: formData.email,
        user_id: user?.id || null,
      };
      const { error: signupError } = await supabase.from('retreat_signups').insert([payload]);
      if (signupError) throw signupError;
      setSignups((prev) => [payload, ...prev]);
      alert('We received your request!');
      closeModal();
    } catch (err) {
      alert(`Could not save your spot: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-surface)] text-[var(--color-text)]">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 rounded-full bg-[var(--color-card)] mb-4" />
          <div className="h-4 w-32 bg-[var(--color-card)] rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-surface)] text-[var(--color-text)] relative">
      <div className="bg-grain" />

      {/* Header */}
      <div className="relative pt-24 pb-12 px-4 text-center z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-card)]/90 dark:bg-stone-800 border border-white/50 dark:border-stone-700 text-[var(--color-muted)] dark:text-stone-300 text-xs font-bold uppercase tracking-widest mb-6 shadow-sm shadow-[var(--color-primary)]/10">
          <Star size={12} className="text-[var(--color-primary)]" /> Retreats
        </div>
        <h1 className="text-5xl md:text-6xl font-serif font-medium text-stone-900 dark:text-stone-100 mb-6">Travel with the Studio</h1>
        <p className="text-lg text-[var(--color-muted)] dark:text-stone-300 max-w-xl mx-auto leading-relaxed">
          Nourish yourself with immersive experiences designed to balance body, mind, and heart.
        </p>
        {error && (
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--color-card)] border border-white/50 dark:border-stone-700 text-xs text-[var(--color-muted)] shadow-card">
            <AlertCircle size={14} /> {error}
          </div>
        )}
      </div>

      <div className="max-w-4xl mx-auto px-4 pb-24 space-y-6 relative z-10">
        {retreats.length === 0 && !error && (
          <div className="p-8 rounded-3xl border border-dashed border-stone-200 dark:border-stone-700 bg-white/70 dark:bg-stone-800/60 text-center text-sm text-[var(--color-muted)] shadow-card">
            {isAdmin 
              ? "No retreats yet. Add one in the admin panel to see it here instantly." 
              : "Our upcoming retreats are currently being planned. Please check back soon for updates."}
          </div>
        )}
        
        {retreats.map((retreat, idx) => {
          const total = retreat.capacity || 0;
          const booked = bookingCounts.get(retreat.id) || 0;
          const spotsLeft = total ? Math.max(0, total - booked) : null;
          const dateLabel = retreat.date_label || retreat.start_date || retreat.end_date;
          const startDateObj = retreat.start_date ? new Date(retreat.start_date) : null;
          const isFull = total > 0 && booked >= total;

          return (
            <div
              key={retreat.id}
              className="group relative rounded-3xl p-6 md:p-8 transition-all duration-300 border animate-in-up bg-white border-stone-100 shadow-card hover:shadow-soft hover:-translate-y-1 dark:bg-stone-800 dark:border-stone-700"
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <div className="flex flex-col md:flex-row gap-6 md:items-center">
                
                {/* Date Badge */}
                <div className="flex flex-col items-center justify-center w-full md:w-20 h-20 rounded-2xl shrink-0 border transition-colors bg-stone-50 border-stone-100 text-stone-600 dark:bg-stone-700 dark:border-stone-600 dark:text-stone-300">
                  <span className="text-[10px] font-bold uppercase tracking-widest">{startDateObj ? startDateObj.toLocaleDateString('en-US', { month: 'short' }) : 'TBD'}</span>
                  <span className="text-2xl font-serif font-bold leading-none mt-1">{startDateObj ? startDateObj.getDate() : '--'}</span>
                </div>

                {/* Details */}
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                    <h3 className="text-xl font-serif font-bold text-stone-800 dark:text-stone-100">{retreat.title}</h3>
                    {isFull && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-stone-100 text-stone-500 dark:bg-stone-700 dark:text-stone-400">
                        Sold Out
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-stone-500 dark:text-stone-400 mb-3">
                    <span className="flex items-center gap-1.5"><Calendar size={14} className="text-[var(--color-primary)]"/> {dateLabel || 'Dates TBA'}</span>
                    <span className="flex items-center gap-1.5"><MapPin size={14} className="text-[var(--color-primary)]"/> {retreat.location || 'Location TBA'}</span>
                    {spotsLeft !== null && (
                      <span className={`flex items-center gap-1.5 ${isFull ? 'text-rose-500 font-medium' : ''}`}>
                        <Users size={14} className={isFull ? 'text-rose-500' : 'text-[var(--color-primary)]'}/>
                        {isFull ? 'Full' : `${spotsLeft} spots left`}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-stone-600 dark:text-stone-300 line-clamp-2">{retreat.description || 'Details coming soon.'}</p>
                </div>

                {/* Action */}
                <div className="flex items-center justify-between md:flex-col md:items-end gap-4 mt-2 md:mt-0 border-t md:border-none border-stone-100 dark:border-stone-700 pt-4 md:pt-0">
                  <span className="text-lg font-bold text-stone-700 dark:text-stone-200">{retreat.price ? `$${retreat.price}` : 'Price TBA'}</span>
                  <button
                    onClick={() => openModal(retreat)}
                    disabled={isFull || submitting}
                    className={`px-6 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg shadow-stone-900/5 hover:-translate-y-0.5 transition-all
                      ${isFull
                        ? 'bg-stone-300 cursor-not-allowed shadow-none dark:bg-stone-700 dark:text-stone-500'
                        : 'bg-stone-800 hover:bg-stone-900 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white'
                      }`}
                  >
                    {isFull ? 'Waitlist' : 'Reserve Spot'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showModal && selectedRetreat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/20 backdrop-blur-sm animate-in fade-in" onClick={closeModal}>
          <div className="bg-white dark:bg-stone-900 rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden border border-white/50 dark:border-stone-700 animate-in-up" onClick={(e) => e.stopPropagation()}>
            <div className="p-8">
              <div className="mb-6">
                <div className="flex justify-between items-start mb-2">
                   <span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">Reserve Spot</span>
                   <button onClick={closeModal} className="p-1 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 transition-colors"><X size={16}/></button>
                </div>
                <h3 className="text-2xl font-serif font-bold text-stone-900 dark:text-white mt-1 mb-2">{selectedRetreat.title}</h3>
                <div className="flex items-center gap-2 text-stone-500 dark:text-stone-400 text-sm">
                  <Calendar size={14} /> {selectedRetreat.date_label || selectedRetreat.start_date || 'Dates TBA'}
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-500 dark:text-stone-400 mb-1 uppercase tracking-wider">Name</label>
                  <input
                    type="text"
                    required
                    className="w-full p-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:ring-2 focus:ring-teal-500/50 outline-none transition-all text-stone-900 dark:text-white text-sm"
                    placeholder="Jane Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 dark:text-stone-400 mb-1 uppercase tracking-wider">Email</label>
                  <input
                    type="email"
                    required
                    className="w-full p-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:ring-2 focus:ring-teal-500/50 outline-none transition-all text-stone-900 dark:text-white text-sm"
                    placeholder="jane@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-stone-900 hover:bg-stone-800 dark:bg-white dark:text-stone-900 dark:hover:bg-stone-200 text-white rounded-xl font-bold shadow-lg shadow-stone-900/10 transition-all flex items-center justify-center gap-2 mt-2"
                >
                  {submitting ? 'Submitting...' : 'Confirm Reservation'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Retreats;