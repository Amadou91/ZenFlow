import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { POSE_LIBRARY } from '../data/poses';
import PoseIcon from './PoseIcon';
import getLevelColor from '../utils/getLevelColor';


const PoseLibrary = ({ setSelectedPose }) => {
  const [search, setSearch] = useState('');
  const filtered = POSE_LIBRARY.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.sanskrit.toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="max-w-6xl mx-auto p-6 min-h-full">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-6 border-b border-stone-200 dark:border-stone-700 pb-6">
        <div><h2 className="text-3xl font-serif text-teal-900 dark:text-teal-100 mb-2">Pose Library</h2><p className="text-stone-600 dark:text-stone-400">Browse {POSE_LIBRARY.length} poses.</p></div>
        <div className="relative w-full md:w-72"><Search className="absolute left-3 top-3 text-stone-400" size={20} /><input type="text" placeholder="Find a pose..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 focus:ring-2 focus:ring-teal-500 outline-none shadow-sm text-stone-800 dark:text-stone-100" /></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
        {filtered.map(pose => (
          <div key={pose.id} onClick={() => setSelectedPose(pose)} className="bg-white dark:bg-stone-800 p-5 rounded-2xl border border-stone-200 dark:border-stone-700 hover:border-teal-500 hover:shadow-md transition-all cursor-pointer group flex items-start gap-4">
            <div className="w-16 h-16 bg-stone-50 dark:bg-stone-900 rounded-xl flex items-center justify-center text-teal-600 dark:text-teal-400 shrink-0"><PoseIcon category={pose.category} className="w-8 h-8" /></div>
            <div>
              <h3 className="font-bold text-lg text-stone-900 dark:text-stone-100">{pose.name}</h3>
              <p className="text-sm italic text-stone-500 dark:text-stone-400 mb-3 font-serif">{pose.sanskrit}</p>
              <div className="flex gap-2">
                <span className="text-xs bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300 px-2.5 py-1 rounded-md font-medium">{pose.category}</span>
                <span className={`text-xs px-2.5 py-1 rounded-md font-medium ${getLevelColor(pose.difficulty)}`}>Level {pose.difficulty}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PoseLibrary;
