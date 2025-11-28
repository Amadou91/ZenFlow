import React, { useEffect, useMemo, useState } from 'react';
import { Calendar, Clock, MapPin, Star, Users, X } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../utils/supabase';

const Retreats = () => {
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
    <div className="animate-in fade-in-up pb-20 theme-surface relative">
      <div className="bg-grain" />

      <div className="relative h-[60vh] bg-[color-mix(in_srgb,var(--color-card)20%,transparent)] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-gradientFrom)]/40 to-[var(--color-gradientTo)]/40" />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.35),transparent 35%), radial-gradient(circle at 80% 40%, rgba(0,0,0,0.15), transparent 45%)',
          }}
        />
        <div className="relative z-10 text-center max-w-3xl px-6">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[color-mix(in_srgb,var(--color-card)85%,transparent)] border border-[color-mix(in_srgb,var(--color-text)12%,transparent)] text-[var(--color-primary)] text-xs font-bold uppercase tracking-widest mb-6">
            <Star size={12} /> Retreats
          </span>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-[var(--color-text)] mb-4">Travel with the Studio</h1>
          <p className="theme-muted text-lg">Nourish yourself with immersive experiences designed to balance body, mind, and heart.</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-24 relative z-10 space-y-4">
        {error && <div className="p-4 rounded-2xl bg-rose-50 text-rose-700 border border-rose-200 text-sm font-semibold">{error}</div>}
        {retreats.length === 0 && !error && (
          <div className="p-6 rounded-3xl border border-dashed border-[color-mix(in_srgb,var(--color-text)12%,transparent)] text-[var(--color-muted)] text-sm">
            No retreats yet. Add one in the admin panel to see it here instantly.
          </div>
        )}
        <div className="grid md:grid-cols-2 gap-8">
          {retreats.map((retreat) => {
            const total = retreat.capacity || 0;
            const booked = bookingCounts.get(retreat.id) || 0;
            const spotsLeft = total ? Math.max(0, total - booked) : null;
            const dateLabel = retreat.date_label || retreat.start_date || retreat.end_date;

            return (
              <div key={retreat.id} className="bg-[color-mix(in_srgb,var(--color-card)96%,transparent)] rounded-[2.5rem] overflow-hidden shadow-2xl shadow-[color-mix(in_srgb,var(--color-text)15%,transparent)] border border-[color-mix(in_srgb,var(--color-text)10%,transparent)]">
                <div className="bg-[color-mix(in_srgb,var(--color-card)90%,transparent)] min-h-[400px] relative overflow-hidden group">
                  {retreat.image_url ? (
                    <img
                      src={retreat.image_url}
                      alt={retreat.title}
                      className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-[var(--color-muted)] bg-[var(--color-surface)]">
                      No image yet
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[color-mix(in_srgb,var(--color-text)55%,transparent)] to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6 text-white drop-shadow-lg">
                    <div className="flex items-center gap-2 text-sm opacity-80">
                      <Calendar size={16} /> {dateLabel || 'Dates coming soon'}
                    </div>
                    <h3 className="text-2xl font-serif font-bold mt-2">{retreat.title}</h3>
                    <p className="text-sm opacity-80 flex items-center gap-2 mt-1"><MapPin size={16} /> {retreat.location || 'Location TBA'}</p>
                  </div>
                </div>

                <div className="p-8 space-y-4">
                  <p className="theme-muted leading-relaxed">{retreat.description || 'Details coming soon.'}</p>
                  <div className="flex flex-wrap gap-3 text-sm theme-muted">
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full theme-chip border border-[color-mix(in_srgb,var(--color-primary)35%,transparent)]">
                      <Clock size={14} /> {dateLabel || 'Dates TBA'}
                    </span>
                    {spotsLeft !== null && (
                      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[color-mix(in_srgb,var(--color-card)90%,transparent)] border border-[color-mix(in_srgb,var(--color-text)12%,transparent)]">
                        <Users size={14} /> {spotsLeft} spots left
                      </span>
                    )}
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => openModal(retreat)}
                      className="flex-1 py-3 bg-[var(--color-primary)] text-white rounded-xl font-bold shadow-lg shadow-[var(--color-primary)]/25 hover:brightness-110 transition-all"
                    >
                      Reserve My Spot
                    </button>
                    {retreat.price ? (
                      <div className="px-4 py-3 rounded-xl border border-[color-mix(in_srgb,var(--color-text)10%,transparent)] text-[var(--color-text)] font-bold">
                        ${retreat.price}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showModal && selectedRetreat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[color-mix(in_srgb,var(--color-text)30%,transparent)] backdrop-blur-sm animate-in fade-in" onClick={closeModal}>
          <div className="theme-card rounded-3xl max-w-md w-full p-8 animate-in-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-serif font-bold text-[var(--color-text)]">Reserve for {selectedRetreat.title}</h3>
              <button onClick={closeModal} className="p-2 rounded-full hover:bg-[color-mix(in_srgb,var(--color-card)92%,transparent)]"><X size={20} className="theme-muted" /></button>
            </div>
            <p className="theme-muted text-sm mb-6 flex items-center gap-2"><Calendar size={16} /> {selectedRetreat.date_label || selectedRetreat.start_date || 'Dates TBA'}</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                required
                className="w-full p-4 rounded-xl bg-[color-mix(in_srgb,var(--color-card)92%,transparent)] border border-[color-mix(in_srgb,var(--color-text)10%,transparent)] focus:ring-2 focus:ring-[var(--color-primary)]/50 outline-none transition-all text-[var(--color-text)]"
                placeholder="Jane Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <input
                type="email"
                required
                className="w-full p-4 rounded-xl bg-[color-mix(in_srgb,var(--color-card)92%,transparent)] border border-[color-mix(in_srgb,var(--color-text)10%,transparent)] focus:ring-2 focus:ring-[var(--color-primary)]/50 outline-none transition-all text-[var(--color-text)]"
                placeholder="jane@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 bg-[var(--color-primary)] hover:brightness-110 text-white rounded-xl font-bold mt-2 shadow-lg shadow-[var(--color-primary)]/25 transition-all flex items-center justify-center gap-2"
              >
                {submitting ? 'Submitting...' : 'Submit Request'}
              </button>
              <button
                onClick={closeModal}
                type="button"
                className="w-full py-4 bg-[color-mix(in_srgb,var(--color-card)92%,transparent)] hover:bg-[color-mix(in_srgb,var(--color-card)96%,transparent)] font-bold rounded-xl text-[var(--color-text)] transition-colors"
              >
                Close
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Retreats;
