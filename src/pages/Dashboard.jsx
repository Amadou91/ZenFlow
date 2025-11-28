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
      console.error("Error fetching bookings:", err);
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
      if (!data || data.length === 0) throw new Error("Delete failed.");

      setBookings(prev => prev.filter(b => b.id !== bookingToCancel.id));
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
    try { await logout(); navigate('/login'); } catch (e) { console.error('Failed to log out', e); }
  };

  const displayName = currentUser?.user_metadata?.full_name || currentUser?.email?.split('@')[0] || 'Yogi';

  return (
    <div className="animate-in fade-in-up pb-20 min-h-screen bg-stone-50 dark:bg-stone-900 relative">
      <div className="bg-grain"></div>
      
      <div className="bg-white dark:bg-stone-800 border-b border-stone-200 dark:border-stone-700 py-16 px-4 relative z-10">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
          <div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-stone-900 dark:text-white mb-2">Namaste, {displayName}</h1>
            <p className="text-stone-500 dark:text-stone-400">Welcome to your personal sanctuary.</p>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 px-5 py-2.5 bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300 hover:text-rose-600 hover:bg-rose-50 dark:hover:text-rose-400 dark:hover:bg-rose-900/20 rounded-xl font-bold text-sm transition-colors">
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </div>
      
      <div className="max-w-4xl mx-auto px-4 mt-12 relative z-10">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-bold text-stone-800 dark:text-stone-100 font-serif">Your Upcoming Classes</h2>
          <span className="text-xs font-bold uppercase tracking-widest text-stone-400">{bookings.length} Booked</span>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-white/60 dark:border-stone-700 bg-[var(--color-card)] text-[var(--color-muted)] dark:text-stone-200 px-4 py-3 shadow-card">
            <p className="text-sm flex items-center gap-2"><AlertCircle size={16} /> {error}</p>
          </div>
        )}

        {loading ? (
          <div className="p-12 text-center text-stone-400 animate-pulse">Loading your space...</div>
        ) : bookings.length === 0 ? (
          <div className="bg-white dark:bg-stone-800 p-12 rounded-3xl text-center border border-stone-100 dark:border-stone-700 shadow-sm">
            <div className="w-16 h-16 bg-stone-50 dark:bg-stone-700 rounded-full flex items-center justify-center mx-auto mb-4 text-stone-300">
              <Calendar size={24} />
            </div>
            <p className="text-stone-500 dark:text-stone-400 mb-6 font-medium">Your schedule is currently empty.</p>
            <button onClick={() => navigate('/schedule')} className="px-8 py-3 bg-[var(--color-primary)] hover:brightness-105 text-white rounded-xl font-bold shadow-lg shadow-[var(--color-primary)]/25 transition-all hover:-translate-y-0.5">Browse Schedule</button>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map(booking => (
              <div key={booking.id} className="bg-white dark:bg-stone-800 p-6 rounded-2xl shadow-card border border-stone-100 dark:border-stone-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 hover:shadow-soft transition-shadow">
                <div>
                  <h3 className="font-bold text-lg text-stone-900 dark:text-white font-serif mb-2">{booking.class_name}</h3>
                  <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-stone-500 dark:text-stone-400">
                    <span className="flex items-center gap-1.5"><Calendar size={14} className="text-[var(--color-primary)]"/> {new Date(booking.class_date).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1.5"><Clock size={14} className="text-[var(--color-primary)]"/> {new Date(booking.class_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    <span className="flex items-center gap-1.5"><MapPin size={14} className="text-[var(--color-primary)]"/> {booking.location}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto pt-4 sm:pt-0 border-t sm:border-none border-stone-100 dark:border-stone-700">
                  <span className="bg-[var(--color-primary)]/15 text-[var(--color-primary)] px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider flex-1 sm:flex-none text-center border border-white/60 dark:border-stone-700">
                    Confirmed
                  </span>
                  
                  <button 
                    onClick={() => initiateCancel(booking)}
                    disabled={deletingId === booking.id}
                    className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors border border-transparent hover:border-rose-100"
                    title="Cancel Booking"
                  >
                    {deletingId === booking.id ? <div className="w-5 h-5 border-2 border-rose-500 border-t-transparent rounded-full animate-spin"></div> : <Trash2 size={18} />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cancel Modal (Consistent Style) */}
      {showCancelModal && bookingToCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/20 backdrop-blur-sm animate-in fade-in" onClick={() => setShowCancelModal(false)}>
          <div className="bg-white dark:bg-stone-900 rounded-3xl shadow-2xl w-full max-w-sm p-8 animate-in-up" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-12 bg-rose-50 dark:bg-rose-900/20 rounded-full flex items-center justify-center text-rose-500 mb-4 mx-auto">
              <AlertCircle size={24} />
            </div>
            <h3 className="text-xl font-serif font-bold text-stone-900 dark:text-white text-center mb-2">Cancel Booking?</h3>
            <p className="text-stone-500 dark:text-stone-400 text-sm text-center mb-6">
              Are you sure you want to cancel <strong>{bookingToCancel.class_name}</strong>?
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowCancelModal(false)} className="flex-1 py-3 rounded-xl font-bold text-stone-600 bg-stone-50 hover:bg-stone-100 dark:bg-stone-800 dark:text-stone-300 transition-colors">Keep It</button>
              <button onClick={confirmCancel} className="flex-1 py-3 bg-rose-600 text-white hover:bg-rose-700 rounded-xl font-bold transition-all shadow-lg shadow-rose-900/20">Yes, Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;