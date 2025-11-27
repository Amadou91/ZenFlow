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
        // Construct a universal link or URI scheme
        // musicTheme.link is likely an http link (http://open.spotify.com/...)
        // We can try to open it directly, which usually triggers the app intent on mobile.
        window.location.href = musicTheme.link;
        return;
     }

     // Desktop: SDK Playback
     if (!player || !deviceId) return;
     
     // Optimistic feedback
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

        // 1. Activate device first. 
        await transferPlaybackToDevice(token, deviceId, false);
        
        // Short delay to allow device to become active
        await new Promise(resolve => setTimeout(resolve, 500));

        // 2. Send specific play command
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
      <div className="flex justify-between items-center p-4 border-b border-stone-800 bg-stone-900 shrink-0 z-20 h-16">
        <div className="flex items-center gap-3">
          <div className="bg-teal-900/30 p-2 rounded-lg"><Activity className="text-teal-400" size={20} /></div>
          <div><span className="font-bold tracking-widest uppercase text-sm block text-teal-400">Live Session</span><span className="text-xs text-stone-400">Pose {practiceIndex + 1} of {sequence.length}</span></div>
        </div>
        <button 
          onClick={onClose} 
          className="p-2 hover:bg-stone-800 rounded-full text-stone-400 hover:text-white min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation"
        >
          <X size={24} />
        </button>
      </div>
      
      {/* Main Content - Flexible with safe padding */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 text-center relative w-full min-h-0 gap-4 sm:gap-8">
        <div className="absolute inset-0 opacity-5 pointer-events-none flex items-center justify-center">
          <PoseIcon category={current.category} className="w-[80%] h-[80%] text-teal-500" />
        </div>
        
        {/* Top Section: Icon & Name */}
        <div className="relative z-10 flex flex-col items-center gap-2 shrink-0 mt-auto sm:mt-0">
           <div className="w-[clamp(5rem,15vh,9rem)] h-[clamp(5rem,15vh,9rem)] bg-stone-800/50 rounded-full flex items-center justify-center backdrop-blur-sm border-2 border-stone-700 text-teal-400 shadow-2xl">
             <PoseIcon category={current.category} className="w-[60%] h-[60%]" />
           </div>
           <div className="flex flex-col items-center">
             <h1 className="text-[clamp(1.75rem,4vh,3.5rem)] font-serif text-white tracking-tight leading-none mb-1">{current.name}</h1>
             <p className="text-[clamp(1rem,2vh,1.25rem)] text-stone-400 italic font-serif">{current.sanskrit}</p>
           </div>
        </div>

        {/* Middle Section: Timer */}
        <div className="relative z-10 shrink-0">
            <div className="relative w-[clamp(7rem,18vh,12rem)] h-[clamp(7rem,18vh,12rem)] flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90 drop-shadow-2xl" viewBox="0 0 160 160"><circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-stone-800" /><circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-teal-500 transition-all duration-1000 ease-linear" strokeDasharray={440} strokeDashoffset={440 - (440 * timerSeconds) / (current.timerVal || 60)} /></svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[clamp(2rem,5vh,3.5rem)] font-mono font-bold text-white leading-none">{Math.floor(timerSeconds / 60)}:{String(timerSeconds % 60).padStart(2, '0')}</span>
                <span className="text-[10px] uppercase tracking-widest text-teal-500 font-bold mt-1">{current.duration}</span>
              </div>
            </div>
        </div>

        {/* Bottom Section: Teaching Cues - Push to bottom but keep visible */}
        <div className="relative z-10 w-full max-w-2xl bg-stone-800/60 backdrop-blur-sm rounded-xl border border-stone-700/50 p-4 shrink-0 mb-auto sm:mb-0">
           <p className="text-[clamp(0.875rem,2vh,1.15rem)] leading-relaxed text-stone-200 font-medium line-clamp-3 sm:line-clamp-none">
             {current.teachingCue}
           </p>
        </div>
      </div>

      {/* Footer - Fixed height with Safe Area padding for iOS */}
      <div className="bg-stone-900 border-t border-stone-800 p-4 pb-safe sm:p-6 relative z-10 shrink-0">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          
          {/* Left: Music Player */}
          <div className="flex order-3 md:order-1 justify-center md:justify-start">
             {/* Show player UI if token/deviceId exists OR if on mobile (since we allow deep linking) */}
             {(spotifyToken && deviceId) || isMobile ? (
               <div className="flex items-center gap-3 bg-black/50 p-2 pr-4 rounded-xl border border-stone-700 w-full max-w-xs">
                  {/* Album Art: Show on desktop if playing, otherwise generic */}
                  {!isMobile && currentTrack?.album?.images?.[0]?.url ? (
                    <img src={currentTrack.album.images[0].url} alt={currentTrack.name} className="w-10 h-10 rounded-lg object-cover border border-stone-700" />
                  ) : (
                    <div className="p-2 bg-[#1DB954] text-white rounded-lg"><Music size={16} /></div>
                  )}
                  
                  <div className="text-left flex-1 min-w-0 overflow-hidden">
                    <p className="text-xs font-bold text-white truncate">
                        {isMobile ? (musicTheme?.name || 'Play Music') : (currentTrack?.name || musicTheme?.name || 'Start Playlist')}
                    </p>
                    <button 
                        onClick={handlePlayMusic} 
                        className="text-[10px] font-semibold text-[#1DB954] hover:text-white flex items-center gap-1 touch-manipulation"
                    >
                        {isMobile ? 'Open Spotify' : (currentTrack ? 'Resume' : 'Start')} 
                        {isMobile ? <ExternalLink size={10} /> : <Play size={8} fill="currentColor" />}
                    </button>
                  </div>
                  
                  {/* Controls only for Desktop */}
                  {!isMobile && player && (
                    <button onClick={() => player.togglePlay()} className="p-2 hover:bg-white/10 rounded-full touch-manipulation">
                      {isPaused ? <Play size={14} fill="currentColor" className="ml-0.5" /> : <Pause size={14} />}
                    </button>
                  )}
               </div>
             ) : (
               <div className="text-stone-600 text-xs italic">
                 {!spotifyToken ? "Music Ready" : (playerError ? `Error: ${playerError}` : (playbackStatus || "Connecting..."))}
               </div>
             )}
          </div>

          {/* Center: Controls */}
          <div className="order-1 md:order-2 flex flex-col items-center justify-center gap-3">
            <div className="flex items-center justify-center gap-6">
                <button 
                  onClick={prevPracticePose} 
                  disabled={practiceIndex === 0} 
                  className={`p-4 sm:p-3 rounded-full transition-colors touch-manipulation ${practiceIndex === 0 ? 'text-stone-600 cursor-not-allowed' : 'hover:bg-stone-800 text-stone-400 hover:text-white'}`}
                >
                  <SkipBack size={28} />
                </button>
                <button 
                  onClick={() => setIsTimerRunning(!isTimerRunning)} 
                  className="w-16 h-16 bg-teal-600 hover:bg-teal-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-teal-900/50 transition-all hover:scale-105 active:scale-95 touch-manipulation"
                >
                  {isTimerRunning ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
                </button>
                <button 
                  onClick={nextPracticePose} 
                  className="p-4 sm:p-3 hover:bg-stone-800 rounded-full transition-colors text-stone-400 hover:text-white touch-manipulation"
                >
                  <SkipForward size={28} />
                </button>
            </div>
            <label className="flex items-center gap-2 text-xs text-stone-400 cursor-pointer hover:text-white transition-colors py-2">
                <input 
                  type="checkbox" 
                  checked={autoContinue} 
                  onChange={(e) => setAutoContinue(e.target.checked)} 
                  className="w-4 h-4 rounded accent-teal-500 bg-stone-700 border-stone-600 focus:ring-teal-500 focus:ring-offset-stone-900 touch-manipulation"
                />
                Auto Continue
            </label>
          </div>

          {/* Right: Up Next */}
          <div className="order-2 md:order-3 flex justify-center md:justify-end w-full">
            {next ? (
              <div className="flex items-center gap-3 text-right opacity-80 hover:opacity-100 transition-opacity group cursor-pointer max-w-[200px] sm:max-w-[250px]" onClick={nextPracticePose}>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] uppercase tracking-wider block text-teal-500 font-bold">Up Next</span>
                  <span className="font-bold text-sm text-white block truncate">{next.name}</span>
                </div>
                <div className="w-10 h-10 bg-stone-800 rounded-lg flex items-center justify-center text-teal-500 border border-stone-700 group-hover:border-teal-500/50 shrink-0">
                  <PoseIcon category={next.category} className="w-5 h-5" />
                </div>
              </div>
            ) : (
              <div className="text-stone-500 text-sm italic">Namaste</div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default PracticeMode;