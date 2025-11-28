import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase, isSupabaseConfigured } from '../utils/supabase';
import { Calendar, Clock, MapPin, LogOut, Trash2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { currentUser, logout } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState(null);
  const navigate = useNavigate();

  const fetchBookings = useCallback(async () => {
    if (!currentUser) return;
    if (!isSupabaseConfigured || !supabase) {
      setError('Bookings will appear once Supabase is configured.');
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('class_date', { ascending: true });

      if (error) throw error;
      setBookings(data || []);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('We could not load your bookings. Please try again shortly.');
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const initiateCancel = (booking) => {
    setBookingToCancel(booking);
    setShowCancelModal(true);
  };

  const confirmCancel = async () => {
    if (!bookingToCancel) return;
    if (!isSupabaseConfigured || !supabase) {
      alert('Bookings are offline until Supabase is configured.');
      return;
    }
    setDeletingId(bookingToCancel.id);
    try {
      const { data, error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', bookingToCancel.id)
        .eq('user_id', currentUser.id)
        .select();

      if (error) throw error;
      if (!data || data.length === 0) throw new Error('Delete failed.');

      setBookings((prev) => prev.filter((b) => b.id !== bookingToCancel.id));
      setShowCancelModal(false);
    } catch (err) {
      alert(`Could not cancel: ${err.message}`);
      fetchBookings();
    } finally {
      setDeletingId(null);
      setBookingToCancel(null);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (e) {
      console.error('Failed to log out', e);
    }
  };

  const displayName = currentUser?.user_metadata?.full_name || currentUser?.email?.split('@')[0] || 'Yogi';

  return (
    <div className="animate-in fade-in-up pb-20 min-h-screen theme-surface relative">
      <div className="bg-grain" />

      <div className="bg-[color-mix(in_srgb,var(--color-card)94%,transparent)] border-b border-[color-mix(in_srgb,var(--color-text)10%,transparent)] py-16 px-4 relative z-10 shadow-soft">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
          <div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-[var(--color-text)] mb-2">Namaste, {displayName}</h1>
            <p className="theme-muted">Welcome to your personal sanctuary.</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm bg-[color-mix(in_srgb,var(--color-card)92%,transparent)] border border-[color-mix(in_srgb,var(--color-text)10%,transparent)] text-[var(--color-text)] hover:bg-[var(--color-primary)]/12 hover:text-[var(--color-text)] transition-all shadow-card"
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-12 relative z-10">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-bold text-[var(--color-text)] font-serif">Your Upcoming Classes</h2>
          <span className="text-xs font-bold uppercase tracking-widest theme-muted">{bookings.length} Booked</span>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl theme-card px-4 py-3">
            <p className="text-sm flex items-center gap-2"><AlertCircle size={16} /> {error}</p>
          </div>
        )}

        {loading ? (
          <div className="p-12 text-center theme-muted animate-pulse">Loading your space...</div>
        ) : bookings.length === 0 ? (
          <div className="theme-card p-12 rounded-3xl text-center">
            <div className="w-16 h-16 bg-[color-mix(in_srgb,var(--color-card)92%,transparent)] rounded-full flex items-center justify-center mx-auto mb-4 text-[color-mix(in_srgb,var(--color-muted)80%,transparent)]">
              <Calendar size={24} />
            </div>
            <p className="theme-muted mb-6 font-medium">Your schedule is currently empty.</p>
            <button
              onClick={() => navigate('/schedule')}
              className="px-8 py-3 bg-[var(--color-primary)] hover:brightness-105 text-white rounded-xl font-bold shadow-lg shadow-[var(--color-primary)]/25 transition-all hover:-translate-y-0.5"
            >
              Browse Schedule
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="theme-card p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6"
              >
                <div>
                  <h3 className="font-bold text-lg text-[var(--color-text)] font-serif mb-2">{booking.class_name}</h3>
                  <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm theme-muted">
                    <span className="flex items-center gap-1.5"><Calendar size={14} className="text-[var(--color-primary)]" /> {new Date(booking.class_date).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1.5"><Clock size={14} className="text-[var(--color-primary)]" /> {new Date(booking.class_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <span className="flex items-center gap-1.5"><MapPin size={14} className="text-[var(--color-primary)]" /> {booking.location}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto pt-4 sm:pt-0 border-t sm:border-none border-[color-mix(in_srgb,var(--color-text)10%,transparent)]">
                  <span className="theme-chip px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider flex-1 sm:flex-none text-center border border-[color-mix(in_srgb,var(--color-primary)35%,transparent)]">
                    Confirmed
                  </span>

                  <button
                    onClick={() => initiateCancel(booking)}
                    disabled={deletingId === booking.id}
                    className="p-2 text-[color-mix(in_srgb,var(--color-muted)75%,transparent)] hover:text-[var(--color-primary)] hover:bg-[color-mix(in_srgb,var(--color-card)92%,transparent)] rounded-lg transition-colors border border-transparent hover:border-[color-mix(in_srgb,var(--color-text)10%,transparent)]"
                    title="Cancel Booking"
                  >
                    {deletingId === booking.id ? (
                      <div className="w-5 h-5 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Trash2 size={18} />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCancelModal && bookingToCancel && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[color-mix(in_srgb,var(--color-text)30%,transparent)] backdrop-blur-sm animate-in fade-in"
          onClick={() => setShowCancelModal(false)}
        >
          <div className="theme-card rounded-3xl w-full max-w-sm p-8 animate-in-up" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-12 theme-chip rounded-full flex items-center justify-center mb-4 mx-auto">
              <AlertCircle size={24} />
            </div>
            <h3 className="text-xl font-serif font-bold text-[var(--color-text)] text-center mb-2">Cancel Booking?</h3>
            <p className="theme-muted text-sm text-center mb-6">
              Are you sure you want to cancel <strong>{bookingToCancel.class_name}</strong>?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 py-3 rounded-xl font-bold bg-[color-mix(in_srgb,var(--color-card)92%,transparent)] border border-[color-mix(in_srgb,var(--color-text)10%,transparent)] text-[var(--color-text)] hover:bg-[color-mix(in_srgb,var(--color-card)96%,transparent)] transition-colors"
              >
                Keep It
              </button>
              <button
                onClick={confirmCancel}
                className="flex-1 py-3 bg-[var(--color-primary)] text-white hover:brightness-110 rounded-xl font-bold transition-all shadow-lg shadow-[var(--color-primary)]/25"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
