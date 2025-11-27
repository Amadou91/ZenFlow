import React, { useEffect, useState } from 'react';
import { Activity, Music, Pause, Play, SkipBack, SkipForward, X, ExternalLink, Check } from 'lucide-react';
import PoseIcon from './PoseIcon';
import { parseSpotifyUri, playSpotifyTrack, transferPlaybackToDevice } from '../utils/spotify';

const PracticeMode = ({ sequence, practiceIndex, timerSeconds, isTimerRunning, setIsTimerRunning, nextPracticePose, prevPracticePose, autoContinue, setAutoContinue, onClose, musicTheme, spotifyToken, player, deviceId, playerError, ensureAccessToken, isPremiumUser, onPlaybackStatus, playbackStatus, currentTrack, isPaused, onAddTime }) => {
  const current = sequence[practiceIndex];
  const next = sequence[practiceIndex + 1];
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

     if (isMobile) {
        onPlaybackStatus?.('Opening Spotify...');
        window.location.href = musicTheme.link;
        return;
     }

     if (!player || !deviceId) return;
     
     onPlaybackStatus?.('Initializing playback...');

     try {
        const token = await ensureAccessToken();
        if (!token) { 
            onPlaybackStatus?.('Connect Spotify to play music.'); 
            return; 
        }
        if (!isPremiumUser) { 
            onPlaybackStatus?.('Premium required for playback.'); 
            return; 
        }
        
        const uri = parseSpotifyUri(musicTheme.link);
        if (!uri) {
            onPlaybackStatus?.('Invalid Spotify link.');
            return;
        }

        await transferPlaybackToDevice(token, deviceId, false);
        await new Promise(resolve => setTimeout(resolve, 500));
        await playSpotifyTrack(token, deviceId, uri);
        
        onPlaybackStatus?.('Playing...');
     } catch (err) {
         console.error("Playback failed:", err);
         onPlaybackStatus?.('Playback failed. Try opening Spotify app first.');
     }
  };

  // Style to hide scrollbar but keep functionality
  const hideScrollbarStyle = {
    scrollbarWidth: 'none', /* Firefox */
    msOverflowStyle: 'none', /* IE 10+ */
  };

  return (
    <div className="fixed inset-0 h-[100dvh] w-full z-[100] bg-stone-900 text-stone-100 flex flex-col animate-in fade-in duration-300 overflow-hidden">
      {/* Add style tag for Webkit scrollbar hiding */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>

      {/* Header */}
      <div className="flex justify-between items-center px-4 py-3 border-b border-stone-800 bg-stone-900 shrink-0 z-20 h-14 sm:h-16">
        <div className="flex items-center gap-3">
          <div className="bg-teal-900/30 p-1.5 sm:p-2 rounded-lg"><Activity className="text-teal-400" size={18} /></div>
          <div><span className="font-bold tracking-widest uppercase text-xs sm:text-sm block text-teal-400">Live Session</span><span className="text-[10px] sm:text-xs text-stone-400">Pose {practiceIndex + 1} of {sequence.length}</span></div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-stone-800 rounded-full text-stone-400 hover:text-white min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation">
          <X size={20} />
        </button>
      </div>
      
      {/* Main Content - Improved Scaling & Safe Overflow */}
      <div 
        className="flex-1 flex flex-col relative w-full min-h-0 overflow-y-auto px-4 py-2 sm:px-6 sm:py-4 no-scrollbar" 
        style={hideScrollbarStyle}
      >
        <div className="absolute inset-0 opacity-5 pointer-events-none flex items-center justify-center fixed-background">
          <PoseIcon category={current.category} className="w-[80%] h-[80%] text-teal-500" />
        </div>
        
        {/* Center Content Container - my-auto ensures vertical centering when possible, top align when overflowing */}
        <div className="flex flex-col items-center justify-center w-full max-w-4xl mx-auto my-auto gap-2 sm:gap-6 min-h-0">
            
            {/* Split View for Larger Screens (Landscape/Tablet) */}
            <div className="flex flex-col lg:flex-row items-center justify-center w-full gap-4 lg:gap-12 xl:gap-20">
                
                {/* Left Side: Pose Info & Timer */}
                <div className="flex flex-col items-center justify-center gap-3 lg:gap-8 flex-shrink-0">
                    {/* Pose Info - Slightly smaller on mobile to fit */}
                    <div className="relative z-10 flex flex-col items-center gap-2 shrink-0">
                        <div className="w-14 h-14 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-stone-800/50 rounded-full flex items-center justify-center backdrop-blur-sm border-2 border-stone-700 text-teal-400 shadow-2xl transition-all duration-300">
                            <PoseIcon category={current.category} className="w-7 h-7 sm:w-10 sm:h-10 lg:w-12 lg:h-12" />
                        </div>
                        <div className="flex flex-col items-center text-center">
                            <h1 className="text-2xl sm:text-3xl lg:text-5xl font-serif text-white tracking-tight leading-tight mb-0.5 transition-all duration-300">{current.name}</h1>
                            <p className="text-sm sm:text-base lg:text-xl text-stone-400 italic font-serif transition-all duration-300">{current.sanskrit}</p>
                        </div>
                    </div>

                    {/* Timer - Optimized mobile size */}
                    <div className="relative z-10 shrink-0 cursor-pointer active:scale-95 transition-transform touch-manipulation" 
                         onClick={() => onAddTime && onAddTime()} 
                         title="Tap to add 10 seconds">
                        <div className="relative w-28 h-28 sm:w-40 sm:h-40 lg:w-56 lg:h-56 flex items-center justify-center transition-all duration-300">
                            <svg className="w-full h-full transform -rotate-90 drop-shadow-2xl" viewBox="0 0 160 160">
                                <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-stone-800" />
                                <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-teal-500 transition-all duration-1000 ease-linear" strokeDasharray={440} strokeDashoffset={440 - (440 * timerSeconds) / (current.timerVal || 60)} />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-4xl sm:text-5xl lg:text-6xl font-mono font-bold text-white leading-none transition-all duration-300">{Math.floor(timerSeconds / 60)}:{String(timerSeconds % 60).padStart(2, '0')}</span>
                                <span className="text-[10px] sm:text-xs lg:text-sm uppercase tracking-widest text-teal-500 font-bold mt-1 lg:mt-2">{current.duration}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Cues */}
                <div className="relative z-10 w-full lg:max-w-md bg-stone-800/60 backdrop-blur-sm rounded-xl border border-stone-700/50 p-3 sm:p-6 flex items-center justify-center min-h-[80px] lg:min-h-[200px] transition-all duration-300">
                    <p className="text-sm sm:text-base lg:text-xl leading-relaxed text-stone-200 font-medium text-center lg:text-left line-clamp-4 sm:line-clamp-none">
                        {current.teachingCue}
                    </p>
                </div>
            </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-stone-900 border-t border-stone-800 px-4 pt-3 pb-safe sm:p-6 relative z-10 shrink-0 w-full">
        <div className="max-w-6xl mx-auto flex flex-col gap-4 lg:grid lg:grid-cols-3 lg:items-center lg:gap-8">
          
          {/* 1. CONTROLS */}
          <div className="order-1 lg:order-2 w-full flex flex-col items-center justify-center gap-3">
            <div className="flex items-center justify-center gap-8 w-full">
                <button onClick={prevPracticePose} disabled={practiceIndex === 0} className={`p-3 rounded-full transition-colors touch-manipulation ${practiceIndex === 0 ? 'text-stone-600 cursor-not-allowed' : 'bg-stone-800 text-stone-400 hover:text-white'}`}>
                  <SkipBack size={24} />
                </button>
                <button onClick={() => setIsTimerRunning(!isTimerRunning)} className="w-16 h-16 bg-teal-600 hover:bg-teal-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-teal-900/50 transition-all hover:scale-105 active:scale-95 touch-manipulation">
                  {isTimerRunning ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
                </button>
                <button onClick={nextPracticePose} className="p-3 bg-stone-800 hover:bg-stone-700 rounded-full transition-colors text-stone-400 hover:text-white touch-manipulation">
                  <SkipForward size={24} />
                </button>
            </div>
            
            {/* Auto Next Checkbox */}
            <label className="flex items-center gap-2 text-xs text-stone-500 cursor-pointer hover:text-stone-300 transition-colors pb-3 select-none">
              <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all duration-200 ${autoContinue ? 'bg-teal-600 border-teal-600 shadow-sm shadow-teal-900/50' : 'border-stone-600 bg-transparent'}`}>
                {autoContinue && <Check size={10} className="text-white stroke-[4]" />} 
              </div>
              <input type="checkbox" checked={autoContinue} onChange={(e) => setAutoContinue(e.target.checked)} className="hidden" />
              <span className="font-medium">Auto-Next</span>
            </label>
          </div>

          {/* 2. PLAYER */}
          <div className="order-2 lg:order-1 w-full lg:w-auto flex justify-between items-center lg:block">
             <div className="flex-1 min-w-0 max-w-[220px] sm:max-w-xs lg:max-w-[280px]">
                {(spotifyToken && deviceId) || isMobile ? (
                <div onClick={handlePlayMusic} className="flex items-center gap-3 bg-stone-800/50 p-2 pr-4 rounded-lg w-full cursor-pointer hover:bg-stone-800 transition-colors group">
                    {!isMobile && currentTrack?.album?.images?.[0]?.url ? (
                        <img src={currentTrack.album.images[0].url} alt="Album" className="w-10 h-10 rounded object-cover" />
                    ) : (
                        <div className="w-10 h-10 rounded flex items-center justify-center bg-stone-700 text-teal-500 shrink-0">
                            {musicTheme?.icon ? React.cloneElement(musicTheme.icon, { size: 20, className: "text-teal-400" }) : <Music size={20} className="text-stone-400" />}
                        </div>
                    )}
                    <div className="flex-1 min-w-0 overflow-hidden flex flex-col justify-center">
                        <p className="text-xs font-bold text-stone-200 truncate group-hover:text-white transition-colors">
                            {isMobile ? (musicTheme?.name || 'Select Music') : (currentTrack?.name || musicTheme?.name || 'Select Playlist')}
                        </p>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#1DB954] group-hover:text-[#1ed760] transition-colors uppercase tracking-wide">
                            <span>{isMobile ? 'Open Spotify' : (currentTrack ? 'Resume' : 'Start Music')}</span>
                            {isMobile ? <ExternalLink size={10} /> : <Play size={10} fill="currentColor" />}
                        </div>
                    </div>
                </div>
                ) : (
                <div className="text-stone-600 text-xs italic">Music Ready</div>
                )}
             </div>

             <div className="flex lg:hidden items-center gap-3 text-right opacity-90 hover:opacity-100 transition-opacity cursor-pointer" onClick={nextPracticePose}>
                <div className="flex-1 min-w-0 flex flex-col items-end">
                  <span className="text-[10px] uppercase tracking-wider text-teal-500 font-bold">Next</span>
                  <span className="font-bold text-xs text-white block truncate max-w-[100px]">{next ? next.name : 'Finish'}</span>
                </div>
                {next && <div className="w-10 h-10 bg-stone-800 rounded-lg flex items-center justify-center text-teal-500 border border-stone-700 shrink-0"><PoseIcon category={next.category} className="w-5 h-5" /></div>}
             </div>
          </div>

          {/* 3. UP NEXT */}
          <div className="hidden lg:flex order-3 justify-end items-center w-full">
             <div className="flex items-center gap-4 text-right opacity-70 hover:opacity-100 transition-opacity cursor-pointer group" onClick={nextPracticePose}>
                <div className="flex flex-col items-end">
                  <span className="text-xs uppercase tracking-wider text-teal-500 font-bold mb-0.5">Up Next</span>
                  <span className="font-bold text-sm text-white">{next ? next.name : 'Finish Flow'}</span>
                </div>
                {next && (
                    <div className="w-12 h-12 bg-stone-800 rounded-xl flex items-center justify-center text-teal-500 border border-stone-700 group-hover:border-teal-500/50 transition-colors">
                      <PoseIcon category={next.category} className="w-6 h-6" />
                    </div>
                )}
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PracticeMode;