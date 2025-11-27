import React from 'react';
import { Calendar, MapPin } from 'lucide-react';

const Retreats = () => {
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
          <div className="h-64 bg-stone-200 dark:bg-stone-700 flex items-center justify-center text-stone-400 font-bold">[Retreat Image Placeholder]</div>
          <div className="p-8">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-2xl font-bold text-stone-900 dark:text-white mb-2">Summer Solstice Getaway</h3>
                <div className="flex gap-4 text-sm text-stone-500 dark:text-stone-400">
                  <span className="flex items-center gap-1.5"><Calendar size={16}/> June 21-23, 2024</span>
                  <span className="flex items-center gap-1.5"><MapPin size={16}/> Elora Gorge, ON</span>
                </div>
              </div>
              <span className="bg-teal-100 dark:bg-teal-900/30 text-teal-800 dark:text-teal-300 px-3 py-1 rounded-full text-sm font-bold">$450</span>
            </div>
            <p className="text-stone-600 dark:text-stone-300 mb-6 leading-relaxed">Join Jocelyn for a transformative weekend focusing on sun salutations, nature hikes, and communal plant-based meals. This retreat is designed for all levels and aims to reset your circadian rhythm.</p>
            <button className="w-full py-3 bg-stone-900 dark:bg-white text-white dark:text-stone-900 font-bold rounded-xl hover:opacity-90">Join Waitlist</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Retreats;