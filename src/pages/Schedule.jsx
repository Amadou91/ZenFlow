import React, { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../utils/supabase';
import { Calendar, Clock, MapPin, Check, Users, X, CheckCircle, Wallet, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';

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
  const [loadError, setLoadError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [user, setUser] = useState(null);
  
  // Modals
  const [showConfirmModal, setShowConfirmModal] = useState(false); 
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        if (!isSupabaseConfigured || !supabase) {
          setLoading(false);
          return;
        }
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        if (user) {
          const { data, error } = await supabase.from('bookings').select('id, class_id').eq('user_id', user.id);
          if (error) throw error;
          if (data) {
            setBookedClassIds(new Set(data.map(b => b.class_id)));
            setBookingsMap(new Map(data.map(b => [b.class_id, b.id])));
          }
        }
      } catch (err) {
        console.error('Could not load schedule data', err);
        setLoadError('We had trouble loading your bookings. You can still browse the schedule.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleBookClick = (cls) => {
    if (!user) return alert("Please sign in to book a class.");
    if (!isSupabaseConfigured || !supabase) return alert('Bookings are offline until Supabase is configured.');
    if (bookedClassIds.has(cls.id)) return alert("You have already booked this class.");
    setSelectedClass(cls);
    setShowConfirmModal(true);
  };

  const handleCancelClick = (cls) => {
    if (!isSupabaseConfigured || !supabase) return alert('Bookings are offline until Supabase is configured.');
    setSelectedClass(cls);
    setShowCancelModal(true);
  };

  const confirmBooking = async () => {
    if (!selectedClass || !user) return;
    if (!isSupabaseConfigured || !supabase) return alert('Bookings are offline until Supabase is configured.');
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

  const confirmCancel = async () => {
    if (!selectedClass) return;
    if (!isSupabaseConfigured || !supabase) return alert('Bookings are offline until Supabase is configured.');
    setActionLoading(selectedClass.id);
    const bookingId = bookingsMap.get(selectedClass.id);
    try {
      let query = supabase.from('bookings').delete().eq('user_id', user.id);
      if (bookingId) query = query.eq('id', bookingId); else query = query.eq('class_id', selectedClass.id);
      const { error } = await query.select();
      if (error) throw error;
      setBookedClassIds(prev => { const next = new Set(prev); next.delete(selectedClass.id); return next; });
      setBookingsMap(prev => { const next = new Map(prev); next.delete(selectedClass.id); return next; });
      setClasses(prev => prev.map(c => c.id === selectedClass.id ? { ...c, spotsBooked: Math.max(0, c.spotsBooked - 1) } : c));
      setShowCancelModal(false);
    } catch (err) { alert(`Cancellation failed: ${err.message}`); } finally { setActionLoading(null); }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-stone-900">
      <div className="animate-pulse flex flex-col items-center">
        <div className="h-12 w-12 rounded-full bg-stone-200 dark:bg-stone-800 mb-4"></div>
        <div className="h-4 w-32 bg-stone-200 dark:bg-stone-800 rounded"></div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--color-surface)] text-[var(--color-text)] relative">
      <div className="bg-grain"></div>
      
      {/* Header */}
      <div className="relative pt-24 pb-12 px-4 text-center z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-card)]/90 dark:bg-stone-800 border border-white/50 dark:border-stone-700 text-[var(--color-muted)] dark:text-stone-300 text-xs font-bold uppercase tracking-widest mb-6 shadow-sm shadow-[var(--color-primary)]/10">
          <Sparkles size={12} className="text-[var(--color-primary)]" /> Weekly Classes
        </div>
        <h1 className="text-5xl md:text-6xl font-serif font-medium text-stone-900 dark:text-stone-100 mb-6">Class Schedule</h1>
        <p className="text-lg text-[var(--color-muted)] dark:text-stone-300 max-w-xl mx-auto leading-relaxed">
          Join us on the mat. Find a time that nurtures your body and mind.
        </p>
        {loadError && (
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--color-card)] border border-white/50 dark:border-stone-700 text-xs text-[var(--color-muted)] shadow-card">
            <AlertCircle size={14} /> {loadError}
          </div>
        )}
      </div>

      {/* Class List */}
      <div className="max-w-4xl mx-auto px-4 pb-24 space-y-6 relative z-10">
        {classes.map((cls, idx) => {
          const isBooked = bookedClassIds.has(cls.id);
          const spotsLeft = cls.spotsTotal - cls.spotsBooked;
          const isFull = spotsLeft <= 0;
          const dateObj = new Date(cls.date);

          return (
            <div 
              key={cls.id} 
              className={`group relative rounded-3xl p-6 md:p-8 transition-all duration-300 border animate-in-up
                ${isBooked
                  ? 'bg-[var(--color-card)]/90 border-white/60 dark:bg-stone-800 dark:border-stone-700'
                  : 'bg-white border-stone-100 shadow-card hover:shadow-soft hover:-translate-y-1 dark:bg-stone-800 dark:border-stone-700'
                }`}
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <div className="flex flex-col md:flex-row gap-6 md:items-center">
                
                {/* Date Badge */}
                <div className={`flex flex-col items-center justify-center w-full md:w-20 h-20 rounded-2xl shrink-0 border transition-colors
                  ${isBooked
                    ? 'bg-[var(--color-card)] border-white/60 text-[var(--color-primary)] dark:bg-stone-800 dark:border-stone-700 dark:text-[var(--color-primary)]'
                    : 'bg-stone-50 border-stone-100 text-stone-600 dark:bg-stone-700 dark:border-stone-600 dark:text-stone-300'
                  }`}>
                  <span className="text-[10px] font-bold uppercase tracking-widest">{dateObj.toLocaleDateString('en-US', { month: 'short' })}</span>
                  <span className="text-2xl font-serif font-bold leading-none mt-1">{dateObj.getDate()}</span>
                </div>

                {/* Details */}
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                    <h3 className="text-xl font-serif font-bold text-stone-800 dark:text-stone-100">{cls.title}</h3>
                    {isBooked && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-[var(--color-primary)]/15 text-[var(--color-primary)] dark:bg-stone-700 dark:text-[var(--color-primary)]">
                        <Check size={12} strokeWidth={3} /> Booked
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-stone-500 dark:text-stone-400">
                    <span className="flex items-center gap-1.5"><Clock size={14} className="text-[var(--color-primary)]"/> {cls.time} • {cls.duration}</span>
                    <span className="flex items-center gap-1.5"><MapPin size={14} className="text-[var(--color-primary)]"/> {cls.location}</span>
                    <span className={`flex items-center gap-1.5 ${isFull && !isBooked ? 'text-rose-500 font-medium' : ''}`}>
                      <Users size={14} className={isFull ? 'text-rose-500' : 'text-[var(--color-primary)]'}/> {isFull ? 'Waitlist Only' : `${spotsLeft} spots left`}
                    </span>
                  </div>
                </div>

                {/* Action */}
                <div className="flex items-center justify-between md:flex-col md:items-end gap-4 mt-2 md:mt-0 border-t md:border-none border-stone-100 dark:border-stone-700 pt-4 md:pt-0">
                  <span className="text-lg font-bold text-stone-700 dark:text-stone-200">${cls.price}</span>
                  {isBooked ? (
                    <button 
                      onClick={() => handleCancelClick(cls)} 
                      disabled={actionLoading === cls.id}
                      className="px-5 py-2.5 rounded-xl text-sm font-bold border border-stone-200 text-stone-500 hover:border-rose-200 hover:text-rose-600 hover:bg-rose-50 transition-colors bg-white dark:bg-stone-800 dark:border-stone-600 dark:text-stone-400 dark:hover:bg-rose-900/20"
                    >
                      {actionLoading === cls.id ? '...' : 'Cancel'}
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleBookClick(cls)} 
                      disabled={isFull || actionLoading === cls.id}
                      className={`px-6 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg shadow-stone-900/5 hover:-translate-y-0.5 transition-all
                        ${isFull 
                          ? 'bg-stone-300 cursor-not-allowed shadow-none dark:bg-stone-700 dark:text-stone-500' 
                          : 'bg-stone-800 hover:bg-stone-900 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white'
                        }`}
                    >
                      {isFull ? 'Join Waitlist' : 'Book Now'}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/20 backdrop-blur-sm animate-in fade-in" onClick={() => setShowConfirmModal(false)}>
          <div className="bg-white dark:bg-stone-900 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden border border-white/50 dark:border-stone-700 animate-in-up" onClick={e => e.stopPropagation()}>
            <div className="p-8">
              <div className="mb-6">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">Confirm Booking</span>
                <h3 className="text-2xl font-serif font-bold text-stone-900 dark:text-white mt-1 mb-2">{selectedClass.title}</h3>
                <div className="flex items-center gap-2 text-stone-500 dark:text-stone-400 text-sm">
                  <Calendar size={14} /> {new Date(selectedClass.date).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric' })} at {selectedClass.time}
                </div>
              </div>
              
              <div className="bg-stone-50 dark:bg-stone-800 p-4 rounded-2xl mb-6 flex justify-between items-center border border-stone-100 dark:border-stone-700">
                <span className="text-stone-600 dark:text-stone-300 font-medium text-sm">Total</span>
                <span className="text-xl font-bold text-stone-900 dark:text-white">${selectedClass.price}</span>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setShowConfirmModal(false)} className="flex-1 py-3 rounded-xl font-bold text-stone-500 hover:bg-stone-50 dark:text-stone-400 dark:hover:bg-stone-800 transition-colors">Cancel</button>
                <button onClick={confirmBooking} disabled={actionLoading === selectedClass.id} className="flex-[2] py-3 bg-stone-900 hover:bg-black text-white dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white rounded-xl font-bold shadow-lg shadow-stone-900/10 transition-all flex items-center justify-center gap-2">
                  {actionLoading === selectedClass.id ? 'Booking...' : <>Confirm <ArrowRight size={16} /></>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- CANCELLATION MODAL --- */}
      {showCancelModal && selectedClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/20 backdrop-blur-sm animate-in fade-in" onClick={() => setShowCancelModal(false)}>
          <div className="bg-white dark:bg-stone-900 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden border border-white/50 dark:border-stone-700 animate-in-up" onClick={e => e.stopPropagation()}>
            <div className="p-8">
              <div className="w-12 h-12 bg-rose-50 dark:bg-rose-900/20 rounded-full flex items-center justify-center text-rose-500 mb-4">
                <AlertCircle size={24} />
              </div>
              <h3 className="text-xl font-serif font-bold text-stone-900 dark:text-white mb-2">Cancel your booking?</h3>
              <p className="text-stone-500 dark:text-stone-400 text-sm mb-6 leading-relaxed">
                Are you sure you want to cancel <strong>{selectedClass.title}</strong>? This will open up a spot for another student.
              </p>

              <div className="flex gap-3">
                <button onClick={() => setShowCancelModal(false)} className="flex-1 py-3 rounded-xl font-bold text-stone-600 bg-stone-50 hover:bg-stone-100 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700 transition-colors">Keep Spot</button>
                <button onClick={confirmCancel} disabled={actionLoading === selectedClass.id} className="flex-1 py-3 bg-white border-2 border-rose-100 text-rose-600 hover:bg-rose-50 hover:border-rose-200 dark:bg-stone-900 dark:border-rose-900/30 dark:text-rose-400 dark:hover:bg-rose-900/10 rounded-xl font-bold transition-all">
                  {actionLoading === selectedClass.id ? '...' : 'Yes, Cancel'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* --- SUCCESS / PAYMENT MODAL --- */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/20 backdrop-blur-sm animate-in fade-in" onClick={() => setShowSuccessModal(false)}>
          <div className="bg-white dark:bg-stone-900 rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden border border-white/50 dark:border-stone-700 animate-in-up" onClick={e => e.stopPropagation()}>
            <div className="bg-teal-600 p-8 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-4 text-white shadow-inner">
                  <Check size={32} strokeWidth={3} />
                </div>
                <h3 className="text-2xl font-serif font-bold text-white mb-1">You're Booked!</h3>
                <p className="text-teal-100 text-sm">We've saved a mat for you.</p>
              </div>
            </div>
            
            <div className="p-8">
              <div className="space-y-4 mb-8">
                <div className="flex gap-3 items-start">
                  <div className="bg-stone-50 dark:bg-stone-800 p-2 rounded-lg text-stone-400 mt-0.5"><Wallet size={18} /></div>
                  <div>
                    <h4 className="font-bold text-stone-900 dark:text-white text-sm">Payment Options</h4>
                    <p className="text-stone-500 dark:text-stone-400 text-xs mt-1 leading-relaxed">
                      Please send an e-transfer of <strong>${selectedClass.price}</strong> to:
                    </p>
                    <div className="mt-2 bg-stone-50 dark:bg-stone-800 py-2 px-3 rounded-lg border border-stone-100 dark:border-stone-700 text-center">
                      <span className="font-mono text-stone-800 dark:text-stone-200 text-sm select-all">hello@jocelynyoga.com</span>
                    </div>
                    <p className="text-stone-400 dark:text-stone-500 text-[10px] mt-2 italic">
                      * Cash or card is also accepted at the studio.
                    </p>
                  </div>
                </div>
              </div>

              <button onClick={() => setShowSuccessModal(false)} className="w-full py-3 bg-stone-900 hover:bg-stone-800 dark:bg-white dark:text-stone-900 dark:hover:bg-stone-200 text-white rounded-xl font-bold shadow-lg shadow-stone-900/10 transition-all">
                Wonderful, thanks!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Schedule;