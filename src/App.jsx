import React, { useState, useEffect } from 'react';
import { 
  Menu, X, Play, RefreshCw, Settings, Heart, Copy, Printer, 
  Sun, Moon, Music, Wind, Activity, Trash2, Search, 
  Shuffle, SkipForward, Pause, PlayCircle, Info, Download, Check, Headphones,
  Layers, Target, Zap, Anchor // New icons for methods
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
  { 
    id: 'suc', name: 'Easy Pose', sanskrit: 'Sukhasana', category: POSE_CATEGORIES.CENTERING, difficulty: 1, wrist: false, knee: false, pregnant: true, 
    cues: 'Sit tall, ground sit bones, hands on knees.', 
    benefits: ['Calms the brain', 'Strengthens the back', 'Stretches knees and ankles'],
    types: ['grounding', 'meditation'],
    prompt: 'Clean minimalist vector flat illustration of a person sitting cross-legged in Sukhasana (Easy Pose), neutral spine, hands resting on knees, relaxed shoulders. White background, soft teal and slate grey palette, simple crisp lines, animation-ready.'
  },
  { 
    id: 'vir', name: 'Hero Pose', sanskrit: 'Virasana', category: POSE_CATEGORIES.CENTERING, difficulty: 1, wrist: false, knee: false, pregnant: true, 
    cues: 'Knees together, feet apart, sit between heels.', 
    benefits: ['Stretches thighs and knees', 'Improves digestion', 'Relieves tired legs'],
    types: ['grounding', 'knees'],
    prompt: 'Clean minimalist vector flat illustration of a person in Virasana (Hero Pose), seated between heels, knees together, torso upright, hands resting on thighs. White background, soft teal and slate grey palette.'
  },
  { 
    id: 'chi', name: 'Child\'s Pose', sanskrit: 'Balasana', category: POSE_CATEGORIES.CENTERING, difficulty: 1, wrist: false, knee: true, pregnant: true, 
    cues: 'Knees wide, big toes touch, forehead to mat.', 
    benefits: ['Gently stretches hips and thighs', 'Calms the mind', 'Relieves back and neck pain'],
    types: ['grounding', 'hip-opener', 'rest'],
    prompt: 'Clean minimalist vector flat illustration of a person in Balasana (Child’s Pose), knees wide, torso folded down, forehead on mat, arms extended forward. White background, soft teal and slate grey palette.'
  },

  // WARMUP
  { 
    id: 'cat', name: 'Cat Pose', sanskrit: 'Marjaryasana', category: POSE_CATEGORIES.WARMUP, difficulty: 1, wrist: true, knee: true, pregnant: true, 
    cues: 'Exhale, round spine to ceiling, chin to chest.', 
    benefits: ['Increases spine flexibility', 'Stretches back torso and neck', 'Stimulates abdominal organs'],
    types: ['spine', 'warmup'],
    prompt: 'Clean minimalist vector flat illustration of a person in Cat Pose (Marjaryasana), rounded spine, head dropped, on all fours. White background, soft teal and slate grey palette.'
  },
  { 
    id: 'cow', name: 'Cow Pose', sanskrit: 'Bitilasana', category: POSE_CATEGORIES.WARMUP, difficulty: 1, wrist: true, knee: true, pregnant: true, 
    cues: 'Inhale, drop belly, lift gaze.', 
    benefits: ['Stretches front torso and neck', 'Massages spine', 'Calms the mind'],
    types: ['spine', 'warmup'],
    prompt: 'Clean minimalist vector flat illustration of a person in Cow Pose (Bitilasana), spine arched, chest open, head lifted, on all fours. White background, soft teal and slate grey palette.'
  },
  { 
    id: 'thread', name: 'Thread the Needle', sanskrit: 'Parsva Balasana', category: POSE_CATEGORIES.WARMUP, difficulty: 1, wrist: true, knee: true, pregnant: true, 
    cues: 'Slide arm under chest, rest shoulder on mat.', 
    benefits: ['Opens shoulders', 'Gentle spinal twist', 'Relieves tension in upper back'],
    types: ['twist', 'shoulder'],
    prompt: 'Clean minimalist vector flat illustration of a person in Thread the Needle pose, on all fours with one arm threaded under the chest, shoulder and head resting on the ground. White background, soft teal and slate grey palette.'
  },
  { 
    id: 'dd', name: 'Downward Facing Dog', sanskrit: 'Adho Mukha Svanasana', category: POSE_CATEGORIES.WARMUP, difficulty: 2, wrist: true, knee: false, pregnant: true, 
    cues: 'Hips high, heels down, press into knuckles.', 
    benefits: ['Energizes the body', 'Stretches shoulders, hamstrings, calves', 'Strengthens arms and legs'],
    types: ['hamstring', 'inversion', 'strength'],
    prompt: 'Clean minimalist vector flat illustration of a person in Downward Facing Dog, hips lifted, arms straight, legs straight, forming an inverted V. White background, soft teal and slate grey palette.'
  },
  { 
    id: 'rag', name: 'Ragdoll Fold', sanskrit: 'Uttanasana Variation', category: POSE_CATEGORIES.WARMUP, difficulty: 1, wrist: false, knee: false, pregnant: true, 
    cues: 'Hold opposite elbows, sway gently side to side.', 
    benefits: ['Releases lower back', 'Calms the nervous system', 'Stretches hamstrings'],
    types: ['hamstring', 'spine'],
    prompt: 'Clean minimalist vector flat illustration of a person in Ragdoll Forward Fold, knees soft, torso hanging over legs, arms hanging or holding elbows. White background, soft teal and slate grey palette.'
  },

  // SUN SALUTATION
  { 
    id: 'mtn', name: 'Mountain Pose', sanskrit: 'Tadasana', category: POSE_CATEGORIES.SUN_SALUTATION, difficulty: 1, wrist: false, knee: false, pregnant: true, 
    cues: 'Feet grounded, palms forward, crown lifts.', 
    benefits: ['Improves posture', 'Strengthens thighs, knees, and ankles', 'Firms abdomen and buttocks'],
    types: ['standing', 'grounding'],
    prompt: 'Clean minimalist vector flat illustration of a person standing tall in Tadasana, feet hip-width, neutral spine, arms by sides. White background, soft teal and slate grey palette.'
  },
  { 
    id: 'plk', name: 'Plank Pose', sanskrit: 'Phalakasana', category: POSE_CATEGORIES.SUN_SALUTATION, difficulty: 2, wrist: true, knee: false, pregnant: false, 
    cues: 'Core engaged, heels press back, dome upper back.', 
    benefits: ['Strengthens arms, wrists, and spine', 'Tones abdomen', 'Prepares body for advanced arm balances'],
    types: ['core', 'strength'],
    prompt: 'Clean minimalist vector flat illustration of a person in Plank Pose, straight line from head to heels, arms straight, core engaged. White background, soft teal and slate grey palette.'
  },
  { 
    id: 'chat', name: 'Chaturanga', sanskrit: 'Chaturanga Dandasana', category: POSE_CATEGORIES.SUN_SALUTATION, difficulty: 3, wrist: true, knee: false, pregnant: false, 
    cues: 'Lower halfway, elbows hug ribs.', 
    benefits: ['Develops core stability', 'Strengthens arms and wrists', 'Tones abdomen'],
    types: ['strength', 'arm-balance'],
    prompt: 'Clean minimalist vector flat illustration of a person in Chaturanga, elbows bent at 90 degrees, body parallel to floor, tight core. White background, soft teal and slate grey palette.'
  },
  { 
    id: 'cobra', name: 'Cobra Pose', sanskrit: 'Bhujangasana', category: POSE_CATEGORIES.SUN_SALUTATION, difficulty: 1, wrist: true, knee: false, pregnant: false, 
    cues: 'Lift chest, little weight in hands, press tops of feet.', 
    benefits: ['Strengthens the spine', 'Stretches chest and lungs, shoulders, and abdomen', 'Stimulates abdominal organs'],
    types: ['backbend', 'spine'],
    prompt: 'Clean minimalist vector flat illustration of a person in Cobra Pose, chest lifted, elbows bent close to ribs, legs on ground. White background, soft teal and slate grey palette.'
  },
  { 
    id: 'updog', name: 'Upward Facing Dog', sanskrit: 'Urdhva Mukha Svanasana', category: POSE_CATEGORIES.SUN_SALUTATION, difficulty: 2, wrist: true, knee: false, pregnant: false, 
    cues: 'Thighs lifted, chest open, shoulders down.', 
    benefits: ['Improves posture', 'Strengthens spine, arms, wrists', 'Stretches chest and lungs'],
    types: ['backbend', 'strength'],
    prompt: 'Clean minimalist vector flat illustration of a person in Upward Facing Dog, arms straight, thighs lifted off ground, chest open. White background, soft teal and slate grey palette.'
  },

  // STANDING
  { 
    id: 'w1', name: 'Warrior I', sanskrit: 'Virabhadrasana I', category: POSE_CATEGORIES.STANDING, difficulty: 2, wrist: false, knee: false, pregnant: true, 
    cues: 'Back heel down 45 degrees, hips square to front.', 
    benefits: ['Stretches chest and lungs', 'Strengthens shoulders and arms', 'Strengthens and stretches thighs and calves'],
    types: ['strength', 'hip-opener', 'standing'],
    prompt: 'Clean minimalist vector flat illustration of a person in Warrior I, front knee bent 90 degrees, back leg straight, hips squared, arms overhead. White background, soft teal and slate grey palette.'
  },
  { 
    id: 'w2', name: 'Warrior II', sanskrit: 'Virabhadrasana II', category: POSE_CATEGORIES.STANDING, difficulty: 1, wrist: false, knee: false, pregnant: true, 
    cues: 'Front knee over ankle, gaze over front middle finger.', 
    benefits: ['Increases stamina', 'Strengthens legs and ankles', 'Stretches groins, chest and shoulders'],
    types: ['strength', 'hip-opener', 'standing'],
    prompt: 'Clean minimalist vector flat illustration of a person in Warrior II, front knee bent, arms extended parallel, hips open, strong T-shape. White background, soft teal and slate grey palette.'
  },
  { 
    id: 'tri', name: 'Triangle Pose', sanskrit: 'Trikonasana', category: POSE_CATEGORIES.STANDING, difficulty: 2, wrist: false, knee: false, pregnant: true, 
    cues: 'Lengthen side body, hand to shin or block.', 
    benefits: ['Stretches hips, groins, hamstrings', 'Opens chest and shoulders', 'Relieves backache'],
    types: ['hamstring', 'hip-opener', 'standing'],
    prompt: 'Clean minimalist vector flat illustration of a person in Triangle Pose, front leg straight, torso extended sideways, bottom hand to shin, top arm vertical. White background, soft teal and slate grey palette.'
  },
  { 
    id: 'extside', name: 'Extended Side Angle', sanskrit: 'Utthita Parsvakonasana', category: POSE_CATEGORIES.STANDING, difficulty: 2, wrist: false, knee: false, pregnant: true, 
    cues: 'Forearm to thigh or hand to floor, long diagonal line.', 
    benefits: ['Strengthens legs, knees, and ankles', 'Stretches groins, spine, waist', 'Stimulates abdominal organs'],
    types: ['strength', 'side-stretch', 'standing'],
    prompt: 'Clean minimalist vector flat illustration of a person in Extended Side Angle, front knee bent, forearm on thigh or hand to floor, top arm extended overhead on a diagonal. White background, soft teal and slate grey palette.'
  },
  { 
    id: 'lunge', name: 'High Lunge', sanskrit: 'Ashta Chandrasana', category: POSE_CATEGORIES.STANDING, difficulty: 2, wrist: false, knee: false, pregnant: true, 
    cues: 'Back heel lifted, hips square, arms reach up.', 
    benefits: ['Strengthens legs and arms', 'Stretches hip flexors', 'Develops balance and stability'],
    types: ['strength', 'balance', 'standing'],
    prompt: 'Clean minimalist vector flat illustration of a person in High Lunge, front knee bent, back leg straight, arms overhead, torso upright. White background, soft teal and slate grey palette.'
  },
  { 
    id: 'goddess', name: 'Goddess Pose', sanskrit: 'Utkata Konasana', category: POSE_CATEGORIES.STANDING, difficulty: 2, wrist: false, knee: false, pregnant: true, 
    cues: 'Toes out, heels in, sink hips, cactus arms.', 
    benefits: ['Opens hips and chest', 'Strengthens legs and glutes', 'Builds heat'],
    types: ['strength', 'hip-opener', 'standing'],
    prompt: 'Clean minimalist vector flat illustration of a person in Goddess Pose, wide stance, knees bent, toes turned out, arms bent at 90 degrees. White background, soft teal and slate grey palette.'
  },
  { 
    id: 'chair', name: 'Chair Pose', sanskrit: 'Utkatasana', category: POSE_CATEGORIES.STANDING, difficulty: 2, wrist: false, knee: false, pregnant: true, 
    cues: 'Sit back into heels, lift chest, tuck tailbone slightly.', 
    benefits: ['Strengthens ankles, thighs, calves, and spine', 'Stretches shoulders and chest', 'Stimulates heart and diaphragm'],
    types: ['strength', 'standing'],
    prompt: 'Clean minimalist vector flat illustration of a person in Chair Pose, knees bent deeply, hips back, arms overhead, spine long. White background, soft teal and slate grey palette.'
  },

  // BALANCE
  { 
    id: 'tree', name: 'Tree Pose', sanskrit: 'Vrksasana', category: POSE_CATEGORIES.BALANCE, difficulty: 1, wrist: false, knee: false, pregnant: true, 
    cues: 'Foot to calf or thigh (not knee), hands to heart.', 
    benefits: ['Strengthens thighs, calves, ankles, and spine', 'Stretches groins and inner thighs', 'Improves balance'],
    types: ['balance', 'hip-opener'],
    prompt: 'Clean minimalist vector flat illustration of a person in Tree Pose, standing on one leg, other foot on inner thigh, hands in prayer at chest. White background, soft teal and slate grey palette.'
  },
  { 
    id: 'eagle', name: 'Eagle Pose', sanskrit: 'Garudasana', category: POSE_CATEGORIES.BALANCE, difficulty: 3, wrist: false, knee: false, pregnant: true, 
    cues: 'Wrap right leg over left, right arm under left.', 
    benefits: ['Strengthens and stretches ankles and calves', 'Stretches thighs, hips, shoulders, and upper back', 'Improves concentration'],
    types: ['balance', 'twist', 'peak'],
    prompt: 'Clean minimalist vector flat illustration of a person in Eagle Pose, one leg wrapped around the other, arms wrapped, slight squat, elbows lifted. White background, soft teal and slate grey palette.'
  },
  { 
    id: 'w3', name: 'Warrior III', sanskrit: 'Virabhadrasana III', category: POSE_CATEGORIES.BALANCE, difficulty: 3, wrist: false, knee: false, pregnant: true, 
    cues: 'T-shape body, hips square to floor.', 
    benefits: ['Strengthens ankles and legs', 'Strengthens shoulders and muscles of the back', 'Tones the abdomen'],
    types: ['balance', 'strength', 'hamstring'],
    prompt: 'Clean minimalist vector flat illustration of a person in Warrior III, standing on one leg, torso forward, back leg lifted straight, arms extended. White background, soft teal and slate grey palette.'
  },
  { 
    id: 'dancer', name: 'Dancer Pose', sanskrit: 'Natarajasana', category: POSE_CATEGORIES.BALANCE, difficulty: 3, wrist: false, knee: false, pregnant: true, 
    cues: 'Catch inside of back foot, kick into hand.', 
    benefits: ['Stretches shoulders, chest, thighs, groins, and abdomen', 'Strengthens legs and ankles', 'Improves balance'],
    types: ['balance', 'backbend', 'peak'],
    prompt: 'Clean minimalist vector flat illustration of a person in Dancer Pose, standing on one leg, back leg bent and held by the hand, opposite arm reaching forward. White background, soft teal and slate grey palette.'
  },

  // FLOOR / STRETCH / PEAK
  { 
    id: 'pigeon', name: 'Half Pigeon', sanskrit: 'Eka Pada Rajakapotasana', category: POSE_CATEGORIES.HIP_OPENER, difficulty: 2, wrist: true, knee: true, pregnant: true, 
    cues: 'Right knee to right wrist, shin diagonal.', 
    benefits: ['Stretches thighs, groins and psoas', 'Opens hips', 'Stimulates abdominal organs'],
    types: ['hip-opener', 'rest'],
    prompt: 'Clean minimalist vector flat illustration of a person in Half Pigeon Pose, front leg folded, back leg extended, torso upright or folding forward. White background, soft teal and slate grey palette.'
  },
  { 
    id: 'bridge', name: 'Bridge Pose', sanskrit: 'Setu Bandha Sarvangasana', category: POSE_CATEGORIES.BACKBEND, difficulty: 1, wrist: false, knee: false, pregnant: true, 
    cues: 'Lift hips, interlace fingers under back.', 
    benefits: ['Stretches chest, neck, and spine', 'Calms the brain', 'Rejuvenates tired legs'],
    types: ['backbend', 'spine'],
    prompt: 'Clean minimalist vector flat illustration of a person in Bridge Pose, lying on back with knees bent, hips lifted, chest open. White background, soft teal and slate grey palette.'
  },
  { 
    id: 'wheel', name: 'Wheel Pose', sanskrit: 'Urdhva Dhanurasana', category: POSE_CATEGORIES.BACKBEND, difficulty: 3, wrist: true, knee: false, pregnant: false, 
    cues: 'Press into hands and feet, lift entire body.', 
    benefits: ['Strengthens arms, wrists, legs, buttocks, abdomen, and spine', 'Stimulates thyroid and pituitary', 'Increases energy'],
    types: ['backbend', 'peak', 'strength'],
    prompt: 'Clean minimalist vector flat illustration of a person in Wheel Pose, full backbend, hands and feet on ground, chest lifted. White background, soft teal and slate grey palette.'
  },
  { 
    id: 'boat', name: 'Boat Pose', sanskrit: 'Navasana', category: POSE_CATEGORIES.CORE, difficulty: 2, wrist: false, knee: false, pregnant: false, 
    cues: 'Lift feet, balance on sit bones, chest open.', 
    benefits: ['Strengthens abdomen, hip flexors, and spine', 'Stimulates kidneys', 'Improves digestion'],
    types: ['core', 'strength'],
    prompt: 'Clean minimalist vector flat illustration of a person in Boat Pose, balanced on sit bones, legs lifted straight, torso leaning back, arms extended forward. White background, soft teal and slate grey palette.'
  },
  { 
    id: 'crow', name: 'Crow Pose', sanskrit: 'Bakasana', category: POSE_CATEGORIES.BALANCE, difficulty: 3, wrist: true, knee: false, pregnant: false, 
    cues: 'Knees to armpits, lean forward, float feet.', 
    benefits: ['Strengthens arms and wrists', 'Stretches upper back', 'Strengthens abdominal muscles'],
    types: ['arm-balance', 'peak', 'core'],
    prompt: 'Clean minimalist vector flat illustration of a person in Crow Pose, balancing on hands, knees on upper arms, feet lifted, compact body. White background, soft teal and slate grey palette.'
  },
  { 
    id: 'headstand', name: 'Headstand', sanskrit: 'Sirsasana', category: POSE_CATEGORIES.INVERSION, difficulty: 3, wrist: true, knee: false, pregnant: false, 
    cues: 'Forearms down, interlace fingers, crown of head lightly down.', 
    benefits: ['Calms the brain', 'Strengthens arms, legs and spine', 'Improves digestion'],
    types: ['inversion', 'peak', 'core'],
    prompt: 'Clean minimalist vector flat illustration of a person in Supported Headstand, forearm base, straight legs stacked over hips. White background, soft teal and slate grey palette.'
  },
  
  // RESTORATIVE / COOL DOWN
  { 
    id: 'paschi', name: 'Seated Forward Fold', sanskrit: 'Paschimottanasana', category: POSE_CATEGORIES.RESTORATIVE, difficulty: 1, wrist: false, knee: false, pregnant: true, 
    cues: 'Lengthen spine then fold, keep feet flexed.', 
    benefits: ['Calms the brain', 'Stretches the spine, shoulders and hamstrings', 'Stimulates liver and kidneys'],
    types: ['hamstring', 'spine', 'rest'],
    prompt: 'Clean minimalist vector flat illustration of a person in Seated Forward Fold, legs straight, torso folding over legs, hands reaching toward feet. White background, soft teal and slate grey palette.'
  },
  { 
    id: 'janu', name: 'Head to Knee', sanskrit: 'Janu Sirsasana', category: POSE_CATEGORIES.RESTORATIVE, difficulty: 1, wrist: false, knee: true, pregnant: true, 
    cues: 'One leg straight, one foot to inner thigh, fold.', 
    benefits: ['Calms the brain', 'Stretches spine, shoulders, hamstrings, and groins', 'Stimulates liver and kidneys'],
    types: ['hamstring', 'hip-opener', 'rest'],
    prompt: 'Clean minimalist vector flat illustration of a person in Head-to-Knee Pose, one leg extended, other foot against inner thigh, torso folding over extended leg. White background, soft teal and slate grey palette.'
  },
  { 
    id: 'twist', name: 'Supine Twist', sanskrit: 'Supta Matsyendrasana', category: POSE_CATEGORIES.TWIST, difficulty: 1, wrist: false, knee: false, pregnant: true, 
    cues: 'Knees to one side, gaze opposite.', 
    benefits: ['Stretches the back muscles and glutes', 'Massages back and hips', 'Helps hydrate spinal disks'],
    types: ['twist', 'spine', 'rest'],
    prompt: 'Clean minimalist vector flat illustration of a person lying on their back in a Supine Twist, one knee crossed over the body, opposite arm extended. White background, soft teal and slate grey palette.'
  },
  { 
    id: 'happy', name: 'Happy Baby', sanskrit: 'Ananda Balasana', category: POSE_CATEGORIES.HIP_OPENER, difficulty: 1, wrist: false, knee: false, pregnant: true, 
    cues: 'Grab outer feet, pull knees toward armpits.', 
    benefits: ['Gently releases hips', 'Calms the brain', 'Relieves lower back pain'],
    types: ['hip-opener', 'rest'],
    prompt: 'Clean minimalist vector flat illustration of a person on their back in Happy Baby Pose, knees bent wide, hands holding feet, spine grounded. White background, soft teal and slate grey palette.'
  },
  { 
    id: 'sava', name: 'Corpse Pose', sanskrit: 'Savasana', category: POSE_CATEGORIES.SAVASANA, difficulty: 0, wrist: false, knee: false, pregnant: true, 
    cues: 'Complete relaxation. Let go of breath control.', 
    benefits: ['Calms the brain', 'Relieves stress', 'Relaxes the body'],
    types: ['rest', 'grounding'],
    prompt: 'Clean minimalist vector flat illustration of a person lying flat on back in Savasana, arms relaxed by sides, legs extended, neutral alignment. White background, soft teal and slate grey palette.'
  },
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
  { id: 'piano', name: 'Soft Piano', icon: <Music size={16}/>, description: 'Gentle, emotional classical keys.' },
  { id: 'binaural', name: 'Binaural Theta', icon: <Wind size={16}/>, description: 'Brainwave entrainment for deep meditation.' },
  { id: 'silence', name: 'Breath Only', icon: <Moon size={16}/>, description: 'Pure silence to focus on Ujjayi breath.' },
];

