import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, PlayCircle, RefreshCw, Settings, Heart, Printer, Sun, Moon, Music, Activity, BookOpen, LogOut, LogIn, Layers, Target, Zap, Anchor, Wind, Trash2, Play, ArrowLeft, Check } from 'lucide-react';
import PoseCard from '../components/PoseCard';
import PoseLibrary from '../components/PoseLibrary';
import MusicConfig from '../components/MusicConfig';
import PracticeMode from '../components/PracticeMode';
import PoseDetailModal from '../components/PoseDetailModal';
import PrintLayout from '../components/PrintLayout';
import useSpotifyPlayer from '../hooks/useSpotifyPlayer';
import { POSE_CATEGORIES, TIMING_CONFIG, POSE_LIBRARY, DEFAULT_MUSIC_THEMES, GENERATION_CONFIG, LEVELS } from '../data/poses';
import { SEQUENCE_METHODS, PEAK_POSES, THEMES, TARGET_AREAS } from '../constants/sequence';
import { API_BASE, getLoginUrl, transferPlaybackToDevice, fetchSpotifyProfile } from '../utils/spotify';
import { useTheme } from '../context/ThemeContext';

// --- MAIN APP COMPONENT ---

export default function ZenFlowApp() {
  const [activeTab, setActiveTab] = useState('generator'); 
  const [isPrinting, setIsPrinting] = useState(false);
  
  // Use the global theme context instead of local state
  const { darkMode, toggleTheme } = useTheme();

  const [sequence, setSequence] = useState(() => {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem('yoga_in_progress');
    return saved ? JSON.parse(saved).poses : [];
  });

  const [params, setParams] = useState(() => {
    const defaultParams = { duration: 60, difficulty: 'Intermediate', style: 'Vinyasa', filters: { noWrists: false, kneeFriendly: false, pregnancySafe: false }, method: SEQUENCE_METHODS.STANDARD, selectedPeakPose: PEAK_POSES[0]?.id || '', selectedTheme: THEMES[0].id, selectedTarget: TARGET_AREAS[0].id };
    if (typeof window === 'undefined') return defaultParams;
    const saved = localStorage.getItem('yoga_in_progress');
    return saved ? JSON.parse(saved).params : defaultParams;
  });

  const [savedSequences, setSavedSequences] = useState(() => { if (typeof window !== 'undefined') { const saved = localStorage.getItem('yoga_saved_sequences'); return saved ? JSON.parse(saved) : []; } return []; });
  
  const [inProgress, setInProgress] = useState(() => {
    if (typeof window === 'undefined') return null;
    const saved = localStorage.getItem('yoga_in_progress');
    return saved ? JSON.parse(saved) : null;
  });

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
  
  const [practiceIndex, setPracticeIndex] = useState(() => {
    if (typeof window === 'undefined') return 0;
    const saved = localStorage.getItem('yoga_in_progress');
    return saved ? (JSON.parse(saved).currentIndex || 0) : 0;
  });
  
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [selectedPose, setSelectedPose] = useState(null);

  const [spotifyToken, setSpotifyToken] = useState(null);
  const [tokenExpiry, setTokenExpiry] = useState(null);
  const [spotifyProfile, setSpotifyProfile] = useState(null);
  const [tokenError, setTokenError] = useState(null);
  const isPremiumUser = spotifyProfile?.product === 'premium';

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

  const ensureAccessToken = useCallback(async () => {
    if (spotifyToken && tokenExpiry && tokenExpiry > Date.now()) return spotifyToken;
    return refreshAccessToken();
  }, [refreshAccessToken, spotifyToken, tokenExpiry]);

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

  useEffect(() => {
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
             if (autoContinue) {
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

  useEffect(() => {
    if (isTimerRunning && timerSeconds === 0 && autoContinue) {
       if (practiceIndex < sequence.length - 1) {
          const nextIndex = practiceIndex + 1;
          setPracticeIndex(nextIndex);
          setTimerSeconds(sequence[nextIndex].timerVal);
       } else {
          setIsTimerRunning(false); 
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

  const fillSection = (pool, categories, targetSeconds, filterFn = null, startPose = null) => {
    let sectionPoses = [];
    let currentSeconds = 0;
    let currentLevel = startPose ? startPose.level : null; 

    let candidates = pool.filter(p => categories.includes(p.category));
    if (filterFn) candidates = candidates.filter(filterFn);
    
    if (candidates.length === 0) return { poses: [], actualDuration: 0, lastPose: startPose };

    while (currentSeconds < targetSeconds) {
      let validNextPoses = candidates;
      
      if (currentLevel && GENERATION_CONFIG.TRANSITION_RULES[currentLevel]) {
         const allowedLevels = GENERATION_CONFIG.TRANSITION_RULES[currentLevel];
         validNextPoses = candidates.filter(p => allowedLevels.includes(p.level));
         if (validNextPoses.length === 0) {
            validNextPoses = candidates.filter(p => p.level === LEVELS.KNEELING || p.level === LEVELS.STANDING);
         }
      }

      if (validNextPoses.length === 0) validNextPoses = candidates;

      let selectablePoses = validNextPoses;
      if (sectionPoses.length > 0 && candidates.length > 1) {
          const lastId = sectionPoses[sectionPoses.length - 1].id;
          const validWithoutLast = validNextPoses.filter(p => p.id !== lastId);
          if (validWithoutLast.length > 0) {
              selectablePoses = validWithoutLast;
          } else {
              const candidatesWithoutLast = candidates.filter(p => p.id !== lastId);
              if (candidatesWithoutLast.length > 0) {
                  selectablePoses = candidatesWithoutLast;
              }
          }
      }

      const pose = selectablePoses[Math.floor(Math.random() * selectablePoses.length)];

      sectionPoses.push(pose);
      currentSeconds += (TIMING_CONFIG[pose.category]?.seconds || 60);
      currentLevel = pose.level; 
    }

    const lastPose = sectionPoses.length > 0 ? sectionPoses[sectionPoses.length - 1] : startPose;
    return { poses: sectionPoses, actualDuration: currentSeconds, lastPose };
  };

  const generateSequence = () => {
    const pool = getFilteredPool();
    let newSequence = [];
    
    const totalSeconds = params.duration * 60;
    const ratios = GENERATION_CONFIG.SECTION_RATIOS[params.style] || GENERATION_CONFIG.SECTION_RATIOS.Vinyasa;
    
    const timeAllocations = {
      centering: totalSeconds * ratios.centering,
      warmup: totalSeconds * ratios.warmup,
      standing: totalSeconds * ratios.standing,
      floor: totalSeconds * ratios.floor,
      savasana: totalSeconds * ratios.savasana,
    };

    let lastGeneratedPose = null;

    const strategies = {
      [SEQUENCE_METHODS.STANDARD]: () => {
        const centering = fillSection(pool, [POSE_CATEGORIES.CENTERING], timeAllocations.centering, null, null);
        newSequence.push(...centering.poses);
        lastGeneratedPose = centering.lastPose;

        const catCow = [pool.find(p=>p.id==='cat'), pool.find(p=>p.id==='cow')].filter(Boolean);
        let warmupTime = timeAllocations.warmup;
        
        if (catCow.length === 2) {
           newSequence.push(...catCow);
           warmupTime -= (TIMING_CONFIG[POSE_CATEGORIES.WARMUP].seconds * 2);
           lastGeneratedPose = catCow[1];
        }
        
        const warmup = fillSection(pool, [POSE_CATEGORIES.WARMUP], warmupTime, p => p.id !== 'cat' && p.id !== 'cow', lastGeneratedPose);
        newSequence.push(...warmup.poses);
        lastGeneratedPose = warmup.lastPose;

        const isFlowStyle = params.style === 'Vinyasa' || params.style === 'Power';
        
        if (isFlowStyle) {
           const sunFlow = ['mtn', 'plk', 'chat', 'cobra', 'dd'].map(id => pool.find(p => p.id === id)).filter(Boolean);
           if (sunFlow.length === 5) {
             const sunTime = sunFlow.length * 15; 
             const rounds = Math.max(1, Math.floor((timeAllocations.standing * 0.3) / sunTime));
             for(let i=0; i<rounds; i++) newSequence.push(...sunFlow);
             lastGeneratedPose = sunFlow[sunFlow.length - 1]; 
           }

           const remainingStandingTime = timeAllocations.standing * 0.7;
           let currentFlowTime = 0;
           const standingCandidates = pool.filter(p => [POSE_CATEGORIES.STANDING, POSE_CATEGORIES.BALANCE].includes(p.category));
           
           if (standingCandidates.length > 0) {
             while(currentFlowTime < remainingStandingTime) {
               const flowLength = Math.floor(Math.random() * 3) + 3; 
               const flowPoses = [];
               const shuffled = [...standingCandidates].sort(() => 0.5 - Math.random());
               
               for(let i=0; i<flowLength; i++) {
                 if (shuffled[i]) flowPoses.push(shuffled[i]);
               }

               newSequence.push(...flowPoses);
               currentFlowTime += flowPoses.reduce((acc, p) => acc + TIMING_CONFIG[p.category].seconds, 0);

               const vinyasa = GENERATION_CONFIG.VINYASA_FLOW_ID_SEQUENCE.map(id => pool.find(p => p.id === id)).filter(Boolean);
               if (vinyasa.length > 0) {
                 newSequence.push(...vinyasa);
                 currentFlowTime += vinyasa.length * 15; 
               }

               newSequence.push(...flowPoses); 
               currentFlowTime += flowPoses.reduce((acc, p) => acc + TIMING_CONFIG[p.category].seconds, 0);

               if (vinyasa.length > 0) {
                 newSequence.push(...vinyasa);
                 currentFlowTime += vinyasa.length * 15;
                 lastGeneratedPose = vinyasa[vinyasa.length - 1];
               } else {
                 lastGeneratedPose = flowPoses[flowPoses.length - 1];
               }
             }
           }
        } else {
           const standing = fillSection(pool, [POSE_CATEGORIES.STANDING, POSE_CATEGORIES.BALANCE], timeAllocations.standing, null, lastGeneratedPose);
           newSequence.push(...standing.poses);
           lastGeneratedPose = standing.lastPose;
        }

        const floorGroups = [
            { cats: [POSE_CATEGORIES.HIP_OPENER], time: timeAllocations.floor * 0.4 },
            { cats: [POSE_CATEGORIES.BACKBEND], time: timeAllocations.floor * 0.2 },
            { cats: [POSE_CATEGORIES.TWIST], time: timeAllocations.floor * 0.2 },
            { cats: [POSE_CATEGORIES.RESTORATIVE], time: timeAllocations.floor * 0.2 },
        ];

        for (const group of floorGroups) {
            const segment = fillSection(pool, group.cats, group.time, null, lastGeneratedPose);
            newSequence.push(...segment.poses);
            lastGeneratedPose = segment.lastPose;
        }
      },

      [SEQUENCE_METHODS.PEAK]: () => {
        const peak = pool.find(p => p.id === params.selectedPeakPose);
        if (!peak) return strategies[SEQUENCE_METHODS.STANDARD]();

        const centering = fillSection(pool, [POSE_CATEGORIES.CENTERING], timeAllocations.centering, null, null);
        newSequence.push(...centering.poses);
        lastGeneratedPose = centering.lastPose;

        const warmup = fillSection(pool, [POSE_CATEGORIES.WARMUP], timeAllocations.warmup, null, lastGeneratedPose);
        newSequence.push(...warmup.poses);
        lastGeneratedPose = warmup.lastPose;

        const relatedTypes = peak.types ? peak.types.filter(t => t !== 'peak') : [];
        const prepPoses = fillSection(pool, [POSE_CATEGORIES.STANDING, POSE_CATEGORIES.CORE], timeAllocations.standing, 
          p => p.types && p.types.some(t => relatedTypes.includes(t)),
          lastGeneratedPose 
        );
        newSequence.push(...prepPoses.poses);
        lastGeneratedPose = prepPoses.lastPose;
        
        newSequence.push(peak);
        lastGeneratedPose = peak;

        const coolDown = fillSection(pool, [POSE_CATEGORIES.HIP_OPENER, POSE_CATEGORIES.RESTORATIVE], timeAllocations.floor, null, lastGeneratedPose);
        newSequence.push(...coolDown.poses);
      },

      [SEQUENCE_METHODS.THEME]: () => {
        const theme = THEMES.find(t => t.id === params.selectedTheme);
        if (!theme) return strategies[SEQUENCE_METHODS.STANDARD]();
        return strategies[SEQUENCE_METHODS.STANDARD]();
      },
      
      [SEQUENCE_METHODS.TARGET]: () => strategies[SEQUENCE_METHODS.STANDARD](), 
      [SEQUENCE_METHODS.LADDER]: () => strategies[SEQUENCE_METHODS.STANDARD](),
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
    setPracticeIndex(0); 
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

  const deletePose = (index) => {
    const updated = [...sequence];
    updated.splice(index, 1);
    setSequence(updated);
  };

  const deleteSaved = (id) => { const updated = savedSequences.filter(s => s.id !== id); setSavedSequences(updated); localStorage.setItem('yoga_saved_sequences', JSON.stringify(updated)); };

  const clearInProgress = useCallback(() => {
    setInProgress(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('yoga_in_progress');
    }
  }, []);

  useEffect(() => {
    if (sequence.length === 0) return;

    const snapshot = {
      id: 'in-progress',
      name: 'In Progress Flow',
      updatedAt: new Date().toISOString(),
      params,
      poses: sequence,
      currentIndex: practiceIndex 
    };

    setInProgress(snapshot);
    if (typeof window !== 'undefined') {
      localStorage.setItem('yoga_in_progress', JSON.stringify(snapshot));
    }
  }, [params, sequence, practiceIndex]);

  const resumePractice = (session) => {
    setParams(session.params);
    setSequence(session.poses);
    const resumeIdx = session.currentIndex || 0;
    setPracticeIndex(resumeIdx);
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
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 100);
  };

  const handleLogout = async () => {
    try { await fetch(`${API_BASE}/api/spotify/logout`, { method: 'POST', credentials: 'include' }); } catch (err) { console.warn('Logout failed', err); }
    clearStoredToken(); setSpotifyToken(null); setTokenExpiry(null); setSpotifyProfile(null); setSpotifyStatus(''); setTokenError(null);
  };

  if (isPrinting) {
    return <PrintLayout sequence={sequence} params={params} />;
  }

  return (
    <div className={`h-[100dvh] overflow-hidden font-sans transition-colors duration-300 relative ${darkMode ? 'dark bg-stone-900 text-stone-100' : 'bg-stone-50 text-stone-800'}`}>
      {/* Background Ambience from Global Layout */}
      <div className="fixed inset-0 bg-grain z-0 opacity-50 pointer-events-none"></div>
      <div className="fixed inset-0 bg-gradient-to-br from-stone-50 via-white to-stone-100 dark:from-stone-900 dark:via-stone-900 dark:to-stone-950 z-[-1] pointer-events-none"></div>

      {selectedPose && <PoseDetailModal pose={selectedPose} onClose={() => setSelectedPose(null)} />}
      
      {activeTab === 'practice' && (
        <PracticeMode 
          sequence={sequence} 
          practiceIndex={practiceIndex} 
          timerSeconds={timerSeconds}
          onAddTime={() => setTimerSeconds(prev => prev + 10)} 
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

      {/* --- APP HEADER --- */}
      <header className="fixed top-0 left-0 right-0 z-40 h-16 bg-white/70 dark:bg-stone-900/70 backdrop-blur-xl border-b border-white/20 dark:border-white/5 flex items-center justify-between px-4 lg:px-8 print:hidden shadow-sm">
        <div className="flex items-center gap-4">
          <Link to="/" className="p-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full text-stone-500 dark:text-stone-400 transition-colors" title="Back to Home">
            <ArrowLeft size={20} />
          </Link>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden p-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full text-stone-500 dark:text-stone-400">
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('generator')}>
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
            <h1 className="text-xl font-bold font-serif text-stone-800 dark:text-white tracking-tight">ZenFlow</h1>
          </div>
        </div>
        
        {/* Desktop Tabs */}
        <nav className="hidden lg:flex items-center bg-stone-100/50 dark:bg-stone-800/50 p-1 rounded-full border border-stone-200/50 dark:border-stone-700/50">
          {['generator', 'library', 'saved', 'settings'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 ${activeTab === tab ? 'bg-white dark:bg-stone-700 text-teal-800 dark:text-teal-100 shadow-sm' : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'}`}>
              {tab}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {!spotifyToken && <button onClick={() => window.location.href = getLoginUrl()} className="hidden sm:flex px-4 py-1.5 bg-[#1DB954] hover:bg-[#1ed760] text-white rounded-full text-xs font-bold items-center gap-1.5 transition-all shadow-sm"><LogIn size={14} /> Spotify</button>}
          {spotifyToken && <button onClick={handleLogout} className="p-2 text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-full transition-colors" title="Disconnect"><LogOut size={18} /></button>}
          <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500 dark:text-stone-400 transition-colors">{darkMode ? <Sun size={18} /> : <Moon size={18} />}</button>
        </div>
      </header>

      <div className="pt-16 flex h-full relative z-10">
        {/* --- SIDEBAR --- */}
        {isSidebarOpen && <div className="fixed inset-0 bg-stone-900/20 backdrop-blur-sm z-30 lg:hidden transition-opacity animate-in fade-in" onClick={() => setIsSidebarOpen(false)} />}
        <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-80 bg-white/80 dark:bg-stone-900/80 border-r border-stone-100 dark:border-stone-800 transform transition-transform duration-300 ease-[cubic-bezier(0.2,0,0,1)] flex flex-col backdrop-blur-xl ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-0 lg:border-none lg:overflow-hidden'} ${activeTab !== 'generator' ? 'lg:hidden' : ''}`}>
             <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-thin pb-24 lg:pb-6">
                <div className="flex justify-between items-center lg:hidden mb-6"><h2 className="font-serif font-bold text-xl text-stone-900 dark:text-white">Menu</h2><button onClick={() => setIsSidebarOpen(false)} className="text-stone-400 hover:text-stone-900"><X size={20}/></button></div>
                
                {/* Mobile Tab Navigation */}
                <div className="lg:hidden space-y-2">
                  {['generator', 'library', 'saved', 'settings'].map(tab => (
                    <button key={tab} onClick={() => { setActiveTab(tab); setIsSidebarOpen(false); }} className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-all flex items-center gap-3 ${activeTab === tab ? 'bg-stone-100 dark:bg-stone-800 text-teal-700 dark:text-teal-300' : 'text-stone-500 dark:text-stone-400'}`}>
                      {tab === 'generator' && <RefreshCw size={18} />} {tab === 'library' && <BookOpen size={18} />} {tab === 'saved' && <Heart size={18} />} {tab === 'settings' && <Settings size={18} />}
                      <span className="capitalize">{tab}</span>
                    </button>
                  ))}
                </div>

                {activeTab === 'generator' && (
                  <div className="space-y-8 animate-in fade-in-up">
                    <div>
                      <div className="flex justify-between text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest mb-4"><span>Duration</span> <span>{params.duration} min</span></div>
                      <input type="range" min="15" max="90" step="15" value={params.duration} onChange={(e) => setParams({...params, duration: parseInt(e.target.value)})} className="w-full h-1.5 bg-stone-200 dark:bg-stone-700 rounded-full appearance-none cursor-pointer accent-teal-600 hover:accent-teal-500 transition-all" />
                      <div className="flex justify-between mt-2 text-[10px] text-stone-400 font-mono"><span>15m</span><span>90m</span></div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest">Style</label>
                        <select value={params.style} onChange={(e) => setParams({...params, style: e.target.value})} className="w-full p-3 rounded-xl bg-stone-50 dark:bg-stone-800 border-none text-sm font-bold text-stone-700 dark:text-stone-200 focus:ring-2 focus:ring-teal-500/50">
                          {['Vinyasa', 'Hatha', 'Power', 'Yin', 'Restorative'].map(s => <option key={s}>{s}</option>)}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest">Level</label>
                        <select value={params.difficulty} onChange={(e) => setParams({...params, difficulty: e.target.value})} className="w-full p-3 rounded-xl bg-stone-50 dark:bg-stone-800 border-none text-sm font-bold text-stone-700 dark:text-stone-200 focus:ring-2 focus:ring-teal-500/50">
                          {['Beginner', 'Intermediate', 'Advanced'].map(l => <option key={l}>{l}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest">Focus</label>
                      <div className="grid grid-cols-2 gap-2">
                          {[
                            { id: SEQUENCE_METHODS.STANDARD, label: 'Balanced', icon: Layers },
                            { id: SEQUENCE_METHODS.PEAK, label: 'Peak Pose', icon: Target },
                            { id: SEQUENCE_METHODS.THEME, label: 'Themed', icon: Zap },
                            { id: SEQUENCE_METHODS.TARGET, label: 'Anatomy', icon: Anchor },
                          ].map(m => (
                            <button key={m.id} onClick={() => setParams({...params, method: m.id})} className={`p-3 rounded-xl text-xs font-bold border transition-all flex flex-col items-center gap-2 ${params.method === m.id ? 'bg-teal-50 border-teal-500 text-teal-800 dark:bg-teal-900/30 dark:text-teal-100 dark:border-teal-500' : 'bg-white dark:bg-stone-800 border-stone-100 dark:border-stone-700 text-stone-500 hover:bg-stone-50 dark:hover:bg-stone-700'}`}>
                              <m.icon size={18} /> {m.label}
                            </button>
                          ))}
                      </div>
                      {/* Dynamic Selectors based on method */}
                      {params.method === SEQUENCE_METHODS.PEAK && (
                          <select value={params.selectedPeakPose} onChange={(e) => setParams({...params, selectedPeakPose: e.target.value})} className="w-full p-3 rounded-xl bg-teal-50 dark:bg-teal-900/20 border border-teal-100 dark:border-teal-800 text-sm text-teal-900 dark:text-teal-100 font-medium animate-in fade-in-up">
                            {PEAK_POSES.map(p => <option key={p.id} value={p.id}>Peak: {p.name}</option>)}
                          </select>
                      )}
                      {params.method === SEQUENCE_METHODS.THEME && (
                          <select value={params.selectedTheme} onChange={(e) => setParams({...params, selectedTheme: e.target.value})} className="w-full p-3 rounded-xl bg-teal-50 dark:bg-teal-900/20 border border-teal-100 dark:border-teal-800 text-sm text-teal-900 dark:text-teal-100 font-medium animate-in fade-in-up">
                            {THEMES.map(t => <option key={t.id} value={t.id}>Theme: {t.name}</option>)}
                          </select>
                      )}
                      {params.method === SEQUENCE_METHODS.TARGET && (
                          <select value={params.selectedTarget} onChange={(e) => setParams({...params, selectedTarget: e.target.value})} className="w-full p-3 rounded-xl bg-teal-50 dark:bg-teal-900/20 border border-teal-100 dark:border-teal-800 text-sm text-teal-900 dark:text-teal-100 font-medium animate-in fade-in-up">
                            {TARGET_AREAS.map(t => <option key={t.id} value={t.id}>Focus: {t.name}</option>)}
                          </select>
                      )}
                    </div>

                    <div className="space-y-3 pt-4 border-t border-stone-100 dark:border-stone-800">
                      <label className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest">Preferences</label>
                      {['noWrists', 'kneeFriendly', 'pregnancySafe'].map(f => (
                        <label key={f} className="flex items-center gap-3 text-sm cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-800 p-2 -mx-2 rounded-lg transition-colors">
                          <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${params.filters[f] ? 'bg-teal-500 border-teal-500' : 'border-stone-300 dark:border-stone-600'}`}>
                            {params.filters[f] && <Check size={14} className="text-white" />}
                          </div>
                          <input type="checkbox" checked={params.filters[f]} onChange={() => setParams(p => ({...p, filters: {...p.filters, [f]: !p.filters[f]}}))} className="hidden" />
                          <span className="text-stone-600 dark:text-stone-300 capitalize font-medium">{f.replace(/([A-Z])/g, ' $1').trim()}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
             </div>
             
             {activeTab === 'generator' && (
               <div className="p-6 border-t border-stone-100 dark:border-stone-800 bg-white/50 dark:bg-stone-900/50 backdrop-blur-md">
                 <button onClick={generateSequence} className="w-full py-4 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-2xl shadow-xl shadow-stone-900/10 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 font-bold text-sm tracking-wide flex items-center justify-center gap-2">
                   <RefreshCw size={18} className={sequence.length === 0 ? "animate-spin-slow" : ""} /> Generate Flow
                 </button>
               </div>
             )}
        </aside>

        {/* --- MAIN CONTENT AREA --- */}
        <main className="flex-1 h-full overflow-y-auto relative scrollbar-thin pb-safe">
          <div className="max-w-5xl mx-auto p-4 lg:p-8 pb-32">
            
            {activeTab === 'library' && <div className="animate-in fade-in-up"><PoseLibrary setSelectedPose={setSelectedPose} /></div>}
            
            {activeTab === 'settings' && <div className="animate-in fade-in-up"><MusicConfig themes={musicThemes} onUpdateTheme={updateMusicTheme} spotifyToken={spotifyToken} getLoginUrl={getLoginUrl} isPremiumUser={isPremiumUser} tokenError={tokenError} /></div>}
            
            {activeTab === 'saved' && (
               <div className="animate-in fade-in-up space-y-8">
                 <div className="mb-8">
                   <h2 className="text-4xl font-serif text-stone-900 dark:text-white mb-2">Your Sanctuary</h2>
                   <p className="text-stone-500 dark:text-stone-400">Resuming practice is an act of self-care.</p>
                 </div>

                 {inProgress && (
                   <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/10 border border-amber-100 dark:border-amber-800/50 p-6 rounded-3xl flex flex-col sm:flex-row justify-between items-start sm:items-center shadow-sm gap-6 relative overflow-hidden group">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200/20 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
                     <div className="relative z-10">
                       <span className="inline-block px-3 py-1 bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200 rounded-full text-[10px] font-bold uppercase tracking-widest mb-3">In Progress</span>
                       <h3 className="font-bold text-xl text-stone-900 dark:text-stone-100 mb-1">{inProgress.name}</h3>
                       <p className="text-sm text-stone-500 dark:text-stone-400 font-medium">Pose { (inProgress.currentIndex || 0) + 1 } of {inProgress.poses.length} • {inProgress.params.style}</p>
                     </div>
                     <div className="flex gap-3 w-full sm:w-auto relative z-10">
                       <button onClick={() => resumePractice(inProgress)} className="flex-1 sm:flex-none px-6 py-3 bg-amber-900 dark:bg-amber-100 text-white dark:text-amber-900 rounded-xl font-bold hover:shadow-lg hover:-translate-y-0.5 transition-all">Resume</button>
                       <button onClick={clearInProgress} className="p-3 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/30 rounded-xl transition-colors"><Trash2 size={20} /></button>
                     </div>
                   </div>
                 )}

                 <div className="grid gap-4">
                   {savedSequences.map(s => (
                     <div key={s.id} className="bg-white dark:bg-stone-800 p-6 rounded-2xl border border-stone-100 dark:border-stone-700 flex justify-between items-center group hover:border-teal-200 dark:hover:border-teal-800 transition-colors">
                       <div>
                         <h3 className="font-bold text-lg dark:text-stone-100 mb-1">{s.name}</h3>
                         <p className="text-sm text-stone-400 font-medium">{s.params.style} • {s.params.duration} min • {s.date}</p>
                       </div>
                       <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button onClick={() => { setParams(s.params); setSequence(s.poses); setActiveTab('generator'); }} className="p-2 text-teal-600 bg-teal-50 dark:bg-teal-900/20 rounded-lg"><Play size={18}/></button>
                         <button onClick={() => deleteSaved(s.id)} className="p-2 text-rose-500 bg-rose-50 dark:bg-rose-900/20 rounded-lg"><Trash2 size={18}/></button>
                       </div>
                     </div>
                   ))}
                 </div>
               </div>
            )}

            {activeTab === 'generator' && (
              <div className="animate-in fade-in-up">
                {sequence.length > 0 && (
                  <div className="bg-white/80 dark:bg-stone-800/80 backdrop-blur-xl rounded-3xl shadow-soft border border-white/20 dark:border-stone-700 p-6 md:p-8 mb-8 sticky top-4 z-20">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div>
                        <div className="flex items-center gap-3 mb-3">
                          <span className="px-3 py-1 rounded-full bg-teal-100 dark:bg-teal-900/40 text-teal-800 dark:text-teal-200 text-[10px] font-bold uppercase tracking-widest">{params.style}</span>
                          <span className="px-3 py-1 rounded-full bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300 text-[10px] font-bold uppercase tracking-widest">{params.difficulty}</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-serif text-stone-900 dark:text-white leading-tight">
                            {params.method === SEQUENCE_METHODS.PEAK ? `Peak Focus: ${POSE_LIBRARY.find(p=>p.id===params.selectedPeakPose)?.name}` : 'Your Sequence'}
                        </h2>
                        <div className="flex gap-6 mt-4 text-sm text-stone-500 dark:text-stone-400 font-bold tracking-wide">
                          <span className="flex items-center gap-2"><Wind size={16}/> {params.duration} Mins</span>
                          <span className="flex items-center gap-2"><Activity size={16}/> {sequence.length} Poses</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-3">
                        <button onClick={() => { if(sequence.length > 0) { setPracticeIndex(0); setTimerSeconds(sequence[0].timerVal); setActiveTab('practice'); }}} className="flex-1 md:flex-none px-8 py-4 bg-teal-600 hover:bg-teal-500 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-teal-900/20 hover:-translate-y-1 transition-all duration-300">
                          <PlayCircle size={20} /> Begin Practice
                        </button>
                        <div className="flex gap-2">
                          <button onClick={() => setIsTeacherMode(!isTeacherMode)} className={`p-4 rounded-2xl border transition-all ${isTeacherMode ? 'bg-teal-50 border-teal-200 text-teal-700' : 'bg-white border-stone-200 text-stone-400 hover:bg-stone-50'}`} title="Teacher Mode"><BookOpen size={20} /></button>
                          <button onClick={() => { const name = prompt("Name flow:"); if(name) { const newSave = { id: Date.now(), name, date: new Date().toLocaleDateString(), params, poses: sequence }; setSavedSequences([newSave, ...savedSequences]); localStorage.setItem('yoga_saved_sequences', JSON.stringify([newSave, ...savedSequences])); } }} className="p-4 bg-white border border-stone-200 rounded-2xl text-stone-400 hover:text-rose-500 hover:border-rose-200 transition-colors"><Heart size={20} /></button>
                          <button onClick={handlePrint} className="p-4 bg-white border border-stone-200 rounded-2xl text-stone-400 hover:text-stone-900 hover:border-stone-300 transition-colors"><Printer size={20} /></button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Music Selector Inline */}
                    {!isTeacherMode && (
                      <div className="mt-8 pt-6 border-t border-stone-100 dark:border-stone-700 overflow-x-auto pb-2">
                        <div className="flex gap-3 min-w-max">
                          {musicThemes.map(theme => (
                            <button key={theme.id} onClick={() => setSelectedMusicId(theme.id)} className={`px-4 py-2 rounded-xl flex items-center gap-3 transition-all border ${selectedMusicId === theme.id ? 'bg-teal-50 border-teal-200 text-teal-800 dark:bg-teal-900/40 dark:border-teal-700 dark:text-teal-100' : 'bg-transparent border-transparent hover:bg-stone-50 dark:hover:bg-stone-800'}`}>
                              <div className={selectedMusicId === theme.id ? "text-teal-600" : "text-stone-400"}>{theme.icon}</div>
                              <span className="text-xs font-bold whitespace-nowrap">{theme.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className={isTeacherMode ? "grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-0" : "space-y-0"}>
                  {sequence.length === 0 ? (
                    <div className="text-center py-32 px-4">
                      <div className="w-24 h-24 bg-stone-100 dark:bg-stone-800 rounded-full flex items-center justify-center mx-auto mb-6 text-stone-300 dark:text-stone-600 animate-pulse">
                        <Wind size={40} />
                      </div>
                      <h3 className="text-2xl font-serif text-stone-400 dark:text-stone-500 mb-2">Your mat is ready.</h3>
                      <p className="text-stone-400 text-sm">Configure your preferences and generate a flow to begin.</p>
                    </div>
                  ) : (
                    sequence.map((pose, idx) => (<PoseCard key={pose.uniqueId} pose={pose} index={idx} onSwap={swapPose} onDelete={deletePose} setSelectedPose={setSelectedPose} isTeacherMode={isTeacherMode} isLast={idx === sequence.length - 1} isFirst={idx === 0} />))
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}