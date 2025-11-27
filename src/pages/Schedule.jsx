import React, { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase'; 
import { Calendar, MapPin, Clock, Check } from 'lucide-react';

const CLASSES = [
  // Mock data - eventually this will come from your database
  { id: 'c1', name: 'Vinyasa Flow', time: '10:00 AM', date: '2023-10-25', duration: '60 min', location: 'Studio A', instructor: 'Sarah' },
  { id: 'c2', name: 'Yin Yoga', time: '6:00 PM', date: '2023-10-25', duration: '75 min', location: 'Studio B', instructor: 'Mike' },
  { id: 'c3', name: 'Power Yoga', time: '8:00 AM', date: '2023-10-26', duration: '45 min', location: 'Studio A', instructor: 'Jessica' },
];

const Schedule = () => {
  const [bookedClassIds, setBookedClassIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null); 
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data } = await supabase
          .from('bookings')
          .select('class_id')
          .eq('user_id', user.id);
        
        if (data) {
          setBookedClassIds(new Set(data.map(b => b.class_id)));
        }
      }
      setLoading(false);
    };
    loadData();
  }, []);

  const handleBook = async (classItem) => {
    if (!user) return alert("Please sign in to book a class.");
    setActionLoading(classItem.id);

    try {
      const { error } = await supabase
        .from('bookings')
        .insert([{
            user_id: user.id,
            class_id: classItem.id,
            class_name: classItem.name,
            class_date: classItem.date,
            location: classItem.location
        }]);

      if (error) throw error;

      setBookedClassIds(prev => new Set(prev).add(classItem.id));
      
    } catch (err) {
      alert(`Booking failed: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async (classItem) => {
    if (!confirm(`Cancel your spot in ${classItem.name}?`)) return;
    setActionLoading(classItem.id);

    try {
      const { error } = await supabase
        .from('bookings')
        .delete()
        .match({ user_id: user.id, class_id: classItem.id });

      if (error) throw error;

      setBookedClassIds(prev => {
        const next = new Set(prev);
        next.delete(classItem.id);
        return next;
      });

    } catch (err) {
      alert(`Cancellation failed: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return (
    <div className="p-8 text-center text-stone-500 dark:text-stone-400 animate-pulse">
      Loading schedule...
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 pb-24">
      <div className="flex items-center gap-3 mb-8">
        <h2 className="text-3xl font-serif text-teal-900 dark:text-teal-100">Class Schedule</h2>
      </div>
      
      <div className="space-y-4">
        {CLASSES.map(cls => {
          const isBooked = bookedClassIds.has(cls.id);
          const isLoading = actionLoading === cls.id;

          return (
            <div 
              key={cls.id} 
              className={`
                flex flex-col md:flex-row items-center justify-between p-6 rounded-xl border-2 transition-all duration-300
                ${isBooked 
                  ? 'bg-teal-50/30 dark:bg-teal-900/10 border-teal-500 dark:border-teal-500/50 shadow-md' 
                  : 'bg-white dark:bg-stone-800 border-transparent shadow-sm hover:shadow-md dark:border-stone-700'
                }
              `}
            >
              
              {/* Class Info */}
              <div className="flex-1 w-full md:w-auto mb-4 md:mb-0">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-bold text-lg text-stone-900 dark:text-stone-100">{cls.name}</h3>
                  {isBooked && (
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Check size={10} strokeWidth={3} /> Booked
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-stone-500 dark:text-stone-400 font-medium">
                  <div className="flex items-center gap-1.5"><Calendar size={14} /> {cls.date}</div>
                  <div className="flex items-center gap-1.5"><Clock size={14} /> {cls.time} • {cls.duration}</div>
                  <div className="flex items-center gap-1.5"><MapPin size={14} /> {cls.location}</div>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => isBooked ? handleCancel(cls) : handleBook(cls)}
                disabled={isLoading}
                className={`
                  w-full md:w-40 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 touch-manipulation
                  ${isBooked 
                    ? 'bg-white dark:bg-stone-800 border-2 border-stone-200 dark:border-stone-600 text-stone-500 dark:text-stone-400 hover:border-rose-200 dark:hover:border-rose-800 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20' 
                    : 'bg-teal-600 text-white hover:bg-teal-700 shadow-lg hover:shadow-teal-900/20 dark:hover:bg-teal-500'
                  }
                  ${isLoading ? 'opacity-50 cursor-wait' : ''}
                `}
              >
                {isLoading ? 'Processing...' : isBooked ? 'Cancel Booking' : 'Sign Up'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Schedule;