import React, { useState, useEffect, useCallback } from 'react';
import { 
  Menu, X, Play, RefreshCw, Settings, Heart, Printer, 
  Sun, Moon, Music, Wind, Activity, Trash2, Search, 
  Shuffle, SkipForward, Pause, PlayCircle, Info, Check, Headphones,
  Layers, Target, Zap, Anchor, BookOpen, User, Feather, ExternalLink,
  LogOut, LogIn, Edit3
} from 'lucide-react';

// --- 1. DATA & CONSTANTS ---

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
  { 
    id: 'suc', name: 'Easy Pose', sanskrit: 'Sukhasana', category: POSE_CATEGORIES.CENTERING, difficulty: 1, wrist: false, knee: false, pregnant: true, 
    cues: 'Sit tall, ground sit bones, hands on knees.', 
    benefits: ['Calms the brain', 'Strengthens the back', 'Stretches knees and ankles'],
    types: ['grounding', 'meditation']
  },
  { 
    id: 'vir', name: 'Hero Pose', sanskrit: 'Virasana', category: POSE_CATEGORIES.CENTERING, difficulty: 1, wrist: false, knee: false, pregnant: true, 
    cues: 'Knees together, feet apart, sit between heels.', 
    benefits: ['Stretches thighs and knees', 'Improves digestion', 'Relieves tired legs'],
    types: ['grounding', 'knees']
  },
  { 
    id: 'chi', name: 'Child\'s Pose', sanskrit: 'Balasana', category: POSE_CATEGORIES.CENTERING, difficulty: 1, wrist: false, knee: true, pregnant: true, 
    cues: 'Knees wide, big toes touch, forehead to mat.', 
    benefits: ['Gently stretches hips and thighs', 'Calms the mind', 'Relieves back and neck pain'],
    types: ['grounding', 'hip-opener', 'rest']
  },

  // WARMUP
  { 
    id: 'cat', name: 'Cat Pose', sanskrit: 'Marjaryasana', category: POSE_CATEGORIES.WARMUP, difficulty: 1, wrist: true, knee: true, pregnant: true, 
    cues: 'Exhale, round spine to ceiling, chin to chest.', 
    benefits: ['Increases spine flexibility', 'Stretches back torso and neck', 'Stimulates abdominal organs'],
    types: ['spine', 'warmup']
  },
  { 
    id: 'cow', name: 'Cow Pose', sanskrit: 'Bitilasana', category: POSE_CATEGORIES.WARMUP, difficulty: 1, wrist: true, knee: true, pregnant: true, 
    cues: 'Inhale, drop belly, lift gaze.', 
    benefits: ['Stretches front torso and neck', 'Massages spine', 'Calms the mind'],
    types: ['spine', 'warmup']
  },
  { 
    id: 'thread', name: 'Thread the Needle', sanskrit: 'Parsva Balasana', category: POSE_CATEGORIES.WARMUP, difficulty: 1, wrist: true, knee: true, pregnant: true, 
    cues: 'Slide arm under chest, rest shoulder on mat.', 
    benefits: ['Opens shoulders', 'Gentle spinal twist', 'Relieves tension in upper back'],
    types: ['twist', 'shoulder']
  },
  { 
    id: 'dd', name: 'Downward Facing Dog', sanskrit: 'Adho Mukha Svanasana', category: POSE_CATEGORIES.WARMUP, difficulty: 2, wrist: true, knee: false, pregnant: true, 
    cues: 'Hips high, heels down, press into knuckles.', 
    benefits: ['Energizes the body', 'Stretches shoulders, hamstrings, calves', 'Strengthens arms and legs'],
    types: ['hamstring', 'inversion', 'strength']
  },
  { 
    id: 'rag', name: 'Ragdoll Fold', sanskrit: 'Uttanasana Variation', category: POSE_CATEGORIES.WARMUP, difficulty: 1, wrist: false, knee: false, pregnant: true, 
    cues: 'Hold opposite elbows, sway gently side to side.', 
    benefits: ['Releases lower back', 'Calms the nervous system', 'Stretches hamstrings'],
    types: ['hamstring', 'spine']
  },

  // SUN SALUTATION
  { 
    id: 'mtn', name: 'Mountain Pose', sanskrit: 'Tadasana', category: POSE_CATEGORIES.SUN_SALUTATION, difficulty: 1, wrist: false, knee: false, pregnant: true, 
    cues: 'Feet grounded, palms forward, crown lifts.', 
    benefits: ['Improves posture', 'Strengthens thighs, knees, and ankles', 'Firms abdomen and buttocks'],
    types: ['standing', 'grounding']
  },
  { 
    id: 'plk', name: 'Plank Pose', sanskrit: 'Phalakasana', category: POSE_CATEGORIES.SUN_SALUTATION, difficulty: 2, wrist: true, knee: false, pregnant: false, 
    cues: 'Core engaged, heels press back, dome upper back.', 
    benefits: ['Strengthens arms, wrists, and spine', 'Tones abdomen', 'Prepares body for advanced arm balances'],
    types: ['core', 'strength']
  },
  { 
    id: 'chat', name: 'Chaturanga', sanskrit: 'Chaturanga Dandasana', category: POSE_CATEGORIES.SUN_SALUTATION, difficulty: 3, wrist: true, knee: false, pregnant: false, 
    cues: 'Lower halfway, elbows hug ribs.', 
    benefits: ['Develops core stability', 'Strengthens arms and wrists', 'Tones abdomen'],
    types: ['strength', 'arm-balance']
  },
  { 
    id: 'cobra', name: 'Cobra Pose', sanskrit: 'Bhujangasana', category: POSE_CATEGORIES.SUN_SALUTATION, difficulty: 1, wrist: true, knee: false, pregnant: false, 
    cues: 'Lift chest, little weight in hands, press tops of feet.', 
    benefits: ['Strengthens the spine', 'Stretches chest and lungs, shoulders, and abdomen', 'Stimulates abdominal organs'],
    types: ['backbend', 'spine']
  },
  { 
    id: 'updog', name: 'Upward Facing Dog', sanskrit: 'Urdhva Mukha Svanasana', category: POSE_CATEGORIES.SUN_SALUTATION, difficulty: 2, wrist: true, knee: false, pregnant: false, 
    cues: 'Thighs lifted, chest open, shoulders down.', 
    benefits: ['Improves posture', 'Strengthens spine, arms, wrists', 'Stretches chest and lungs'],
    types: ['backbend', 'strength']
  },

  // STANDING
  { 
    id: 'w1', name: 'Warrior I', sanskrit: 'Virabhadrasana I', category: POSE_CATEGORIES.STANDING, difficulty: 2, wrist: false, knee: false, pregnant: true, 
    cues: 'Back heel down 45 degrees, hips square to front.', 
    benefits: ['Stretches chest and lungs', 'Strengthens shoulders and arms', 'Strengthens and stretches thighs and calves'],
    types: ['strength', 'hip-opener', 'standing']
  },
  { 
    id: 'w2', name: 'Warrior II', sanskrit: 'Virabhadrasana II', category: POSE_CATEGORIES.STANDING, difficulty: 1, wrist: false, knee: false, pregnant: true, 
    cues: 'Front knee over ankle, gaze over front middle finger.', 
    benefits: ['Increases stamina', 'Strengthens legs and ankles', 'Stretches groins, chest and shoulders'],
    types: ['strength', 'hip-opener', 'standing']
  },
  { 
    id: 'tri', name: 'Triangle Pose', sanskrit: 'Trikonasana', category: POSE_CATEGORIES.STANDING, difficulty: 2, wrist: false, knee: false, pregnant: true, 
    cues: 'Lengthen side body, hand to shin or block.', 
    benefits: ['Stretches hips, groins, hamstrings', 'Opens chest and shoulders', 'Relieves backache'],
    types: ['hamstring', 'hip-opener', 'standing']
  },
  { 
    id: 'extside', name: 'Extended Side Angle', sanskrit: 'Utthita Parsvakonasana', category: POSE_CATEGORIES.STANDING, difficulty: 2, wrist: false, knee: false, pregnant: true, 
    cues: 'Forearm to thigh or hand to floor, long diagonal line.', 
    benefits: ['Strengthens legs, knees, and ankles', 'Stretches groins, spine, waist', 'Stimulates abdominal organs'],
    types: ['strength', 'side-stretch', 'standing']
  },
  { 
    id: 'lunge', name: 'High Lunge', sanskrit: 'Ashta Chandrasana', category: POSE_CATEGORIES.STANDING, difficulty: 2, wrist: false, knee: false, pregnant: true, 
    cues: 'Back heel lifted, hips square, arms reach up.', 
    benefits: ['Strengthens legs and arms', 'Stretches hip flexors', 'Develops balance and stability'],
    types: ['strength', 'balance', 'standing']
  },
  { 
    id: 'goddess', name: 'Goddess Pose', sanskrit: 'Utkata Konasana', category: POSE_CATEGORIES.STANDING, difficulty: 2, wrist: false, knee: false, pregnant: true, 
    cues: 'Toes out, heels in, sink hips, cactus arms.', 
    benefits: ['Opens hips and chest', 'Strengthens legs and glutes', 'Builds heat'],
    types: ['strength', 'hip-opener', 'standing']
  },
  { 
    id: 'chair', name: 'Chair Pose', sanskrit: 'Utkatasana', category: POSE_CATEGORIES.STANDING, difficulty: 2, wrist: false, knee: false, pregnant: true, 
    cues: 'Sit back into heels, lift chest, tuck tailbone slightly.', 
    benefits: ['Strengthens ankles, thighs, calves, and spine', 'Stretches shoulders and chest', 'Stimulates heart and diaphragm'],
    types: ['strength', 'standing']
  },

  // BALANCE
  { 
    id: 'tree', name: 'Tree Pose', sanskrit: 'Vrksasana', category: POSE_CATEGORIES.BALANCE, difficulty: 1, wrist: false, knee: false, pregnant: true, 
    cues: 'Foot to calf or thigh (not knee), hands to heart.', 
    benefits: ['Strengthens thighs, calves, ankles, and spine', 'Stretches groins and inner thighs', 'Improves balance'],
    types: ['balance', 'hip-opener']
  },
  { 
    id: 'eagle', name: 'Eagle Pose', sanskrit: 'Garudasana', category: POSE_CATEGORIES.BALANCE, difficulty: 3, wrist: false, knee: false, pregnant: true, 
    cues: 'Wrap right leg over left, right arm under left.', 
    benefits: ['Strengthens and stretches ankles and calves', 'Stretches thighs, hips, shoulders, and upper back', 'Improves concentration'],
    types: ['balance', 'twist', 'peak']
  },
  { 
    id: 'w3', name: 'Warrior III', sanskrit: 'Virabhadrasana III', category: POSE_CATEGORIES.BALANCE, difficulty: 3, wrist: false, knee: false, pregnant: true, 
    cues: 'T-shape body, hips square to floor.', 
    benefits: ['Strengthens ankles and legs', 'Strengthens shoulders and muscles of the back', 'Tones the abdomen'],
    types: ['balance', 'strength', 'hamstring']
  },
  { 
    id: 'dancer', name: 'Dancer Pose', sanskrit: 'Natarajasana', category: POSE_CATEGORIES.BALANCE, difficulty: 3, wrist: false, knee: false, pregnant: true, 
    cues: 'Catch inside of back foot, kick into hand.', 
    benefits: ['Stretches shoulders, chest, thighs, groins, and abdomen', 'Strengthens legs and ankles', 'Improves balance'],
    types: ['balance', 'backbend', 'peak']
  },

  // FLOOR / STRETCH / PEAK
  { 
    id: 'pigeon', name: 'Half Pigeon', sanskrit: 'Eka Pada Rajakapotasana', category: POSE_CATEGORIES.HIP_OPENER, difficulty: 2, wrist: true, knee: true, pregnant: true, 
    cues: 'Right knee to right wrist, shin diagonal.', 
    benefits: ['Stretches thighs, groins and psoas', 'Opens hips', 'Stimulates abdominal organs'],
    types: ['hip-opener', 'rest']
  },
  { 
    id: 'bridge', name: 'Bridge Pose', sanskrit: 'Setu Bandha Sarvangasana', category: POSE_CATEGORIES.BACKBEND, difficulty: 1, wrist: false, knee: false, pregnant: true, 
    cues: 'Lift hips, interlace fingers under back.', 
    benefits: ['Stretches chest, neck, and spine', 'Calms the brain', 'Rejuvenates tired legs'],
    types: ['backbend', 'spine']
  },
  { 
    id: 'wheel', name: 'Wheel Pose', sanskrit: 'Urdhva Dhanurasana', category: POSE_CATEGORIES.BACKBEND, difficulty: 3, wrist: true, knee: false, pregnant: false, 
    cues: 'Press into hands and feet, lift entire body.', 
    benefits: ['Strengthens arms, wrists, legs, buttocks, abdomen, and spine', 'Stimulates thyroid and pituitary', 'Increases energy'],
    types: ['backbend', 'peak', 'strength']
  },
  { 
    id: 'boat', name: 'Boat Pose', sanskrit: 'Navasana', category: POSE_CATEGORIES.CORE, difficulty: 2, wrist: false, knee: false, pregnant: false, 
    cues: 'Lift feet, balance on sit bones, chest open.', 
    benefits: ['Strengthens abdomen, hip flexors, and spine', 'Stimulates kidneys', 'Improves digestion'],
    types: ['core', 'strength']
  },
  { 
    id: 'crow', name: 'Crow Pose', sanskrit: 'Bakasana', category: POSE_CATEGORIES.BALANCE, difficulty: 3, wrist: true, knee: false, pregnant: false, 
    cues: 'Knees to armpits, lean forward, float feet.', 
    benefits: ['Strengthens arms and wrists', 'Stretches upper back', 'Strengthens abdominal muscles'],
    types: ['arm-balance', 'peak', 'core']
  },
  { 
    id: 'headstand', name: 'Headstand', sanskrit: 'Sirsasana', category: POSE_CATEGORIES.INVERSION, difficulty: 3, wrist: true, knee: false, pregnant: false, 
    cues: 'Forearms down, interlace fingers, crown of head lightly down.', 
    benefits: ['Calms the brain', 'Strengthens arms, legs and spine', 'Improves digestion'],
    types: ['inversion', 'peak', 'core']
  },
  
  // RESTORATIVE / COOL DOWN
  { 
    id: 'paschi', name: 'Seated Forward Fold', sanskrit: 'Paschimottanasana', category: POSE_CATEGORIES.RESTORATIVE, difficulty: 1, wrist: false, knee: false, pregnant: true, 
    cues: 'Lengthen spine then fold, keep feet flexed.', 
    benefits: ['Calms the brain', 'Stretches the spine, shoulders and hamstrings', 'Stimulates liver and kidneys'],
    types: ['hamstring', 'spine', 'rest']
  },
  { 
    id: 'janu', name: 'Head to Knee', sanskrit: 'Janu Sirsasana', category: POSE_CATEGORIES.RESTORATIVE, difficulty: 1, wrist: false, knee: true, pregnant: true, 
    cues: 'One leg straight, one foot to inner thigh, fold.', 
    benefits: ['Calms the brain', 'Stretches spine, shoulders, hamstrings, and groins', 'Stimulates liver and kidneys'],
    types: ['hamstring', 'hip-opener', 'rest']
  },
  { 
    id: 'twist', name: 'Supine Twist', sanskrit: 'Supta Matsyendrasana', category: POSE_CATEGORIES.TWIST, difficulty: 1, wrist: false, knee: false, pregnant: true, 
    cues: 'Knees to one side, gaze opposite.', 
    benefits: ['Stretches the back muscles and glutes', 'Massages back and hips', 'Helps hydrate spinal disks'],
    types: ['twist', 'spine', 'rest']
  },
  { 
    id: 'happy', name: 'Happy Baby', sanskrit: 'Ananda Balasana', category: POSE_CATEGORIES.HIP_OPENER, difficulty: 1, wrist: false, knee: false, pregnant: true, 
    cues: 'Grab outer feet, pull knees toward armpits.', 
    benefits: ['Gently releases hips', 'Calms the brain', 'Relieves lower back pain'],
    types: ['hip-opener', 'rest']
  },
  { 
    id: 'sava', name: 'Corpse Pose', sanskrit: 'Savasana', category: POSE_CATEGORIES.SAVASANA, difficulty: 0, wrist: false, knee: false, pregnant: true, 
    cues: 'Complete relaxation. Let go of breath control.', 
    benefits: ['Calms the brain', 'Relieves stress', 'Relaxes the body'],
    types: ['rest', 'grounding']
  },
];

