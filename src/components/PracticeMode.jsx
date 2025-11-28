import React, { useEffect, useState } from 'react';
import { Activity, Pause, Play, SkipBack, SkipForward, X, ExternalLink, Check } from 'lucide-react';
import PoseIcon from './PoseIcon';
import { parseSpotifyUri, playSpotifyTrack, transferPlaybackToDevice } from '../utils/spotify';

const PracticeMode = ({ sequence, practiceIndex, timerSeconds, isTimerRunning, setIsTimerRunning, nextPracticePose, prevPracticePose, autoContinue, setAutoContinue, onClose, musicTheme, player, deviceId, ensureAccessToken, isPremiumUser, onPlaybackStatus, currentTrack, onAddTime }) => {
  const current = sequence[practiceIndex];
  // Removed unused 'next' variable
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const userAgent = typeof window.navigator === "undefined" ? "" : navigator.userAgent;
      const mobile = Boolean(userAgent.match(/Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i));
      setIsMobile(mobile || window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => { setIsTimerRunning(false); }, [setIsTimerRunning]);

  const handlePlayMusic = async () => {
     if (!musicTheme.link) return;
     if (isMobile) { onPlaybackStatus?.('Opening Spotify...'); window.location.href = musicTheme.link; return; }
     if (!player || !deviceId) return;
     onPlaybackStatus?.('Initializing playback...');
     try {
        const token = await ensureAccessToken();
        if (!token || !isPremiumUser) { onPlaybackStatus?.('Premium required.'); return; }
        const uri = parseSpotifyUri(musicTheme.link);
        if (!uri) return;
        await transferPlaybackToDevice(token, deviceId, false);
        await new Promise(resolve => setTimeout(resolve, 500));
        await playSpotifyTrack(token, deviceId, uri);
        onPlaybackStatus?.('Playing...');
     } catch (err) { console.error("Playback failed:", err); }
  };

  const progressPercent = (timerSeconds / (current.timerVal || 60)) * 100;

  return (
    <div className="fixed inset-0 h-[100dvh] w-full z-[100] bg-stone-900 text-stone-100 flex flex-col animate-in fade-in overflow-hidden">
      <div className="absolute inset-0 opacity-10 pointer-events-none">
         <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-teal-900/30 rounded-full blur-[150px] animate-float"></div>
         <div className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] bg-stone-800/50 rounded-full blur-[150px] animate-float" style={{animationDelay: '2s'}}></div>
      </div>

      <style>{`.no-scrollbar::-webkit-scrollbar { display: none; }`}</style>

      <div className="flex justify-between items-center px-6 py-4 relative z-20">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-stone-800 flex items-center justify-center text-teal-500 animate-pulse"><Activity size={20} /></div>
          <div><span className="font-serif font-bold text-lg text-stone-100">Live Session</span><div className="h-1 w-full bg-stone-800 rounded-full mt-1 overflow-hidden"><div className="h-full bg-teal-500 transition-all duration-500" style={{ width: `${((practiceIndex + 1) / sequence.length) * 100}%` }}></div></div></div>
        </div>
        <button onClick={onClose} className="p-3 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md transition-colors"><X size={20} /></button>
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center relative w-full min-h-0 overflow-y-auto px-6 py-4 no-scrollbar z-10">
        <div className="flex flex-col lg:flex-row items-center justify-center w-full gap-8 lg:gap-24">
            
            <div className="flex flex-col items-center gap-8 shrink-0">
                <div className="relative">
                    <div className="absolute inset-0 bg-teal-500/20 rounded-full blur-2xl animate-pulse"></div>
                    <div className="w-40 h-40 sm:w-56 sm:h-56 bg-stone-800/80 backdrop-blur-xl rounded-full flex items-center justify-center border border-stone-700 shadow-2xl relative z-10">
                        <PoseIcon category={current.category} className="w-20 h-20 sm:w-28 sm:h-28 text-teal-400 opacity-90" />
                    </div>
                </div>
                
                <div className="text-center space-y-2">
                    <h1 className="text-4xl sm:text-6xl font-serif font-bold text-white tracking-tight">{current.name}</h1>
                    <p className="text-xl text-stone-400 italic font-serif">{current.sanskrit}</p>
                </div>

                <div className="relative cursor-pointer group" onClick={() => onAddTime && onAddTime()} title="Add time">
                    <div className="text-7xl sm:text-8xl font-mono font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-stone-500 tracking-tighter transition-all group-hover:scale-105">
                        {Math.floor(timerSeconds / 60)}:{String(timerSeconds % 60).padStart(2, '0')}
                    </div>
                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-bold uppercase tracking-widest text-stone-500 opacity-0 group-hover:opacity-100 transition-opacity">Tap to add 10s</div>
                </div>
            </div>

            <div className="w-full max-w-md bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 p-8 text-center lg:text-left">
                <h4 className="text-xs font-bold uppercase tracking-widest text-teal-500 mb-3">Guidance</h4>
                <p className="text-lg text-stone-200 leading-relaxed font-light">"{current.teachingCue}"</p>
            </div>
        </div>
      </div>

      <div className="px-6 pb-8 pt-4 relative z-20">
        <div className="max-w-4xl mx-auto flex flex-col gap-6">
          <div className="w-full h-1 bg-stone-800 rounded-full overflow-hidden">
             <div className="h-full bg-teal-500 transition-all duration-1000 ease-linear" style={{ width: `${progressPercent}%` }}></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-6">
             <div className="order-2 md:order-1 flex justify-center md:justify-start">
                <div onClick={handlePlayMusic} className="flex items-center gap-3 bg-stone-800/60 hover:bg-stone-800 px-4 py-2 rounded-full cursor-pointer transition-colors border border-stone-700/50">
                    <div className={`w-2 h-2 rounded-full ${currentTrack ? 'bg-green-500 animate-pulse' : 'bg-stone-600'}`}></div>
                    <span className="text-xs font-bold text-stone-300 uppercase tracking-wide truncate max-w-[150px]">
                        {isMobile ? (musicTheme?.name || 'Music') : (currentTrack?.name || musicTheme?.name || 'Music')}
                    </span>
                    {isMobile && <ExternalLink size={12} className="text-stone-500"/>}
                </div>
             </div>

             <div className="order-1 md:order-2 flex justify-center items-center gap-8">
                <button onClick={prevPracticePose} disabled={practiceIndex === 0} className="p-4 rounded-full hover:bg-white/10 text-stone-400 hover:text-white transition-colors disabled:opacity-30"><SkipBack size={28} /></button>
                
                <button onClick={() => setIsTimerRunning(!isTimerRunning)} className="w-20 h-20 bg-stone-100 text-stone-900 rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                  {isTimerRunning ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
                </button>
                
                <button onClick={nextPracticePose} className="p-4 rounded-full hover:bg-white/10 text-stone-400 hover:text-white transition-colors"><SkipForward size={28} /></button>
             </div>

             <div className="order-3 flex justify-center md:justify-end items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer group">
                   <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${autoContinue ? 'bg-teal-600 border-teal-600' : 'border-stone-600 group-hover:border-stone-500'}`}>
                      {autoContinue && <Check size={14} className="text-white" />}
                   </div>
                   <span className="text-xs font-bold uppercase tracking-wider text-stone-500 group-hover:text-stone-300 transition-colors">Auto-Next</span>
                   <input type="checkbox" checked={autoContinue} onChange={(e) => setAutoContinue(e.target.checked)} className="hidden" />
                </label>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PracticeMode;