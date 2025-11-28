import React, { useState } from 'react';
import { Edit3, Check, X, ExternalLink } from 'lucide-react';

const MusicConfig = ({ themes, onUpdateTheme, spotifyToken, getLoginUrl, isPremiumUser, tokenError }) => {
  const [editingId, setEditingId] = useState(null);
  const [tempLink, setTempLink] = useState('');

  return (
    <div className="space-y-3">
      {!spotifyToken && (
        <button
          onClick={() => window.location.href = getLoginUrl()}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white rounded-full font-bold text-sm hover:brightness-110 shadow-card"
        >
          Connect Spotify
        </button>
      )}
      {tokenError && <p className="text-sm text-rose-500">{tokenError}</p>}
      {!isPremiumUser && <p className="text-sm theme-muted">A Spotify premium account is required to stream full tracks.</p>}
      <div className="space-y-3">
        {themes.map(theme => (
          <div key={theme.id} className="theme-card p-6 rounded-xl flex flex-col md:flex-row md:items-center gap-4">
            <div className="p-3 bg-[color-mix(in_srgb,var(--color-card)88%,transparent)] rounded-lg text-[var(--color-primary)] border border-[color-mix(in_srgb,var(--color-text)10%,transparent)]">
              {theme.icon}
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-[var(--color-text)]">{theme.name}</h3>
              <p className="text-sm theme-muted">{theme.description}</p>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
              {editingId === theme.id ? (
                <>
                  <input
                    type="text"
                    value={tempLink}
                    onChange={(e) => setTempLink(e.target.value)}
                    className="flex-1 p-2 rounded border border-[var(--color-primary)] bg-[color-mix(in_srgb,var(--color-card)90%,transparent)] text-[var(--color-text)] text-sm outline-none"
                    placeholder="Playlist or track URL"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => { onUpdateTheme(theme.id, tempLink); setEditingId(null); }}
                      className="p-2 bg-[var(--color-primary)] text-white rounded"
                    >
                      <Check size={18} />
                    </button>
                    <button onClick={() => setEditingId(null)} className="p-2 bg-[color-mix(in_srgb,var(--color-card)92%,transparent)] rounded border border-[color-mix(in_srgb,var(--color-text)10%,transparent)]">
                      <X size={18} />
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-between bg-[color-mix(in_srgb,var(--color-card)92%,transparent)] p-2 rounded border border-[color-mix(in_srgb,var(--color-text)10%,transparent)] w-full md:w-auto">
                  <span className="text-xs theme-muted truncate flex-1 mr-2 opacity-80">{theme.link || 'No link configured'}</span>
                  <div className="flex items-center gap-2">
                    {theme.link && (
                      <a
                        href={theme.link}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 text-[color-mix(in_srgb,var(--color-muted)75%,transparent)] hover:text-[var(--color-primary)]"
                      >
                        <ExternalLink size={14} />
                      </a>
                    )}
                    <button onClick={() => { setEditingId(theme.id); setTempLink(theme.link); }} className="p-1.5 text-[color-mix(in_srgb,var(--color-muted)75%,transparent)] hover:text-[var(--color-primary)]">
                      <Edit3 size={14} />
                    </button>
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