const SEQUENCE_METHODS = {
  STANDARD: 'standard',
  PEAK: 'peak',
  THEME: 'theme',
  TARGET: 'target',
  LADDER: 'ladder'
};

const PEAK_POSES = POSE_LIBRARY.filter(p => p.types.includes('peak')).map(p => ({ id: p.id, name: p.name }));

const THEMES = [
  { id: 'grounding', name: 'Grounding & Stability', types: ['grounding', 'balance', 'standing'] },
  { id: 'energy', name: 'Energy & Power', types: ['strength', 'core', 'backbend'] },
  { id: 'detox', name: 'Detox & Twist', types: ['twist', 'core'] },
  { id: 'heart', name: 'Heart Opening', types: ['backbend', 'chest'] },
  { id: 'rest', name: 'Relaxation & Restore', types: ['rest', 'grounding'] }
];

const TARGET_AREAS = [
  { id: 'hips', name: 'Hips & Emotions', types: ['hip-opener'] },
  { id: 'core', name: 'Core Fire', types: ['core'] },
  { id: 'spine', name: 'Spine Health', types: ['spine'] },
  { id: 'hamstrings', name: 'Hamstrings & Release', types: ['hamstring'] },
  { id: 'shoulders', name: 'Shoulders & Neck', types: ['shoulder'] }
];

