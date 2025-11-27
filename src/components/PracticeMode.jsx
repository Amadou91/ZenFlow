import React, { useEffect, useState } from 'react';
import { Activity, Music, Pause, Play, SkipBack, SkipForward, X, ExternalLink } from 'lucide-react';
import PoseIcon from './PoseIcon';
import { parseSpotifyUri, playSpotifyTrack, transferPlaybackToDevice } from '../utils/spotify';

const PracticeMode = ({ sequence, practiceIndex, timerSeconds, isTimerRunning, setIsTimerRunning, nextPracticePose, prevPracticePose, autoContinue, setAutoContinue, onClose, musicTheme, spotifyToken, player, deviceId, playerError, ensureAccessToken, isPremiumUser, onPlaybackStatus, playbackStatus, currentTrack, isPaused }) => {
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

     // Mobile: Deep link to Spotify App
     if (isMobile) {
        onPlaybackStatus?.('Opening Spotify...');
        window.location.href = musicTheme.link;
        return;
     }

     // Desktop: SDK Playback
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

  return (
    // h-[100dvh] fixes Safari bottom bar overlap issues
    <div className="fixed inset-0 h-[100dvh] w-full z-[100] bg-stone-900 text-stone-100 flex flex-col animate-in fade-in duration-300 overflow-hidden">
      
      {/* Header - Fixed Height */}
      <div className="flex justify-between items-center px-4 py-3 border-b border-stone-800 bg-stone-900 shrink-0 z-20 h-14 sm:h-16">
        <div className="flex items-center gap-3">
          <div className="bg-teal-900/30 p-1.5 sm:p-2 rounded-lg"><Activity className="text-teal-400" size={18} /></div>
          <div><span className="font-bold tracking-widest uppercase text-xs sm:text-sm block text-teal-400">Live Session</span><span className="text-[10px] sm:text-xs text-stone-400">Pose {practiceIndex + 1} of {sequence.length}</span></div>
        </div>
        <button 
          onClick={onClose} 
          className="p-2 hover:bg-stone-800 rounded-full text-stone-400 hover:text-white min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation"
        >
          <X size={20} />
        </button>
      </div>
      
      {/* Main Content - Flex Column ensuring center content visibility */}
      <div className="flex-1 flex flex-col items-center relative w-full min-h-0 overflow-y-auto overscroll-none px-4 py-2 sm:px-6 sm:py-4">
        <div className="absolute inset-0 opacity-5 pointer-events-none flex items-center justify-center">
          <PoseIcon category={current.category} className="w-[80%] h-[80%] text-teal-500" />
        </div>
        
        {/* Content Stack - Evenly spaced but prioritizing center */}
        <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md mx-auto gap-2 sm:gap-6 min-h-[300px]">
            
            {/* Top: Icon & Name */}
            <div className="relative z-10 flex flex-col items-center gap-2 shrink-0">
            <div className="w-16 h-16 sm:w-24 sm:h-24 bg-stone-800/50 rounded-full flex items-center justify-center backdrop-blur-sm border-2 border-stone-700 text-teal-400 shadow-2xl">
                <PoseIcon category={current.category} className="w-8 h-8 sm:w-12 sm:h-12" />
            </div>
            <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl sm:text-4xl font-serif text-white tracking-tight leading-tight mb-0.5">{current.name}</h1>
                <p className="text-sm sm:text-lg text-stone-400 italic font-serif">{current.sanskrit}</p>
            </div>
            </div>

            {/* Middle: Timer */}
            <div className="relative z-10 shrink-0 my-1 sm:my-2">
                <div className="relative w-28 h-28 sm:w-40 sm:h-40 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90 drop-shadow-2xl" viewBox="0 0 160 160"><circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-stone-800" /><circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-teal-500 transition-all duration-1000 ease-linear" strokeDasharray={440} strokeDashoffset={440 - (440 * timerSeconds) / (current.timerVal || 60)} /></svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl sm:text-5xl font-mono font-bold text-white leading-none">{Math.floor(timerSeconds / 60)}:{String(timerSeconds % 60).padStart(2, '0')}</span>
                    <span className="text-[10px] uppercase tracking-widest text-teal-500 font-bold mt-1">{current.duration}</span>
                </div>
                </div>
            </div>

            {/* Bottom: Teaching Cues */}
            <div className="relative z-10 w-full bg-stone-800/60 backdrop-blur-sm rounded-xl border border-stone-700/50 p-3 sm:p-5 shrink-0">
                <p className="text-sm sm:text-lg leading-relaxed text-stone-200 font-medium text-center line-clamp-3 sm:line-clamp-none">
                    {current.teachingCue}
                </p>
            </div>
        </div>
      </div>

      {/* Footer - Compressed & Optimized Layout */}
      <div className="bg-stone-900 border-t border-stone-800 px-4 pt-3 pb-safe sm:p-6 relative z-10 shrink-0 w-full">
        <div className="max-w-5xl mx-auto flex flex-col gap-3 sm:grid sm:grid-cols-3 sm:gap-4 items-center">
          
          {/* Mobile: Player & Next stacked horizontally for space */}
          {/* Desktop: Player Left, Next Right */}
          
          {/* 1. Controls (Center on Desktop, Top on Mobile) */}
          <div className="order-1 md:order-2 w-full flex flex-col items-center gap-2">
            <div className="flex items-center justify-center gap-6 sm:gap-8 w-full">
                <button 
                  onClick={prevPracticePose} 
                  disabled={practiceIndex === 0} 
                  className={`p-3 rounded-full transition-colors touch-manipulation ${practiceIndex === 0 ? 'text-stone-600 cursor-not-allowed' : 'bg-stone-800 text-stone-400 hover:text-white'}`}
                >
                  <SkipBack size={20} />
                </button>
                <button 
                  onClick={() => setIsTimerRunning(!isTimerRunning)} 
                  className="w-14 h-14 sm:w-16 sm:h-16 bg-teal-600 hover:bg-teal-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-teal-900/50 transition-all hover:scale-105 active:scale-95 touch-manipulation"
                >
                  {isTimerRunning ? <Pause className="w-6 h-6 sm:w-8 sm:h-8" /> : <Play className="w-6 h-6 sm:w-8 sm:h-8 ml-1" />}
                </button>
                <button 
                  onClick={nextPracticePose} 
                  className="p-3 bg-stone-800 hover:bg-stone-700 rounded-full transition-colors text-stone-400 hover:text-white touch-manipulation"
                >
                  <SkipForward size={20} />
                </button>
            </div>
          </div>

          {/* 2. Bottom Row for Mobile: Player + Up Next */}
          <div className="order-2 md:order-1 w-full flex justify-between items-center gap-3 sm:grid sm:grid-cols-2 md:flex md:col-span-2 md:justify-between">
             
             {/* Music Player */}
             <div className="flex-1 min-w-0 max-w-[200px] sm:max-w-xs">
                {(spotifyToken && deviceId) || isMobile ? (
                <div 
                    onClick={handlePlayMusic}
                    className="flex items-center gap-2.5 bg-black/40 p-1.5 pr-3 rounded-lg border border-stone-800 w-full cursor-pointer hover:bg-black/60 transition-colors group"
                >
                    {/* Icon Logic: Album Art (Desktop) > Theme Icon (Mobile) > Generic Music */}
                    {!isMobile && currentTrack?.album?.images?.[0]?.url ? (
                        <img src={currentTrack.album.images[0].url} alt="Album Art" className="w-8 h-8 rounded bg-stone-800 object-cover" />
                    ) : (
                        // Fallback to Theme Icon or Generic Music, styled nicely
                        <div className="w-8 h-8 rounded flex items-center justify-center bg-stone-800 text-teal-500 shrink-0">
                            {musicTheme?.icon ? (
                                // We need to clone the element to adjust size/color if it's a React Element
                                React.cloneElement(musicTheme.icon, { size: 16, className: "text-teal-400" })
                            ) : (
                                <Music size={16} className="text-stone-400" />
                            )}
                        </div>
                    )}
                    
                    <div className="flex-1 min-w-0 overflow-hidden flex flex-col justify-center">
                        <p className="text-[10px] sm:text-xs font-bold text-stone-300 truncate leading-tight group-hover:text-white transition-colors">
                            {isMobile ? (musicTheme?.name || 'Select Music') : (currentTrack?.name || musicTheme?.name || 'Select Playlist')}
                        </p>
                        <div className="flex items-center gap-1 text-[10px] font-bold text-[#1DB954] group-hover:text-[#1ed760] transition-colors">
                            <span>{isMobile ? 'OPEN APP' : (currentTrack ? 'RESUME' : 'START')}</span>
                            {isMobile ? <ExternalLink size={8} /> : <Play size={8} fill="currentColor" />}
                        </div>
                    </div>
                </div>
                ) : (
                <div className="text-stone-600 text-[10px] italic pl-1">Music Ready</div>
                )}
             </div>

             {/* Up Next (Mobile Compressed) */}
             <div className="flex items-center gap-2 text-right opacity-80 hover:opacity-100 transition-opacity group cursor-pointer max-w-[40%] sm:max-w-none justify-end" onClick={nextPracticePose}>
                <div className="flex-1 min-w-0 hidden xs:block">
                  <span className="text-[9px] uppercase tracking-wider block text-teal-500 font-bold leading-none mb-0.5">Next</span>
                  <span className="font-bold text-xs text-white block truncate">{next ? next.name : 'Finish'}</span>
                </div>
                {next && (
                    <div className="w-8 h-8 bg-stone-800 rounded-lg flex items-center justify-center text-teal-500 border border-stone-700 shrink-0">
                    <PoseIcon category={next.category} className="w-4 h-4" />
                    </div>
                )}
             </div>
          </div>

          {/* Auto Continue Checkbox - Tucked away */}
          <div className="absolute top-0 right-4 -translate-y-full py-2 sm:static sm:translate-y-0 sm:py-0 sm:flex sm:justify-end order-3">
             <label className="flex items-center gap-2 text-[10px] sm:text-xs text-stone-500 cursor-pointer hover:text-white transition-colors bg-stone-900/80 px-2 py-1 rounded-t-lg sm:bg-transparent sm:p-0 backdrop-blur-sm sm:backdrop-blur-none">
                <input 
                  type="checkbox" 
                  checked={autoContinue} 
                  onChange={(e) => setAutoContinue(e.target.checked)} 
                  className="w-3 h-3 rounded accent-teal-500 bg-stone-700 border-stone-600 focus:ring-teal-500 focus:ring-offset-stone-900"
                />
                Auto-Next
            </label>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PracticeMode;