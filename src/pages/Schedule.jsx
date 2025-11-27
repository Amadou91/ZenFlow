import React, { useState } from 'react';
import { UPCOMING_CLASSES, FAQS } from '../data/schedule';
import { Calendar, Clock, MapPin, CheckCircle, Users, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../utils/supabase';
import { useNavigate } from 'react-router-dom';
import { sendEmail, generateBookingTemplate } from '../utils/email';

const Schedule = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [selectedClass, setSelectedClass] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);

  const handleBook = (cls) => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setSelectedClass(cls);
  };

  const confirmBooking = async () => {
    if (!currentUser || !selectedClass) return;
    
    setBookingLoading(true);
    try {
      // 1. Save to Supabase
      const { error } = await supabase.from('bookings').insert([
        {
          user_id: currentUser.id,
          class_id: selectedClass.id,
          class_name: selectedClass.title,
          class_date: selectedClass.date,
          location: selectedClass.location,
        }
      ]);

      if (error) throw error;

      // 2. Send Email
      const userName = currentUser.user_metadata?.full_name || 'Yogi';
      const emailHtml = generateBookingTemplate(userName, selectedClass);
      await sendEmail(currentUser.email, `Booking Confirmed: ${selectedClass.title}`, emailHtml);

      setShowConfirmation(true);
      setTimeout(() => {
          setShowConfirmation(false);
          setSelectedClass(null);
      }, 3000);
    } catch (error) {
      console.error("Booking Error", error);
      alert("Failed to book class: " + error.message);
    }
    setBookingLoading(false);
  };

  return (
    <div className="animate-in fade-in duration-500 pb-20">
      <div className="bg-stone-100 dark:bg-stone-800 py-16 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-stone-900 dark:text-white mb-4">Class Schedule</h1>
        <p className="text-stone-600 dark:text-stone-300 max-w-2xl mx-auto">Join us in Drayton. Reserve your spot online to ensure availability.</p>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-8">
        <div className="space-y-4">
          {UPCOMING_CLASSES.map((cls) => (
            <div key={cls.id} className="bg-white dark:bg-stone-900 rounded-2xl p-6 shadow-sm border border-stone-200 dark:border-stone-800 flex flex-col md:flex-row gap-6 transition-all hover:border-teal-500 hover:shadow-md">
              <div className="flex-shrink-0 flex md:flex-col items-center justify-center md:justify-start gap-2 md:gap-0 md:w-24 md:border-r border-stone-100 dark:border-stone-800 pr-0 md:pr-6">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-500">{new Date(cls.date).toLocaleDateString('en-US', { month: 'short' })}</span>
                <span className="text-2xl md:text-4xl font-serif font-bold text-stone-900 dark:text-white">{new Date(cls.date).getDate()}</span>
                <span className="text-sm text-stone-500 dark:text-stone-400">{new Date(cls.date).toLocaleDateString('en-US', { weekday: 'short' })}</span>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-stone-900 dark:text-white">{cls.title}</h3>
                  <span className="text-lg font-bold text-teal-600 dark:text-teal-400">${cls.price}</span>
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-stone-500 dark:text-stone-400 mb-4">
                  <span className="flex items-center gap-1.5"><Clock size={16} /> {new Date(cls.date).toLocaleTimeString('en-US', {hour: 'numeric', minute:'2-digit'})} ({cls.duration})</span>
                  <span className="flex items-center gap-1.5"><MapPin size={16} /> {cls.location}</span>
                  <span className="flex items-center gap-1.5"><Users size={16} /> {cls.spotsTotal - cls.spotsBooked} spots left</span>
                </div>
                <p className="text-sm text-stone-600 dark:text-stone-300 mb-4 leading-relaxed">{cls.description}</p>
                <div className="flex items-center justify-between">
                   <span className="text-xs font-bold bg-stone-100 dark:bg-stone-800 px-2 py-1 rounded text-stone-600 dark:text-stone-400">{cls.difficulty}</span>
                   <button onClick={() => handleBook(cls)} disabled={cls.spotsBooked >= cls.spotsTotal} className={`px-6 py-2 rounded-lg font-bold text-sm transition-colors ${cls.spotsBooked >= cls.spotsTotal ? 'bg-stone-200 text-stone-400 cursor-not-allowed' : 'bg-stone-900 dark:bg-white text-white dark:text-stone-900 hover:bg-teal-600 dark:hover:bg-stone-200'}`}>
                     {cls.spotsBooked >= cls.spotsTotal ? 'Waitlist' : (currentUser ? 'Book Now' : 'Login to Book')}
                   </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 mt-24">
        <h2 className="text-2xl font-serif font-bold text-stone-900 dark:text-white mb-8 text-center">Common Questions</h2>
        <div className="space-y-4">{FAQS.map((faq, idx) => (<FaqItem key={idx} question={faq.q} answer={faq.a} />))}</div>
      </div>

      {selectedClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-2xl max-w-md w-full p-6 border border-stone-200 dark:border-stone-700">
            {!showConfirmation ? (
                <>
                    <h3 className="text-2xl font-serif font-bold mb-4 dark:text-white">Confirm Booking</h3>
                    <div className="bg-stone-50 dark:bg-stone-800 p-4 rounded-xl mb-6">
                        <p className="font-bold text-stone-900 dark:text-white">{selectedClass.title}</p>
                        <p className="text-sm text-stone-500 dark:text-stone-400">{new Date(selectedClass.date).toLocaleDateString()} at {new Date(selectedClass.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                        <p className="text-sm text-stone-500 dark:text-stone-400">{selectedClass.location}</p>
                        <div className="mt-2 pt-2 border-t border-stone-200 dark:border-stone-700 flex justify-between font-bold"><span className="dark:text-stone-200">Total</span><span className="text-teal-600">${selectedClass.price}</span></div>
                    </div>
                    <p className="text-sm text-stone-500 mb-6 text-center">Booking as <strong>{currentUser.email}</strong>. <br/>A confirmation email will be sent to you.</p>
                    <div className="flex gap-3">
                        <button onClick={() => setSelectedClass(null)} disabled={bookingLoading} className="flex-1 py-3 text-stone-500 font-bold hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg">Cancel</button>
                        <button onClick={confirmBooking} disabled={bookingLoading} className="flex-1 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg shadow-lg flex justify-center">{bookingLoading ? 'Processing...' : 'Confirm'}</button>
                    </div>
                </>
            ) : (
                <div className="text-center py-8">
                    <div className="w-16 h-16 bg-teal-100 dark:bg-teal-900/30 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle size={32} /></div>
                    <h3 className="text-xl font-bold mb-2 dark:text-white">You're Booked!</h3>
                    <p className="text-stone-500 dark:text-stone-400">Check your email for details.</p>
                </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const FaqItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center p-4 text-left bg-white dark:bg-stone-900 hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors">
        <span className="font-bold text-stone-800 dark:text-stone-200">{question}</span>
        {isOpen ? <ChevronUp size={18} className="text-stone-400"/> : <ChevronDown size={18} className="text-stone-400"/>}
      </button>
      {isOpen && (<div className="p-4 pt-0 bg-white dark:bg-stone-900 text-sm text-stone-600 dark:text-stone-400 leading-relaxed border-t border-stone-100 dark:border-stone-800/50">{answer}</div>)}
    </div>
  );
};

export default Schedule;