const DEFAULT_MUSIC_THEMES = [
  { id: 'electronic', name: 'Tribal / House', icon: <Activity size={16}/>, description: 'Upbeat rhythm for Vinyasa.', link: 'http://open.spotify.com/playlist/37i9dQZF1DX2sUQwD7tbmL' },
  { id: 'ambient', name: 'Ambient Drone', icon: <Wind size={16}/>, description: 'Deep, spacious sounds for focus.', link: 'http://open.spotify.com/playlist/37i9dQZF1DX6J5NfMJS675' },
  { id: 'nature', name: 'Rain & Forest', icon: <Sun size={16}/>, description: 'Grounding natural textures.', link: 'http://open.spotify.com/playlist/37i9dQZF1DX4wta20PHgwo' },
  { id: 'lofi', name: 'Lo-Fi Beats', icon: <Headphones size={16}/>, description: 'Chill hop for a relaxed groove.', link: 'http://open.spotify.com/playlist/37i9dQZF1DX8Uebhn9wzrS' },
  { id: 'indian', name: 'Indian Flute', icon: <Music size={16}/>, description: 'Traditional atmosphere.', link: 'http://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M' },
  { id: 'piano', name: 'Soft Piano', icon: <Music size={16}/>, description: 'Gentle, emotional classical keys.', link: 'http://open.spotify.com/playlist/37i9dQZF1DX4sWSpwq3LiO' },
];

// --- 2. SPOTIFY UTILS ---

const API_BASE =
  typeof window !== 'undefined'
    ? (
        import.meta.env.VITE_API_BASE_URL ||
        // Helpful local dev default: UI runs on 5173, auth server on 5174
        (['localhost', '127.0.0.1'].includes(window.location.hostname) && window.location.port === '5173'
          ? `http://${window.location.hostname}:5174`
          : window.location.origin)
      )
    : '';

const SPOTIFY_CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const SPOTIFY_REDIRECT_URI = import.meta.env.VITE_SPOTIFY_REDIRECT_URI;
const useDirectSpotifyAuth = Boolean(SPOTIFY_CLIENT_ID);

const getLoginUrl = () => {
  if (!useDirectSpotifyAuth) return `${API_BASE}/api/spotify/login`;

  const redirectUri =
    SPOTIFY_REDIRECT_URI ||
    (typeof window !== 'undefined'
      ? `${window.location.origin}${window.location.pathname}`
      : '');

  const params = new URLSearchParams({
    response_type: 'token',
    client_id: SPOTIFY_CLIENT_ID,
    redirect_uri: redirectUri,
    scope: REQUIRED_SCOPES.join(' '),
  });

  return `https://accounts.spotify.com/authorize?${params.toString()}`;
};

const REQUIRED_SCOPES = [
  'streaming',               // Required for Web Playback SDK
  'user-read-email',         // Required for SDK
  'user-read-private',       // Required for SDK
  'user-read-playback-state',// To read current status
  'user-modify-playback-state' // To transfer playback to this device
];

const transferPlaybackToDevice = async (token, deviceId, play = false) => {
  if (!token || !deviceId) return;
  try {
    await fetch('https://api.spotify.com/v1/me/player', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ device_ids: [deviceId], play })
    });
  } catch (err) {
    console.error('Failed to transfer playback', err);
  }
};

const parseSpotifyUri = (link) => {
  if (!link) return null;
  // Convert https://open.spotify.com/playlist/ID -> spotify:playlist:ID
  const match = link.match(/(playlist|album|track)[/:]([a-zA-Z0-9]+)/);
  if (match) {
    const [, type, id] = match;
    return `spotify:${type}:${id}`;
  }
  return null;
};

