import React, { useState, useEffect } from 'react';
import { 
  Menu, X, Play, RefreshCw, Settings, Heart, Copy, Printer, 
  Sun, Moon, Music, Wind, Activity, Trash2, Search, BookOpen, 
  Shuffle, SkipForward, Pause, Circle, Headphones, ChevronRight,
  Info, PlayCircle
} from 'lucide-react';

/**
 * DATA: POSE LIBRARY
 */
const POSE_CATEGORIES = {
  CENTERING: 'Centering',
  WARMUP: 'Warmup',
  SUN_SALUTATION: 'Sun Salutation',
  STANDING: 'Standing',
  BALANCE: 'Balance',
  INVERSION: 'Inversion',
  BACKBEND: 'Backbend',
  TWIST: 'Twist',
  HIP_OPENER: 'Hip Opener',
  CORE: 'Core',
  RESTORATIVE: 'Restorative',
  SAVASANA: 'Savasana'
};

const POSE_LIBRARY = [
  // CENTERING
  { id: 'suc', name: 'Easy Pose', sanskrit: 'Sukhasana', category: POSE_CATEGORIES.CENTERING, difficulty: 1, wrist: false, knee: false, pregnant: true, cues: 'Sit tall, ground sit bones, hands on knees.', types: ['grounding'] },
  { id: 'vir', name: 'Hero Pose', sanskrit: 'Virasana', category: POSE_CATEGORIES.CENTERING, difficulty: 1, wrist: false, knee: false, pregnant: true, cues: 'Knees together, feet apart, sit between heels.', types: ['grounding'] },
  { id: 'chi', name: 'Child\'s Pose', sanskrit: 'Balasana', category: POSE_CATEGORIES.CENTERING, difficulty: 1, wrist: false, knee: true, pregnant: true, cues: 'Knees wide, big toes touch, forehead to mat.', types: ['grounding', 'hip-opener'] },

  // WARMUP
  { id: 'cat', name: 'Cat Pose', sanskrit: 'Marjaryasana', category: POSE_CATEGORIES.WARMUP, difficulty: 1, wrist: true, knee: true, pregnant: true, cues: 'Exhale, round spine to ceiling, chin to chest.', types: ['spine'] },
  { id: 'cow', name: 'Cow Pose', sanskrit: 'Bitilasana', category: POSE_CATEGORIES.WARMUP, difficulty: 1, wrist: true, knee: true, pregnant: true, cues: 'Inhale, drop belly, lift gaze.', types: ['spine'] },
  { id: 'thread', name: 'Thread the Needle', sanskrit: 'Parsva Balasana', category: POSE_CATEGORIES.WARMUP, difficulty: 1, wrist: true, knee: true, pregnant: true, cues: 'Slide arm under chest, rest shoulder on mat.', types: ['twist', 'shoulder'] },
  { id: 'dd', name: 'Downward Facing Dog', sanskrit: 'Adho Mukha Svanasana', category: POSE_CATEGORIES.WARMUP, difficulty: 2, wrist: true, knee: false, pregnant: true, cues: 'Hips high, heels down, press into knuckles.', types: ['hamstring', 'inversion'] },
  { id: 'rag', name: 'Ragdoll Fold', sanskrit: 'Uttanasana Variation', category: POSE_CATEGORIES.WARMUP, difficulty: 1, wrist: false, knee: false, pregnant: true, cues: 'Hold opposite elbows, sway gently side to side.', types: ['hamstring'] },

  // SUN SALUTATION
  { id: 'mtn', name: 'Mountain Pose', sanskrit: 'Tadasana', category: POSE_CATEGORIES.SUN_SALUTATION, difficulty: 1, wrist: false, knee: false, pregnant: true, cues: 'Feet grounded, palms forward, crown lifts.', types: ['standing'] },
  { id: 'plk', name: 'Plank Pose', sanskrit: 'Phalakasana', category: POSE_CATEGORIES.SUN_SALUTATION, difficulty: 2, wrist: true, knee: false, pregnant: false, cues: 'Core engaged, heels press back, dome upper back.', types: ['core', 'strength'] },
  { id: 'chat', name: 'Chaturanga', sanskrit: 'Chaturanga Dandasana', category: POSE_CATEGORIES.SUN_SALUTATION, difficulty: 3, wrist: true, knee: false, pregnant: false, cues: 'Lower halfway, elbows hug ribs.', types: ['strength'] },
  { id: 'cobra', name: 'Cobra Pose', sanskrit: 'Bhujangasana', category: POSE_CATEGORIES.SUN_SALUTATION, difficulty: 1, wrist: true, knee: false, pregnant: false, cues: 'Lift chest, little weight in hands, press tops of feet.', types: ['backbend'] },
  { id: 'updog', name: 'Upward Facing Dog', sanskrit: 'Urdhva Mukha Svanasana', category: POSE_CATEGORIES.SUN_SALUTATION, difficulty: 2, wrist: true, knee: false, pregnant: false, cues: 'Thighs lifted, chest open, shoulders down.', types: ['backbend'] },

  // STANDING
  { id: 'w1', name: 'Warrior I', sanskrit: 'Virabhadrasana I', category: POSE_CATEGORIES.STANDING, difficulty: 2, wrist: false, knee: false, pregnant: true, cues: 'Back heel down 45 degrees, hips square to front.', types: ['strength', 'hip-opener'] },
  { id: 'w2', name: 'Warrior II', sanskrit: 'Virabhadrasana II', category: POSE_CATEGORIES.STANDING, difficulty: 1, wrist: false, knee: false, pregnant: true, cues: 'Front knee over ankle, gaze over front middle finger.', types: ['strength', 'hip-opener'] },
  { id: 'tri', name: 'Triangle Pose', sanskrit: 'Trikonasana', category: POSE_CATEGORIES.STANDING, difficulty: 2, wrist: false, knee: false, pregnant: true, cues: 'Lengthen side body, hand to shin or block.', types: ['hamstring', 'hip-opener'] },
  { id: 'extside', name: 'Extended Side Angle', sanskrit: 'Utthita Parsvakonasana', category: POSE_CATEGORIES.STANDING, difficulty: 2, wrist: false, knee: false, pregnant: true, cues: 'Forearm to thigh or hand to floor, long diagonal line.', types: ['strength', 'side-stretch'] },
  { id: 'lunge', name: 'High Lunge', sanskrit: 'Ashta Chandrasana', category: POSE_CATEGORIES.STANDING, difficulty: 2, wrist: false, knee: false, pregnant: true, cues: 'Back heel lifted, hips square, arms reach up.', types: ['strength', 'balance'] },
  { id: 'goddess', name: 'Goddess Pose', sanskrit: 'Utkata Konasana', category: POSE_CATEGORIES.STANDING, difficulty: 2, wrist: false, knee: false, pregnant: true, cues: 'Toes out, heels in, sink hips, cactus arms.', types: ['strength', 'hip-opener'] },
  { id: 'chair', name: 'Chair Pose', sanskrit: 'Utkatasana', category: POSE_CATEGORIES.STANDING, difficulty: 2, wrist: false, knee: false, pregnant: true, cues: 'Sit back into heels, lift chest, tuck tailbone slightly.', types: ['strength'] },

  // BALANCE
  { id: 'tree', name: 'Tree Pose', sanskrit: 'Vrksasana', category: POSE_CATEGORIES.BALANCE, difficulty: 1, wrist: false, knee: false, pregnant: true, cues: 'Foot to calf or thigh (not knee), hands to heart.', types: ['balance', 'hip-opener'] },
  { id: 'eagle', name: 'Eagle Pose', sanskrit: 'Garudasana', category: POSE_CATEGORIES.BALANCE, difficulty: 3, wrist: false, knee: false, pregnant: true, cues: 'Wrap right leg over left, right arm under left.', types: ['balance', 'twist'] },
  { id: 'w3', name: 'Warrior III', sanskrit: 'Virabhadrasana III', category: POSE_CATEGORIES.BALANCE, difficulty: 3, wrist: false, knee: false, pregnant: true, cues: 'T-shape body, hips square to floor.', types: ['balance', 'strength'] },
  { id: 'dancer', name: 'Dancer Pose', sanskrit: 'Natarajasana', category: POSE_CATEGORIES.BALANCE, difficulty: 3, wrist: false, knee: false, pregnant: true, cues: 'Catch inside of back foot, kick into hand.', types: ['balance', 'backbend'] },

  // FLOOR / STRETCH / PEAK
  { id: 'pigeon', name: 'Half Pigeon', sanskrit: 'Eka Pada Rajakapotasana', category: POSE_CATEGORIES.HIP_OPENER, difficulty: 2, wrist: true, knee: true, pregnant: true, cues: 'Right knee to right wrist, shin diagonal.', types: ['hip-opener'] },
  { id: 'bridge', name: 'Bridge Pose', sanskrit: 'Setu Bandha Sarvangasana', category: POSE_CATEGORIES.BACKBEND, difficulty: 1, wrist: false, knee: false, pregnant: true, cues: 'Lift hips, interlace fingers under back.', types: ['backbend'] },
  { id: 'wheel', name: 'Wheel Pose', sanskrit: 'Urdhva Dhanurasana', category: POSE_CATEGORIES.BACKBEND, difficulty: 3, wrist: true, knee: false, pregnant: false, cues: 'Press into hands and feet, lift entire body.', types: ['backbend', 'peak'] },
  { id: 'boat', name: 'Boat Pose', sanskrit: 'Navasana', category: POSE_CATEGORIES.CORE, difficulty: 2, wrist: false, knee: false, pregnant: false, cues: 'Lift feet, balance on sit bones, chest open.', types: ['core'] },
  { id: 'crow', name: 'Crow Pose', sanskrit: 'Bakasana', category: POSE_CATEGORIES.BALANCE, difficulty: 3, wrist: true, knee: false, pregnant: false, cues: 'Knees to armpits, lean forward, float feet.', types: ['arm-balance', 'peak'] },
  { id: 'headstand', name: 'Headstand', sanskrit: 'Sirsasana', category: POSE_CATEGORIES.INVERSION, difficulty: 3, wrist: true, knee: false, pregnant: false, cues: 'Forearms down, interlace fingers, crown of head lightly down.', types: ['inversion', 'peak'] },
  
  // RESTORATIVE / COOL DOWN
  { id: 'paschi', name: 'Seated Forward Fold', sanskrit: 'Paschimottanasana', category: POSE_CATEGORIES.RESTORATIVE, difficulty: 1, wrist: false, knee: false, pregnant: true, cues: 'Lengthen spine then fold, keep feet flexed.', types: ['hamstring'] },
  { id: 'janu', name: 'Head to Knee', sanskrit: 'Janu Sirsasana', category: POSE_CATEGORIES.RESTORATIVE, difficulty: 1, wrist: false, knee: true, pregnant: true, cues: 'One leg straight, one foot to inner thigh, fold.', types: ['hamstring', 'hip-opener'] },
  { id: 'twist', name: 'Supine Twist', sanskrit: 'Supta Matsyendrasana', category: POSE_CATEGORIES.TWIST, difficulty: 1, wrist: false, knee: false, pregnant: true, cues: 'Knees to one side, gaze opposite.', types: ['twist', 'spine'] },
  { id: 'happy', name: 'Happy Baby', sanskrit: 'Ananda Balasana', category: POSE_CATEGORIES.HIP_OPENER, difficulty: 1, wrist: false, knee: false, pregnant: true, cues: 'Grab outer feet, pull knees toward armpits.', types: ['hip-opener'] },
  { id: 'sava', name: 'Corpse Pose', sanskrit: 'Savasana', category: POSE_CATEGORIES.SAVASANA, difficulty: 0, wrist: false, knee: false, pregnant: true, cues: 'Complete relaxation. Let go of breath control.', types: ['rest'] },
];

