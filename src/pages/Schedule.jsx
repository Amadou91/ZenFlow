import React, { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';
import { Calendar, Clock, MapPin, Check, Users, X, CheckCircle, Wallet, ArrowRight } from 'lucide-react';

const INITIAL_CLASSES = [
  { id: 'c1', title: 'Vinyasa Flow', time: '10:00 AM', date: '2023-10-25', duration: '60 min', location: 'Studio A', instructor: 'Sarah', price: 20, spotsTotal: 15, spotsBooked: 8, difficulty: 'Intermediate' },
  { id: 'c2', title: 'Yin Yoga', time: '6:00 PM', date: '2023-10-25', duration: '75 min', location: 'Studio B', instructor: 'Mike', price: 25, spotsTotal: 12, spotsBooked: 12, difficulty: 'Beginner' },
  { id: 'c3', title: 'Power Yoga', time: '8:00 AM', date: '2023-10-26', duration: '45 min', location: 'Studio A', instructor: 'Jessica', price: 20, spotsTotal: 20, spotsBooked: 5, difficulty: 'Advanced' },
];

const Schedule = () => {
  const [classes, setClasses] = useState(INITIAL_CLASSES);
  const [bookedClassIds, setBookedClassIds] = useState(new Set()); // Stores class_ids
  const [bookingsMap, setBookingsMap] = useState(new Map()); // Stores class_id -> booking_id
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [user, setUser] = useState(null);
  
  const [showConfirmModal, setShowConfirmModal] = useState(false); 
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);

  const fetchUserBookings = async (userId) => {
    const { data } = await supabase
      .from('bookings')
      .select('id, class_id')
      .eq('user_id', userId);
    
    if (data) {
      setBookedClassIds(new Set(data.map(b => b.class_id)));
      setBookingsMap(new Map(data.map(b => [b.class_id, b.id])));
    }
  };

  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) await fetchUserBookings(user.id);
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
      // 1. Strict Duplicate Check on Server
      const { data: existing } = await supabase
        .from('bookings')
        .select('id')
        .eq('user_id', user.id)
        .eq('class_id', selectedClass.id)
        .single();

      if (existing) {
        alert("You have already booked this class.");
        await fetchUserBookings(user.id); // Sync state
        setShowConfirmModal(false);
        return;
      }

      // 2. Insert
      const { data, error } = await supabase
        .from('bookings')
        .insert([{
          user_id: user.id,
          class_id: selectedClass.id,
          class_name: selectedClass.title,
          class_date: selectedClass.date,
          location: selectedClass.location
        }])
        .select(); // Return the new ID

      if (error) throw error;
      
      // 3. Update Local State
      if (data && data[0]) {
        const newBooking = data[0];
        setBookedClassIds(prev => new Set(prev).add(selectedClass.id));
        setBookingsMap(prev => new Map(prev).set(selectedClass.id, newBooking.id));
        
        setClasses(prev => prev.map(c => 
          c.id === selectedClass.id ? { ...c, spotsBooked: c.spotsBooked + 1 } : c
        ));
      }
      
      setShowConfirmModal(false);
      setShowSuccessModal(true);

    } catch (err) {
      alert(`Booking failed: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async (cls) => {
    if (!confirm(`Cancel your spot in ${cls.title}?`)) return;
    setActionLoading(cls.id);

    // Find the specific booking ID for this class
    const bookingId = bookingsMap.get(cls.id);

    try {
      // If we don't have the ID locally, try to find it on server before deleting
      let query = supabase.from('bookings').delete().eq('user_id', user.id);
      
      if (bookingId) {
        query = query.eq('id', bookingId);
      } else {
        query = query.eq('class_id', cls.id);
      }

      const { data, error } = await query.select();

      if (error) throw error;

      if (!data || data.length === 0) {
        // Only throw if we truly expected something to be there
        if (bookedClassIds.has(cls.id)) {
           throw new Error("Database returned 0 deleted rows. Check permissions.");
        }
      }

      // Success: Update UI
      setBookedClassIds(prev => {
        const next = new Set(prev);
        next.delete(cls.id);
        return next;
      });
      
      // Remove from map
      setBookingsMap(prev => {
        const next = new Map(prev);
        next.delete(cls.id);
        return next;
      });

      setClasses(prev => prev.map(c => 
        c.id === cls.id ? { ...c, spotsBooked: Math.max(0, c.spotsBooked - 1) } : c
      ));

    } catch (err) {
      alert(`Cancellation failed: ${err.message}`);
      await fetchUserBookings(user.id); // Re-sync on error
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <div className="p-12 text-center text-stone-500 animate-pulse">Loading schedule...</div>;

  return (
    <div className="animate-in fade-in duration-500 pb-24 relative">
      <div className="bg-stone-100 dark:bg-stone-800 py-12 px-4 text-center border-b border-stone-200 dark:border-stone-700">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-stone-900 dark:text-white mb-3">Class Schedule</h1>
        <p className="text-stone-600 dark:text-stone-300 max-w-xl mx-auto">Reserve your spot online to ensure availability.</p>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-8 space-y-4">
        {classes.map((cls) => {
          const isBooked = bookedClassIds.has(cls.id);
          const spotsLeft = cls.spotsTotal - cls.spotsBooked;
          const isFull = spotsLeft <= 0;
          const isLoading = actionLoading === cls.id;

          return (
            <div 
              key={cls.id} 
              className={`
                flex flex-col md:flex-row gap-6 p-6 rounded-2xl border-2 transition-all duration-200 shadow-sm
                ${isBooked 
                  ? 'bg-teal-50 dark:bg-teal-900 border-teal-500 dark:border-teal-500' 
                  : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 hover:border-teal-400 dark:hover:border-teal-700 hover:shadow-md'
                }
              `}
            >
              <div className="flex-shrink-0 flex md:flex-col items-center justify-center md:justify-start gap-3 md:gap-1 md:w-24 md:border-r border-stone-100 dark:border-stone-700/50 pr-0 md:pr-6">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-500 dark:text-rose-400">
                  {new Date(cls.date).toLocaleDateString('en-US', { month: 'short' })}
                </span>
                <span className="text-2xl md:text-3xl font-serif font-bold text-stone-900 dark:text-white">
                  {new Date(cls.date).getDate()}
                </span>
                <span className="text-sm text-stone-500 dark:text-stone-400 font-medium">
                  {new Date(cls.date).toLocaleDateString('en-US', { weekday: 'short' })}
                </span>
              </div>

              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-bold text-stone-900 dark:text-white">{cls.title}</h3>
                    {isBooked && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-teal-100 text-teal-900 dark:bg-teal-950 dark:text-teal-200 border border-teal-200 dark:border-teal-800">
                        <Check size={12} strokeWidth={3} /> Booked
                      </span>
                    )}
                  </div>
                  <span className="text-lg font-bold text-teal-600 dark:text-teal-400">${cls.price}</span>
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-stone-500 dark:text-stone-400 mb-4 font-medium">
                  <span className="flex items-center gap-1.5"><Clock size={16} /> {cls.time} ({cls.duration})</span>
                  <span className="flex items-center gap-1.5"><MapPin size={16} /> {cls.location}</span>
                  
                  <span className={`flex items-center gap-1.5 transition-colors ${isFull && !isBooked ? 'text-rose-500 dark:text-rose-400 font-bold' : ''}`}>
                    <Users size={16} /> 
                    {isFull 
                      ? 'Class Full' 
                      : `${spotsLeft} spot${spotsLeft !== 1 ? 's' : ''} left`
                    }
                  </span>
                </div>

                <div className="flex items-center justify-between mt-auto">
                  <span className="text-xs font-bold bg-stone-100 dark:bg-stone-800 px-3 py-1 rounded text-stone-600 dark:text-stone-400 uppercase tracking-wide">
                    {cls.difficulty}
                  </span>

                  {isBooked ? (
                    <button 
                      onClick={() => handleCancel(cls)}
                      disabled={isLoading}
                      className="px-6 py-2.5 rounded-xl font-bold text-sm bg-white dark:bg-stone-950 border-2 border-stone-200 dark:border-stone-700 text-stone-500 dark:text-stone-400 hover:border-rose-300 dark:hover:border-rose-700 hover:text-rose-600 dark:hover:text-rose-400 transition-all cursor-pointer flex items-center gap-2"
                    >
                      {isLoading ? 'Processing...' : 'Cancel Booking'}
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleBookClick(cls)}
                      disabled={isFull || isLoading}
                      className={`
                        px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg flex items-center gap-2 transition-all
                        ${isFull 
                          ? 'bg-stone-200 dark:bg-stone-800 text-stone-400 cursor-not-allowed shadow-none' 
                          : 'bg-stone-900 dark:bg-white text-white dark:text-stone-900 hover:bg-teal-600 dark:hover:bg-stone-200 hover:shadow-xl cursor-pointer'
                        }
                      `}
                    >
                      {isLoading ? 'Processing...' : isFull ? 'Waitlist' : 'Book Now'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* --- CONFIRMATION MODAL --- */}
      {showConfirmModal && selectedClass && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowConfirmModal(false)}>
          <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-2xl w-full max-w-sm border border-stone-200 dark:border-stone-700 p-6 transform animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-serif font-bold text-stone-900 dark:text-white">Confirm Booking</h3>
              <button onClick={() => setShowConfirmModal(false)}><X size={20} className="text-stone-400 hover:text-stone-900" /></button>
            </div>
            
            <p className="text-stone-600 dark:text-stone-300 mb-6">
              You are booking a spot for <strong>{selectedClass.title}</strong> on {new Date(selectedClass.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at {selectedClass.time}.
            </p>

            <div className="flex gap-3">
              <button 
                onClick={confirmBooking}
                disabled={actionLoading === selectedClass.id}
                className="flex-1 py-3 bg-stone-900 dark:bg-white text-white dark:text-stone-900 rounded-xl font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2"
              >
                {actionLoading === selectedClass.id ? 'Booking...' : <><span className="whitespace-nowrap">Yes, Book It</span> <ArrowRight size={16} /></>}
              </button>
              <button 
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-3 border border-stone-200 dark:border-stone-700 rounded-xl font-bold text-stone-500 hover:bg-stone-50 dark:hover:bg-stone-800"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- SUCCESS MODAL --- */}
      {showSuccessModal && selectedClass && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowSuccessModal(false)}>
          <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-2xl max-w-md w-full border border-stone-200 dark:border-stone-700 transform animate-in zoom-in-95 duration-200 overflow-hidden" onClick={e => e.stopPropagation()}>
            
            <div className="bg-teal-600 p-6 text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                <CheckCircle size={32} className="text-white" />
              </div>
              <h3 className="text-2xl font-serif font-bold text-white">All Set!</h3>
              <p className="text-teal-100 mt-1">We've saved a spot for you.</p>
            </div>

            <div className="p-6">
              <div className="bg-stone-50 dark:bg-stone-800/50 p-4 rounded-xl border border-stone-100 dark:border-stone-700/50 mb-6">
                <h4 className="font-bold text-stone-900 dark:text-white mb-1">{selectedClass.title}</h4>
                <p className="text-stone-500 dark:text-stone-400 text-sm">
                  {new Date(selectedClass.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} • {selectedClass.time}
                </p>
                <p className="text-stone-500 dark:text-stone-400 text-sm">{selectedClass.location}</p>
              </div>

              <div className="space-y-3">
                <h5 className="font-bold text-stone-900 dark:text-white flex items-center gap-2 text-sm uppercase tracking-wide">
                  <Wallet size={16} className="text-teal-600" /> Payment Info
                </h5>
                <p className="text-stone-600 dark:text-stone-300 text-sm leading-relaxed">
                  Thanks for booking! You can pay <strong>${selectedClass.price}</strong> via e-transfer to <span className="font-mono bg-stone-100 dark:bg-stone-800 px-1 rounded">hello@jocelynyoga.com</span> or simply bring cash to the class.
                </p>
              </div>

              <button 
                onClick={() => setShowSuccessModal(false)}
                className="w-full mt-8 py-3 bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-white rounded-xl font-bold hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Schedule;