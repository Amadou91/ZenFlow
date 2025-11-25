import React, { useState, useEffect } from 'react';
import { 
  Menu, X, Play, RefreshCw, Settings, Heart, Copy, Printer, 
  Sun, Moon, Music, Wind, Activity, Trash2
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
 * MAIN APP COMPONENT
 */
export default function YogaRandomizer() {
  const [params, setParams] = useState({
    duration: 60, // mins
    difficulty: 'Intermediate',
    style: 'Vinyasa',
    pace: 'Moderate',
    filters: {
      noWrists: false,
      kneeFriendly: false,
      pregnancySafe: false,
    }
  });

  const [sequence, setSequence] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [savedSequences, setSavedSequences] = useState([]);
  const [activeTab, setActiveTab] = useState('generator');

  // Load dark mode preference
  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
    }
    const saved = localStorage.getItem('yoga_saved_sequences');
    if (saved) setSavedSequences(JSON.parse(saved));
  }, []);

  const updateParam = (key, value) => {
    setParams(prev => ({ ...prev, [key]: value }));
  };

  const toggleFilter = (key) => {
    setParams(prev => ({ 
      ...prev, 
      filters: { ...prev.filters, [key]: !prev.filters[key] } 
    }));
  };

  const generateSequence = () => {
    let pool = [...POSE_LIBRARY];

    // 1. Apply Filters
    if (params.filters.noWrists) pool = pool.filter(p => !p.wrist);
    if (params.filters.kneeFriendly) pool = pool.filter(p => !p.knee);
    if (params.filters.pregnancySafe) pool = pool.filter(p => p.pregnant);
    if (params.difficulty === 'Beginner') pool = pool.filter(p => p.difficulty <= 1);
    if (params.difficulty === 'Intermediate') pool = pool.filter(p => p.difficulty <= 2);

    // 2. Define Skeleton based on Duration
    const minutes = params.duration;
    let counts = {
      centering: 2,
      warmup: Math.floor(minutes * 0.15),
      sunSal: Math.floor(minutes * 0.15),
      standing: Math.floor(minutes * 0.30),
      balance: Math.floor(minutes * 0.10),
      floor: Math.floor(minutes * 0.20),
      savasana: 1
    };

    if (params.style === 'Yin' || params.style === 'Restorative') {
      counts = {
        centering: 3, warmup: 2, sunSal: 0, standing: 0, balance: 0,
        floor: Math.floor(minutes / 4), savasana: 1
      };
    }

    const pick = (category, count) => {
      let candidates = pool.filter(p => p.category === category);
      candidates = candidates.sort(() => 0.5 - Math.random());
      return candidates.slice(0, Math.max(1, count));
    };

    let newSequence = [];
    newSequence.push(...pick(POSE_CATEGORIES.CENTERING, counts.centering));
    newSequence.push(...pick(POSE_CATEGORIES.WARMUP, counts.warmup));

    if (counts.sunSal > 0) {
      const sunAIds = ['mtn', 'plk', 'chat', 'cobra', 'dd'];
      const sunFlow = sunAIds.map(id => POSE_LIBRARY.find(p => p.id === id)).filter(Boolean);
      // If we filtered out plank/chat/dd due to wrists, we need a modified flow
      if (sunFlow.length === 5) {
          newSequence.push(...sunFlow);
          if (params.duration > 45) newSequence.push(...sunFlow);
      }
    }

    newSequence.push(...pick(POSE_CATEGORIES.STANDING, counts.standing));
    newSequence.push(...pick(POSE_CATEGORIES.BALANCE, counts.balance));

    let floorCandidates = pool.filter(p => 
      [POSE_CATEGORIES.HIP_OPENER, POSE_CATEGORIES.TWIST, POSE_CATEGORIES.BACKBEND, POSE_CATEGORIES.RESTORATIVE].includes(p.category)
    );
    floorCandidates = floorCandidates.sort(() => 0.5 - Math.random());
    newSequence.push(...floorCandidates.slice(0, counts.floor));

    const sava = POSE_LIBRARY.find(p => p.id === 'sava');
    if (sava) newSequence.push(sava);

    const finalSequence = newSequence.map((pose, idx) => ({
      ...pose,
      uniqueId: `${pose.id}-${idx}-${Date.now()}`,
      duration: params.style === 'Yin' ? '3-5 min' : '5-8 breaths',
      transition: idx < newSequence.length - 1 ? 'Flow to...' : 'Relax completely.'
    }));

    setSequence(finalSequence);
    setActiveTab('generator');
  };

  const saveSequence = () => {
    if (sequence.length === 0) return;
    const name = prompt("Name your sequence:", `My ${params.style} Flow`);
    if (!name) return;
    const newSave = {
      id: Date.now(),
      name,
      date: new Date().toLocaleDateString(),
      params: { ...params },
      poses: sequence
    };
    const updated = [newSave, ...savedSequences];
    setSavedSequences(updated);
    localStorage.setItem('yoga_saved_sequences', JSON.stringify(updated));
  };

  const deleteSaved = (id) => {
    const updated = savedSequences.filter(s => s.id !== id);
    setSavedSequences(updated);
    localStorage.setItem('yoga_saved_sequences', JSON.stringify(updated));
  };

  const copyToClipboard = () => {
    const text = sequence.map((p, i) => `${i + 1}. ${p.name} (${p.sanskrit}) - ${p.duration}`).join('\n');
    navigator.clipboard.writeText(text);
    alert("Sequence copied to clipboard!");
  };

  const getDifficultyColor = (diff) => {
    // Changed: <= 1 captures both Level 1 and Level 0 (Savasana)
    if (diff <= 1) return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200';
    if (diff === 2) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    return 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200';
  };

  // Init
  useEffect(() => { generateSequence(); }, []);

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${darkMode ? 'dark bg-stone-900 text-stone-100' : 'bg-stone-50 text-stone-800'}`}>
      
      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-white/90 dark:bg-stone-800/90 backdrop-blur border-b border-stone-200 dark:border-stone-700 flex items-center justify-between px-4 lg:px-8 print:hidden">
        <div className="flex items-center gap-2">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-stone-100 dark:hover:bg-stone-700 rounded-lg lg:hidden">
            <Menu size={24} />
          </button>
          <div className="flex items-center gap-2">
            <Activity className="text-teal-600 dark:text-teal-400" />
            <h1 className="text-xl font-bold tracking-tight text-teal-900 dark:text-teal-100">ZenFlow <span className="hidden sm:inline font-normal opacity-70">Generator</span></h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors"
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button 
            onClick={() => setActiveTab('saved')}
            className="hidden sm:flex items-center gap-2 text-sm font-medium hover:text-teal-600 transition-colors"
          >
            <Heart size={18} /> Saved
          </button>
        </div>
      </header>

      <div className="pt-16 flex h-screen overflow-hidden">
        
        {/* SIDEBAR PARAMETERS */}
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

            {/* CLASS BASICS */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-teal-700 dark:text-teal-400 font-semibold uppercase text-xs tracking-wider">
                <Settings size={14} /> Basics
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Duration: {params.duration} min</label>
                <input 
                  type="range" min="15" max="90" step="15" 
                  value={params.duration} 
                  onChange={(e) => updateParam('duration', parseInt(e.target.value))}
                  className="w-full accent-teal-600 cursor-pointer"
                />
                <div className="flex justify-between text-xs opacity-60 mt-1">
                  <span>15</span><span>90</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Style</label>
                  <select 
                    value={params.style} 
                    onChange={(e) => updateParam('style', e.target.value)}
                    className="w-full p-2 rounded border border-stone-200 dark:border-stone-600 bg-stone-50 dark:bg-stone-700 text-sm"
                  >
                    <option>Vinyasa</option>
                    <option>Hatha</option>
                    <option>Power</option>
                    <option>Yin</option>
                    <option>Restorative</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Difficulty</label>
                  <select 
                    value={params.difficulty} 
                    onChange={(e) => updateParam('difficulty', e.target.value)}
                    className="w-full p-2 rounded border border-stone-200 dark:border-stone-600 bg-stone-50 dark:bg-stone-700 text-sm"
                  >
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                  </select>
                </div>
              </div>
            </div>

            {/* FILTERS */}
            <div className="space-y-3">
               <div className="flex items-center gap-2 text-teal-700 dark:text-teal-400 font-semibold uppercase text-xs tracking-wider">
                <Activity size={14} /> Filters
              </div>
              <label className="flex items-center gap-3 text-sm cursor-pointer hover:opacity-80">
                <input type="checkbox" checked={params.filters.noWrists} onChange={() => toggleFilter('noWrists')} className="accent-teal-600 w-4 h-4" />
                <span>Wrist-Friendly (No Plank/DownDog)</span>
              </label>
              <label className="flex items-center gap-3 text-sm cursor-pointer hover:opacity-80">
                <input type="checkbox" checked={params.filters.kneeFriendly} onChange={() => toggleFilter('kneeFriendly')} className="accent-teal-600 w-4 h-4" />
                <span>Knee-Friendly</span>
              </label>
              <label className="flex items-center gap-3 text-sm cursor-pointer hover:opacity-80">
                <input type="checkbox" checked={params.filters.pregnancySafe} onChange={() => toggleFilter('pregnancySafe')} className="accent-teal-600 w-4 h-4" />
                <span>Pregnancy Safe</span>
              </label>
            </div>

            {/* ACTION BUTTON */}
            <button 
              onClick={() => { generateSequence(); setIsSidebarOpen(false); }}
              className="w-full py-4 bg-teal-700 hover:bg-teal-800 text-white rounded-xl shadow-lg shadow-teal-700/20 font-bold flex items-center justify-center gap-2 transition-all transform active:scale-95"
            >
              <RefreshCw size={20} /> Generate Sequence
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 h-full overflow-y-auto bg-stone-50 dark:bg-stone-900 relative">
          
          {activeTab === 'saved' ? (
            <div className="max-w-4xl mx-auto p-6 lg:p-12">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-serif text-teal-900 dark:text-teal-100">Saved Flows</h2>
                <button onClick={() => setActiveTab('generator')} className="text-sm underline">Back to Generator</button>
              </div>
              
              {savedSequences.length === 0 ? (
                <div className="text-center py-20 opacity-50">
                  <Heart size={48} className="mx-auto mb-4" />
                  <p>No saved sequences yet.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {savedSequences.map(s => (
                    <div key={s.id} className="bg-white dark:bg-stone-800 p-6 rounded-xl shadow-sm border border-stone-100 dark:border-stone-700 flex justify-between items-center group">
                      <div>
                        <h3 className="font-bold text-lg">{s.name}</h3>
                        <p className="text-sm opacity-60">{s.params.style} • {s.params.duration} min • {s.date}</p>
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { setParams(s.params); setSequence(s.poses); setActiveTab('generator'); }} className="p-2 hover:bg-teal-50 dark:hover:bg-teal-900/30 text-teal-600 rounded-lg" title="Load">
                          <Play size={18} />
                        </button>
                        <button onClick={() => deleteSaved(s.id)} className="p-2 hover:bg-rose-50 dark:hover:bg-rose-900/30 text-rose-600 rounded-lg" title="Delete">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="max-w-4xl mx-auto p-4 lg:p-10 print:p-0 print:max-w-none">
              
              {/* SEQUENCE HEADER */}
              <div className="bg-white dark:bg-stone-800 rounded-2xl shadow-sm border border-stone-100 dark:border-stone-700 p-6 mb-8 print:border-none print:shadow-none">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-100 dark:border-stone-700 pb-6 mb-6">
                  <div>
                    <span className="text-xs font-bold tracking-widest text-teal-600 uppercase mb-1 block">Class Plan</span>
                    <h2 className="text-3xl font-serif text-stone-900 dark:text-white">
                      {params.difficulty} {params.style} Flow
                    </h2>
                    <div className="flex gap-4 mt-2 text-sm opacity-60">
                      <span className="flex items-center gap-1"><Wind size={14}/> {params.duration} Minutes</span>
                      <span className="flex items-center gap-1"><Activity size={14}/> {sequence.length} Poses</span>
                    </div>
                  </div>
                  
                  {/* EXPORT TOOLS */}
                  <div className="flex gap-2 print:hidden">
                    <button onClick={saveSequence} className="p-2 text-stone-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors" title="Save">
                      <Heart size={20} />
                    </button>
                    <button onClick={copyToClipboard} className="p-2 text-stone-500 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-lg transition-colors" title="Copy Text">
                      <Copy size={20} />
                    </button>
                    <button onClick={() => window.print()} className="p-2 text-stone-500 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-lg transition-colors" title="Print / PDF">
                      <Printer size={20} />
                    </button>
                  </div>
                </div>

                {/* PLAYLIST SUGGESTION */}
                <div className="flex items-center gap-3 p-4 bg-stone-50 dark:bg-stone-900/50 rounded-lg text-sm print:hidden">
                  <div className="p-2 bg-teal-100 dark:bg-teal-900 rounded-full text-teal-700 dark:text-teal-300">
                    <Music size={16} />
                  </div>
                  <div>
                    <span className="font-bold block text-stone-700 dark:text-stone-300">Suggested Vibe</span>
                    <span className="opacity-70">
                      {params.style === 'Power' || params.style === 'Vinyasa' ? 'Upbeat Electronic or Tribal Drums' : 'Ambient Drone or Nature Sounds'}
                    </span>
                  </div>
                </div>
              </div>

              {/* SEQUENCE LIST */}
              <div className="space-y-1 relative before:absolute before:left-8 before:top-4 before:bottom-4 before:w-0.5 before:bg-stone-200 dark:before:bg-stone-700 print:before:left-4">
                {sequence.map((pose) => (
                  <div key={pose.uniqueId} className="relative pl-16 group break-inside-avoid print:pl-10 print:mb-4">
                    
                    {/* TIMELINE DOT */}
                    {/* Changed: Standardized to always be teal (filled) to look consistent */}
                    <div className={`
                      absolute left-[26px] top-6 w-4 h-4 rounded-full border-4 border-white dark:border-stone-900 print:left-[10px]
                      bg-teal-500
                    `}></div>

                    {/* POSE CARD */}
                    <div className="bg-white dark:bg-stone-800 p-5 rounded-xl border border-stone-100 dark:border-stone-700 hover:shadow-md transition-shadow print:shadow-none print:border-stone-200">
                      <div className="flex justify-between items-start mb-1">
                        <div>
                          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1 block">{pose.category}</span>
                          <h3 className="font-bold text-lg text-stone-800 dark:text-stone-100 leading-tight">{pose.name}</h3>
                          <p className="text-stone-500 dark:text-stone-400 italic text-sm font-serif">{pose.sanskrit}</p>
                        </div>
                        <span className={`text-[10px] px-2 py-1 rounded font-bold uppercase tracking-wide ${getDifficultyColor(pose.difficulty)} print:border print:border-stone-200`}>
                          Level {pose.difficulty}
                        </span>
                      </div>

                      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="bg-stone-50 dark:bg-stone-900/50 p-3 rounded-lg print:bg-transparent print:p-0">
                          <strong className="block text-teal-700 dark:text-teal-400 text-xs uppercase mb-1">Cues</strong>
                          <p className="opacity-80 leading-relaxed">{pose.cues}</p>
                        </div>
                        <div className="flex flex-col justify-center gap-2 opacity-70">
                          <div className="flex items-center gap-2">
                            <Wind size={14} /> <span>Hold: <strong>{pose.duration}</strong></span>
                          </div>
                          <div className="flex items-center gap-2 text-xs italic">
                            <span>Next: {pose.transition}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* FOOTER */}
              <div className="mt-12 text-center text-stone-400 text-sm print:hidden">
                <p>Generated by ZenFlow. Practice mindfully.</p>
              </div>

            </div>
          )}
        </main>
      </div>
    </div>
  );
}