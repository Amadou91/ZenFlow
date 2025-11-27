import React, { useState, useEffect, useCallback } from 'react';
import { Menu, X, PlayCircle, RefreshCw, Settings, Heart, Printer, Sun, Moon, Music, Activity, BookOpen, LogOut, LogIn, Layers, Target, Zap, Anchor, Wind, Trash2 } from 'lucide-react';
import PoseCard from './components/PoseCard';
import PoseLibrary from './components/PoseLibrary';
import MusicConfig from './components/MusicConfig';
import PracticeMode from './components/PracticeMode';
import PoseDetailModal from './components/PoseDetailModal';
import PrintLayout from './components/PrintLayout';
import useSpotifyPlayer from './hooks/useSpotifyPlayer';
import { POSE_CATEGORIES, TIMING_CONFIG, POSE_LIBRARY, DEFAULT_MUSIC_THEMES } from './data/poses';
import { SEQUENCE_METHODS, PEAK_POSES, THEMES, TARGET_AREAS } from './constants/sequence';
import { API_BASE, getLoginUrl, transferPlaybackToDevice, fetchSpotifyProfile } from './utils/spotify';

// --- MAIN APP COMPONENT ---

export default function YogaApp() {
  const [activeTab, setActiveTab] = useState('generator'); 
  const [isPrinting, setIsPrinting] = useState(false); // State for print mode
  
  // Theme State
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('zenflow_theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false; // Default light
  });

  // Persist theme
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('zenflow_theme', darkMode ? 'dark' : 'light');
      if (darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [darkMode]);

  // Initialize sequence from local storage if available
  const [sequence, setSequence] = useState(() => {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem('yoga_in_progress');
    return saved ? JSON.parse(saved).poses : [];
  });

  // Initialize params from local storage if available
  const [params, setParams] = useState(() => {
    const defaultParams = { duration: 60, difficulty: 'Intermediate', style: 'Vinyasa', filters: { noWrists: false, kneeFriendly: false, pregnancySafe: false }, method: SEQUENCE_METHODS.STANDARD, selectedPeakPose: PEAK_POSES[0]?.id || '', selectedTheme: THEMES[0].id, selectedTarget: TARGET_AREAS[0].id };
    if (typeof window === 'undefined') return defaultParams;
    const saved = localStorage.getItem('yoga_in_progress');
    return saved ? JSON.parse(saved).params : defaultParams;
  });

  const [savedSequences, setSavedSequences] = useState(() => { if (typeof window !== 'undefined') { const saved = localStorage.getItem('yoga_saved_sequences'); return saved ? JSON.parse(saved) : []; } return []; });
  
  // Track ongoing practice state
  const [inProgress, setInProgress] = useState(() => {
    if (typeof window === 'undefined') return null;
    const saved = localStorage.getItem('yoga_in_progress');
    return saved ? JSON.parse(saved) : null;
  });

  // Auto Continue State
  const [autoContinue, setAutoContinue] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('zenflow_auto_continue');
      return saved === 'true';
    }
    return false;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('zenflow_auto_continue', autoContinue);
    }
  }, [autoContinue]);

  const [musicThemes, setMusicThemes] = useState(() => { if (typeof window !== 'undefined') { const saved = localStorage.getItem('yoga_music_themes'); if (saved) { const parsed = JSON.parse(saved); return DEFAULT_MUSIC_THEMES.map(def => { const savedTheme = parsed.find(s => s.id === def.id); return savedTheme ? { ...def, link: savedTheme.link } : def; }); } } return DEFAULT_MUSIC_THEMES; });
  const updateMusicTheme = (id, newLink) => { const updated = musicThemes.map(t => t.id === id ? { ...t, link: newLink } : t); setMusicThemes(updated); localStorage.setItem('yoga_music_themes', JSON.stringify(updated.map(({ id, link }) => ({ id, link })))); };
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => typeof window !== 'undefined' ? window.innerWidth >= 1024 : true);
  const [isTeacherMode, setIsTeacherMode] = useState(false);
  const [selectedMusicId, setSelectedMusicId] = useState(musicThemes[0].id);
  const [spotifyStatus, setSpotifyStatus] = useState('');
  
  // Practice State - initialized from storage
  const [practiceIndex, setPracticeIndex] = useState(() => {
    if (typeof window === 'undefined') return 0;
    const saved = localStorage.getItem('yoga_in_progress');
    return saved ? (JSON.parse(saved).currentIndex || 0) : 0;
  });
  
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [selectedPose, setSelectedPose] = useState(null);

  // --- AUTH STATE ---
  const [spotifyToken, setSpotifyToken] = useState(null);
  const [tokenExpiry, setTokenExpiry] = useState(null);
  const [spotifyProfile, setSpotifyProfile] = useState(null);
  const [tokenError, setTokenError] = useState(null);
  const isPremiumUser = spotifyProfile?.product === 'premium';

  // --- TOKEN MANAGEMENT ---

  const storeToken = useCallback((token, expiresAt) => {
    setSpotifyToken(token);
    setTokenExpiry(expiresAt);
    if (typeof window !== 'undefined') {
      localStorage.setItem('spotify_access_token', token);
      localStorage.setItem('spotify_token_expiry', String(expiresAt));
    }
  }, []);

  const clearStoredToken = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('spotify_access_token');
      localStorage.removeItem('spotify_token_expiry');
    }
  }, []);

  // 1. Refresh Token
  const refreshAccessToken = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/spotify/refresh`, { credentials: 'include' });
      if (!res.ok) throw new Error('Refresh failed');
      const data = await res.json();
      const expiresAt = Date.now() + (data.expires_in || 3600) * 1000;
      storeToken(data.access_token, expiresAt);
      setTokenError(null);
      return data.access_token;
    } catch (err) {
      console.error('Auto-refresh failed', err);
      clearStoredToken();
      setSpotifyToken(null);
      return null;
    }
  }, [clearStoredToken, storeToken]);

  // 2. Initial Load
  useEffect(() => {
    const initAuth = async () => {
      const searchParams = new URLSearchParams(window.location.search);
      const tokenFromUrl = searchParams.get('access_token');
      const expiresInFromUrl = searchParams.get('expires_in');
      const errorFromUrl = searchParams.get('error');

      if (errorFromUrl) {
        setTokenError('Authentication failed. Please try again.');
        window.history.replaceState({}, '', window.location.pathname);
        return;
      }

      if (tokenFromUrl) {
        const expiresAt = Date.now() + (Number(expiresInFromUrl) || 3600) * 1000;
        storeToken(tokenFromUrl, expiresAt);
        window.history.replaceState({}, '', window.location.pathname);
        return;
      }

      const storedToken = localStorage.getItem('spotify_access_token');
      const storedExpiry = Number(localStorage.getItem('spotify_token_expiry') || '0');

      if (storedToken && storedExpiry > Date.now()) {
        setSpotifyToken(storedToken);
        setTokenExpiry(storedExpiry);
      } else {
        await refreshAccessToken();
      }
    };
    initAuth();
  }, [storeToken, refreshAccessToken]);

  // 3. Ensure Token for Playback
  const ensureAccessToken = useCallback(async () => {
    if (spotifyToken && tokenExpiry && tokenExpiry > Date.now()) return spotifyToken;
    return refreshAccessToken();
  }, [refreshAccessToken, spotifyToken, tokenExpiry]);

  // 4. Fetch Profile
  useEffect(() => {
    if (!spotifyToken) return;
    (async () => {
      const profile = await fetchSpotifyProfile(spotifyToken);
      if (profile) setSpotifyProfile(profile);
    })();
  }, [spotifyToken]);

  const { player, deviceId, playerError, currentTrack, isPaused } = useSpotifyPlayer(spotifyToken);

  useEffect(() => {
    if (playerError) {
      console.warn("Spotify SDK Error:", playerError);
      setSpotifyStatus(playerError);
    }
  }, [playerError]);

  useEffect(() => {
    if (spotifyToken && deviceId) {
      transferPlaybackToDevice(spotifyToken, deviceId);
      setSpotifyStatus('Player ready.');
    }
  }, [spotifyToken, deviceId]);

  // --- APP LOGIC ---
  
  // Handle Initial Flow Logic
  useEffect(() => {
    // If no sequence, open sidebar to prompt generation.
    if (sequence.length === 0) {
       setIsSidebarOpen(true);
    }
  }, [sequence.length]);

  useEffect(() => {
    let interval = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds(prev => {
          if (prev <= 1) { 
             // Timer Done
             if (autoContinue) {
                // We'll handle auto-next in a separate effect to avoid state loop here, 
                // or we let it sit at 0 and the effect below catches it.
                // But to be safe, just let it hit 0.
                return 0;
             }
             setIsTimerRunning(false); 
             return 0; 
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, autoContinue]);

  // Auto-Continue Trigger
  useEffect(() => {
    if (isTimerRunning && timerSeconds === 0 && autoContinue) {
       if (practiceIndex < sequence.length - 1) {
          const nextIndex = practiceIndex + 1;
          setPracticeIndex(nextIndex);
          setTimerSeconds(sequence[nextIndex].timerVal);
          // Keep timer running
       } else {
          setIsTimerRunning(false); // End of sequence
       }
    }
  }, [timerSeconds, isTimerRunning, autoContinue, practiceIndex, sequence]);


  const getFilteredPool = () => { 
    let pool = [...POSE_LIBRARY]; 
    if (params.filters.noWrists) pool = pool.filter(p => !p.wrist); 
    if (params.filters.kneeFriendly) pool = pool.filter(p => !p.knee); 
    if (params.filters.pregnancySafe) pool = pool.filter(p => p.pregnant); 
    if (params.difficulty === 'Beginner') pool = pool.filter(p => p.difficulty <= 1); 
    if (params.difficulty === 'Intermediate') pool = pool.filter(p => p.difficulty <= 2); 
    return pool; 
  };

  const ensureCatCow = (selectedPoses, pool) => {
    const hasCat = selectedPoses.some(p => p.id === 'cat');
    const hasCow = selectedPoses.some(p => p.id === 'cow');
    if (!hasCat && !hasCow) return selectedPoses;

    let newPoses = selectedPoses.filter(p => p.id !== 'cat' && p.id !== 'cow');
    const catPose = pool.find(p => p.id === 'cat');
    const cowPose = pool.find(p => p.id === 'cow');

    if (catPose && cowPose) {
      newPoses.unshift(catPose, cowPose);
    } else {
      if (hasCat && catPose) newPoses.push(catPose);
      if (hasCow && cowPose) newPoses.push(cowPose);
    }
    return newPoses;
  };

  const pick = (pool, category, count, filterFn = null) => {
    let candidates = pool.filter(p => p.category === category);
    if (filterFn) candidates = candidates.filter(filterFn);
    candidates = candidates.sort(() => 0.5 - Math.random());
    return candidates.slice(0, Math.max(1, count));
  };

  const generateSequence = () => {
    const pool = getFilteredPool();
    let newSequence = [];

    const strategies = {
      [SEQUENCE_METHODS.STANDARD]: () => {
        const counts = params.style === 'Yin' ? { centering: 3, warmup: 2, standing: 0, floor: 5 } : { centering: 2, warmup: 3, standing: 5, floor: 3 };
        newSequence.push(...pick(pool, POSE_CATEGORIES.CENTERING, counts.centering));
        let warmups = pick(pool, POSE_CATEGORIES.WARMUP, counts.warmup);
        newSequence.push(...ensureCatCow(warmups, pool));
        if (params.style !== 'Yin') {
           const sunFlow = ['mtn', 'plk', 'chat', 'cobra', 'dd'].map(id => pool.find(p => p.id === id)).filter(Boolean);
           if (sunFlow.length === 5) newSequence.push(...sunFlow);
           newSequence.push(...pick(pool, POSE_CATEGORIES.STANDING, counts.standing));
           newSequence.push(...pick(pool, POSE_CATEGORIES.BALANCE, 2));
        }
        newSequence.push(...pick(pool, POSE_CATEGORIES.HIP_OPENER, counts.floor));
      },
      [SEQUENCE_METHODS.PEAK]: () => {
        const peak = pool.find(p => p.id === params.selectedPeakPose);
        if (!peak) return strategies[SEQUENCE_METHODS.STANDARD]();
        newSequence.push(...pick(pool, POSE_CATEGORIES.CENTERING, 2));
        let warmups = pick(pool, POSE_CATEGORIES.WARMUP, 3);
        newSequence.push(...ensureCatCow(warmups, pool));
        const sunFlow = ['mtn', 'plk', 'chat', 'cobra', 'dd'].map(id => pool.find(p => p.id === id)).filter(Boolean);
        newSequence.push(...sunFlow);
        const related = peak.types ? peak.types.filter(t => t !== 'peak') : [];
        newSequence.push(...pick(pool, POSE_CATEGORIES.STANDING, 4, p => p.types && p.types.some(t => related.includes(t))));
        newSequence.push(peak); 
        newSequence.push(...pick(pool, POSE_CATEGORIES.RESTORATIVE, 2));
      },
      [SEQUENCE_METHODS.THEME]: () => {
        const theme = THEMES.find(t => t.id === params.selectedTheme);
        if (!theme) return strategies[SEQUENCE_METHODS.STANDARD]();
        const smartPick = (category, count) => {
          let candidates = pool.filter(p => p.category === category);
          candidates.sort((a, b) => {
             const aMatch = a.types && a.types.some(t => theme.types.includes(t));
             const bMatch = b.types && b.types.some(t => theme.types.includes(t));
             return (bMatch ? 1 : 0) - (aMatch ? 1 : 0) || 0.5 - Math.random();
          });
          return candidates.slice(0, Math.max(1, count));
        };
        newSequence.push(...smartPick(POSE_CATEGORIES.CENTERING, 2));
        newSequence.push(...ensureCatCow(smartPick(POSE_CATEGORIES.WARMUP, 3), pool));
        if (theme.id !== 'rest') {
           const sunFlow = ['mtn', 'plk', 'chat', 'cobra', 'dd'].map(id => pool.find(p => p.id === id)).filter(Boolean);
           newSequence.push(...sunFlow);
        }
        newSequence.push(...smartPick(POSE_CATEGORIES.STANDING, 4));
        newSequence.push(...smartPick(POSE_CATEGORIES.HIP_OPENER, 3));
      },
      [SEQUENCE_METHODS.TARGET]: () => {
         const target = TARGET_AREAS.find(t => t.id === params.selectedTarget);
         if (!target) return strategies[SEQUENCE_METHODS.STANDARD]();
         const smartPick = (category, count) => {
            let candidates = pool.filter(p => p.category === category);
            candidates.sort((a, b) => {
               const aMatch = a.types && a.types.some(t => target.types.includes(t));
               const bMatch = b.types && b.types.some(t => target.types.includes(t));
               return (bMatch ? 1 : 0) - (aMatch ? 1 : 0) || 0.5 - Math.random();
            });
            return candidates.slice(0, Math.max(1, count));
         };
         newSequence.push(...smartPick(POSE_CATEGORIES.CENTERING, 2));
         newSequence.push(...ensureCatCow(smartPick(POSE_CATEGORIES.WARMUP, 3), pool));
         newSequence.push(...smartPick(POSE_CATEGORIES.STANDING, 5));
         newSequence.push(...smartPick(POSE_CATEGORIES.HIP_OPENER, 3));
      },
      [SEQUENCE_METHODS.LADDER]: () => {
         const ladderPoses = pick(pool, POSE_CATEGORIES.STANDING, 3);
         if (ladderPoses.length < 3) return strategies[SEQUENCE_METHODS.STANDARD]();
         newSequence.push(...pick(pool, POSE_CATEGORIES.CENTERING, 2));
         newSequence.push(...ensureCatCow(pick(pool, POSE_CATEGORIES.WARMUP, 2), pool));
         const sunFlow = ['mtn', 'plk', 'chat', 'cobra', 'dd'].map(id => pool.find(p => p.id === id)).filter(Boolean);
         newSequence.push(...sunFlow);
         const vinyasa = [pool.find(p => p.id === 'plk'), pool.find(p => p.id === 'dd')].filter(Boolean);
         newSequence.push(ladderPoses[0]);
         newSequence.push(...vinyasa);
         newSequence.push(ladderPoses[0]);
         newSequence.push(ladderPoses[1]);
         newSequence.push(...vinyasa);
         newSequence.push(ladderPoses[0]);
         newSequence.push(ladderPoses[1]);
         newSequence.push(ladderPoses[2]);
         newSequence.push(...vinyasa);
         newSequence.push(...pick(pool, POSE_CATEGORIES.HIP_OPENER, 2));
      }
    };

    const strategy = strategies[params.method] || strategies[SEQUENCE_METHODS.STANDARD];
    strategy();

    const sava = POSE_LIBRARY.find(p => p.id === 'sava');
    if (sava && !newSequence.find(p => p.id === 'sava')) newSequence.push(sava);

    const finalSequence = newSequence.map((pose, idx) => {
      const config = TIMING_CONFIG[pose.category] || { label: '1 min', seconds: 60 };
      return {
        ...pose,
        uniqueId: `${pose.id}-${idx}-${Date.now()}`,
        duration: config.label, 
        timerVal: config.seconds, 
      };
    });

    setSequence(finalSequence);
    setPracticeIndex(0); // Reset practice index on new generation
    setActiveTab('generator');
    if (window.innerWidth < 1024) setIsSidebarOpen(false);
  };

  const swapPose = (index) => {
    const currentPose = sequence[index];
    const pool = getFilteredPool();
    const candidates = pool.filter(p => p.category === currentPose.category && p.id !== currentPose.id);
    if (candidates.length > 0) {
      const newPose = candidates[Math.floor(Math.random() * candidates.length)];
      const updated = [...sequence];
      updated[index] = { 
        ...newPose, 
        uniqueId: `${newPose.id}-${index}-${Date.now()}`, 
        duration: currentPose.duration, 
        timerVal: currentPose.timerVal 
      };
      setSequence(updated);
    }
  };

  const deleteSaved = (id) => { const updated = savedSequences.filter(s => s.id !== id); setSavedSequences(updated); localStorage.setItem('yoga_saved_sequences', JSON.stringify(updated)); };

  const clearInProgress = useCallback(() => {
    setInProgress(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('yoga_in_progress');
    }
  }, []);

  // Update inProgress whenever sequence, params OR practiceIndex changes
  useEffect(() => {
    if (sequence.length === 0) return;

    const snapshot = {
      id: 'in-progress',
      name: 'In Progress Flow',
      updatedAt: new Date().toISOString(),
      params,
      poses: sequence,
      currentIndex: practiceIndex // Track the current pose index
    };

    setInProgress(snapshot);
    if (typeof window !== 'undefined') {
      localStorage.setItem('yoga_in_progress', JSON.stringify(snapshot));
    }
  }, [params, sequence, practiceIndex]);

  const resumePractice = (session) => {
    setParams(session.params);
    setSequence(session.poses);
    
    // Resume at stored index or 0
    const resumeIdx = session.currentIndex || 0;
    setPracticeIndex(resumeIdx);
    
    // Set timer to that specific pose's time
    if(session.poses && session.poses[resumeIdx]) {
      setTimerSeconds(session.poses[resumeIdx].timerVal);
    }
    
    setIsTimerRunning(true);
    setActiveTab('practice');
  };

  const nextPracticePose = () => { 
    if (practiceIndex < sequence.length - 1) { 
      const nextIndex = practiceIndex + 1;
      setPracticeIndex(nextIndex); 
      setTimerSeconds(sequence[nextIndex].timerVal); 
      setIsTimerRunning(true); 
    } else { 
      setActiveTab('generator'); 
    } 
  };

  const prevPracticePose = () => {
    if (practiceIndex > 0) {
      const prevIndex = practiceIndex - 1;
      setPracticeIndex(prevIndex);
      setTimerSeconds(sequence[prevIndex].timerVal);
      setIsTimerRunning(true);
    }
  };
  
  const handlePrint = () => {
    setIsPrinting(true);
    // Wait for state update to render print view
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 100);
  };

  const handleLogout = async () => {
    try { await fetch(`${API_BASE}/api/spotify/logout`, { method: 'POST', credentials: 'include' }); } catch (err) { console.warn('Logout failed', err); }
    clearStoredToken(); setSpotifyToken(null); setTokenExpiry(null); setSpotifyProfile(null); setSpotifyStatus(''); setTokenError(null);
  };

  // Render Print Layout if printing
  if (isPrinting) {
    return <PrintLayout sequence={sequence} params={params} />;
  }

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${darkMode ? 'dark bg-stone-900 text-stone-100' : 'bg-stone-50 text-stone-800'}`}>
      <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-white/90 dark:bg-stone-800/90 backdrop-blur border-b border-stone-200 dark:border-stone-700 flex items-center justify-between px-4 lg:px-8 print:hidden">
        <div className="flex items-center gap-3">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-stone-100 dark:hover:bg-stone-700 rounded-lg text-stone-600 dark:text-stone-300"><Menu size={24} /></button>
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('generator')}><div className="bg-teal-600 text-white p-1.5 rounded-lg"><Activity size={18} /></div><h1 className="text-xl font-bold tracking-tight text-stone-800 dark:text-stone-100 font-serif">ZenFlow</h1></div>
        </div>
        <nav className="hidden md:flex items-center gap-1">
          {['generator', 'library', 'saved', 'settings'].map(tab => (<button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${activeTab === tab ? 'bg-stone-100 dark:bg-stone-700 text-teal-700 dark:text-teal-400' : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'}`}>{tab.charAt(0).toUpperCase() + tab.slice(1)}</button>))}
        </nav>
        <div className="flex items-center gap-2">
          {!spotifyToken && <button onClick={() => window.location.href = getLoginUrl()} className="px-3 py-2 bg-[#1DB954] text-white rounded-full text-xs font-bold hover:opacity-90 flex items-center gap-1"><LogIn size={16} /> Connect Spotify</button>}
          {spotifyToken && <button onClick={handleLogout} className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-full" title="Disconnect"><LogOut size={20} /></button>}
          <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 transition-colors">{darkMode ? <Sun size={20} /> : <Moon size={20} />}</button>
        </div>
      </header>

      {selectedPose && <PoseDetailModal pose={selectedPose} onClose={() => setSelectedPose(null)} />}
      
      {activeTab === 'practice' && (
        <PracticeMode 
          sequence={sequence} 
          practiceIndex={practiceIndex} 
          timerSeconds={timerSeconds} 
          isTimerRunning={isTimerRunning} 
          setIsTimerRunning={setIsTimerRunning} 
          nextPracticePose={nextPracticePose}
          prevPracticePose={prevPracticePose}
          autoContinue={autoContinue}
          setAutoContinue={setAutoContinue}
          onClose={() => setActiveTab('generator')} 
          musicTheme={musicThemes.find(t => t.id === selectedMusicId)} 
          spotifyToken={spotifyToken} 
          player={player} 
          deviceId={deviceId} 
          playerError={playerError} 
          ensureAccessToken={ensureAccessToken} 
          isPremiumUser={isPremiumUser} 
          onPlaybackStatus={setSpotifyStatus} 
          playbackStatus={spotifyStatus} 
          currentTrack={currentTrack} 
          isPaused={isPaused} 
        />
      )}

      <div className="pt-16 flex h-screen overflow-hidden">
        {isSidebarOpen && <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden transition-opacity animate-in fade-in duration-200" onClick={() => setIsSidebarOpen(false)} />}
        {(activeTab === 'generator' || isSidebarOpen) && (
          <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-80 bg-white dark:bg-stone-800 border-r border-stone-200 dark:border-stone-700 transform transition-transform duration-300 ease-in-out print:hidden flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:w-0 lg:border-none lg:overflow-hidden'} ${activeTab !== 'generator' ? 'lg:hidden' : ''}`}>
             <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-thin">
                {/* MOBILE NAV HEADER */}
                <div className="flex justify-between items-center lg:hidden mb-6"><div className="flex items-center gap-2"><div className="bg-teal-600 text-white p-1 rounded-lg"><Activity size={16} /></div><h2 className="font-bold text-lg dark:text-stone-100 font-serif">ZenFlow</h2></div><button onClick={() => setIsSidebarOpen(false)} className="text-stone-500 p-2 hover:bg-stone-100 dark:hover:bg-stone-700 rounded-full"><X size={20}/></button></div>
                
                {/* MOBILE MENU LINKS */}
                <div className="lg:hidden mb-8 space-y-1 pb-6 border-b border-stone-100 dark:border-stone-700">
                  <div className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2 px-2">Menu</div>
                  {['generator', 'library', 'saved', 'settings'].map(tab => (
                    <button 
                      key={tab} 
                      onClick={() => { setActiveTab(tab); setIsSidebarOpen(false); }} 
                      className={`w-full text-left px-4 py-3 rounded-xl font-bold transition-all flex items-center gap-3 ${activeTab === tab ? 'bg-teal-50 text-teal-800 dark:bg-teal-900/30 dark:text-teal-100' : 'text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800'}`}
                    >
                      {tab === 'generator' && <RefreshCw size={18} />}
                      {tab === 'library' && <BookOpen size={18} />}
                      {tab === 'saved' && <Heart size={18} />}
                      {tab === 'settings' && <Settings size={18} />}
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </div>

                {/* CONTROLS */}
                {activeTab === 'generator' && (
                  <div className="space-y-5">
                    <div className="flex items-center gap-2 text-teal-700 dark:text-teal-400 font-bold uppercase text-xs tracking-widest"><Settings size={14} /> Configuration</div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-2 font-medium dark:text-stone-300"><span>Duration</span> <span>{params.duration} min</span></div>
                      <input type="range" min="15" max="90" step="15" value={params.duration} onChange={(e) => setParams({...params, duration: parseInt(e.target.value)})} className="w-full accent-teal-600 h-2 bg-stone-200 dark:bg-stone-600 rounded-lg appearance-none cursor-pointer" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-stone-500 dark:text-stone-400 uppercase mb-1.5">Style</label>
                        <select value={params.style} onChange={(e) => setParams({...params, style: e.target.value})} className="w-full p-2.5 rounded-lg border border-stone-200 dark:border-stone-600 bg-stone-50 dark:bg-stone-700 text-sm font-medium outline-none focus:ring-2 focus:ring-teal-500 dark:text-stone-100">
                          {['Vinyasa', 'Hatha', 'Power', 'Yin', 'Restorative'].map(s => <option key={s}>{s}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-stone-500 dark:text-stone-400 uppercase mb-1.5">Level</label>
                        <select value={params.difficulty} onChange={(e) => setParams({...params, difficulty: e.target.value})} className="w-full p-2.5 rounded-lg border border-stone-200 dark:border-stone-600 bg-stone-50 dark:bg-stone-700 text-sm font-medium outline-none focus:ring-2 focus:ring-teal-500 dark:text-stone-100">
                          {['Beginner', 'Intermediate', 'Advanced'].map(l => <option key={l}>{l}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-stone-100 dark:border-stone-700">
                      <div className="flex items-center gap-2 text-teal-700 dark:text-teal-400 font-bold uppercase text-xs tracking-widest"><Layers size={14} /> Method</div>
                      <div className="grid grid-cols-2 gap-2">
                          {[
                            { id: SEQUENCE_METHODS.STANDARD, label: 'Standard', icon: Layers },
                            { id: SEQUENCE_METHODS.PEAK, label: 'Peak Pose', icon: Target },
                            { id: SEQUENCE_METHODS.THEME, label: 'Themed', icon: Zap },
                            { id: SEQUENCE_METHODS.TARGET, label: 'Body Area', icon: Anchor },
                            { id: SEQUENCE_METHODS.LADDER, label: 'Ladder', icon: Layers }
                          ].map(m => (
                            <button 
                              key={m.id}
                              onClick={() => setParams({...params, method: m.id})} 
                              className={`p-3 rounded-lg text-xs font-bold border transition-all flex flex-col items-center gap-1 ${params.method === m.id ? 'bg-teal-50 border-teal-500 text-teal-800 dark:bg-teal-900/30 dark:text-teal-100 dark:border-teal-500' : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:border-teal-300 dark:hover:border-stone-500'}`}
                            >
                              <m.icon size={16} /> {m.label}
                            </button>
                          ))}
                      </div>

                      {params.method === SEQUENCE_METHODS.PEAK && (
                          <select value={params.selectedPeakPose} onChange={(e) => setParams({...params, selectedPeakPose: e.target.value})} className="w-full p-2 rounded border border-stone-200 dark:border-stone-600 text-sm bg-white dark:bg-stone-700 dark:text-stone-100">
                            {PEAK_POSES.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                          </select>
                      )}
                      
                      {params.method === SEQUENCE_METHODS.THEME && (
                          <select value={params.selectedTheme} onChange={(e) => setParams({...params, selectedTheme: e.target.value})} className="w-full p-2 rounded border border-stone-200 dark:border-stone-600 text-sm bg-white dark:bg-stone-700 dark:text-stone-100">
                            {THEMES.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                          </select>
                      )}

                      {params.method === SEQUENCE_METHODS.TARGET && (
                          <select value={params.selectedTarget} onChange={(e) => setParams({...params, selectedTarget: e.target.value})} className="w-full p-2 rounded border border-stone-200 dark:border-stone-600 text-sm bg-white dark:bg-stone-700 dark:text-stone-100">
                            {TARGET_AREAS.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                          </select>
                      )}
                    </div>

                    <div className="space-y-3 pt-4 border-t border-stone-100 dark:border-stone-700">
                      <div className="flex items-center gap-2 text-teal-700 dark:text-teal-400 font-bold uppercase text-xs tracking-widest"><Activity size={14} /> Filters</div>
                      {['noWrists', 'kneeFriendly', 'pregnancySafe'].map(f => (
                        <label key={f} className="flex items-center gap-3 text-sm cursor-pointer hover:opacity-80 p-2 hover:bg-stone-50 dark:hover:bg-stone-700/50 rounded text-stone-700 dark:text-stone-300">
                          <input type="checkbox" checked={params.filters[f]} onChange={() => setParams(p => ({...p, filters: {...p.filters, [f]: !p.filters[f]}}))} className="accent-teal-600 w-4 h-4 rounded" />
                          <span className="capitalize">{f.replace(/([A-Z])/g, ' $1').trim()}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
             </div>
             {activeTab === 'generator' && <div className="p-4 border-t border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/50"><button onClick={generateSequence} className="w-full py-3.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl shadow-lg font-bold flex items-center justify-center gap-2"><RefreshCw size={18} /> Generate Flow</button></div>}
          </aside>
        )}
        <main className="flex-1 h-full overflow-y-auto bg-stone-50 dark:bg-stone-900 relative scrollbar-thin">
          {activeTab === 'library' && <PoseLibrary setSelectedPose={setSelectedPose} />}
          {activeTab === 'settings' && <MusicConfig themes={musicThemes} onUpdateTheme={updateMusicTheme} spotifyToken={spotifyToken} getLoginUrl={getLoginUrl} isPremiumUser={isPremiumUser} tokenError={tokenError} />}
          {activeTab === 'saved' && (
             <div className="max-w-4xl mx-auto p-8">
               <h2 className="text-3xl font-serif text-teal-900 dark:text-teal-100 mb-6">Saved & In-Progress</h2>
               <p className="text-sm text-stone-500 dark:text-stone-400 mb-6">Pick up where you left off or revisit your favorite flows.</p>

               {inProgress && (
                 <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-6 rounded-xl flex justify-between items-center shadow-sm mb-6">
                   <div>
                     <div className="flex items-center gap-2 mb-1">
                       <span className="px-2 py-0.5 bg-amber-200 text-amber-900 rounded text-[10px] font-bold uppercase tracking-wide">In Progress</span>
                       <span className="text-xs text-amber-700 dark:text-amber-300">
                         {/* Show readable last pose info */}
                         Pose { (inProgress.currentIndex || 0) + 1 } of {inProgress.poses.length} • Updated {new Date(inProgress.updatedAt).toLocaleTimeString()}
                       </span>
                     </div>
                     <h3 className="font-bold text-lg text-stone-900 dark:text-stone-100">{inProgress.name}</h3>
                     <p className="text-sm opacity-70 dark:text-stone-400">{inProgress.params.style} • {inProgress.params.duration} min</p>
                   </div>
                   <div className="flex gap-2">
                     {/* Update button to use new resumePractice logic */}
                     <button onClick={() => resumePractice(inProgress)} className="px-3 py-2 bg-amber-500 text-white rounded-lg shadow font-bold">Resume</button>
                     <button onClick={clearInProgress} className="p-2 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-800/50 rounded-lg" title="Clear in-progress flow"><Trash2 size={18} /></button>
                   </div>
                 </div>
               )}

               <h3 className="text-xl font-bold text-teal-900 dark:text-teal-100 mb-4">Saved Flows</h3>
               {savedSequences.length === 0 && <p className="text-sm text-stone-500 dark:text-stone-400">No saved flows yet. Create a sequence and tap the heart to store it.</p>}
               {savedSequences.map(s => (
                 <div key={s.id} className="bg-white dark:bg-stone-800 p-6 rounded-xl flex justify-between items-center group shadow-sm mb-4 border border-stone-100 dark:border-stone-700">
                   <div>
                     <h3 className="font-bold text-lg dark:text-stone-100">{s.name}</h3>
                     <p className="text-sm opacity-60 dark:text-stone-400">{s.params.style} • {s.params.duration} min</p>
                   </div>
                   <div className="flex gap-2">
                     <button onClick={() => { setParams(s.params); setSequence(s.poses); setActiveTab('generator'); }} className="p-2 text-teal-600 bg-teal-50 rounded-lg"><Play size={18}/></button>
                     <button onClick={() => deleteSaved(s.id)} className="p-2 text-rose-600 bg-rose-50 rounded-lg"><Trash2 size={18}/></button>
                   </div>
                 </div>
               ))}
             </div>
          )}
          {activeTab === 'generator' && (
            <div className="max-w-5xl mx-auto p-4 lg:p-8 print:p-0 print:max-w-none">
              <div className="bg-white dark:bg-stone-800 rounded-2xl shadow-sm border border-stone-100 dark:border-stone-700 p-6 mb-8 print:hidden">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-stone-100 dark:border-stone-700 pb-6 mb-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 rounded bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200 text-[10px] font-bold uppercase tracking-wider">{params.style}</span>
                      <span className="px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300 text-[10px] font-bold uppercase tracking-wider">{params.difficulty}</span>
                    </div>
                    <h2 className="text-4xl font-serif text-stone-900 dark:text-white">
                        {params.method === SEQUENCE_METHODS.PEAK ? `Peak: ${POSE_LIBRARY.find(p=>p.id===params.selectedPeakPose)?.name}` : 'Yoga Sequence'}
                    </h2>
                    <div className="flex gap-6 mt-3 text-sm text-stone-500 dark:text-stone-400 font-medium"><span className="flex items-center gap-1.5"><Wind size={16}/> {params.duration} mins</span><span className="flex items-center gap-1.5"><Activity size={16}/> {sequence.length} poses</span></div></div>
                  <div className="flex gap-2">
                    <button onClick={() => { if(sequence.length > 0) { setPracticeIndex(0); setTimerSeconds(sequence[0].timerVal); setActiveTab('practice'); }}} className="px-6 py-3 bg-stone-900 dark:bg-white text-white dark:text-stone-900 hover:opacity-90 rounded-xl font-bold flex items-center gap-2 shadow-lg"><PlayCircle size={20} /> Start Practice</button>
                    <button onClick={() => setIsTeacherMode(!isTeacherMode)} className={`p-3 rounded-xl border transition-colors ${isTeacherMode ? 'bg-teal-50 dark:bg-teal-900/30 border-teal-200 dark:border-teal-700 text-teal-700 dark:text-teal-400' : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-400'}`} title="Teacher Mode">
                      <BookOpen size={20} />
                    </button>
                    <button onClick={() => { const name = prompt("Name flow:"); if(name) { const newSave = { id: Date.now(), name, date: new Date().toLocaleDateString(), params, poses: sequence }; setSavedSequences([newSave, ...savedSequences]); localStorage.setItem('yoga_saved_sequences', JSON.stringify([newSave, ...savedSequences])); } }} className="p-3 text-stone-500 border border-stone-200 rounded-xl"><Heart size={20} /></button>
                    <button onClick={handlePrint} className="p-3 text-stone-500 dark:text-stone-400 hover:text-teal-600 dark:hover:text-teal-400 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-xl transition-colors"><Printer size={20} /></button>
                  </div>
                </div>
                {!isTeacherMode && <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">{musicThemes.map(theme => (<button key={theme.id} onClick={() => setSelectedMusicId(theme.id)} className={`p-2 rounded-lg flex flex-col items-center text-center transition-all border ${selectedMusicId === theme.id ? 'bg-teal-50 border-teal-200 text-teal-800 dark:bg-teal-900/40 dark:border-teal-700 dark:text-teal-200' : 'bg-stone-50 dark:bg-stone-800 border-transparent'}`}><div className="mb-1">{theme.icon}</div><span className="text-[10px] font-bold truncate w-full">{theme.name}</span></button>))}</div>}
              </div>
              
              {/* PRINT HEADER (Only visible in Print) */}
              <div className="hidden print-only mb-8 text-center">
                <h1 className="text-3xl font-serif font-bold mb-2">ZenFlow Sequence</h1>
                <p className="text-sm text-gray-500">{params.style} • {params.difficulty} • {params.duration} mins</p>
              </div>

              <div className={isTeacherMode ? "grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-0" : "space-y-1"}>
                {sequence.length === 0 ? (
                  <div className="text-center py-20 opacity-40 text-stone-600 dark:text-stone-400 px-4">
                    <p className="text-lg font-serif">Ready to flow? Generate a sequence to begin.</p>
                  </div>
                ) : (
                  sequence.map((pose, idx) => (<PoseCard key={pose.uniqueId} pose={pose} index={idx} onSwap={swapPose} setSelectedPose={setSelectedPose} isTeacherMode={isTeacherMode} isLast={idx === sequence.length - 1} isFirst={idx === 0} />))
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
