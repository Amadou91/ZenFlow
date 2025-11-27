import React, { useState } from 'react';
import { Check, Edit3, ExternalLink, LogIn, X } from 'lucide-react';


const MusicConfig = ({ themes, onUpdateTheme, spotifyToken, getLoginUrl, isPremiumUser, tokenError }) => {
  const [editingId, setEditingId] = useState(null);
  const [tempLink, setTempLink] = useState('');

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-serif text-teal-900 dark:text-teal-100">Music Configuration</h2>
        {!spotifyToken ? (
           <button onClick={() => window.location.href = getLoginUrl()} className="flex items-center gap-2 px-4 py-2 bg-[#1DB954] text-white rounded-full font-bold text-sm hover:opacity-90">
             <LogIn size={16} /> Connect Spotify
           </button>
        ) : (
          <div className="flex items-center gap-2 text-[#1DB954] font-bold text-sm">
             <Check size={16} /> {isPremiumUser ? 'Spotify Premium Connected' : 'Spotify Connected'}
          </div>
        )}
      </div>

      {tokenError && <div className="mb-6 px-4 py-3 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 text-sm">{tokenError}</div>}
      {spotifyToken && !isPremiumUser && <div className="mb-6 px-4 py-3 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 text-sm">Premium is required for playback.</div>}

      <div className="grid gap-4">
        {themes.map(theme => (
          <div key={theme.id} className="bg-white dark:bg-stone-800 p-6 rounded-xl border border-stone-200 dark:border-stone-700 flex flex-col md:flex-row md:items-center gap-4 shadow-sm">
            <div className="p-3 bg-stone-100 dark:bg-stone-900 rounded-lg text-teal-600 dark:text-teal-400">{theme.icon}</div>
            <div className="flex-1"><h3 className="font-bold text-stone-900 dark:text-stone-100">{theme.name}</h3><p className="text-sm text-stone-500 dark:text-stone-400">{theme.description}</p></div>
            <div className="flex-1 md:max-w-md w-full">
              {editingId === theme.id ? (
                <div className="flex flex-col sm:flex-row gap-2">
                  <input type="text" value={tempLink} onChange={(e) => setTempLink(e.target.value)} className="flex-1 p-2 rounded border border-teal-500 bg-white dark:bg-stone-900 dark:text-white text-sm outline-none" />
                  <div className="flex gap-2"><button onClick={() => { onUpdateTheme(theme.id, tempLink); setEditingId(null); }} className="p-2 bg-teal-600 text-white rounded"><Check size={18}/></button><button onClick={() => setEditingId(null)} className="p-2 bg-stone-200 dark:bg-stone-700 rounded"><X size={18}/></button></div>
                </div>
              ) : (
                <div className="flex items-center justify-between bg-stone-50 dark:bg-stone-900 p-2 rounded border border-stone-200 dark:border-stone-700">
                  <span className="text-xs text-stone-500 truncate flex-1 mr-2 opacity-70">{theme.link || 'No link configured'}</span>
                  <div className="flex gap-1">
                    {theme.link && <a href={theme.link} target="_blank" rel="noreferrer" className="p-1.5 text-stone-400 hover:text-teal-500"><ExternalLink size={14} /></a>}
                    <button onClick={() => { setEditingId(theme.id); setTempLink(theme.link); }} className="p-1.5 text-stone-400 hover:text-teal-500"><Edit3 size={14} /></button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MusicConfig;
