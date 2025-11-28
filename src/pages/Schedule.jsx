import React, { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';
import { Calendar, Clock, MapPin, Check, Users, X, CheckCircle, Wallet, ArrowRight } from 'lucide-react';

const INITIAL_CLASSES = [
  { id: 'c1', title: 'Sunrise Vinyasa', time: '07:00 AM', date: new Date(Date.now() + 86400000).toISOString(), duration: '60 min', location: 'Drayton Hall', instructor: 'Jocelyn', price: 20, spotsTotal: 15, spotsBooked: 8, difficulty: 'All Levels' },
  { id: 'c2', title: 'Candlelit Yin', time: '07:30 PM', date: new Date(Date.now() + 86400000).toISOString(), duration: '75 min', location: 'The Loft', instructor: 'Jocelyn', price: 25, spotsTotal: 12, spotsBooked: 10, difficulty: 'Beginner' },
  { id: 'c3', title: 'Power Flow', time: '09:00 AM', date: new Date(Date.now() + 172800000).toISOString(), duration: '60 min', location: 'Drayton Hall', instructor: 'Jocelyn', price: 20, spotsTotal: 20, spotsBooked: 5, difficulty: 'Intermediate' },
];

const Schedule = () => {
  const [classes, setClasses] = useState(INITIAL_CLASSES);
  const [bookedClassIds, setBookedClassIds] = useState(new Set());
  const [bookingsMap, setBookingsMap] = useState(new Map());
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [user, setUser] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false); 
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        const { data } = await supabase.from('bookings').select('id, class_id').eq('user_id', user.id);
        if (data) {
          setBookedClassIds(new Set(data.map(b => b.class_id)));
          setBookingsMap(new Map(data.map(b => [b.class_id, b.id])));
        }
      }
      setLoading(false);
    };
    loadData();
  }, []);

  const handleBookClick = (cls) => {
    if (!user) return alert("Please sign in to book a class.");
    if (bookedClassIds.has(cls.id)) return alert("You have already booked this class.");
    setSelectedClass(cls);
    setShowConfirmModal(true);
  };

  const confirmBooking = async () => {
    if (!selectedClass || !user) return;
    setActionLoading(selectedClass.id);
    try {
      const { data, error } = await supabase.from('bookings').insert([{ user_id: user.id, class_id: selectedClass.id, class_name: selectedClass.title, class_date: selectedClass.date, location: selectedClass.location }]).select();
      if (error) throw error;
      if (data && data[0]) {
        setBookedClassIds(prev => new Set(prev).add(selectedClass.id));
        setBookingsMap(prev => new Map(prev).set(selectedClass.id, data[0].id));
        setClasses(prev => prev.map(c => c.id === selectedClass.id ? { ...c, spotsBooked: c.spotsBooked + 1 } : c));
      }
      setShowConfirmModal(false);
      setShowSuccessModal(true);
    } catch (err) { alert(`Booking failed: ${err.message}`); } finally { setActionLoading(null); }
  };

  const handleCancel = async (cls) => {
    if (!confirm(`Cancel your spot in ${cls.title}?`)) return;
    setActionLoading(cls.id);
    const bookingId = bookingsMap.get(cls.id);
    try {
      let query = supabase.from('bookings').delete().eq('user_id', user.id);
      if (bookingId) query = query.eq('id', bookingId); else query = query.eq('class_id', cls.id);
      const { error } = await query.select();
      if (error) throw error;
      setBookedClassIds(prev => { const next = new Set(prev); next.delete(cls.id); return next; });
      setBookingsMap(prev => { const next = new Map(prev); next.delete(cls.id); return next; });
      setClasses(prev => prev.map(c => c.id === cls.id ? { ...c, spotsBooked: Math.max(0, c.spotsBooked - 1) } : c));
    } catch (err) { alert(`Cancellation failed: ${err.message}`); } finally { setActionLoading(null); }
  };

  if (loading) return <div className="p-20 text-center text-stone-500 dark:text-stone-400 animate-pulse font-serif text-xl">Loading schedule...</div>;

  return (
    <div className="animate-in fade-in-up pb-24">
      <div className="py-20 px-4 text-center">
        <h1 className="text-5xl md:text-6xl font-serif font-bold text-stone-900 dark:text-white mb-6">Class Schedule</h1>
        <div className="h-1 w-20 bg-teal-500 mx-auto rounded-full mb-6"></div>
        <p className="text-xl text-stone-600 dark:text-stone-300 max-w-2xl mx-auto font-light">Join us in person. Reserve your mat to ensure availability.</p>
      </div>

      <div className="max-w-5xl mx-auto px-4 space-y-6">
        {classes.map((cls) => {
          const isBooked = bookedClassIds.has(cls.id);
          const spotsLeft = cls.spotsTotal - cls.spotsBooked;
          const isFull = spotsLeft <= 0;
          const dateObj = new Date(cls.date);

          return (
            <div key={cls.id} className={`group relative overflow-hidden rounded-[2rem] p-8 transition-all duration-500 border ${isBooked ? 'bg-teal-50/50 border-teal-200 dark:bg-teal-900/10 dark:border-teal-800' : 'bg-white/60 dark:bg-stone-800/60 border-white/40 dark:border-stone-700/40 hover:bg-white dark:hover:bg-stone-800 hover:shadow-xl hover:shadow-stone-200/50 dark:hover:shadow-none backdrop-blur-md'}`}>
              <div className="flex flex-col md:flex-row gap-8 items-center">
                
                <div className="flex flex-col items-center justify-center w-24 h-24 bg-stone-100 dark:bg-stone-900 rounded-3xl shrink-0 border border-stone-200 dark:border-stone-800 group-hover:scale-105 transition-transform duration-500">
                  <span className="text-xs font-bold uppercase tracking-widest text-rose-500">{dateObj.toLocaleDateString('en-US', { month: 'short' })}</span>
                  <span className="text-3xl font-serif font-bold text-stone-900 dark:text-white">{dateObj.getDate()}</span>
                  <span className="text-xs font-bold text-stone-400">{dateObj.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                </div>

                <div className="flex-1 text-center md:text-left">
                  <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-2 justify-center md:justify-start">
                    <h3 className="text-2xl font-serif font-bold text-stone-900 dark:text-white">{cls.title}</h3>
                    {isBooked && <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200"><Check size={12}/> Confirmed</span>}
                  </div>
                  
                  <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-stone-500 dark:text-stone-400 font-medium mt-3">
                    <span className="flex items-center gap-1.5 bg-white dark:bg-stone-900 px-3 py-1.5 rounded-lg border border-stone-100 dark:border-stone-800"><Clock size={14} className="text-teal-500"/> {cls.time} ({cls.duration})</span>
                    <span className="flex items-center gap-1.5 bg-white dark:bg-stone-900 px-3 py-1.5 rounded-lg border border-stone-100 dark:border-stone-800"><MapPin size={14} className="text-teal-500"/> {cls.location}</span>
                    <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-100 dark:border-stone-800 ${isFull && !isBooked ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-white dark:bg-stone-900'}`}>
                      <Users size={14} className={isFull ? 'text-rose-500' : 'text-teal-500'}/> {isFull ? 'Class Full' : `${spotsLeft} spots left`}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-3 shrink-0 w-full md:w-auto">
                  <span className="text-2xl font-serif font-bold text-teal-600 dark:text-teal-400">${cls.price}</span>
                  {isBooked ? (
                    <button onClick={() => handleCancel(cls)} disabled={actionLoading === cls.id} className="w-full md:w-40 py-3 rounded-xl font-bold text-sm bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-400 hover:text-rose-500 hover:border-rose-200 transition-all">
                      {actionLoading === cls.id ? '...' : 'Cancel'}
                    </button>
                  ) : (
                    <button onClick={() => handleBookClick(cls)} disabled={isFull || actionLoading === cls.id} className={`w-full md:w-40 py-3 rounded-xl font-bold text-sm transition-all shadow-lg hover:-translate-y-1 ${isFull ? 'bg-stone-200 text-stone-400 cursor-not-allowed shadow-none' : 'bg-stone-900 dark:bg-white text-white dark:text-stone-900 hover:bg-teal-600 dark:hover:bg-stone-200'}`}>
                      {isFull ? 'Waitlist' : 'Book Now'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showConfirmModal && selectedClass && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm animate-in fade-in" onClick={() => setShowConfirmModal(false)}>
          <div className="bg-white dark:bg-stone-900 rounded-[2rem] shadow-2xl w-full max-w-sm p-8 transform animate-in fade-in-up" onClick={e => e.stopPropagation()}>
            <h3 className="text-2xl font-serif font-bold text-stone-900 dark:text-white mb-2">Confirm Booking</h3>
            <p className="text-stone-500 mb-8">Join us for {selectedClass.title}?</p>
            <div className="flex gap-4">
              <button onClick={confirmBooking} disabled={actionLoading === selectedClass.id} className="flex-1 py-4 bg-stone-900 dark:bg-white text-white dark:text-stone-900 rounded-xl font-bold hover:scale-105 transition-transform">Yes, Book</button>
              <button onClick={() => setShowConfirmModal(false)} className="px-6 py-4 rounded-xl font-bold text-stone-500 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}
      
      {showSuccessModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm animate-in fade-in" onClick={() => setShowSuccessModal(false)}>
          <div className="bg-white dark:bg-stone-900 rounded-[2rem] shadow-2xl max-w-sm w-full p-8 text-center transform animate-in fade-in-up" onClick={e => e.stopPropagation()}>
            <div className="w-20 h-20 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center mx-auto mb-6 text-teal-600"><CheckCircle size={40} /></div>
            <h3 className="text-2xl font-serif font-bold text-stone-900 dark:text-white mb-2">You're Booked!</h3>
            <p className="text-stone-500 mb-8">We've saved a spot for you on the mat.</p>
            <button onClick={() => setShowSuccessModal(false)} className="w-full py-4 bg-stone-900 dark:bg-white text-white dark:text-stone-900 rounded-xl font-bold">Wonderful</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Schedule;