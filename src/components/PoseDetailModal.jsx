import React from 'react';
import { X } from 'lucide-react';
import PoseIcon from './PoseIcon';

const PoseDetailModal = ({ pose, onClose }) => {
  if (!pose) return null;
  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-stone-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-64 bg-stone-100 dark:bg-stone-900 relative flex items-center justify-center overflow-hidden group">
          <div className="w-32 h-32 text-teal-600 dark:text-teal-400 opacity-80">
            <PoseIcon category={pose.category} className="w-full h-full" />
          </div>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-stone-700 dark:text-white rounded-full backdrop-blur-md"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-5 md:p-8 overflow-y-auto">
          <h2 className="text-3xl font-serif text-stone-900 dark:text-white mb-1">{pose.name}</h2>
          <p className="text-stone-600 dark:text-stone-400 italic font-serif text-lg mb-4">{pose.sanskrit}</p>
          <div className="space-y-4">
            <div>
              <h3 className="font-bold">Instructions</h3>
              <p>{pose.cues}</p>
            </div>
            <div>
              <h3 className="font-bold">Benefits</h3>
              <ul className="list-disc ml-5">{pose.benefits?.map((b, i) => <li key={i}>{b}</li>)}</ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PoseDetailModal;