const playSpotifyTrack = async (token, device_id, context_uri) => {
  if (!token || !device_id || !context_uri) return;

  try {
    await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${device_id}`, {
      method: 'PUT',
      body: JSON.stringify({ context_uri: context_uri }),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });
  } catch (err) {
    console.error("Spotify Play Error:", err);
  }
};

const fetchSpotifyProfile = async (token) => {
  if (!token) return null;
  try {
    const res = await fetch('https://api.spotify.com/v1/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!res.ok) return null;
    return res.json();
  } catch (e) {
    console.error('Failed to load Spotify profile', e);
    return null;
  }
};

// --- 3. CUSTOM HOOK ---

const useSpotifyPlayer = (token) => {
  const [player, setPlayer] = useState(undefined);
  const [deviceId, setDeviceId] = useState(null);
  const [isPaused, setPaused] = useState(true);
  const [isActive, setActive] = useState(false);
  const [currentTrack, setTrack] = useState(null);
  const [playerError, setPlayerError] = useState(null);

  useEffect(() => {
    if (!token) return;

    let localPlayer;

    const initializePlayer = () => {
      localPlayer = new window.Spotify.Player({
        name: 'ZenFlow Web Player',
        getOAuthToken: cb => { cb(token); },
        volume: 0.5
      });

      setPlayer(localPlayer);

      localPlayer.addListener('ready', ({ device_id }) => {
        console.log('Ready with Device ID', device_id);
        setDeviceId(device_id);
      });

      localPlayer.addListener('not_ready', ({ device_id }) => {
        console.log('Device ID has gone offline', device_id);
      });

      localPlayer.addListener('player_state_changed', (state) => {
        if (!state) return;
        setTrack(state.track_window.current_track);
        setPaused(state.paused);
        setActive(true);
      });

      localPlayer.addListener('initialization_error', ({ message }) => setPlayerError(message));
      localPlayer.addListener('authentication_error', ({ message }) => setPlayerError(message));
      localPlayer.addListener('account_error', () => setPlayerError("Premium account required for playback."));

      localPlayer.connect();
    };

    // Check if the script is already loaded
    if (window.Spotify) {
      initializePlayer();
    } else {
      // If not, wait for it
      window.onSpotifyWebPlaybackSDKReady = initializePlayer;
      
      // Inject script if it doesn't exist
      if (!document.getElementById('spotify-player-script')) {
        const script = document.createElement("script");
        script.id = 'spotify-player-script';
        script.src = "https://sdk.scdn.co/spotify-player.js";
        script.async = true;
        document.body.appendChild(script);
      }
    }

    return () => {
       if (localPlayer) {
         localPlayer.disconnect();
       }
    };
  }, [token]);

  return { player, deviceId, isPaused, isActive, currentTrack, playerError };
};

// --- 4. UI COMPONENTS ---

const PoseIcon = ({ category, className = "w-full h-full p-2" }) => {
  let Icon = User;
  switch(category) {
    case POSE_CATEGORIES.SUN_SALUTATION: Icon = Sun; break;
    case POSE_CATEGORIES.WARMUP: Icon = Activity; break;
    case POSE_CATEGORIES.CENTERING: Icon = Anchor; break;
    case POSE_CATEGORIES.STANDING: Icon = User; break;
    case POSE_CATEGORIES.BALANCE: Icon = Target; break;
    case POSE_CATEGORIES.CORE: Icon = Zap; break;
    case POSE_CATEGORIES.BACKBEND: Icon = Activity; break; 
    case POSE_CATEGORIES.TWIST: Icon = RefreshCw; break;
    case POSE_CATEGORIES.HIP_OPENER: Icon = Target; break;
    case POSE_CATEGORIES.RESTORATIVE: Icon = Feather; break;
    case POSE_CATEGORIES.SAVASANA: Icon = Moon; break;
    case POSE_CATEGORIES.INVERSION: Icon = RefreshCw; break;
    default: Icon = User;
  }
  return <Icon className={className} strokeWidth={1.5} />;
};

const PoseDetailModal = ({ pose, onClose }) => {
  if (!pose) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div className="bg-white dark:bg-stone-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
        <div className="h-64 bg-stone-100 dark:bg-stone-900 relative flex items-center justify-center overflow-hidden group">
          <div className="w-32 h-32 text-teal-600 dark:text-teal-400 opacity-80">
             <PoseIcon category={pose.category} className="w-full h-full" />
          </div>
          <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-stone-700 dark:text-white rounded-full backdrop-blur-md">
            <X size={20} />
          </button>
        </div>
        <div className="p-5 md:p-8 overflow-y-auto">
          <div className="flex justify-between items-start mb-6">
            <div>
              <span className="text-teal-700 dark:text-teal-400 font-bold uppercase tracking-widest text-xs mb-1 block">{pose.category}</span>
              <h2 className="text-3xl font-serif text-stone-900 dark:text-white mb-1">{pose.name}</h2>
              <p className="text-stone-600 dark:text-stone-400 italic font-serif text-lg">{pose.sanskrit}</p>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide h-fit ${pose.difficulty <= 1 ? 'bg-emerald-100 text-emerald-800' : pose.difficulty === 2 ? 'bg-yellow-100 text-yellow-800' : 'bg-rose-100 text-rose-800'}`}>
              Level {pose.difficulty}
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-bold flex items-center gap-2 mb-3 text-stone-800 dark:text-stone-200"><Info size={18} className="text-teal-600 dark:text-teal-400" /> Instructions</h3>
              <p className="text-stone-700 dark:text-stone-300 leading-relaxed bg-stone-50 dark:bg-stone-900/50 p-4 rounded-lg border border-stone-100 dark:border-stone-700">{pose.cues}</p>
            </div>
            <div>
              <h3 className="font-bold flex items-center gap-2 mb-3 text-stone-800 dark:text-stone-200"><Check size={18} className="text-teal-600 dark:text-teal-400" /> Key Benefits</h3>
              <ul className="space-y-2">
                {pose.benefits && pose.benefits.map((benefit, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-stone-600 dark:text-stone-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5 shrink-0" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const PoseCard = ({ pose, index, onSwap, setSelectedPose, isTeacherMode }) => {
  if (isTeacherMode) {
    return (
      <div className="flex items-center gap-4 p-3 border-b border-stone-200 dark:border-stone-700 break-inside-avoid hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors">
        <span className="font-mono text-stone-400 w-6 text-right">{index + 1}</span>
        <div className="w-10 h-10 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden shrink-0 flex items-center justify-center text-teal-600 dark:text-teal-400">
           <PoseIcon category={pose.category} className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-stone-900 dark:text-stone-100 text-sm">{pose.name}</h4>
          <p className="text-xs text-stone-500 dark:text-stone-400 italic">{pose.sanskrit}</p>
        </div>
        <div className="text-xs text-stone-600 dark:text-stone-400 font-medium uppercase tracking-wide">{pose.duration}</div>
      </div>
    );
  }
  return (
    <div className="relative pl-8 md:pl-12 group break-inside-avoid mb-4">
      <div className="absolute left-[15px] md:left-[23px] top-8 bottom-[-16px] w-0.5 bg-stone-200 dark:bg-stone-700 group-last:hidden"></div>
      <div className="absolute left-[9px] md:left-[17px] top-6 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-stone-900 bg-teal-500 shadow-sm z-10"></div>
      <div 
        onClick={() => setSelectedPose(pose)}
        className="cursor-pointer bg-white dark:bg-stone-800 p-4 md:p-5 rounded-xl border border-stone-200 dark:border-stone-700 hover:shadow-md hover:border-teal-300 dark:hover:border-teal-700 transition-all group relative"
      >
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-4">
             <div className="w-14 h-14 bg-stone-50 dark:bg-stone-900 rounded-xl flex items-center justify-center text-teal-600 dark:text-teal-400 shrink-0">
                <PoseIcon category={pose.category} className="w-8 h-8" />
             </div>
             <div>
                <h3 className="font-bold text-lg text-stone-800 dark:text-stone-100 leading-tight group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors">{pose.name}</h3>
                <p className="text-stone-500 dark:text-stone-400 italic text-sm font-serif">{pose.sanskrit}</p>
             </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <button 
              onClick={(e) => { e.stopPropagation(); onSwap(index); }} 
              className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-stone-400 hover:text-teal-600 dark:text-stone-500 dark:hover:text-teal-400 bg-stone-50 dark:bg-stone-700 rounded-lg hover:bg-teal-50 dark:hover:bg-teal-900/30" 
              title="Swap Pose"
            >
              <Shuffle size={16} />
            </button>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-4 text-xs text-stone-500 dark:text-stone-400">
          <span className="flex items-center gap-1 bg-stone-100 dark:bg-stone-700 px-2 py-1 rounded font-medium text-stone-700 dark:text-stone-300">{pose.category}</span>
          <span className="flex items-center gap-1"><Wind size={12} /> {pose.duration}</span>
        </div>
      </div>
    </div>
  );
};

const MusicConfig = ({ themes, onUpdateTheme, spotifyToken, getLoginUrl, isPremiumUser, tokenError }) => {
  const [editingId, setEditingId] = useState(null);
  const [tempLink, setTempLink] = useState('');

  const handleEdit = (theme) => {
    setEditingId(theme.id);
    setTempLink(theme.link);
  };

  const handleSave = (id) => {
    onUpdateTheme(id, tempLink);
    setEditingId(null);
  };

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

      <p className="text-stone-600 dark:text-stone-400 mb-8">
        Link your Spotify playlists to each mood. For full playback, ensure you are connected to Spotify Premium above.
      </p>

      {tokenError && (
        <div className="mb-6 px-4 py-3 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 text-sm">
          {tokenError}
        </div>
      )}
      {spotifyToken && !isPremiumUser && (
        <div className="mb-6 px-4 py-3 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 text-sm">
          Premium is required to play full tracks. You can still manage playlist links here.
        </div>
      )}

      <div className="grid gap-4">
        {themes.map(theme => (
          <div key={theme.id} className="bg-white dark:bg-stone-800 p-6 rounded-xl border border-stone-200 dark:border-stone-700 flex flex-col md:flex-row md:items-center gap-4 shadow-sm">
            <div className="p-3 bg-stone-100 dark:bg-stone-900 rounded-lg text-teal-600 dark:text-teal-400">
              {theme.icon}
            </div>
            
            <div className="flex-1">
              <h3 className="font-bold text-stone-900 dark:text-stone-100">{theme.name}</h3>
              <p className="text-sm text-stone-500 dark:text-stone-400">{theme.description}</p>
            </div>

            <div className="flex-1 md:max-w-md w-full">
              {editingId === theme.id ? (
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={tempLink}
                    onChange={(e) => setTempLink(e.target.value)}
                    placeholder="Paste Spotify Link..."
                    className="flex-1 p-2 rounded border border-teal-500 bg-white dark:bg-stone-900 dark:text-white text-sm outline-none"
                  />
                  <div className="flex gap-2 sm:flex-row sm:items-center">
                    <button onClick={() => handleSave(theme.id)} className="p-2 bg-teal-600 text-white rounded hover:bg-teal-700"><Check size={18}/></button>
                    <button onClick={() => setEditingId(null)} className="p-2 bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300 rounded hover:opacity-80"><X size={18}/></button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between bg-stone-50 dark:bg-stone-900 p-2 rounded border border-stone-200 dark:border-stone-700">
                  <span className="text-xs text-stone-500 truncate flex-1 mr-2 opacity-70">{theme.link || 'No link configured'}</span>
                  <div className="flex gap-1">
                    {theme.link && (
                      <a href={theme.link} target="_blank" rel="noreferrer" className="p-1.5 text-stone-400 hover:text-teal-500" title="Open in Spotify">
                        <ExternalLink size={14} />
                      </a>
                    )}
                    <button onClick={() => handleEdit(theme)} className="p-1.5 text-stone-400 hover:text-teal-500" title="Edit Link">
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

const PracticeMode = ({
    sequence,
    practiceIndex,
    timerSeconds,
    isTimerRunning,
    setIsTimerRunning,
    nextPracticePose,
    onClose,
    musicTheme,
    spotifyToken,
    player,
    deviceId,
    playerError,
    ensureAccessToken,
    isPremiumUser,
    onPlaybackStatus,
    playbackStatus
}) => {
  const current = sequence[practiceIndex];
  const next = sequence[practiceIndex + 1];

  useEffect(() => {
      setIsTimerRunning(false);
  }, [setIsTimerRunning]);

  const handlePlayMusic = async () => {
     if (!player || !deviceId || !musicTheme.link) return;
     const token = await ensureAccessToken();
     if (!token) {
        onPlaybackStatus?.('Connect Spotify to play music from your playlists.');
        return;
     }
     if (!isPremiumUser) {
        onPlaybackStatus?.('Spotify Premium is required for full-track playback.');
        return;
     }
     const uri = parseSpotifyUri(musicTheme.link);
     if (uri) {
        await transferPlaybackToDevice(token, deviceId, true);
        await playSpotifyTrack(token, deviceId, uri);
        onPlaybackStatus?.('Playing through Spotify Web Playback SDK.');
     }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-stone-900 text-stone-100 flex flex-col animate-in fade-in duration-300">
      <div className="flex justify-between items-center p-4 sm:p-6 border-b border-stone-800">
        <div className="flex items-center gap-3">
          <div className="bg-teal-900/30 p-2 rounded-lg"><Activity className="text-teal-400" size={20} /></div>
          <div>
             <span className="font-bold tracking-widest uppercase text-sm block text-teal-400">Live Session</span>
             <span className="text-xs text-stone-400">Pose {practiceIndex + 1} of {sequence.length}</span>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-stone-800 rounded-full text-stone-400 hover:text-white"><X /></button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 pointer-events-none flex items-center justify-center">
           <PoseIcon category={current.category} className="w-[120%] h-[120%] text-teal-500" />
        </div>

        <div className="relative z-10 flex flex-col items-center max-w-4xl mx-auto w-full">
           <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-48 md:h-48 mb-6 sm:mb-8 md:mb-10 bg-stone-800/50 rounded-full flex items-center justify-center backdrop-blur-sm border-2 border-stone-700 text-teal-400 shadow-2xl">
              <PoseIcon category={current.category} className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24" />
           </div>

           <h1 className="text-3xl sm:text-4xl md:text-6xl font-serif mb-2 sm:mb-3 text-white tracking-tight">{current.name}</h1>
           <p className="text-lg sm:text-xl md:text-2xl text-stone-400 italic font-serif mb-6 sm:mb-8 md:mb-10">{current.sanskrit}</p>

           <div className="flex items-center gap-4 mb-8 md:mb-10">
              <div className="relative w-28 h-28 sm:w-32 sm:h-32 md:w-40 md:h-40 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90 drop-shadow-2xl" viewBox="0 0 160 160">
                  <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-stone-800" />
                  <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-teal-500 transition-all duration-1000 ease-linear" strokeDasharray={440} strokeDashoffset={440 - (440 * timerSeconds) / (current.timerVal || 60)} />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-2xl sm:text-3xl md:text-4xl font-mono font-bold text-white">
                  {Math.floor(timerSeconds / 60)}:{String(timerSeconds % 60).padStart(2, '0')}
                </div>
              </div>
           </div>

           <div className="bg-stone-800/80 backdrop-blur-md p-6 sm:p-8 rounded-2xl border border-stone-700/50 max-w-2xl shadow-xl w-full">
             <p className="text-lg sm:text-xl leading-relaxed text-stone-200 font-medium">{current.cues}</p>
           </div>
        </div>
      </div>

      <div className="bg-stone-900 border-t border-stone-800 p-4 sm:p-6 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 items-center relative z-10">
        <div className="md:hidden">
          {next && (
            <div className="flex items-center gap-3 rounded-xl bg-stone-800/80 border border-stone-700 p-3">
              <div className="w-10 h-10 bg-stone-900 rounded-lg flex items-center justify-center text-teal-500 border border-stone-700">
                <PoseIcon category={next.category} className="w-5 h-5" />
              </div>
              <div className="text-left">
                <span className="text-[10px] uppercase tracking-wider block text-teal-500 font-bold">Up Next</span>
                <span className="font-bold text-sm text-white">{next.name}</span>
              </div>
            </div>
          )}
        </div>

        <div className="hidden md:block">
          {next && (
            <div className="flex items-center gap-4 opacity-60 hover:opacity-100 transition-opacity cursor-pointer group">
              <div className="w-12 h-12 bg-stone-800 rounded-lg flex items-center justify-center text-teal-500 border border-stone-700 group-hover:border-teal-500/50">
                <PoseIcon category={next.category} className="w-6 h-6" />
              </div>
              <div className="text-left">
                <span className="text-[10px] uppercase tracking-wider block text-teal-500 font-bold">Up Next</span>
                <span className="font-bold text-sm text-white">{next.name}</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-center gap-4 sm:gap-8 flex-wrap">
          <button onClick={() => setIsTimerRunning(!isTimerRunning)} className="w-16 h-16 sm:w-20 sm:h-20 bg-teal-600 hover:bg-teal-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-teal-900/50 transition-all hover:scale-105 active:scale-95">
            {isTimerRunning ? (
              <Pause className="w-7 h-7 sm:w-8 sm:h-8" />
            ) : (
              <Play className="w-7 h-7 sm:w-8 sm:h-8 ml-0.5 sm:ml-1" />
            )}
          </button>
          <button onClick={nextPracticePose} className="p-3 sm:p-4 hover:bg-stone-800 rounded-full transition-colors text-stone-400 hover:text-white">
            <SkipForward size={28} className="sm:hidden" />
            <SkipForward size={32} className="hidden sm:block" />
          </button>
        </div>

        {playbackStatus && (
          <div className="mt-4 text-xs bg-emerald-900/40 border border-emerald-700 text-emerald-100 px-4 py-2 rounded-lg">
            {playbackStatus}
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-center md:justify-end gap-3 w-full md:max-w-sm">
           {/* MODIFIED: REMOVED IFRAME PREVIEW FALLBACK */}
           {spotifyToken && deviceId ? (
             <div className="flex items-center gap-3 bg-black/50 p-2 pr-4 rounded-xl border border-stone-700 w-full">
                <div className="p-2 bg-[#1DB954] text-white rounded-lg">
                  <Music size={20} />
                </div>
                <div className="text-left flex-1 min-w-0">
                   <p className="text-xs text-stone-400 font-bold uppercase tracking-wider">Music Player</p>
                   <button onClick={handlePlayMusic} className="text-sm font-bold text-white hover:text-[#1DB954] flex items-center gap-1 truncate w-full">
                     Start Playlist <Play size={12} fill="currentColor" />
                   </button>
                </div>
                {player && (
                  <div className="flex gap-2 ml-2">
                    <button onClick={() => player.togglePlay()} className="p-2 hover:bg-white/10 rounded-full"><Pause size={16} /></button>
                    <button onClick={() => player.nextTrack()} className="p-2 hover:bg-white/10 rounded-full"><SkipForward size={16} /></button>
                  </div>
                )}
             </div>
           ) : (
              <div className="text-stone-500 text-sm italic flex items-center gap-2">
                 {!spotifyToken && "Music configured but player disconnected (Log in)"}
                 {spotifyToken && !deviceId && !playerError && "Player Connecting..."}
                 {spotifyToken && playerError && `Player Error: ${playerError}`}
              </div>
           )}
        </div>
      </div>
    </div>
  );
};

const PoseLibrary = ({ setSelectedPose }) => {
  const [search, setSearch] = useState('');
  const filtered = POSE_LIBRARY.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.sanskrit.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto p-6 min-h-full">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-6 border-b border-stone-200 dark:border-stone-700 pb-6">
        <div>
          <h2 className="text-3xl font-serif text-teal-900 dark:text-teal-100 mb-2">Pose Library</h2>
          <p className="text-stone-600 dark:text-stone-400">Browse the full collection of {POSE_LIBRARY.length} poses.</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-3 text-stone-400" size={20} />
          <input 
            type="text" placeholder="Find a pose..." 
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 focus:ring-2 focus:ring-teal-500 outline-none shadow-sm text-stone-800 dark:text-stone-100"
          />
        </div>
      </div>
      
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
          {filtered.map(pose => (
            <div 
              key={pose.id} 
              onClick={() => setSelectedPose(pose)}
              className="bg-white dark:bg-stone-800 p-5 rounded-2xl border border-stone-200 dark:border-stone-700 hover:border-teal-500 dark:hover:border-teal-500 hover:shadow-md transition-all cursor-pointer group flex items-start gap-4"
            >
              <div className="w-16 h-16 bg-stone-50 dark:bg-stone-900 rounded-xl flex items-center justify-center text-teal-600 dark:text-teal-400 shrink-0 group-hover:bg-teal-50 dark:group-hover:bg-teal-900/30 transition-colors">
                <PoseIcon category={pose.category} className="w-8 h-8" />
              </div>
              <div>
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-bold text-lg text-stone-900 dark:text-stone-100 group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors">{pose.name}</h3>
                </div>
                <p className="text-sm italic text-stone-500 dark:text-stone-400 mb-3 font-serif">{pose.sanskrit}</p>
                <span className="text-xs bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300 px-2.5 py-1 rounded-md font-medium">{pose.category}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 opacity-50">
          <Info size={48} className="mx-auto mb-4 text-stone-400"/>
          <p className="text-lg">No poses found matching "{search}"</p>
        </div>
      )}
    </div>
  );
};


/**
 * MAIN APP COMPONENT
 */
export default function YogaApp() {
  const [activeTab, setActiveTab] = useState('generator'); 
  const [params, setParams] = useState({
    duration: 60,
    difficulty: 'Intermediate',
    style: 'Vinyasa',
    filters: { noWrists: false, kneeFriendly: false, pregnancySafe: false },
    method: SEQUENCE_METHODS.STANDARD,
    selectedPeakPose: PEAK_POSES[0]?.id || '',
    selectedTheme: THEMES[0].id,
    selectedTarget: TARGET_AREAS[0].id
  });

  const [sequence, setSequence] = useState([]);
  
  // -- PERSISTENCE --
  const [savedSequences, setSavedSequences] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('yoga_saved_sequences');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  
  const [musicThemes, setMusicThemes] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('yoga_music_themes');
      if (saved) {
        const parsed = JSON.parse(saved);
        return DEFAULT_MUSIC_THEMES.map(def => {
          const savedTheme = parsed.find(s => s.id === def.id);
          return savedTheme ? { ...def, link: savedTheme.link } : def;
        });
      }
    }
    return DEFAULT_MUSIC_THEMES;
  });

  const updateMusicTheme = (id, newLink) => {
    const updated = musicThemes.map(t => t.id === id ? { ...t, link: newLink } : t);
    setMusicThemes(updated);
    const toSave = updated.map(({ id, link }) => ({ id, link }));
    localStorage.setItem('yoga_music_themes', JSON.stringify(toSave));
  };
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024;
    }
    return true;
  });

  const [isTeacherMode, setIsTeacherMode] = useState(false);
  const [darkMode, setDarkMode] = useState(() => 
    typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
  );
  
  const [selectedMusicId, setSelectedMusicId] = useState(musicThemes[0].id);
  const [spotifyStatus, setSpotifyStatus] = useState('');
  
  // Practice Mode State
  const [practiceIndex, setPracticeIndex] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);

  // Pose Modal State
  const [selectedPose, setSelectedPose] = useState(null);

  // --- SPOTIFY INTEGRATION ---
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
    if (useDirectSpotifyAuth) {
      setTokenError('Spotify session expired. Reconnect to continue playback.');
      clearStoredToken();
      setSpotifyToken(null);
      return null;
    }

    try {
      const res = await fetch(`${API_BASE}/api/spotify/refresh`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to refresh token');
      const data = await res.json();
      const expiresAt = Date.now() + (data.expires_in || 3600) * 1000;
      storeToken(data.access_token, expiresAt);
      setTokenError(null);
      return data.access_token;
    } catch (err) {
      console.error('Unable to refresh Spotify token', err);
      setTokenError('Connect Spotify to enable full playback.');
      clearStoredToken();
      setSpotifyToken(null);
      return null;
    }
  }, [clearStoredToken, storeToken]);

const bootstrapTokenFromHash = useCallback(async () => {
  if (typeof window === 'undefined') return;
  const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  const searchParams = new URLSearchParams(window.location.search);
  const token = searchParams.get('access_token') || hashParams.get('access_token');
  const expiresIn = Number(searchParams.get('expires_in') || hashParams.get('expires_in') || '0');

    if (token) {
      const expiresAt = Date.now() + (expiresIn || 3600) * 1000;
      storeToken(token, expiresAt);
      setTokenError(null);
      window.history.replaceState({}, '', window.location.pathname);
      return;
    }

    const storedToken = localStorage.getItem('spotify_access_token');
    const storedExpiry = Number(localStorage.getItem('spotify_token_expiry') || '0');

    if (storedToken && storedExpiry > Date.now()) {
      setTokenError(null);
    setSpotifyToken(storedToken);
    setTokenExpiry(storedExpiry);
  } else {
    clearStoredToken();
  }

  // If we're using the backend (authorization code flow) and the user has a
  // refresh token cookie, pull a fresh access token automatically so they can
  // resume playback without clicking Connect again.
  if (!useDirectSpotifyAuth && (!token || expiresIn === 0) && !storedToken) {
    await refreshAccessToken();
  }
}, [clearStoredToken, refreshAccessToken, storeToken]);

  const ensureAccessToken = useCallback(async () => {
    if (spotifyToken && (!tokenExpiry || tokenExpiry > Date.now())) return spotifyToken;

    // For direct auth we cannot refresh; require a reconnect instead.
    if (useDirectSpotifyAuth) {
      setTokenError('Spotify session expired. Reconnect to continue playback.');
      return null;
    }

    return refreshAccessToken();
  }, [refreshAccessToken, spotifyToken, tokenExpiry]);

  useEffect(() => {
    bootstrapTokenFromHash();
  }, [bootstrapTokenFromHash]);

  useEffect(() => {
    if (!spotifyToken) return;
    (async () => {
      const profile = await fetchSpotifyProfile(spotifyToken);
      if (profile) setSpotifyProfile(profile);
    })();
  }, [spotifyToken]);

  // Initialize Custom Hook
  const { player, deviceId, playerError } = useSpotifyPlayer(spotifyToken);

  useEffect(() => {
    if (playerError) {
      console.warn("Spotify SDK Error:", playerError);
      setSpotifyStatus(playerError);
    }
  }, [playerError]);

  useEffect(() => {
    if (spotifyToken && deviceId) {
      transferPlaybackToDevice(spotifyToken, deviceId);
      setSpotifyStatus('Web Playback device is ready. Use Start Playlist to begin.');
    }
  }, [spotifyToken, deviceId]);


  // Timer Logic
  useEffect(() => {
    let interval = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds(prev => {
          if (prev <= 1) {
             setIsTimerRunning(false);
             return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);


  // --- CORE GENERATION LOGIC ---

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

    const totalSeconds = params.duration * 60;
    const savasanaSeconds = 300; 
    const activeSeconds = Math.max(0, totalSeconds - savasanaSeconds);
    const activePoseCount = newSequence.length - 1; // Exclude Savasana
    const secondsPerPose = activePoseCount > 0 ? Math.floor(activeSeconds / activePoseCount) : 60;

    const finalSequence = newSequence.map((pose, idx) => ({
      ...pose,
      uniqueId: `${pose.id}-${idx}-${Date.now()}`,
      duration: pose.id === 'sava' ? '5-10 min' : `${Math.floor(secondsPerPose/60)}m ${secondsPerPose%60}s`, // Dynamic text
      timerVal: pose.id === 'sava' ? savasanaSeconds : secondsPerPose, // Dynamic timer
    }));

    setSequence(finalSequence);
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

  const deleteSaved = (id) => {
    const updated = savedSequences.filter(s => s.id !== id);
    setSavedSequences(updated);
    localStorage.setItem('yoga_saved_sequences', JSON.stringify(updated));
  };

  const handleLogout = async () => {
    try {
      if (!useDirectSpotifyAuth) {
        await fetch(`${API_BASE}/api/spotify/logout`, { method: 'POST', credentials: 'include' });
      }
    } catch (err) {
      console.warn('Failed to log out from Spotify', err);
    }
    clearStoredToken();
    setSpotifyToken(null);
    setTokenExpiry(null);
    setSpotifyProfile(null);
    setSpotifyStatus('');
    setTokenError(null);
  };

  // --- UI RENDER ---

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${darkMode ? 'dark bg-stone-900 text-stone-100' : 'bg-stone-50 text-stone-800'}`}>
      
      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-white/90 dark:bg-stone-800/90 backdrop-blur border-b border-stone-200 dark:border-stone-700 flex items-center justify-between px-4 lg:px-8 print:hidden">
        <div className="flex items-center gap-3">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-stone-100 dark:hover:bg-stone-700 rounded-lg text-stone-600 dark:text-stone-300">
            <Menu size={24} />
          </button>
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('generator')}>
            <div className="bg-teal-600 text-white p-1.5 rounded-lg"><Activity size={18} /></div>
            <h1 className="text-xl font-bold tracking-tight text-stone-800 dark:text-stone-100 font-serif">ZenFlow</h1>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-1">
          {['generator', 'library', 'saved', 'settings'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${activeTab === tab ? 'bg-stone-100 dark:bg-stone-700 text-teal-700 dark:text-teal-400' : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'}`}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {!spotifyToken && (
            <button onClick={() => window.location.href = getLoginUrl()} className="px-3 py-2 bg-[#1DB954] text-white rounded-full text-xs font-bold hover:opacity-90 flex items-center gap-1">
              <LogIn size={16} /> Connect Spotify
            </button>
          )}
          {spotifyToken && (
            <button onClick={handleLogout} className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-full" title="Disconnect Spotify">
              <LogOut size={20} />
            </button>
          )}
          <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 transition-colors">
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </header>

      {/* MODALS */}
      {selectedPose && <PoseDetailModal pose={selectedPose} onClose={() => setSelectedPose(null)} />}
      {activeTab === 'practice' && (
        <PracticeMode 
          sequence={sequence}
          practiceIndex={practiceIndex}
          timerSeconds={timerSeconds}
          isTimerRunning={isTimerRunning}
          setIsTimerRunning={setIsTimerRunning}
          nextPracticePose={() => { if (practiceIndex < sequence.length - 1) { setPracticeIndex(p => p + 1); setTimerSeconds(sequence[0].timerVal); setIsTimerRunning(true); } else { setActiveTab('generator'); } }}
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
        />
      )}

      {/* MAIN LAYOUT */}
      <div className="pt-16 flex h-screen overflow-hidden">
        
        {/* SIDEBAR BACKDROP (Mobile) */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden transition-opacity animate-in fade-in duration-200"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* SIDEBAR */}
        {/* MODIFIED: Sidebar now renders if user is on generator OR if sidebar is open (for mobile menu) */}
        {(activeTab === 'generator' || isSidebarOpen) && (
          <aside className={`
            fixed lg:static inset-y-0 left-0 z-40 w-80 bg-white dark:bg-stone-800 border-r border-stone-200 dark:border-stone-700 
            transform transition-transform duration-300 ease-in-out print:hidden flex flex-col
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:w-0 lg:border-none lg:overflow-hidden'}
            ${/* On desktop, hide sidebar if not on generator tab */ activeTab !== 'generator' ? 'lg:hidden' : ''}
          `}>
            <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-thin">
              
              {/* MOBILE NAV HEADER */}
              <div className="flex justify-between items-center lg:hidden mb-6">
                <div className="flex items-center gap-2">
                  <div className="bg-teal-600 text-white p-1 rounded-lg"><Activity size={16} /></div>
                  <h2 className="font-bold text-lg dark:text-stone-100 font-serif">ZenFlow</h2>
                </div>
                <button onClick={() => setIsSidebarOpen(false)} className="text-stone-500 p-2 hover:bg-stone-100 dark:hover:bg-stone-700 rounded-full"><X size={20}/></button>
              </div>

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

              {/* CONTROLS - Only show if on Generator tab */}
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

            {/* GENERATE BUTTON - Only show if on Generator tab */}
            {activeTab === 'generator' && (
              <div className="p-4 border-t border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/50">
                <button onClick={generateSequence} className="w-full py-3.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl shadow-lg shadow-teal-900/20 font-bold flex items-center justify-center gap-2 transition-all transform active:scale-95">
                  <RefreshCw size={18} /> Generate Flow
                </button>
              </div>
            )}
          </aside>
        )}

        {/* WORKSPACE */}
        <main className="flex-1 h-full overflow-y-auto bg-stone-50 dark:bg-stone-900 relative scrollbar-thin">
          
          {activeTab === 'library' && <PoseLibrary setSelectedPose={setSelectedPose} />}
          {activeTab === 'settings' && (
            <MusicConfig
              themes={musicThemes}
              onUpdateTheme={updateMusicTheme}
              spotifyToken={spotifyToken}
              getLoginUrl={getLoginUrl}
              isPremiumUser={isPremiumUser}
              tokenError={tokenError}
            />
          )}

          {activeTab === 'saved' && (
            <div className="max-w-4xl mx-auto p-8">
               <h2 className="text-3xl font-serif text-teal-900 dark:text-teal-100 mb-8 border-b border-stone-200 dark:border-stone-700 pb-4">Your Library</h2>
               {savedSequences.length === 0 ? <div className="text-center py-20 opacity-50 text-stone-600 dark:text-stone-400"><BookOpen size={48} className="mx-auto mb-4"/>No saved flows yet.</div> : (
                 <div className="grid gap-4">
                   {savedSequences.map(s => (
                     <div key={s.id} className="bg-white dark:bg-stone-800 p-6 rounded-xl flex justify-between items-center group shadow-sm hover:shadow-md border border-stone-100 dark:border-stone-700">
                        <div><h3 className="font-bold text-lg text-stone-900 dark:text-stone-100">{s.name}</h3><p className="text-sm opacity-60 text-stone-600 dark:text-stone-400">{s.params.style} • {s.params.duration} min • {s.date}</p></div>
                        <div className="flex gap-2">
                          <button onClick={() => { setParams(s.params); setSequence(s.poses); setActiveTab('generator'); }} className="p-2 text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/30 rounded-lg"><Play size={18} /></button>
                          <button onClick={() => deleteSaved(s.id)} className="p-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg"><Trash2 size={18} /></button>
                        </div>
                     </div>
                   ))}
                 </div>
               )}
            </div>
          )}

          {activeTab === 'generator' && (
            <div className="max-w-5xl mx-auto p-4 lg:p-8 print:p-0 print:max-w-none">
              
              {/* SEQUENCE HEADER */}
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
                    <div className="flex gap-6 mt-3 text-sm text-stone-500 dark:text-stone-400 font-medium">
                      <span className="flex items-center gap-1.5"><Wind size={16}/> {params.duration} mins</span>
                      <span className="flex items-center gap-1.5"><Activity size={16}/> {sequence.length} poses</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button onClick={() => { if(sequence.length > 0) { setPracticeIndex(0); setTimerSeconds(sequence[0].timerVal); setActiveTab('practice'); }}} className="px-6 py-3 bg-stone-900 dark:bg-white text-white dark:text-stone-900 hover:opacity-90 rounded-xl font-bold flex items-center gap-2 shadow-lg transition-transform hover:-translate-y-0.5">
                      <PlayCircle size={20} /> Start Practice
                    </button>
                    <button onClick={() => setIsTeacherMode(!isTeacherMode)} className={`p-3 rounded-xl border transition-colors ${isTeacherMode ? 'bg-teal-50 dark:bg-teal-900/30 border-teal-200 dark:border-teal-700 text-teal-700 dark:text-teal-400' : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-400'}`} title="Teacher Mode">
                      <BookOpen size={20} />
                    </button>
                    <button onClick={() => { 
                      const name = prompt("Name flow:"); 
                      if(name) {
                        const newSave = { id: Date.now(), name, date: new Date().toLocaleDateString(), params, poses: sequence };
                        setSavedSequences([newSave, ...savedSequences]);
                        localStorage.setItem('yoga_saved_sequences', JSON.stringify([newSave, ...savedSequences]));
                      }
                    }} className="p-3 text-stone-500 dark:text-stone-400 hover:text-rose-500 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-colors"><Heart size={20} /></button>
                    <button onClick={() => window.print()} className="p-3 text-stone-500 dark:text-stone-400 hover:text-teal-600 dark:hover:text-teal-400 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-xl transition-colors"><Printer size={20} /></button>
                  </div>
                </div>

                {/* Music Themes */}
                {!isTeacherMode && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                    {musicThemes.map(theme => (
                      <button 
                        key={theme.id}
                        onClick={() => setSelectedMusicId(theme.id)}
                        className={`p-2 rounded-lg flex flex-col items-center text-center transition-all border ${selectedMusicId === theme.id ? 'bg-teal-50 border-teal-200 text-teal-800 dark:bg-teal-900/40 dark:border-teal-700 dark:text-teal-200 ring-1 ring-teal-500' : 'bg-stone-50 dark:bg-stone-800 border-transparent hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-500 dark:text-stone-400'}`}
                      >
                        <div className="mb-1">{theme.icon}</div>
                        <span className="text-[10px] font-bold truncate w-full">{theme.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* PRINT HEADER (Only visible in Print) */}
              <div className="hidden print-only mb-8 text-center">
                <h1 className="text-3xl font-serif font-bold mb-2">ZenFlow Sequence</h1>
                <p className="text-sm text-gray-500">{params.style} • {params.difficulty} • {params.duration} mins</p>
              </div>

              {/* SEQUENCE LIST */}
              <div className={isTeacherMode ? "grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-0" : `space-y-1 ${sequence.length > 0 ? "relative before:absolute before:left-8 before:top-4 before:bottom-4 before:w-0.5 before:bg-stone-200 dark:before:bg-stone-700 print:before:hidden" : ""}`}>
                {sequence.length === 0 ? (
                  <div className="text-center py-20 opacity-40 text-stone-600 dark:text-stone-400 px-4">
                    <p className="text-lg font-serif">Ready to flow? Generate a sequence to begin.</p>
                  </div>
                ) : (
                  sequence.map((pose, idx) => (
                    <PoseCard 
                      key={pose.uniqueId} 
                      pose={pose} 
                      index={idx} 
                      onSwap={swapPose} 
                      setSelectedPose={setSelectedPose}
                      isTeacherMode={isTeacherMode} 
                    />
                  ))
                )}
              </div>

              <div className="mt-12 text-center text-stone-400 text-sm print:hidden">
                <p>Designed with mindfulness by ZenFlow.</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}