/**
 * MUSIC THEMES
 */
const MUSIC_THEMES = [
  { id: 'electronic', name: 'Tribal / Deep House', icon: <Activity size={16}/>, description: 'Upbeat rhythm for Power & Vinyasa flows.' },
  { id: 'ambient', name: 'Ambient Drone', icon: <Wind size={16}/>, description: 'Deep, spacious sounds for focus.' },
  { id: 'nature', name: 'Rain & Forest', icon: <Sun size={16}/>, description: 'Grounding natural textures.' },
  { id: 'lofi', name: 'Lo-Fi Beats', icon: <Headphones size={16}/>, description: 'Chill hop for a relaxed groove.' },
  { id: 'indian', name: 'Indian Flute', icon: <Music size={16}/>, description: 'Traditional atmosphere with Sitar & Flute.' },
  { id: 'silence', name: 'Breath Only', icon: <Moon size={16}/>, description: 'Pure silence to focus on Ujjayi breath.' },
];

/**
 * MAIN APP COMPONENT
 */
export default function YogaApp() {
  const [activeTab, setActiveTab] = useState('generator'); // 'generator', 'saved', 'library', 'practice'
  const [params, setParams] = useState({
    duration: 60,
    difficulty: 'Intermediate',
    style: 'Vinyasa',
    filters: { noWrists: false, kneeFriendly: false, pregnancySafe: false }
  });

  const [sequence, setSequence] = useState([]);
  const [savedSequences, setSavedSequences] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [musicTheme, setMusicTheme] = useState(MUSIC_THEMES[0]);
  
  // Practice Mode State
  const [practiceIndex, setPracticeIndex] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);

  // Load Preferences
  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
    }
    const saved = localStorage.getItem('yoga_saved_sequences');
    if (saved) setSavedSequences(JSON.parse(saved));
  }, []);

  // Timer Logic
  useEffect(() => {
    let interval = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => setTimerSeconds(s => s - 1), 1000);
    } else if (timerSeconds === 0) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  // --- CORE FUNCTIONS ---

  const generateSequence = () => {
    let pool = [...POSE_LIBRARY];

    // Filters
    if (params.filters.noWrists) pool = pool.filter(p => !p.wrist);
    if (params.filters.kneeFriendly) pool = pool.filter(p => !p.knee);
    if (params.filters.pregnancySafe) pool = pool.filter(p => p.pregnant);
    if (params.difficulty === 'Beginner') pool = pool.filter(p => p.difficulty <= 1);
    if (params.difficulty === 'Intermediate') pool = pool.filter(p => p.difficulty <= 2);

    // Structure
    const minutes = params.duration;
    let counts = {
      centering: 2, warmup: Math.floor(minutes * 0.15), sunSal: Math.floor(minutes * 0.15),
      standing: Math.floor(minutes * 0.30), balance: Math.floor(minutes * 0.10),
      floor: Math.floor(minutes * 0.20), savasana: 1
    };

    if (params.style === 'Yin' || params.style === 'Restorative') {
      counts = { centering: 3, warmup: 2, sunSal: 0, standing: 0, balance: 0, floor: Math.floor(minutes / 4), savasana: 1 };
    }

    const pick = (category, count) => {
      let candidates = pool.filter(p => p.category === category).sort(() => 0.5 - Math.random());
      return candidates.slice(0, Math.max(1, count));
    };

    let newSequence = [];
    newSequence.push(...pick(POSE_CATEGORIES.CENTERING, counts.centering));
    newSequence.push(...pick(POSE_CATEGORIES.WARMUP, counts.warmup));

    if (counts.sunSal > 0) {
      const sunAIds = ['mtn', 'plk', 'chat', 'cobra', 'dd'];
      const sunFlow = sunAIds.map(id => POSE_LIBRARY.find(p => p.id === id)).filter(Boolean);
      if (sunFlow.length === 5) {
        newSequence.push(...sunFlow);
        if (params.duration > 45) newSequence.push(...sunFlow);
      }
    }

    newSequence.push(...pick(POSE_CATEGORIES.STANDING, counts.standing));
    newSequence.push(...pick(POSE_CATEGORIES.BALANCE, counts.balance));

    let floorCandidates = pool.filter(p => [POSE_CATEGORIES.HIP_OPENER, POSE_CATEGORIES.TWIST, POSE_CATEGORIES.BACKBEND, POSE_CATEGORIES.RESTORATIVE].includes(p.category)).sort(() => 0.5 - Math.random());
    newSequence.push(...floorCandidates.slice(0, counts.floor));

    const sava = POSE_LIBRARY.find(p => p.id === 'sava');
    if (sava) newSequence.push(sava);

    const finalSequence = newSequence.map((pose, idx) => ({
      ...pose,
      uniqueId: `${pose.id}-${idx}-${Date.now()}`,
      duration: params.style === 'Yin' ? '3-5 min' : '5-8 breaths',
      timerVal: params.style === 'Yin' ? 180 : 30, // seconds for timer
      transition: idx < newSequence.length - 1 ? 'Flow to...' : 'Relax completely.'
    }));

    setSequence(finalSequence);
    setActiveTab('generator');
  };

  const swapPose = (index) => {
    const currentPose = sequence[index];
    const sameCategory = POSE_LIBRARY.filter(p => 
      p.category === currentPose.category && 
      p.id !== currentPose.id &&
      (!params.filters.noWrists || !p.wrist) &&
      (!params.filters.kneeFriendly || !p.knee)
    );
    
    if (sameCategory.length > 0) {
      const newPose = sameCategory[Math.floor(Math.random() * sameCategory.length)];
      const updatedSeq = [...sequence];
      updatedSeq[index] = {
        ...newPose,
        uniqueId: `${newPose.id}-${index}-${Date.now()}`,
        duration: currentPose.duration,
        timerVal: currentPose.timerVal,
        transition: currentPose.transition
      };
      setSequence(updatedSeq);
    } else {
      alert("No alternate poses available in this category with current filters.");
    }
  };

  const startPractice = () => {
    if (sequence.length === 0) return;
    setPracticeIndex(0);
    setTimerSeconds(sequence[0].timerVal);
    setActiveTab('practice');
    setIsTimerRunning(false);
  };

  const nextPracticePose = () => {
    if (practiceIndex < sequence.length - 1) {
      const nextIdx = practiceIndex + 1;
      setPracticeIndex(nextIdx);
      setTimerSeconds(sequence[nextIdx].timerVal);
      setIsTimerRunning(true);
    } else {
      // Finished
      setActiveTab('generator');
    }
  };

  const deleteSaved = (id) => {
    const updated = savedSequences.filter(s => s.id !== id);
    setSavedSequences(updated);
    localStorage.setItem('yoga_saved_sequences', JSON.stringify(updated));
  };

  // --- SUB-COMPONENTS ---

  const PoseCard = ({ pose, index, onSwap }) => (
    <div className="relative pl-16 group break-inside-avoid print:pl-10 print:mb-4">
      {/* Timeline Dot (Uniform Teal) */}
      <div className="absolute left-[26px] top-6 w-4 h-4 rounded-full border-4 border-white dark:border-stone-900 bg-teal-500 print:left-[10px]"></div>

      <div className="bg-white dark:bg-stone-800 p-5 rounded-xl border border-stone-100 dark:border-stone-700 hover:shadow-md transition-shadow group relative">
        <div className="flex justify-between items-start mb-1">
          <div>
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1 block">{pose.category}</span>
            <h3 className="font-bold text-lg text-stone-800 dark:text-stone-100 leading-tight">{pose.name}</h3>
            <p className="text-stone-500 dark:text-stone-400 italic text-sm font-serif">{pose.sanskrit}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
             <span className={`text-[10px] px-2 py-1 rounded font-bold uppercase tracking-wide ${pose.difficulty <= 1 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200' : pose.difficulty === 2 ? 'bg-yellow-100 text-yellow-800' : 'bg-rose-100 text-rose-800'}`}>
              Level {pose.difficulty}
            </span>
            <button onClick={() => onSwap(index)} className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-stone-400 hover:text-teal-600" title="Swap Pose">
              <Shuffle size={14} />
            </button>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="bg-stone-50 dark:bg-stone-900/50 p-3 rounded-lg">
            <strong className="block text-teal-700 dark:text-teal-400 text-xs uppercase mb-1">Cues</strong>
            <p className="opacity-80 leading-relaxed">{pose.cues}</p>
          </div>
          <div className="flex flex-col justify-center gap-2 opacity-70">
            <div className="flex items-center gap-2">
              <Wind size={14} /> <span>Hold: <strong>{pose.duration}</strong></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const PoseLibrary = () => {
    const [search, setSearch] = useState('');
    const filtered = POSE_LIBRARY.filter(p => 
      p.name.toLowerCase().includes(search.toLowerCase()) || 
      p.sanskrit.toLowerCase().includes(search.toLowerCase())
    );

    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-serif text-teal-900 dark:text-teal-100">Pose Lab</h2>
            <p className="text-stone-500">Explore the encyclopedia of movement.</p>
          </div>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-3 text-stone-400" size={18} />
            <input 
              type="text" placeholder="Search poses..." 
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(pose => (
            <div key={pose.id} className="bg-white dark:bg-stone-800 p-5 rounded-xl border border-stone-200 dark:border-stone-700 hover:border-teal-500 transition-colors">
              <div className="flex justify-between">
                <h3 className="font-bold text-lg">{pose.name}</h3>
                <span className="text-xs bg-stone-100 dark:bg-stone-700 px-2 py-1 rounded">{pose.category}</span>
              </div>
              <p className="text-sm italic text-stone-500 mb-3">{pose.sanskrit}</p>
              <p className="text-sm opacity-80 mb-2">{pose.cues}</p>
              <div className="flex gap-2 mt-3">
                 {pose.types.map(t => <span key={t} className="text-[10px] uppercase font-bold text-teal-600 bg-teal-50 dark:bg-teal-900/30 px-2 py-1 rounded">{t}</span>)}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const PracticeMode = () => {
    const current = sequence[practiceIndex];
    const next = sequence[practiceIndex + 1];

    return (
      <div className="fixed inset-0 z-[60] bg-stone-900 text-stone-100 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-stone-800">
          <div className="flex items-center gap-2">
            <Activity className="text-teal-400" />
            <span className="font-bold tracking-widest uppercase">Live Practice</span>
          </div>
          <button onClick={() => setActiveTab('generator')} className="p-2 hover:bg-stone-800 rounded-full"><X /></button>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <span className="text-teal-400 font-bold uppercase tracking-widest mb-4">{current.category}</span>
          <h1 className="text-5xl md:text-7xl font-serif mb-2">{current.name}</h1>
          <p className="text-2xl text-stone-400 italic font-serif mb-12">{current.sanskrit}</p>
          
          {/* Timer Ring */}
          <div className="relative w-48 h-48 flex items-center justify-center mb-12">
            <div className={`absolute inset-0 rounded-full border-4 ${isTimerRunning ? 'border-teal-500 animate-pulse' : 'border-stone-700'}`}></div>
            <div className="text-6xl font-mono font-bold">{Math.floor(timerSeconds / 60)}:{String(timerSeconds % 60).padStart(2, '0')}</div>
          </div>

          {/* Cues */}
          <p className="text-xl max-w-2xl leading-relaxed opacity-90">{current.cues}</p>
        </div>

        {/* Footer Controls */}
        <div className="bg-stone-800 p-6 flex items-center justify-between">
          <div className="w-1/3">
            {next && (
              <div className="hidden md:block opacity-60">
                <span className="text-xs uppercase block mb-1">Up Next</span>
                <span className="font-bold">{next.name}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsTimerRunning(!isTimerRunning)} 
              className="w-16 h-16 bg-teal-500 hover:bg-teal-400 rounded-full flex items-center justify-center text-stone-900 transition-transform hover:scale-105"
            >
              {isTimerRunning ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" ml="1" />}
            </button>
            <button 
              onClick={nextPracticePose} 
              className="p-4 hover:bg-stone-700 rounded-full transition-colors"
            >
              <SkipForward size={24} />
            </button>
          </div>

          <div className="w-1/3 flex justify-end items-center gap-2 opacity-60">
            <Music size={16} />
            <span className="text-sm hidden md:inline">{musicTheme.name}</span>
          </div>
        </div>
      </div>
    );
  };

  // --- RENDER ---

  // Init Generator on Load
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if(sequence.length === 0) generateSequence(); }, []);

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${darkMode ? 'dark bg-stone-900 text-stone-100' : 'bg-stone-50 text-stone-800'}`}>
      
      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-white/90 dark:bg-stone-800/90 backdrop-blur border-b border-stone-200 dark:border-stone-700 flex items-center justify-between px-4 lg:px-8 print:hidden">
        <div className="flex items-center gap-2">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-stone-100 dark:hover:bg-stone-700 rounded-lg lg:hidden">
            <Menu size={24} />
          </button>
          <div className="flex items-center gap-2" onClick={() => setActiveTab('generator')}>
            <Activity className="text-teal-600 dark:text-teal-400" />
            <h1 className="text-xl font-bold tracking-tight text-teal-900 dark:text-teal-100 cursor-pointer">ZenFlow</h1>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          <button onClick={() => setActiveTab('generator')} className={`text-sm font-medium ${activeTab === 'generator' ? 'text-teal-600' : 'opacity-60 hover:opacity-100'}`}>Generator</button>
          <button onClick={() => setActiveTab('library')} className={`text-sm font-medium ${activeTab === 'library' ? 'text-teal-600' : 'opacity-60 hover:opacity-100'}`}>Pose Lab</button>
          <button onClick={() => setActiveTab('saved')} className={`text-sm font-medium ${activeTab === 'saved' ? 'text-teal-600' : 'opacity-60 hover:opacity-100'}`}>Saved Flows</button>
        </nav>

        <div className="flex items-center gap-3">
          <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors">
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </header>

      {/* OVERLAY: PRACTICE MODE */}
      {activeTab === 'practice' && <PracticeMode />}

      {/* MAIN LAYOUT */}
      <div className="pt-16 flex h-screen overflow-hidden">
        
        {/* SIDEBAR (Only visible in Generator) */}
        {activeTab === 'generator' && (
          <aside className={`
            absolute lg:relative z-40 w-full lg:w-80 h-[calc(100vh-64px)] 
            bg-white dark:bg-stone-800 border-r border-stone-200 dark:border-stone-700 
            transform transition-transform duration-300 overflow-y-auto print:hidden
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-0 lg:border-none lg:overflow-hidden'}
          `}>
            <div className="p-6 space-y-8">
              <div className="flex justify-between items-center lg:hidden">
                <h2 className="font-bold text-lg">Class Settings</h2>
                <button onClick={() => setIsSidebarOpen(false)}><X /></button>
              </div>

              {/* SETTINGS FORM */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-teal-700 dark:text-teal-400 font-semibold uppercase text-xs tracking-wider"><Settings size={14} /> Basics</div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Duration: {params.duration} min</label>
                  <input type="range" min="15" max="90" step="15" value={params.duration} onChange={(e) => setParams({...params, duration: parseInt(e.target.value)})} className="w-full accent-teal-600 cursor-pointer" />
                  <div className="flex justify-between text-xs opacity-60 mt-1"><span>15</span><span>90</span></div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Style</label>
                    <select value={params.style} onChange={(e) => setParams({...params, style: e.target.value})} className="w-full p-2 rounded border border-stone-200 dark:border-stone-600 bg-stone-50 dark:bg-stone-700 text-sm">
                      <option>Vinyasa</option><option>Hatha</option><option>Power</option><option>Yin</option><option>Restorative</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Difficulty</label>
                    <select value={params.difficulty} onChange={(e) => setParams({...params, difficulty: e.target.value})} className="w-full p-2 rounded border border-stone-200 dark:border-stone-600 bg-stone-50 dark:bg-stone-700 text-sm">
                      <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                 <div className="flex items-center gap-2 text-teal-700 dark:text-teal-400 font-semibold uppercase text-xs tracking-wider"><Activity size={14} /> Filters</div>
                 <label className="flex items-center gap-3 text-sm cursor-pointer hover:opacity-80"><input type="checkbox" checked={params.filters.noWrists} onChange={() => setParams(p => ({...p, filters: {...p.filters, noWrists: !p.filters.noWrists}}))} className="accent-teal-600 w-4 h-4" /><span>Wrist-Friendly</span></label>
                 <label className="flex items-center gap-3 text-sm cursor-pointer hover:opacity-80"><input type="checkbox" checked={params.filters.kneeFriendly} onChange={() => setParams(p => ({...p, filters: {...p.filters, kneeFriendly: !p.filters.kneeFriendly}}))} className="accent-teal-600 w-4 h-4" /><span>Knee-Friendly</span></label>
                 <label className="flex items-center gap-3 text-sm cursor-pointer hover:opacity-80"><input type="checkbox" checked={params.filters.pregnancySafe} onChange={() => setParams(p => ({...p, filters: {...p.filters, pregnancySafe: !p.filters.pregnancySafe}}))} className="accent-teal-600 w-4 h-4" /><span>Pregnancy Safe</span></label>
              </div>

              <button onClick={() => { generateSequence(); setIsSidebarOpen(false); }} className="w-full py-4 bg-teal-700 hover:bg-teal-800 text-white rounded-xl shadow-lg shadow-teal-700/20 font-bold flex items-center justify-center gap-2 transition-all transform active:scale-95">
                <RefreshCw size={20} /> Generate Sequence
              </button>
            </div>
          </aside>
        )}

        {/* CONTENT AREA */}
        <main className="flex-1 h-full overflow-y-auto bg-stone-50 dark:bg-stone-900 relative">
          
          {activeTab === 'library' && <PoseLibrary />}

          {activeTab === 'saved' && (
            <div className="max-w-4xl mx-auto p-6 lg:p-12">
               <h2 className="text-3xl font-serif text-teal-900 dark:text-teal-100 mb-8">Saved Flows</h2>
               {savedSequences.length === 0 ? <p className="opacity-50 text-center">No saved flows yet.</p> : (
                 <div className="grid gap-4">
                   {savedSequences.map(s => (
                     <div key={s.id} className="bg-white dark:bg-stone-800 p-6 rounded-xl flex justify-between items-center group shadow-sm">
                        <div><h3 className="font-bold text-lg">{s.name}</h3><p className="text-sm opacity-60">{s.params.style} • {s.params.duration} min</p></div>
                        <div className="flex gap-2">
                          <button onClick={() => { setParams(s.params); setSequence(s.poses); setActiveTab('generator'); }} className="p-2 text-teal-600 hover:bg-teal-50 rounded-lg"><Play size={18} /></button>
                          <button onClick={() => deleteSaved(s.id)} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg"><Trash2 size={18} /></button>
                        </div>
                     </div>
                   ))}
                 </div>
               )}
            </div>
          )}

          {activeTab === 'generator' && (
            <div className="max-w-4xl mx-auto p-4 lg:p-10 print:p-0 print:max-w-none">
              
              {/* SEQUENCE HEADER CARD */}
              <div className="bg-white dark:bg-stone-800 rounded-2xl shadow-sm border border-stone-100 dark:border-stone-700 p-6 mb-8 print:border-none print:shadow-none">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-100 dark:border-stone-700 pb-6 mb-6">
                  <div>
                    <span className="text-xs font-bold tracking-widest text-teal-600 uppercase mb-1 block">Class Plan</span>
                    <h2 className="text-3xl font-serif text-stone-900 dark:text-white">{params.difficulty} {params.style} Flow</h2>
                    <div className="flex gap-4 mt-2 text-sm opacity-60">
                      <span className="flex items-center gap-1"><Wind size={14}/> {params.duration} Mins</span>
                      <span className="flex items-center gap-1"><Activity size={14}/> {sequence.length} Poses</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 print:hidden">
                    <button onClick={startPractice} className="px-4 py-2 bg-stone-900 dark:bg-white text-white dark:text-stone-900 hover:opacity-90 rounded-lg font-bold flex items-center gap-2 shadow-lg">
                      <PlayCircle size={18} /> Start
                    </button>
                    <button onClick={() => { 
                      const name = prompt("Name flow:"); 
                      if(name) {
                        const newSave = { id: Date.now(), name, date: new Date().toLocaleDateString(), params, poses: sequence };
                        setSavedSequences([newSave, ...savedSequences]);
                        localStorage.setItem('yoga_saved_sequences', JSON.stringify([newSave, ...savedSequences]));
                      }
                    }} className="p-2 text-stone-500 hover:text-rose-500 hover:bg-rose-50 rounded-lg"><Heart size={20} /></button>
                    <button onClick={() => { navigator.clipboard.writeText(sequence.map(p => p.name).join('\n')); alert('Copied!'); }} className="p-2 text-stone-500 hover:text-teal-600 hover:bg-teal-50 rounded-lg"><Copy size={20} /></button>
                    <button onClick={() => window.print()} className="p-2 text-stone-500 hover:text-teal-600 hover:bg-teal-50 rounded-lg"><Printer size={20} /></button>
                  </div>
                </div>

                {/* SOUNDSCAPE SELECTOR */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 print:hidden">
                  {MUSIC_THEMES.map(theme => (
                    <button 
                      key={theme.id}
                      onClick={() => setMusicTheme(theme)}
                      className={`p-3 rounded-lg flex items-center gap-3 text-left transition-all border ${musicTheme.id === theme.id ? 'bg-teal-50 border-teal-200 dark:bg-teal-900/30 dark:border-teal-800 ring-1 ring-teal-500' : 'bg-stone-50 dark:bg-stone-900 border-transparent hover:bg-stone-100 dark:hover:bg-stone-800'}`}
                    >
                      <div className={`p-2 rounded-full ${musicTheme.id === theme.id ? 'bg-teal-100 text-teal-700 dark:bg-teal-800 dark:text-teal-200' : 'bg-stone-200 dark:bg-stone-700 text-stone-500'}`}>
                        {theme.icon}
                      </div>
                      <div>
                        <span className="block text-sm font-bold">{theme.name}</span>
                        <span className="block text-xs opacity-60 truncate w-32">{theme.description}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* LIST VIEW */}
              <div className="space-y-1 relative before:absolute before:left-8 before:top-4 before:bottom-4 before:w-0.5 before:bg-stone-200 dark:before:bg-stone-700 print:before:left-4">
                {sequence.map((pose, idx) => (
                  <PoseCard key={pose.uniqueId} pose={pose} index={idx} onSwap={swapPose} />
                ))}
              </div>

              <div className="mt-12 text-center text-stone-400 text-sm print:hidden">
                <p>Generated by ZenFlow.</p>
              </div>

            </div>
          )}
        </main>
      </div>
    </div>
  );
}