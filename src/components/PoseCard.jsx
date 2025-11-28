import React, { useState } from 'react';
import { Clock, Shuffle, Trash2, AlertCircle } from 'lucide-react';
import PoseIcon from './PoseIcon';
import getLevelColor from '../utils/getLevelColor';

const PoseCard = ({ pose, index, onSwap, onDelete, setSelectedPose, isTeacherMode, isLast, isFirst }) => {
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDelete = (e) => {
    e.stopPropagation();
    if (confirmDelete) {
      onDelete(index);
    } else {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
    }
  };

  const handleSwap = (e) => {
    e.stopPropagation();
    onSwap(index);
    setConfirmDelete(false);
  };

  // --- TEACHER MODE (Compact Row) ---
  if (isTeacherMode) {
    return (
      <div className="flex items-center gap-4 p-3 border-b border-stone-100 dark:border-stone-800 bg-white dark:bg-stone-900 hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors group relative">
        <span className="font-mono text-stone-300 dark:text-stone-600 w-6 text-right text-xs shrink-0">{index + 1}</span>
        
        <div className="w-10 h-10 bg-stone-100 dark:bg-stone-800 rounded-lg shrink-0 flex items-center justify-center text-stone-600 dark:text-stone-400">
          <PoseIcon category={pose.category} className="w-5 h-5" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-stone-800 dark:text-stone-200 text-sm truncate">{pose.name}</h4>
          <p className="text-[10px] text-stone-400 dark:text-stone-500 italic truncate">{pose.sanskrit}</p>
        </div>
        
        <div className="flex items-center gap-2 shrink-0">
           <button onClick={handleSwap} className="p-2 text-stone-300 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-md transition-colors"><Shuffle size={14} /></button>
           <button onClick={handleDelete} className={`p-2 rounded-md transition-colors ${confirmDelete ? 'text-rose-500 bg-rose-50' : 'text-stone-300 hover:text-rose-500 hover:bg-rose-50'}`}>
             {confirmDelete ? <AlertCircle size={14} /> : <Trash2 size={14} />}
           </button>
        </div>
      </div>
    );
  }

  // --- STANDARD CARD MODE (Polished) ---
  return (
    <div className="relative pl-6 sm:pl-10 md:pl-12 group break-inside-avoid mb-6 animate-in fade-in-up" style={{ animationDelay: `${index * 0.05}s` }}>
      {/* Timeline Line */}
      {!isFirst && (
        <div className="absolute left-[11px] sm:left-[19px] md:left-[23px] top-[-24px] h-[calc(100%+24px)] w-px bg-stone-200 dark:bg-stone-800 -z-10" />
      )}
      {!isLast && <div className="absolute left-[11px] sm:left-[19px] md:left-[23px] top-8 bottom-[-24px] w-px bg-stone-200 dark:bg-stone-800 -z-10" />}

      {/* Timeline Dot */}
      <div className="absolute left-[4px] sm:left-[12px] md:left-[16px] top-8 w-4 h-4 rounded-full border-[3px] border-white dark:border-stone-900 bg-teal-400 dark:bg-teal-600 shadow-sm z-10 ring-4 ring-stone-50 dark:ring-stone-900"></div>

      <div
        onClick={() => !confirmDelete && setSelectedPose(pose)}
        className="cursor-pointer bg-white dark:bg-stone-800 p-5 rounded-2xl shadow-soft hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border border-transparent hover:border-teal-100 dark:hover:border-teal-900/30 group relative overflow-hidden"
      >
        {/* Subtle gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-teal-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none dark:from-teal-900/10"></div>

        <div className="relative z-10">
          <div className="flex justify-between items-start gap-4 mb-3">
            <div className="flex items-start gap-4 flex-1 min-w-0">
              {/* Icon Container */}
              <div className="w-14 h-14 bg-stone-50 dark:bg-stone-900 rounded-2xl flex items-center justify-center text-teal-600 dark:text-teal-400 shrink-0 shadow-sm border border-stone-100 dark:border-stone-700/50">
                <PoseIcon category={pose.category} className="w-7 h-7" />
              </div>
              
              <div className="min-w-0 flex-1 pt-1">
                <h3 className="font-bold text-lg text-stone-800 dark:text-stone-100 truncate font-serif tracking-tight">{pose.name}</h3>
                <p className="text-stone-500 dark:text-stone-400 italic text-sm truncate font-medium opacity-80">{pose.sanskrit}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button onClick={handleSwap} className="p-2 text-stone-400 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/30 rounded-lg transition-colors" title="Swap"><Shuffle size={16} /></button>
              <button onClick={handleDelete} className={`p-2 rounded-lg transition-colors ${confirmDelete ? 'bg-rose-50 text-rose-600' : 'text-stone-400 hover:text-rose-500 hover:bg-rose-50'}`}>
                {confirmDelete ? <AlertCircle size={16} /> : <Trash2 size={16} />}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-3">
            <span className="text-[10px] uppercase font-bold tracking-wider text-stone-500 bg-stone-100 dark:bg-stone-900/50 px-2 py-1 rounded-md">{pose.category}</span>
            <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-md ${getLevelColor(pose.difficulty)}`}>
              Lvl {pose.difficulty}
            </span>
            <span className="flex items-center gap-1 text-[10px] font-bold tracking-wider text-stone-400 uppercase">
              <Clock size={12} /> {pose.duration}
            </span>
          </div>

          <p className="mt-4 text-sm text-stone-600 dark:text-stone-300 leading-relaxed border-t border-stone-100 dark:border-stone-700 pt-3 opacity-90">
            "{pose.teachingCue}"
          </p>
        </div>
      </div>
    </div>
  );
};

export default PoseCard;