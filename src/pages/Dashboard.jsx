import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../utils/supabase';
import { Calendar, Clock, MapPin, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { currentUser, logout } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBookings = async () => {
      if (!currentUser) return;
      
      try {
        const { data, error } = await supabase
          .from('bookings')
          .select('*')
          .eq('user_id', currentUser.id)
          .order('class_date', { ascending: true });

        if (error) throw error;
        setBookings(data);
      } catch (err) {
        console.error("Error fetching bookings:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [currentUser]);

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
          <p>Loading your schedule...</p>
        ) : bookings.length === 0 ? (
          <div className="bg-white dark:bg-stone-800 p-8 rounded-xl text-center border border-stone-200 dark:border-stone-700">
            <p className="text-stone-500 dark:text-stone-400 mb-4">You haven't booked any classes yet.</p>
            <button onClick={() => navigate('/schedule')} className="px-6 py-2 bg-teal-600 text-white rounded-lg font-bold">Browse Schedule</button>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map(booking => (
              <div key={booking.id} className="bg-white dark:bg-stone-900 p-6 rounded-xl shadow-sm border border-stone-200 dark:border-stone-800 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-lg text-stone-900 dark:text-white">{booking.class_name}</h3>
                  <div className="flex gap-4 text-sm text-stone-500 dark:text-stone-400 mt-1">
                    <span className="flex items-center gap-1"><Calendar size={14}/> {new Date(booking.class_date).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1"><Clock size={14}/> {new Date(booking.class_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    <span className="flex items-center gap-1"><MapPin size={14}/> {booking.location}</span>
                  </div>
                </div>
                <div className="bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Confirmed</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;