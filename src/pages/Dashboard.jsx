import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../utils/supabase';
import { Calendar, Clock, MapPin, LogOut, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { currentUser, logout } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const navigate = useNavigate();

  const fetchBookings = useCallback(async () => {
    if (!currentUser) return;
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
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    
    setDeletingId(bookingId);
    try {
      // 1. Perform Delete and ask for the deleted row back
      const { data, error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', bookingId)
        .eq('user_id', currentUser.id) // Security check
        .select();

      if (error) throw error;

      // 2. Strict Verification: Did DB actually delete a row?
      if (!data || data.length === 0) {
        // If we get here, RLS is likely blocking the delete
        throw new Error("Database permission denied. Unable to delete this booking.");
      }

      // 3. Success: Update UI
      setBookings(prev => prev.filter(b => b.id !== bookingId));

    } catch (err) {
      console.error("Delete failed:", err);
      alert(`Could not cancel booking: ${err.message}\n\nPlease check your Supabase RLS policies.`);
      
      // Re-fetch to ensure UI shows the truth (the booking is likely still there)
      fetchBookings();
    } finally {
      setDeletingId(null);
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
    <div className="animate-in fade-in duration-500 pb-20">
      <div className="bg-stone-100 dark:bg-stone-800 py-12 px-4">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-stone-900 dark:text-white">Namaste, {displayName}</h1>
            <p className="text-stone-600 dark:text-stone-300">Welcome to your personal space.</p>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-stone-900 text-rose-600 rounded-lg font-bold shadow-sm hover:bg-rose-50 transition-colors"><LogOut size={18} /> Sign Out</button>
        </div>
      </div>
      
      <div className="max-w-4xl mx-auto px-4 mt-8">
        <h2 className="text-xl font-bold text-stone-900 dark:text-white mb-6 border-b border-stone-200 dark:border-stone-700 pb-2">Your Upcoming Classes</h2>
        
        {loading ? (
          <p className="text-stone-500 animate-pulse">Loading your schedule...</p>
        ) : bookings.length === 0 ? (
          <div className="bg-white dark:bg-stone-800 p-8 rounded-xl text-center border border-stone-200 dark:border-stone-700">
            <p className="text-stone-500 dark:text-stone-400 mb-4">You haven't booked any classes yet.</p>
            <button onClick={() => navigate('/schedule')} className="px-6 py-2 bg-teal-600 text-white rounded-lg font-bold">Browse Schedule</button>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map(booking => (
              <div key={booking.id} className="bg-white dark:bg-stone-900 p-5 rounded-xl shadow-sm border border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="font-bold text-lg text-stone-900 dark:text-white">{booking.class_name}</h3>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-stone-500 dark:text-stone-400 mt-1">
                    <span className="flex items-center gap-1"><Calendar size={14}/> {new Date(booking.class_date).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1"><Clock size={14}/> {new Date(booking.class_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    <span className="flex items-center gap-1"><MapPin size={14}/> {booking.location}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex-1 sm:flex-none text-center">
                    Confirmed
                  </div>
                  
                  <button 
                    onClick={() => handleCancelBooking(booking.id)}
                    disabled={deletingId === booking.id}
                    className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors border border-stone-200 dark:border-stone-700 hover:border-rose-200"
                    title="Cancel Booking"
                  >
                    {deletingId === booking.id ? (
                      <div className="w-5 h-5 border-2 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Trash2 size={20} />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;