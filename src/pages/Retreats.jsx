import React, { useState } from 'react';
import { Calendar, MapPin, X, CheckCircle, ArrowRight } from 'lucide-react';

const Retreats = () => {
  const [showModal, setShowModal] = useState(false);
  const [modalStep, setModalStep] = useState('form'); // 'form' or 'success'
  const [formData, setFormData] = useState({ name: '', email: '' });

  // Static Retreat Data
  const retreatDetails = {
    title: "Summer Solstice Getaway",
    date: "June 21-23, 2024",
    location: "Elora Gorge, ON",
    price: "$450"
  };

  const handleJoinClick = () => {
    setModalStep('form');
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, you would send this data to your backend/Supabase here
    setModalStep('success');
  };

  const closeModal = () => {
    setShowModal(false);
    setFormData({ name: '', email: '' });
  };

  return (
    <div className="animate-in fade-in duration-500 pb-20">
      <div className="relative h-[50vh] min-h-[400px] bg-stone-900 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-teal-900/30"></div> 
        <div className="relative z-10 text-center px-4">
          <span className="inline-block py-1 px-3 border border-white/30 rounded-full text-white text-xs font-bold uppercase tracking-widest mb-4">Coming Summer 2024</span>
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-6">Reconnect with Nature</h1>
          <p className="text-xl text-stone-100 max-w-xl mx-auto">A weekend of yoga, meditation, and community in the heart of Ontario.</p>
        </div>
      </div>
      
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-serif font-bold text-stone-900 dark:text-white mb-8 text-center">Upcoming Retreats</h2>
        
        <div className="bg-white dark:bg-stone-800 rounded-2xl overflow-hidden shadow-lg border border-stone-200 dark:border-stone-700">
          <div className="h-64 bg-stone-200 dark:bg-stone-700 flex items-center justify-center text-stone-400 font-bold uppercase tracking-widest">[Retreat Image Placeholder]</div>
          <div className="p-8">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4 gap-4">
              <div>
                <h3 className="text-2xl font-bold text-stone-900 dark:text-white mb-2">{retreatDetails.title}</h3>
                <div className="flex gap-4 text-sm text-stone-500 dark:text-stone-400">
                  <span className="flex items-center gap-1.5"><Calendar size={16}/> {retreatDetails.date}</span>
                  <span className="flex items-center gap-1.5"><MapPin size={16}/> {retreatDetails.location}</span>
                </div>
              </div>
              <span className="bg-teal-100 dark:bg-teal-900/30 text-teal-800 dark:text-teal-300 px-3 py-1 rounded-full text-sm font-bold w-fit">{retreatDetails.price}</span>
            </div>
            
            <p className="text-stone-600 dark:text-stone-300 mb-8 leading-relaxed">
              Join Jocelyn for a transformative weekend focusing on sun salutations, nature hikes, and communal plant-based meals. This retreat is designed for all levels and aims to reset your circadian rhythm.
            </p>
            
            <button 
              onClick={handleJoinClick}
              className="w-full py-3 bg-stone-900 dark:bg-white text-white dark:text-stone-900 font-bold rounded-xl hover:opacity-90 transition-opacity"
            >
              Join Waitlist
            </button>
          </div>
        </div>
      </div>

      {/* --- WAITLIST MODAL --- */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={closeModal}>
          <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-2xl max-w-md w-full border border-stone-200 dark:border-stone-700 overflow-hidden transform animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            
            <div className="p-4 border-b border-stone-100 dark:border-stone-800 flex justify-between items-center">
              <h3 className="font-bold text-lg text-stone-900 dark:text-white">Join Waitlist</h3>
              <button onClick={closeModal} className="p-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full text-stone-500 transition-colors">
                <X size={20} />
              </button>
            </div>

            {modalStep === 'form' ? (
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="bg-stone-50 dark:bg-stone-800/50 p-4 rounded-xl border border-stone-100 dark:border-stone-700/50 mb-2">
                  <h4 className="font-bold text-stone-900 dark:text-white mb-1">{retreatDetails.title}</h4>
                  <div className="text-xs text-stone-500 dark:text-stone-400 space-y-1">
                    <p>{retreatDetails.date}</p>
                    <p>{retreatDetails.location}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-stone-500 mb-1 ml-1">Full Name</label>
                  <input 
                    required 
                    type="text" 
                    placeholder="Jane Doe"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full p-3 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-stone-500 mb-1 ml-1">Email Address</label>
                  <input 
                    required 
                    type="email" 
                    placeholder="jane@example.com"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    className="w-full p-3 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>

                <div className="pt-2">
                  <button type="submit" className="w-full py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-colors flex items-center justify-center gap-2">
                    Confirm Spot <ArrowRight size={18} />
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={32} />
                </div>
                <h3 className="text-2xl font-serif font-bold text-stone-900 dark:text-white mb-2">You're on the list!</h3>
                <p className="text-stone-600 dark:text-stone-300 text-sm mb-6">
                  Thanks, {formData.name}. We've added you to the priority waitlist for the <strong>{retreatDetails.title}</strong>. We'll verify availability and email you at {formData.email} shortly.
                </p>
                <button onClick={closeModal} className="w-full py-3 bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-white rounded-xl font-bold hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors">
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Retreats;