/**
 * SEQUENCING CONSTANTS
 */
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


// --- EXTRACTED SUB-COMPONENTS TO FIX RE-MOUNTING ISSUES ---

const PoseDetailModal = ({ pose, onClose }) => {
  if (!pose) return null;

  const imagePath = `/poses/${pose.id}.png`; 
  const fallbackImage = `https://image.pollinations.ai/prompt/${encodeURIComponent(pose.prompt || pose.name)}?nologo=true`;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div className="bg-white dark:bg-stone-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
        
        {/* Header Image Area */}
        <div className="h-64 bg-stone-100 dark:bg-stone-900 relative flex items-center justify-center overflow-hidden group">
          <img 
            src={imagePath} 
            alt={pose.name} 
            className="w-full h-full object-contain p-8 mix-blend-multiply dark:mix-blend-normal transition-transform group-hover:scale-105"
            onError={(e) => { e.target.onerror = null; e.target.src = fallbackImage; }} 
          />
          <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-md">
            <X size={20} />
          </button>
          <div className="absolute bottom-4 right-4 flex gap-2">
             <a 
               href={imagePath} 
               download={`${pose.id}.png`}
               onClick={(e) => e.stopPropagation()}
               className="p-2 bg-white/90 dark:bg-black/50 text-stone-700 dark:text-stone-200 rounded-lg hover:text-teal-600 text-xs font-bold flex items-center gap-1 shadow-sm"
             >
               <Download size={14} /> Save Image
             </a>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto">
          <div className="flex justify-between items-start mb-6">
            <div>
              <span className="text-teal-600 font-bold uppercase tracking-widest text-xs mb-1 block">{pose.category}</span>
              <h2 className="text-3xl font-serif text-stone-900 dark:text-white mb-1">{pose.name}</h2>
              <p className="text-stone-500 italic font-serif text-lg">{pose.sanskrit}</p>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${pose.difficulty <= 1 ? 'bg-emerald-100 text-emerald-800' : pose.difficulty === 2 ? 'bg-yellow-100 text-yellow-800' : 'bg-rose-100 text-rose-800'}`}>
              Level {pose.difficulty}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-bold flex items-center gap-2 mb-3 text-stone-800 dark:text-stone-200">
                <Info size={18} className="text-teal-500" /> Instructions
              </h3>
              <p className="text-stone-600 dark:text-stone-400 leading-relaxed bg-stone-50 dark:bg-stone-900/50 p-4 rounded-lg">
                {pose.cues}
              </p>
            </div>

            <div>
              <h3 className="font-bold flex items-center gap-2 mb-3 text-stone-800 dark:text-stone-200">
                <Check size={18} className="text-teal-500" /> Key Benefits
              </h3>
              <ul className="space-y-2">
                {pose.benefits && pose.benefits.map((benefit, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-stone-600 dark:text-stone-400">
                    <div className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-1.5 shrink-0" />
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

const PoseCard = ({ pose, index, onSwap, setSelectedPose }) => (
  <div className="relative pl-16 group break-inside-avoid print:pl-10 print:mb-4">
    {/* Timeline Dot */}
    <div className="absolute left-[26px] top-6 w-4 h-4 rounded-full border-4 border-white dark:border-stone-900 bg-teal-500 print:left-[10px]"></div>

    <div 
      onClick={() => setSelectedPose(pose)}
      className="cursor-pointer bg-white dark:bg-stone-800 p-5 rounded-xl border border-stone-100 dark:border-stone-700 hover:shadow-md hover:border-teal-200 dark:hover:border-teal-800 transition-all group relative"
    >
      <div className="flex justify-between items-start mb-1">
        <div>
          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1 block">{pose.category}</span>
          <h3 className="font-bold text-lg text-stone-800 dark:text-stone-100 leading-tight group-hover:text-teal-600 transition-colors">{pose.name}</h3>
          <p className="text-stone-500 dark:text-stone-400 italic text-sm font-serif">{pose.sanskrit}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
           <span className={`text-[10px] px-2 py-1 rounded font-bold uppercase tracking-wide ${pose.difficulty <= 1 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200' : pose.difficulty === 2 ? 'bg-yellow-100 text-yellow-800' : 'bg-rose-100 text-rose-800'}`}>
            Level {pose.difficulty}
          </span>
          <button 
            onClick={(e) => { e.stopPropagation(); onSwap(index); }} 
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-stone-400 hover:text-teal-600" 
            title="Swap Pose"
          >
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

const PoseLibrary = ({ setSelectedPose }) => {
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
          <p className="text-stone-500">Explore the encyclopedia of movement. Click any pose for details.</p>
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
          <div 
            key={pose.id} 
            onClick={() => setSelectedPose(pose)}
            className="bg-white dark:bg-stone-800 p-5 rounded-xl border border-stone-200 dark:border-stone-700 hover:border-teal-500 transition-colors cursor-pointer group"
          >
            <div className="flex justify-between">
              <h3 className="font-bold text-lg group-hover:text-teal-600 transition-colors">{pose.name}</h3>
              <span className="text-xs bg-stone-100 dark:bg-stone-700 px-2 py-1 rounded h-fit">{pose.category}</span>
            </div>
            <p className="text-sm italic text-stone-500 mb-3">{pose.sanskrit}</p>
            <div className="flex gap-2 mt-3">
               {pose.types.map(t => <span key={t} className="text-[10px] uppercase font-bold text-teal-600 bg-teal-50 dark:bg-teal-900/30 px-2 py-1 rounded">{t}</span>)}
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
    musicTheme 
}) => {
  const current = sequence[practiceIndex];
  const next = sequence[practiceIndex + 1];

  // Auto-pause timer when Practice Mode mounts
  useEffect(() => {
      setIsTimerRunning(false);
  }, []);

  const bgImage = `https://image.pollinations.ai/prompt/${encodeURIComponent(current.prompt || current.name)}?nologo=true`;

  return (
    <div className="fixed inset-0 z-[60] bg-stone-900 text-stone-100 flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center p-6 border-b border-stone-800">
        <div className="flex items-center gap-2">
          <Activity className="text-teal-400" />
          <span className="font-bold tracking-widest uppercase">Live Practice</span>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-stone-800 rounded-full"><X /></button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
        {/* Background image effect */}
        <div className="absolute inset-0 opacity-10 blur-xl pointer-events-none">
           <img 
              src={`/poses/${current.id}.png`} 
              className="w-full h-full object-cover" 
              onError={(e) => { e.target.onerror = null; e.target.src = bgImage; }}
            />
        </div>

        <span className="text-teal-400 font-bold uppercase tracking-widest mb-4 relative z-10">{current.category}</span>
        <h1 className="text-5xl md:text-7xl font-serif mb-2 relative z-10">{current.name}</h1>
        <p className="text-2xl text-stone-400 italic font-serif mb-12 relative z-10">{current.sanskrit}</p>
        
        {/* Timer Ring */}
        <div className="relative w-48 h-48 flex items-center justify-center mb-12 z-10">
          <div className={`absolute inset-0 rounded-full border-4 ${isTimerRunning ? 'border-teal-500 animate-pulse' : 'border-stone-700'}`}></div>
          <div className="text-6xl font-mono font-bold">{Math.floor(timerSeconds / 60)}:{String(timerSeconds % 60).padStart(2, '0')}</div>
        </div>

        {/* Cues */}
        <p className="text-xl max-w-2xl leading-relaxed opacity-90 relative z-10">{current.cues}</p>
      </div>

      {/* Footer Controls */}
      <div className="bg-stone-800 p-6 flex items-center justify-between relative z-10">
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
            {isTimerRunning ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
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


/**
 * MAIN APP COMPONENT
 */
export default function YogaApp() {
  const [activeTab, setActiveTab] = useState('generator'); // 'generator', 'saved', 'library', 'practice'
  const [params, setParams] = useState({
    duration: 60,
    difficulty: 'Intermediate',
    style: 'Vinyasa',
    filters: { noWrists: false, kneeFriendly: false, pregnancySafe: false },
    method: SEQUENCE_METHODS.STANDARD,
    selectedPeakPose: PEAK_POSES[0].id,
    selectedTheme: THEMES[0].id,
    selectedTarget: TARGET_AREAS[0].id
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

  // Pose Modal State
  const [selectedPose, setSelectedPose] = useState(null);

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

  const pick = (pool, category, count, filterFn = null) => {
    let candidates = pool.filter(p => p.category === category);
    if (filterFn) candidates = candidates.filter(filterFn);
    candidates = candidates.sort(() => 0.5 - Math.random());
    return candidates.slice(0, Math.max(1, count));
  };

  const generateStandardSequence = (pool, minutes) => {
    let counts = {
      centering: 2, warmup: Math.floor(minutes * 0.15), sunSal: Math.floor(minutes * 0.15),
      standing: Math.floor(minutes * 0.30), balance: Math.floor(minutes * 0.10),
      floor: Math.floor(minutes * 0.20), savasana: 1
    };

    if (params.style === 'Yin' || params.style === 'Restorative') {
      counts = { centering: 3, warmup: 2, sunSal: 0, standing: 0, balance: 0, floor: Math.floor(minutes / 4), savasana: 1 };
    }

    let newSequence = [];
    newSequence.push(...pick(pool, POSE_CATEGORIES.CENTERING, counts.centering));
    newSequence.push(...pick(pool, POSE_CATEGORIES.WARMUP, counts.warmup));

    if (counts.sunSal > 0) {
      const sunAIds = ['mtn', 'plk', 'chat', 'cobra', 'dd'];
      const sunFlow = sunAIds.map(id => pool.find(p => p.id === id)).filter(Boolean);
      if (sunFlow.length === 5) {
        newSequence.push(...sunFlow);
        if (params.duration > 45) newSequence.push(...sunFlow);
      }
    }

    newSequence.push(...pick(pool, POSE_CATEGORIES.STANDING, counts.standing));
    newSequence.push(...pick(pool, POSE_CATEGORIES.BALANCE, counts.balance));

    // Floor Mix
    let floorCandidates = pool.filter(p => [POSE_CATEGORIES.HIP_OPENER, POSE_CATEGORIES.TWIST, POSE_CATEGORIES.BACKBEND, POSE_CATEGORIES.RESTORATIVE].includes(p.category)).sort(() => 0.5 - Math.random());
    newSequence.push(...floorCandidates.slice(0, counts.floor));

    const sava = POSE_LIBRARY.find(p => p.id === 'sava');
    if (sava) newSequence.push(sava);

    return newSequence;
  };

  const generatePeakPoseSequence = (pool, minutes) => {
    // Structure: Warmup -> SunSal -> Prep Poses -> Peak Pose -> Counter Poses -> Savasana
    const peakPose = POSE_LIBRARY.find(p => p.id === params.selectedPeakPose);
    if (!peakPose) return generateStandardSequence(pool, minutes);

    let newSequence = [];
    newSequence.push(...pick(pool, POSE_CATEGORIES.CENTERING, 2));
    newSequence.push(...pick(pool, POSE_CATEGORIES.WARMUP, 3));

    // Sun Salutations
    const sunAIds = ['mtn', 'plk', 'chat', 'cobra', 'dd'];
    const sunFlow = sunAIds.map(id => pool.find(p => p.id === id)).filter(Boolean);
    if (sunFlow.length === 5) newSequence.push(...sunFlow);

    // Prep Poses (Standing/Core) that share types with Peak
    const prepCount = Math.floor(minutes * 0.3);
    const relatedTypes = peakPose.types.filter(t => t !== 'peak'); // e.g., 'balance', 'hip-opener'
    
    // Find standing/balance poses that match at least one type of the peak pose
    const prepPoses = pool.filter(p => 
      (p.category === POSE_CATEGORIES.STANDING || p.category === POSE_CATEGORIES.BALANCE || p.category === POSE_CATEGORIES.CORE) &&
      p.id !== peakPose.id &&
      p.types.some(t => relatedTypes.includes(t))
    ).sort(() => 0.5 - Math.random()).slice(0, prepCount);

    newSequence.push(...prepPoses);

    // THE PEAK
    newSequence.push(peakPose);

    // Cool down / Counter poses (Floor)
    const coolCount = Math.floor(minutes * 0.2);
    const coolPoses = pool.filter(p => [POSE_CATEGORIES.TWIST, POSE_CATEGORIES.HIP_OPENER, POSE_CATEGORIES.RESTORATIVE].includes(p.category)).sort(() => 0.5 - Math.random()).slice(0, coolCount);
    newSequence.push(...coolPoses);

    const sava = POSE_LIBRARY.find(p => p.id === 'sava');
    if (sava) newSequence.push(sava);

    return newSequence;
  };

  const generateThemedSequence = (pool, minutes) => {
    const theme = THEMES.find(t => t.id === params.selectedTheme);
    if (!theme) return generateStandardSequence(pool, minutes);

    // Filter pool to heavily favor theme types
    // We don't exclude others entirely, but we prioritize them
    const prioritizedPool = pool.filter(p => p.types.some(t => theme.types.includes(t)));
    const otherPool = pool.filter(p => !p.types.some(t => theme.types.includes(t)));

    // Helper to get mostly themed poses, but fill with others if needed
    const smartPick = (category, count) => {
      let themedCandidates = prioritizedPool.filter(p => p.category === category).sort(() => 0.5 - Math.random());
      let others = otherPool.filter(p => p.category === category).sort(() => 0.5 - Math.random());
      return [...themedCandidates, ...others].slice(0, Math.max(1, count));
    };

    let newSequence = [];
    newSequence.push(...smartPick(POSE_CATEGORIES.CENTERING, 2));
    newSequence.push(...smartPick(POSE_CATEGORIES.WARMUP, 3));
    
    // Sun Sal only if appropriate for theme (skip for 'Rest')
    if (theme.id !== 'rest') {
       const sunAIds = ['mtn', 'plk', 'chat', 'cobra', 'dd'];
       const sunFlow = sunAIds.map(id => pool.find(p => p.id === id)).filter(Boolean);
       if (sunFlow.length === 5) newSequence.push(...sunFlow);
    }

    newSequence.push(...smartPick(POSE_CATEGORIES.STANDING, Math.floor(minutes * 0.25)));
    newSequence.push(...smartPick(POSE_CATEGORIES.BALANCE, Math.floor(minutes * 0.1)));
    
    // Floor
    let floorCandidates = [...prioritizedPool, ...otherPool].filter(p => [POSE_CATEGORIES.HIP_OPENER, POSE_CATEGORIES.TWIST, POSE_CATEGORIES.BACKBEND, POSE_CATEGORIES.RESTORATIVE].includes(p.category));
    newSequence.push(...floorCandidates.slice(0, Math.floor(minutes * 0.25)));

    const sava = POSE_LIBRARY.find(p => p.id === 'sava');
    if (sava) newSequence.push(sava);

    return newSequence;
  };

  const generateTargetAreaSequence = (pool, minutes) => {
    const target = TARGET_AREAS.find(t => t.id === params.selectedTarget);
    if (!target) return generateStandardSequence(pool, minutes);

    // Similar logic to Theme, but strictly filtering for benefits/types related to body part
    const targetPool = pool.filter(p => p.types.some(t => target.types.includes(t)));
    const generalPool = pool.filter(p => !p.types.some(t => target.types.includes(t))); // Fillers

    const smartPick = (category, count) => {
      let main = targetPool.filter(p => p.category === category).sort(() => 0.5 - Math.random());
      let fill = generalPool.filter(p => p.category === category).sort(() => 0.5 - Math.random());
      return [...main, ...fill].slice(0, Math.max(1, count));
    };

    let newSequence = [];
    newSequence.push(...smartPick(POSE_CATEGORIES.CENTERING, 2));
    newSequence.push(...smartPick(POSE_CATEGORIES.WARMUP, 3));
    
    // Sun Sal
    const sunAIds = ['mtn', 'plk', 'chat', 'cobra', 'dd'];
    const sunFlow = sunAIds.map(id => pool.find(p => p.id === id)).filter(Boolean);
    if (sunFlow.length === 5) newSequence.push(...sunFlow);

    // Heavy focus on the target area in Standing/Floor
    newSequence.push(...smartPick(POSE_CATEGORIES.STANDING, Math.floor(minutes * 0.3)));
    
    // Floor work is where target areas usually shine (hips, hamstrings, spine)
    let floorTarget = targetPool.filter(p => [POSE_CATEGORIES.HIP_OPENER, POSE_CATEGORIES.TWIST, POSE_CATEGORIES.BACKBEND, POSE_CATEGORIES.RESTORATIVE].includes(p.category));
    let floorFill = generalPool.filter(p => [POSE_CATEGORIES.HIP_OPENER, POSE_CATEGORIES.TWIST, POSE_CATEGORIES.BACKBEND, POSE_CATEGORIES.RESTORATIVE].includes(p.category));
    
    newSequence.push(...[...floorTarget, ...floorFill].slice(0, Math.floor(minutes * 0.3)));

    const sava = POSE_LIBRARY.find(p => p.id === 'sava');
    if (sava) newSequence.push(sava);

    return newSequence;
  };

  const generateLadderFlowSequence = (pool, minutes) => {
    // Ladder Flow: Build a sequence A, then A+B, then A+B+C.
    // We need about 3-4 standing poses to build the ladder.
    const ladderPoses = pick(pool, POSE_CATEGORIES.STANDING, 3);
    if (ladderPoses.length < 3) return generateStandardSequence(pool, minutes);

    let newSequence = [];
    
    // Warmup
    newSequence.push(...pick(pool, POSE_CATEGORIES.CENTERING, 2));
    newSequence.push(...pick(pool, POSE_CATEGORIES.WARMUP, 2));

    // Sun Sal A (Once)
    const sunAIds = ['mtn', 'plk', 'chat', 'cobra', 'dd'];
    const sunFlow = sunAIds.map(id => pool.find(p => p.id === id)).filter(Boolean);
    newSequence.push(...sunFlow);

    // The Ladder Construction
    // Round 1: Pose 1 -> Vinyasa
    newSequence.push(ladderPoses[0]);
    newSequence.push(pool.find(p => p.id === 'plk')); // Mini vinyasa
    newSequence.push(pool.find(p => p.id === 'dd'));

    // Round 2: Pose 1 -> Pose 2 -> Vinyasa
    newSequence.push(ladderPoses[0]);
    newSequence.push(ladderPoses[1]);
    newSequence.push(pool.find(p => p.id === 'plk')); 
    newSequence.push(pool.find(p => p.id === 'dd'));

    // Round 3: Pose 1 -> Pose 2 -> Pose 3 -> Vinyasa
    newSequence.push(ladderPoses[0]);
    newSequence.push(ladderPoses[1]);
    newSequence.push(ladderPoses[2]);
    newSequence.push(pool.find(p => p.id === 'plk')); 
    newSequence.push(pool.find(p => p.id === 'dd'));

    // Cool down
    newSequence.push(...pick(pool, POSE_CATEGORIES.HIP_OPENER, 2));
    newSequence.push(...pick(pool, POSE_CATEGORIES.TWIST, 1));

    const sava = POSE_LIBRARY.find(p => p.id === 'sava');
    if (sava) newSequence.push(sava);

    return newSequence;
  };


  const generateSequence = () => {
    const pool = getFilteredPool();
    const minutes = params.duration;
    let newSequence = [];

    switch (params.method) {
      case SEQUENCE_METHODS.PEAK:
        newSequence = generatePeakPoseSequence(pool, minutes);
        break;
      case SEQUENCE_METHODS.THEME:
        newSequence = generateThemedSequence(pool, minutes);
        break;
      case SEQUENCE_METHODS.TARGET:
        newSequence = generateTargetAreaSequence(pool, minutes);
        break;
      case SEQUENCE_METHODS.LADDER:
        newSequence = generateLadderFlowSequence(pool, minutes);
        break;
      default:
        newSequence = generateStandardSequence(pool, minutes);
        break;
    }

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


  // --- RENDER ---

  // Init Generator on Load
  useEffect(() => { if(sequence.length === 0) generateSequence(); }, []);

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${darkMode ? 'dark bg-stone-900 text-stone-100' : 'bg-stone-50 text-stone-800'}`}>
      
      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-white/90 dark:bg-stone-800/90 backdrop-blur border-b border-stone-200 dark:border-stone-700 flex items-center justify-between px-4 lg:px-8 print:hidden">
        <div className="flex items-center gap-2">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-stone-100 dark:hover:bg-stone-700 rounded-lg lg:hidden">
            <Menu size={24} />
          </button>
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('generator')}>
            <Activity className="text-teal-600 dark:text-teal-400" />
            <h1 className="text-xl font-bold tracking-tight text-teal-900 dark:text-teal-100">ZenFlow</h1>
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

      {/* OVERLAY: POSE DETAIL MODAL */}
      {selectedPose && <PoseDetailModal pose={selectedPose} onClose={() => setSelectedPose(null)} />}

      {/* OVERLAY: PRACTICE MODE */}
      {activeTab === 'practice' && (
        <PracticeMode 
          sequence={sequence}
          practiceIndex={practiceIndex}
          timerSeconds={timerSeconds}
          isTimerRunning={isTimerRunning}
          setIsTimerRunning={setIsTimerRunning}
          nextPracticePose={nextPracticePose}
          onClose={() => setActiveTab('generator')}
          musicTheme={musicTheme}
        />
      )}

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
            <div className="p-6 space-y-8 pb-32">
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

              {/* SEQUENCING METHOD SECTION */}
              <div className="space-y-4 border-t border-stone-100 dark:border-stone-700 pt-4">
                 <div className="flex items-center gap-2 text-teal-700 dark:text-teal-400 font-semibold uppercase text-xs tracking-wider"><Layers size={14} /> Sequence Method</div>
                 
                 <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => setParams({...params, method: SEQUENCE_METHODS.STANDARD})} 
                      className={`p-3 rounded-lg text-xs font-bold border transition-all ${params.method === SEQUENCE_METHODS.STANDARD ? 'bg-teal-50 border-teal-500 text-teal-800' : 'bg-stone-50 border-transparent hover:bg-stone-100 text-stone-600'}`}
                    >
                      Standard Flow
                    </button>
                    <button 
                      onClick={() => setParams({...params, method: SEQUENCE_METHODS.PEAK})} 
                      className={`p-3 rounded-lg text-xs font-bold border transition-all ${params.method === SEQUENCE_METHODS.PEAK ? 'bg-teal-50 border-teal-500 text-teal-800' : 'bg-stone-50 border-transparent hover:bg-stone-100 text-stone-600'}`}
                    >
                      <Target size={14} className="inline mb-1 mr-1"/> Peak Pose
                    </button>
                    <button 
                      onClick={() => setParams({...params, method: SEQUENCE_METHODS.THEME})} 
                      className={`p-3 rounded-lg text-xs font-bold border transition-all ${params.method === SEQUENCE_METHODS.THEME ? 'bg-teal-50 border-teal-500 text-teal-800' : 'bg-stone-50 border-transparent hover:bg-stone-100 text-stone-600'}`}
                    >
                      <Zap size={14} className="inline mb-1 mr-1"/> Themed
                    </button>
                    <button 
                      onClick={() => setParams({...params, method: SEQUENCE_METHODS.TARGET})} 
                      className={`p-3 rounded-lg text-xs font-bold border transition-all ${params.method === SEQUENCE_METHODS.TARGET ? 'bg-teal-50 border-teal-500 text-teal-800' : 'bg-stone-50 border-transparent hover:bg-stone-100 text-stone-600'}`}
                    >
                      <Anchor size={14} className="inline mb-1 mr-1"/> Body Area
                    </button>
                    <button 
                      onClick={() => setParams({...params, method: SEQUENCE_METHODS.LADDER})} 
                      className={`p-3 rounded-lg text-xs font-bold border transition-all col-span-2 ${params.method === SEQUENCE_METHODS.LADDER ? 'bg-teal-50 border-teal-500 text-teal-800' : 'bg-stone-50 border-transparent hover:bg-stone-100 text-stone-600'}`}
                    >
                      <Layers size={14} className="inline mb-1 mr-1"/> Ladder Flow
                    </button>
                 </div>

                 {/* DYNAMIC OPTIONS BASED ON METHOD */}
                 {params.method === SEQUENCE_METHODS.PEAK && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                      <label className="block text-sm font-medium mb-1">Select Peak Pose</label>
                      <select value={params.selectedPeakPose} onChange={(e) => setParams({...params, selectedPeakPose: e.target.value})} className="w-full p-2 rounded border border-stone-200 dark:border-stone-600 bg-stone-50 dark:bg-stone-700 text-sm">
                        {PEAK_POSES.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                    </div>
                 )}

                 {params.method === SEQUENCE_METHODS.THEME && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                      <label className="block text-sm font-medium mb-1">Select Theme</label>
                      <select value={params.selectedTheme} onChange={(e) => setParams({...params, selectedTheme: e.target.value})} className="w-full p-2 rounded border border-stone-200 dark:border-stone-600 bg-stone-50 dark:bg-stone-700 text-sm">
                        {THEMES.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                      </select>
                    </div>
                 )}

                 {params.method === SEQUENCE_METHODS.TARGET && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                      <label className="block text-sm font-medium mb-1">Target Area</label>
                      <select value={params.selectedTarget} onChange={(e) => setParams({...params, selectedTarget: e.target.value})} className="w-full p-2 rounded border border-stone-200 dark:border-stone-600 bg-stone-50 dark:bg-stone-700 text-sm">
                        {TARGET_AREAS.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                      </select>
                    </div>
                 )}
              </div>

              <div className="space-y-3 border-t border-stone-100 dark:border-stone-700 pt-4">
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
          
          {activeTab === 'library' && <PoseLibrary setSelectedPose={setSelectedPose} />}

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
                    <h2 className="text-3xl font-serif text-stone-900 dark:text-white">
                        {params.method === SEQUENCE_METHODS.STANDARD ? `${params.style} Flow` : 
                         params.method === SEQUENCE_METHODS.PEAK ? `Peak: ${POSE_LIBRARY.find(p=>p.id===params.selectedPeakPose)?.name}` : 
                         params.method === SEQUENCE_METHODS.THEME ? `${THEMES.find(t=>t.id===params.selectedTheme)?.name}` :
                         params.method === SEQUENCE_METHODS.TARGET ? `${TARGET_AREAS.find(t=>t.id===params.selectedTarget)?.name} Focus` :
                         'Ladder Flow'}
                    </h2>
                    <div className="flex gap-4 mt-2 text-sm opacity-60">
                      <span className="flex items-center gap-1"><Wind size={14}/> {params.duration} Mins</span>
                      <span className="flex items-center gap-1"><Activity size={14}/> {sequence.length} Poses</span>
                      <span className="flex items-center gap-1"><Layers size={14}/> {params.difficulty}</span>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 print:hidden">
                  {MUSIC_THEMES.map(theme => (
                    <button 
                      key={theme.id}
                      onClick={() => setMusicTheme(theme)}
                      className={`p-3 rounded-lg flex items-center gap-3 text-left transition-all border ${musicTheme.id === theme.id ? 'bg-teal-50 border-teal-200 dark:bg-teal-900/30 dark:border-teal-800 ring-1 ring-teal-500' : 'bg-stone-50 dark:bg-stone-900 border-transparent hover:bg-stone-100 dark:hover:bg-stone-800'}`}
                    >
                      <div className={`p-2 rounded-full shrink-0 ${musicTheme.id === theme.id ? 'bg-teal-100 text-teal-700 dark:bg-teal-800 dark:text-teal-200' : 'bg-stone-200 dark:bg-stone-700 text-stone-500'}`}>
                        {theme.icon}
                      </div>
                      <div className="overflow-hidden">
                        <span className="block text-sm font-bold truncate">{theme.name}</span>
                        <span className="block text-xs opacity-60 truncate">{theme.description}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* LIST VIEW */}
              <div className="space-y-1 relative before:absolute before:left-8 before:top-4 before:bottom-4 before:w-0.5 before:bg-stone-200 dark:before:bg-stone-700 print:before:left-4">
                {sequence.map((pose, idx) => (
                  <PoseCard key={pose.uniqueId} pose={pose} index={idx} onSwap={swapPose} setSelectedPose={setSelectedPose} />
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