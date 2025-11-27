import React from 'react';
import { Clock, Shuffle, Trash2 } from 'lucide-react';
import PoseIcon from './PoseIcon';
import getLevelColor from '../utils/getLevelColor';

const PoseCard = ({ pose, index, onSwap, onDelete, setSelectedPose, isTeacherMode, isLast, isFirst }) => {
  if (isTeacherMode) {
    return (
      <div className="flex items-center gap-4 p-3 border-b border-stone-200 dark:border-stone-700 break-inside-avoid hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors group relative">
        <span className="font-mono text-stone-400 w-6 text-right">{index + 1}</span>
        <div className="w-10 h-10 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden shrink-0 flex items-center justify-center text-teal-600 dark:text-teal-400">
          <PoseIcon category={pose.category} className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0"> {/* min-w-0 helps truncate text if needed */}
          <h4 className="font-bold text-stone-900 dark:text-stone-100 text-sm truncate">{pose.name}</h4>
          <p className="text-xs text-stone-500 dark:text-stone-400 italic truncate">{pose.sanskrit}</p>
        </div>
        
        {/* Controls & Info Container */}
        <div className="flex items-center gap-4 shrink-0">
           <div className="text-right hidden sm:block">
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded block w-fit ml-auto mb-0.5 ${getLevelColor(pose.difficulty)}`}>Lvl {pose.difficulty}</span>
              <div className="text-[10px] text-stone-500 dark:text-stone-400 font-mono uppercase tracking-wide">{pose.duration}</div>
           </div>

           {/* Action Buttons Group */}
           <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 dark:bg-stone-900/80 backdrop-blur-sm rounded-lg p-1 shadow-sm border border-stone-100 dark:border-stone-700 absolute right-14 sm:static sm:bg-transparent sm:shadow-none sm:border-none sm:backdrop-blur-none">
              <button 
                onClick={(e) => { e.stopPropagation(); onSwap(index); }}
                className="p-1.5 text-stone-400 hover:text-teal-600 hover:bg-stone-100 dark:hover:bg-stone-700 rounded transition-colors"
                title="Swap Pose"
              >
                <Shuffle size={14} />
              </button>
              <div className="w-px h-3 bg-stone-200 dark:bg-stone-700 mx-0.5 hidden sm:block"></div>
              <button 
                onClick={(e) => { e.stopPropagation(); onDelete(index); }}
                className="p-1.5 text-stone-400 hover:text-rose-500 hover:bg-stone-100 dark:hover:bg-stone-700 rounded transition-colors"
                title="Remove Pose"
              >
                <Trash2 size={14} />
              </button>
           </div>
        </div>
      </div>
    );
  }
  return (
    <div className="relative pl-8 md:pl-12 group break-inside-avoid mb-4">
      {!isFirst && (
        <div
          className="absolute left-[15px] md:left-[23px] top-[-16px] h-[calc(100%+16px)] md:h-[calc(100%+20px)] w-0.5 bg-stone-200 dark:bg-stone-700 -z-10"
          style={{ height: '52px' }}
        />
      )}
      {!isLast && <div className="absolute left-[15px] md:left-[23px] top-9 md:top-10 bottom-[-16px] w-0.5 bg-stone-200 dark:bg-stone-700 -z-10" />}

      <div className="absolute left-[9px] md:left-[17px] top-9 md:top-10 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-stone-900 bg-teal-500 shadow-sm z-10 ring-4 ring-stone-50 dark:ring-stone-900 box-content"></div>

      <div
        onClick={() => setSelectedPose(pose)}
        className="cursor-pointer bg-white dark:bg-stone-800 p-4 md:p-5 rounded-xl border border-stone-200 dark:border-stone-700 hover:shadow-md hover:border-teal-300 dark:hover:border-teal-700 transition-all group relative"
      >
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-stone-50 dark:bg-stone-900 rounded-xl flex items-center justify-center text-teal-600 dark:text-teal-400 shrink-0">
              <PoseIcon category={pose.category} className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-stone-800 dark:text-stone-100">{pose.name}</h3>
              <p className="text-stone-500 dark:text-stone-400 italic text-sm">{pose.sanskrit}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSwap(index);
              }}
              className="p-2 text-stone-400 hover:text-teal-600 bg-stone-50 dark:bg-stone-700 rounded-lg"
              title="Swap Pose"
            >
              <Shuffle size={16} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(index);
              }}
              className="p-2 text-stone-400 hover:text-rose-500 bg-stone-50 dark:bg-stone-700 rounded-lg"
              title="Remove Pose"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-stone-500 dark:text-stone-400">
          <span className="flex items-center gap-1 bg-stone-100 dark:bg-stone-700 px-2 py-1 rounded font-medium">{pose.category}</span>
          <span className={`flex items-center gap-1 px-2 py-1 rounded font-bold ${getLevelColor(pose.difficulty)}`}>
            Level {pose.difficulty}
          </span>
          <span className="flex items-center gap-1 font-mono">
            <Clock size={12} /> {pose.duration}
          </span>
        </div>
        <div className="mt-3 pt-3 border-t border-stone-100 dark:border-stone-700">
          <p className="text-xs text-stone-500 dark:text-stone-400 italic leading-relaxed">"{pose.teachingCue}"</p>
        </div>
      </div>
    </div>
  );
};

export default PoseCard;