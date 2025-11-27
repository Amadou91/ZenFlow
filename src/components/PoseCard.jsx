import React, { useState } from 'react';
import { Clock, Shuffle, Trash2, AlertCircle, Check } from 'lucide-react';
import PoseIcon from './PoseIcon';
import getLevelColor from '../utils/getLevelColor';

const PoseCard = ({ pose, index, onSwap, onDelete, setSelectedPose, isTeacherMode, isLast, isFirst }) => {
  // Safety state for mobile delete to prevent accidental touches
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.matchMedia('(hover: none)').matches) {
      // On touch devices, require confirmation
      if (confirmDelete) {
        onDelete(index);
      } else {
        setConfirmDelete(true);
        // Reset confirmation after 3 seconds if not clicked
        setTimeout(() => setConfirmDelete(false), 3000);
      }
    } else {
      // Immediate delete on desktop
      onDelete(index);
    }
  };

  const handleSwap = (e) => {
    e.stopPropagation();
    onSwap(index);
    setConfirmDelete(false); // Reset delete state if swapping
  };

  // --- TEACHER MODE (Compact Row) ---
  if (isTeacherMode) {
    return (
      <div className="flex items-center gap-3 p-3 border-b border-stone-200 dark:border-stone-700 break-inside-avoid bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors group relative touch-manipulation">
        <span className="font-mono text-stone-400 w-6 text-right text-sm shrink-0">{index + 1}</span>
        
        {/* Icon */}
        <div className="w-10 h-10 bg-stone-100 dark:bg-stone-700 rounded-full overflow-hidden shrink-0 flex items-center justify-center text-teal-600 dark:text-teal-400">
          <PoseIcon category={pose.category} className="w-6 h-6" />
        </div>
        
        {/* Text Info - Flex Grow to push actions right */}
        <div className="flex-1 min-w-0 pr-2">
          <h4 className="font-bold text-stone-900 dark:text-stone-100 text-sm truncate leading-tight">{pose.name}</h4>
          <p className="text-[10px] text-stone-500 dark:text-stone-400 italic truncate">{pose.sanskrit}</p>
        </div>
        
        {/* Meta Info (Tablet/Desktop) */}
        <div className="text-right hidden sm:block shrink-0">
           <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded block w-fit ml-auto mb-0.5 ${getLevelColor(pose.difficulty)}`}>Lvl {pose.difficulty}</span>
           <div className="text-[10px] text-stone-500 dark:text-stone-400 font-mono uppercase tracking-wide">{pose.duration}</div>
        </div>

        {/* Actions - Always visible on mobile, hover on desktop */}
        <div className="flex items-center gap-1 shrink-0 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity bg-white/90 dark:bg-stone-800/90 lg:bg-transparent rounded-lg">
           <button 
             onClick={handleSwap}
             className="p-2 sm:p-1.5 text-stone-400 hover:text-teal-600 hover:bg-stone-100 dark:hover:bg-stone-700 rounded transition-colors min-w-[32px] min-h-[32px] flex items-center justify-center"
             title="Swap Pose"
           >
             <Shuffle size={16} />
           </button>
           <div className="w-px h-4 bg-stone-200 dark:bg-stone-700 mx-0.5 hidden sm:block"></div>
           <button 
             onClick={handleDelete}
             className={`p-2 sm:p-1.5 rounded transition-all min-w-[32px] min-h-[32px] flex items-center justify-center ${confirmDelete ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/50 dark:text-rose-400' : 'text-stone-400 hover:text-rose-500 hover:bg-stone-100 dark:hover:bg-stone-700'}`}
             title="Remove Pose"
           >
             {confirmDelete ? <AlertCircle size={16} /> : <Trash2 size={16} />}
           </button>
        </div>
      </div>
    );
  }

  // --- STANDARD CARD MODE ---
  return (
    <div className="relative pl-4 sm:pl-8 md:pl-12 group break-inside-avoid mb-4">
      {/* Timeline Line */}
      {!isFirst && (
        <div className="absolute left-[7px] sm:left-[15px] md:left-[23px] top-[-16px] h-[calc(100%+16px)] w-0.5 bg-stone-200 dark:bg-stone-700 -z-10" style={{ height: 'calc(100% + 32px)' }} />
      )}
      {!isLast && <div className="absolute left-[7px] sm:left-[15px] md:left-[23px] top-9 md:top-10 bottom-[-16px] w-0.5 bg-stone-200 dark:bg-stone-700 -z-10" />}

      {/* Timeline Dot */}
      <div className="absolute left-[1px] sm:left-[9px] md:left-[17px] top-6 sm:top-9 md:top-10 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-stone-900 bg-teal-500 shadow-sm z-10 ring-4 ring-stone-50 dark:ring-stone-900 box-content"></div>

      <div
        onClick={() => !confirmDelete && setSelectedPose(pose)}
        className="cursor-pointer bg-white dark:bg-stone-800 p-4 rounded-xl border border-stone-200 dark:border-stone-700 hover:shadow-md hover:border-teal-300 dark:hover:border-teal-700 transition-all group relative overflow-hidden"
      >
        {/* Top Row: Content + Actions */}
        <div className="flex justify-between items-start gap-3 mb-2">
          
          {/* Left: Icon & Titles */}
          <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-stone-50 dark:bg-stone-900 rounded-xl flex items-center justify-center text-teal-600 dark:text-teal-400 shrink-0">
              <PoseIcon category={pose.category} className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
            <div className="min-w-0 flex-1 pt-0.5">
              <h3 className="font-bold text-base sm:text-lg text-stone-800 dark:text-stone-100 truncate leading-tight pr-1">{pose.name}</h3>
              <p className="text-stone-500 dark:text-stone-400 italic text-xs sm:text-sm truncate">{pose.sanskrit}</p>
            </div>
          </div>

          {/* Right: Actions (Flex Container to prevent overlap) */}
          <div className="flex items-center gap-1 shrink-0 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity -mr-2 sm:mr-0">
            <button
              onClick={handleSwap}
              className="p-2 sm:p-2 text-stone-400 hover:text-teal-600 bg-transparent hover:bg-stone-50 dark:hover:bg-stone-700 rounded-lg transition-colors touch-manipulation"
              title="Swap Pose"
              style={{ minHeight: '44px', minWidth: '44px' }} // Minimum touch target
            >
              <Shuffle size={18} />
            </button>
            <button
              onClick={handleDelete}
              className={`p-2 sm:p-2 rounded-lg transition-colors touch-manipulation flex items-center justify-center ${confirmDelete ? 'bg-rose-50 text-rose-600 border border-rose-200' : 'text-stone-400 hover:text-rose-500 bg-transparent hover:bg-stone-50 dark:hover:bg-stone-700'}`}
              title="Remove Pose"
              style={{ minHeight: '44px', minWidth: '44px' }}
            >
              {confirmDelete ? <span className="text-[10px] font-bold uppercase">Del?</span> : <Trash2 size={18} />}
            </button>
          </div>
        </div>

        {/* Tags Row */}
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
          <span className="flex items-center gap-1 bg-stone-100 dark:bg-stone-700 px-2 py-1 rounded font-medium">{pose.category}</span>
          <span className={`flex items-center gap-1 px-2 py-1 rounded font-bold ${getLevelColor(pose.difficulty)}`}>
            Lvl {pose.difficulty}
          </span>
          <span className="flex items-center gap-1 font-mono bg-stone-50 dark:bg-stone-900 px-2 py-1 rounded border border-stone-100 dark:border-stone-700">
            <Clock size={12} /> {pose.duration}
          </span>
        </div>

        {/* Cues */}
        <div className="mt-3 pt-3 border-t border-stone-100 dark:border-stone-700">
          <p className="text-xs text-stone-500 dark:text-stone-400 italic leading-relaxed line-clamp-2">"{pose.teachingCue}"</p>
        </div>
      </div>
    </div>
  );
};

export default PoseCard;