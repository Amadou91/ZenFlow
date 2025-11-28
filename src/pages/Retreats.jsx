import React, { useState } from 'react';
import { Calendar, MapPin, X, CheckCircle, ArrowRight, Sun } from 'lucide-react';

const Retreats = () => {
  const [showModal, setShowModal] = useState(false);
  const [modalStep, setModalStep] = useState('form');
  const [formData, setFormData] = useState({ name: '', email: '' });

  const retreatDetails = { title: "Summer Solstice Getaway", date: "June 21-23, 2024", location: "Elora Gorge, ON", price: "$450" };

  return (
    <div className="animate-in fade-in-up pb-20 bg-stone-50 dark:bg-stone-900 relative">
      <div className="bg-grain"></div>
      
      {/* Immersive Header */}
      <div className="relative h-[60vh] bg-stone-900 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-stone-800/80 to-stone-900 z-10"></div>
        {/* Abstract shapes representing nature */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-teal-900/30 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-rose-900/20 rounded-full blur-[100px]"></div>
        
        <div className="relative z-20 text-center px-4 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-stone-200 text-xs font-bold uppercase tracking-[0.2em] mb-6 shadow-lg">
            <Sun size={14} className="text-teal-400" /> Upcoming Retreat
          </div>
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-6 tracking-tight leading-tight">Reconnect with<br/>Nature.</h1>
          <p className="text-lg md:text-xl text-stone-300 font-light max-w-xl mx-auto leading-relaxed">
            A weekend of immersive yoga, forest bathing, and community in the heart of the Elora Gorge.
          </p>
        </div>
      </div>
      
      <div className="max-w-5xl mx-auto px-6 -mt-20 relative z-30">
        <div className="bg-white dark:bg-stone-800 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-stone-900/10 border border-stone-100 dark:border-stone-700">
          <div className="grid md:grid-cols-2">
            <div className="bg-stone-200 dark:bg-stone-700 min-h-[400px] relative overflow-hidden group">
               <div className="absolute inset-0 flex items-center justify-center text-stone-400 font-bold uppercase tracking-widest text-sm bg-stone-300 dark:bg-stone-600 transition-transform duration-700 group-hover:scale-105">
                 [Elora Gorge Image]
               </div>
            </div>
            
            <div className="p-10 md:p-12 flex flex-col justify-center">
              <span className="text-teal-600 dark:text-teal-400 font-bold tracking-widest uppercase text-xs mb-4">June 2024</span>
              <h2 className="text-4xl font-serif font-bold text-stone-900 dark:text-white mb-6">{retreatDetails.title}</h2>
              
              <div className="space-y-4 mb-8 text-stone-600 dark:text-stone-300 font-medium text-sm">
                <p className="flex items-center gap-3"><Calendar className="text-teal-500 shrink-0" size={18}/> {retreatDetails.date}</p>
                <p className="flex items-center gap-3"><MapPin className="text-teal-500 shrink-0" size={18}/> {retreatDetails.location}</p>
              </div>
              
              <p className="text-stone-600 dark:text-stone-300 mb-10 leading-relaxed text-sm md:text-base">
                Join Jocelyn for a transformative weekend focusing on sun salutations, nature hikes, and communal plant-based meals. Designed to reset your circadian rhythm and ground your energy.
              </p>
              
              <div className="flex items-center justify-between gap-6 mt-auto pt-6 border-t border-stone-100 dark:border-stone-700">
                <span className="text-3xl font-serif font-bold text-stone-900 dark:text-white">{retreatDetails.price}</span>
                <button 
                  onClick={() => { setModalStep('form'); setShowModal(true); }}
                  className="px-8 py-3 bg-stone-900 hover:bg-black dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white rounded-xl font-bold shadow-lg transition-all hover:-translate-y-0.5"
                >
                  Join Waitlist
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/20 backdrop-blur-sm animate-in fade-in" onClick={() => setShowModal(false)}>
          <div className="bg-white dark:bg-stone-900 rounded-3xl shadow-2xl max-w-md w-full p-8 animate-in-up border border-white/50 dark:border-stone-700" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-serif font-bold text-2xl text-stone-900 dark:text-white">{modalStep === 'form' ? 'Join Waitlist' : 'You\'re on the list!'}</h3>
              <button onClick={() => setShowModal(false)} className="p-2 bg-stone-50 hover:bg-stone-100 dark:bg-stone-800 dark:hover:bg-stone-700 rounded-full transition-colors"><X size={20} className="text-stone-500"/></button>
            </div>

            {modalStep === 'form' ? (
              <form onSubmit={(e) => { e.preventDefault(); setModalStep('success'); }} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-widest text-stone-500 ml-1">Full Name</label>
                  <input type="text" required className="w-full p-4 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-100 dark:border-stone-700 focus:ring-2 focus:ring-teal-500 outline-none transition-all" placeholder="Jane Doe" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-widest text-stone-500 ml-1">Email Address</label>
                  <input type="email" required className="w-full p-4 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-100 dark:border-stone-700 focus:ring-2 focus:ring-teal-500 outline-none transition-all" placeholder="jane@example.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
                <button type="submit" className="w-full py-4 bg-stone-900 hover:bg-stone-800 dark:bg-white dark:text-stone-900 rounded-xl font-bold mt-2 shadow-lg shadow-stone-900/10 transition-all flex items-center justify-center gap-2">
                  Confirm Spot <ArrowRight size={18} />
                </button>
              </form>
            ) : (
              <div className="text-center py-4">
                <div className="w-20 h-20 bg-teal-50 dark:bg-teal-900/20 rounded-full flex items-center justify-center mx-auto mb-6 text-teal-600 dark:text-teal-400">
                  <CheckCircle size={40} />
                </div>
                <p className="text-stone-600 dark:text-stone-300 mb-8 leading-relaxed">
                  Thanks <strong>{formData.name}</strong>. We've added <strong>{formData.email}</strong> to the priority list. You'll be the first to know when spots open up.
                </p>
                <button onClick={() => setShowModal(false)} className="w-full py-4 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 font-bold rounded-xl text-stone-600 dark:text-stone-300 transition-colors">Close</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Retreats;