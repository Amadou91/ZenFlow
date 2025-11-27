/* eslint-disable react-refresh/only-export-components */
import React from 'react';
import { Activity, Headphones, Music, Sun, Wind } from 'lucide-react';

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

// NEW: Pose Levels for Transition Logic
const LEVELS = {
  STANDING: 'standing',
  KNEELING: 'kneeling', // Table top, low lunge
  SEATED: 'seated',
  SUPINE: 'supine', // On back
  PRONE: 'prone',   // On belly
  INVERSION: 'inversion' // Headstand, etc
};

// Dynamic Timing Configuration
const TIMING_CONFIG = {
  [POSE_CATEGORIES.WARMUP]: { label: '1 min', seconds: 60 },
  [POSE_CATEGORIES.SUN_SALUTATION]: { label: '1 breath', seconds: 15 },
  [POSE_CATEGORIES.STANDING]: { label: '5–8 breaths', seconds: 60 },
  [POSE_CATEGORIES.BALANCE]: { label: '5–8 breaths', seconds: 60 },
  [POSE_CATEGORIES.INVERSION]: { label: '10–15 breaths', seconds: 90 },
  [POSE_CATEGORIES.BACKBEND]: { label: '5–8 breaths', seconds: 60 },
  [POSE_CATEGORIES.TWIST]: { label: '5–8 breaths', seconds: 60 },
  [POSE_CATEGORIES.HIP_OPENER]: { label: '1–2 mins', seconds: 90 },
  [POSE_CATEGORIES.CORE]: { label: '30 seconds', seconds: 30 },
  [POSE_CATEGORIES.RESTORATIVE]: { label: '2–3 minutes', seconds: 120 },
  [POSE_CATEGORIES.CENTERING]: { label: '1–2 minutes', seconds: 90 },
  [POSE_CATEGORIES.SAVASANA]: { label: '5 minutes', seconds: 300 },
};

const GENERATION_CONFIG = {
  MIN_POSES: 12,
  SECTION_RATIOS: {
    Vinyasa: { centering: 0.1, warmup: 0.15, standing: 0.4, floor: 0.25, savasana: 0.1 },
    Hatha: { centering: 0.15, warmup: 0.2, standing: 0.3, floor: 0.25, savasana: 0.1 },
    Yin: { centering: 0.15, warmup: 0.1, standing: 0.0, floor: 0.6, savasana: 0.15 },
    Power: { centering: 0.05, warmup: 0.15, standing: 0.5, floor: 0.2, savasana: 0.1 },
    Restorative: { centering: 0.2, warmup: 0.1, standing: 0.0, floor: 0.5, savasana: 0.2 },
  },
  VINYASA_FLOW_ID_SEQUENCE: ['plk', 'chat', 'cobra', 'dd'],
  
  // NEW: Biomechanical Transition Rules
  // strict: Only allow transitions to these levels
  // loose: Allow these, plus fallback to 'kneeling' (neutral) if stuck
  TRANSITION_RULES: {
    // From: [Allowed Next Levels]
    [LEVELS.STANDING]: [LEVELS.STANDING, LEVELS.KNEELING, LEVELS.PRONE, LEVELS.INVERSION], // Prone allowed for Vinyasa flow
    [LEVELS.KNEELING]: [LEVELS.KNEELING, LEVELS.STANDING, LEVELS.SEATED, LEVELS.PRONE, LEVELS.SUPINE, LEVELS.INVERSION], // Kneeling is the universal hub
    [LEVELS.SEATED]: [LEVELS.SEATED, LEVELS.SUPINE, LEVELS.KNEELING],
    [LEVELS.PRONE]: [LEVELS.PRONE, LEVELS.KNEELING, LEVELS.SUPINE, LEVELS.INVERSION],
    [LEVELS.SUPINE]: [LEVELS.SUPINE, LEVELS.SEATED, LEVELS.KNEELING], // Hard to go Supine -> Standing without rolling up
    [LEVELS.INVERSION]: [LEVELS.KNEELING, LEVELS.SUPINE, LEVELS.STANDING, LEVELS.PRONE] // Usually come down to childs pose or back
  }
};

const POSE_LIBRARY = [
  // CENTERING
  { 
    id: 'suc', name: 'Easy Pose', sanskrit: 'Sukhasana', category: POSE_CATEGORIES.CENTERING, difficulty: 0, wrist: false, knee: false, pregnant: true, level: LEVELS.SEATED,
    cues: 'Sit tall, ground sit bones, hands on knees.', 
    teachingCue: 'Find a comfortable seat. Root down through your sit bones and lengthen through the crown of your head.',
    benefits: ['Calms the brain', 'Strengthens the back', 'Stretches knees and ankles'],
    types: ['grounding', 'meditation']
  },
  { 
    id: 'vir', name: 'Hero Pose', sanskrit: 'Virasana', category: POSE_CATEGORIES.CENTERING, difficulty: 1, wrist: false, knee: true, pregnant: true, level: LEVELS.KNEELING,
    cues: 'Knees together, feet apart, sit between heels.', 
    teachingCue: 'Kneel with knees touching and feet wider than hips. Lower your seat between your heels.',
    benefits: ['Stretches thighs and knees', 'Improves digestion', 'Relieves tired legs'],
    types: ['grounding', 'knees']
  },
  { 
    id: 'chi', name: 'Child\'s Pose', sanskrit: 'Balasana', category: POSE_CATEGORIES.CENTERING, difficulty: 0, wrist: false, knee: true, pregnant: true, level: LEVELS.KNEELING,
    cues: 'Knees wide, big toes touch, forehead to mat.', 
    teachingCue: 'Bring big toes to touch, knees wide. Sink your hips back to your heels and extend arms forward.',
    benefits: ['Gently stretches hips', 'Calms the mind', 'Relieves back and neck pain'],
    types: ['grounding', 'hip-opener', 'rest']
  },

  // WARMUP
  { 
    id: 'cat', name: 'Cat Pose', sanskrit: 'Marjaryasana', category: POSE_CATEGORIES.WARMUP, difficulty: 1, wrist: true, knee: true, pregnant: true, level: LEVELS.KNEELING,
    cues: 'Exhale, round spine to ceiling, chin to chest.', 
    teachingCue: 'On an exhale, press into your palms, round your back like a halloween cat.',
    benefits: ['Increases spine flexibility', 'Stretches back torso', 'Stimulates abdominal organs'],
    types: ['spine', 'warmup']
  },
  { 
    id: 'cow', name: 'Cow Pose', sanskrit: 'Bitilasana', category: POSE_CATEGORIES.WARMUP, difficulty: 1, wrist: true, knee: true, pregnant: true, level: LEVELS.KNEELING,
    cues: 'Inhale, drop belly, lift gaze.', 
    teachingCue: 'Inhale to drop the belly low, lift the gaze and tailbone.',
    benefits: ['Stretches front torso', 'Massages spine', 'Calms the mind'],
    types: ['spine', 'warmup']
  },
  { 
    id: 'thread', name: 'Thread the Needle', sanskrit: 'Parsva Balasana', category: POSE_CATEGORIES.WARMUP, difficulty: 1, wrist: true, knee: true, pregnant: true, level: LEVELS.KNEELING,
    cues: 'Slide arm under chest, rest shoulder on mat.', 
    teachingCue: 'From Table Top, slide one arm underneath the other, lowering your shoulder and cheek to the mat.',
    benefits: ['Opens shoulders', 'Gentle spinal twist', 'Relieves tension in upper back'],
    types: ['twist', 'shoulder']
  },
  { 
    id: 'dd', name: 'Downward Facing Dog', sanskrit: 'Adho Mukha Svanasana', category: POSE_CATEGORIES.WARMUP, difficulty: 2, wrist: true, knee: false, pregnant: true, level: LEVELS.INVERSION, // Often transitional
    cues: 'Hips high, heels down, press into knuckles.', 
    teachingCue: 'Tuck your toes and lift your hips up and back. Press firmly into your hands.',
    benefits: ['Energizes the body', 'Stretches hamstrings', 'Strengthens arms and legs'],
    types: ['hamstring', 'inversion', 'strength']
  },
  { 
    id: 'rag', name: 'Ragdoll Fold', sanskrit: 'Uttanasana Variation', category: POSE_CATEGORIES.STANDING, difficulty: 1, wrist: false, knee: false, pregnant: true, level: LEVELS.STANDING,
    cues: 'Hold opposite elbows, sway gently side to side.', 
    teachingCue: 'Step feet hip-width apart. Hinge at the hips, bend knees deeply, and grab opposite elbows.',
    benefits: ['Releases lower back', 'Calms the nervous system', 'Stretches hamstrings'],
    types: ['hamstring', 'spine']
  },

  // SUN SALUTATION
  { 
    id: 'mtn', name: 'Mountain Pose', sanskrit: 'Tadasana', category: POSE_CATEGORIES.SUN_SALUTATION, difficulty: 0, wrist: false, knee: false, pregnant: true, level: LEVELS.STANDING,
    cues: 'Feet grounded, palms forward, crown lifts.', 
    teachingCue: 'Stand tall with feet together or hip-width. Engage quads, draw navel in.',
    benefits: ['Improves posture', 'Strengthens thighs', 'Firms abdomen and buttocks'],
    types: ['standing', 'grounding']
  },
  { 
    id: 'plk', name: 'Plank Pose', sanskrit: 'Phalakasana', category: POSE_CATEGORIES.SUN_SALUTATION, difficulty: 2, wrist: true, knee: false, pregnant: false, level: LEVELS.PRONE,
    cues: 'Core engaged, heels press back, dome upper back.', 
    teachingCue: 'Plant hands shoulder-width. Step back to a high push-up.',
    benefits: ['Strengthens arms and spine', 'Tones abdomen', 'Prepares body for advanced arm balances'],
    types: ['core', 'strength']
  },
  { 
    id: 'chat', name: 'Chaturanga', sanskrit: 'Chaturanga Dandasana', category: POSE_CATEGORIES.SUN_SALUTATION, difficulty: 3, wrist: true, knee: false, pregnant: false, level: LEVELS.PRONE,
    cues: 'Lower halfway, elbows hug ribs.', 
    teachingCue: 'Shift forward, bend elbows straight back to lower halfway.',
    benefits: ['Develops core stability', 'Strengthens arms', 'Tones abdomen'],
    types: ['strength', 'arm-balance']
  },
  { 
    id: 'cobra', name: 'Cobra Pose', sanskrit: 'Bhujangasana', category: POSE_CATEGORIES.SUN_SALUTATION, difficulty: 1, wrist: true, knee: false, pregnant: false, level: LEVELS.PRONE,
    cues: 'Lift chest, little weight in hands, press tops of feet.', 
    teachingCue: 'Lower to belly. Press tops of feet down. Peel chest off the floor.',
    benefits: ['Strengthens the spine', 'Stretches chest', 'Stimulates abdominal organs'],
    types: ['backbend', 'spine']
  },
  { 
    id: 'updog', name: 'Upward Facing Dog', sanskrit: 'Urdhva Mukha Svanasana', category: POSE_CATEGORIES.SUN_SALUTATION, difficulty: 2, wrist: true, knee: false, pregnant: false, level: LEVELS.PRONE, // Biomechanically prone-based entry
    cues: 'Thighs lifted, chest open, shoulders down.', 
    teachingCue: 'Press into hands and tops of feet to lift thighs off the mat.',
    benefits: ['Improves posture', 'Strengthens spine', 'Stretches chest and lungs'],
    types: ['backbend', 'strength']
  },

  // STANDING
  { 
    id: 'w1', name: 'Warrior I', sanskrit: 'Virabhadrasana I', category: POSE_CATEGORIES.STANDING, difficulty: 2, wrist: false, knee: false, pregnant: true, level: LEVELS.STANDING,
    cues: 'Back heel down 45 degrees, hips square to front.', 
    teachingCue: 'Step one foot back, heel down at 45 degrees. Bend front knee over ankle.',
    benefits: ['Stretches chest and lungs', 'Strengthens shoulders', 'Strengthens and stretches thighs and calves'],
    types: ['strength', 'hip-opener', 'standing']
  },
  { 
    id: 'w2', name: 'Warrior II', sanskrit: 'Virabhadrasana II', category: POSE_CATEGORIES.STANDING, difficulty: 1, wrist: false, knee: false, pregnant: true, level: LEVELS.STANDING,
    cues: 'Front knee over ankle, gaze over front middle finger.', 
    teachingCue: 'Open hips to the side. Front heel aligns with back arch.',
    benefits: ['Increases stamina', 'Strengthens legs', 'Stretches groins, chest and shoulders'],
    types: ['strength', 'hip-opener', 'standing']
  },
  { 
    id: 'tri', name: 'Triangle Pose', sanskrit: 'Trikonasana', category: POSE_CATEGORIES.STANDING, difficulty: 2, wrist: false, knee: false, pregnant: true, level: LEVELS.STANDING,
    cues: 'Lengthen side body, hand to shin or block.', 
    teachingCue: 'Straighten front leg. Reach forward then down, placing hand on shin or block.',
    benefits: ['Stretches hips', 'Relieves backache', 'Opens chest and shoulders'],
    types: ['hamstring', 'hip-opener', 'standing']
  },
  { 
    id: 'extside', name: 'Extended Side Angle', sanskrit: 'Utthita Parsvakonasana', category: POSE_CATEGORIES.STANDING, difficulty: 2, wrist: false, knee: false, pregnant: true, level: LEVELS.STANDING,
    cues: 'Forearm to thigh or hand to floor, long diagonal line.', 
    teachingCue: 'Bend front knee. Rest forearm on thigh or hand on floor.',
    benefits: ['Strengthens legs', 'Stretches groins', 'Stimulates abdominal organs'],
    types: ['strength', 'side-stretch', 'standing']
  },
  { 
    id: 'lunge', name: 'High Lunge', sanskrit: 'Ashta Chandrasana', category: POSE_CATEGORIES.STANDING, difficulty: 2, wrist: false, knee: false, pregnant: true, level: LEVELS.STANDING,
    cues: 'Back heel lifted, hips square, arms reach up.', 
    teachingCue: 'Step back, keeping back heel lifted. Bend front knee to 90 degrees.',
    benefits: ['Strengthens legs', 'Stretches hip flexors', 'Develops balance and stability'],
    types: ['strength', 'balance', 'standing']
  },
  { 
    id: 'goddess', name: 'Goddess Pose', sanskrit: 'Utkata Konasana', category: POSE_CATEGORIES.STANDING, difficulty: 2, wrist: false, knee: false, pregnant: true, level: LEVELS.STANDING,
    cues: 'Toes out, heels in, sink hips, cactus arms.', 
    teachingCue: 'Step feet wide, toes turned out. Sink hips low into a squat.',
    benefits: ['Opens hips', 'Builds heat', 'Strengthens legs and glutes'],
    types: ['strength', 'hip-opener', 'standing']
  },
  {
    id: 'chair', name: 'Chair Pose', sanskrit: 'Utkatasana', category: POSE_CATEGORIES.STANDING, difficulty: 2, wrist: false, knee: false, pregnant: true, level: LEVELS.STANDING,
    cues: 'Sit back into heels, lift chest, tuck tailbone slightly.',
    teachingCue: 'Feet together or hip-width. Bend knees and sink hips back as if sitting in a chair.',
    benefits: ['Strengthens ankles', 'Stimulates heart', 'Stretches shoulders and chest'],
    types: ['strength', 'standing']
  },
  {
    id: 'revwar', name: 'Revolved Crescent Lunge', sanskrit: 'Parivrtta Anjaneyasana', category: POSE_CATEGORIES.STANDING, difficulty: 3, wrist: false, knee: false, pregnant: false, level: LEVELS.STANDING,
    cues: 'Twist over front leg, back heel lifted, prayer hands.',
    teachingCue: 'From High Lunge, bring hands to heart. Lengthen spine, then hook opposite elbow outside front knee.',
    benefits: ['Detoxifies', 'Strengthens legs', 'Improves balance and focus'],
    types: ['twist', 'standing', 'strength', 'peak']
  },

  // BALANCE
  { 
    id: 'tree', name: 'Tree Pose', sanskrit: 'Vrksasana', category: POSE_CATEGORIES.BALANCE, difficulty: 1, wrist: false, knee: false, pregnant: true, level: LEVELS.STANDING,
    cues: 'Foot to calf or thigh (not knee), hands to heart.', 
    teachingCue: 'Ground through standing leg. Place sole of opposite foot on calf or inner thigh.',
    benefits: ['Strengthens thighs', 'Improves balance', 'Stretches groins and inner thighs'],
    types: ['balance', 'hip-opener']
  },
  { 
    id: 'eagle', name: 'Eagle Pose', sanskrit: 'Garudasana', category: POSE_CATEGORIES.BALANCE, difficulty: 3, wrist: false, knee: false, pregnant: false, level: LEVELS.STANDING,
    cues: 'Wrap right leg over left, right arm under left.', 
    teachingCue: 'Wrap one leg over the other, sinking hips low. Wrap corresponding arm under the other.',
    benefits: ['Strengthens ankles', 'Stretches shoulders', 'Improves concentration'],
    types: ['balance', 'twist', 'peak']
  },
  { 
    id: 'w3', name: 'Warrior III', sanskrit: 'Virabhadrasana III', category: POSE_CATEGORIES.BALANCE, difficulty: 3, wrist: false, knee: false, pregnant: false, level: LEVELS.STANDING,
    cues: 'T-shape body, hips square to floor.', 
    teachingCue: 'Shift weight to standing leg. Hinge forward, lifting back leg until body is T-shaped.',
    benefits: ['Strengthens ankles', 'Tones abdomen', 'Strengthens shoulders and muscles of the back'],
    types: ['balance', 'strength', 'hamstring']
  },
  {
    id: 'dancer', name: 'Dancer Pose', sanskrit: 'Natarajasana', category: POSE_CATEGORIES.BALANCE, difficulty: 3, wrist: false, knee: false, pregnant: false, level: LEVELS.STANDING,
    cues: 'Catch inside of back foot, kick into hand.',
    teachingCue: 'Catch inside edge of back foot. Kick foot into hand to lift leg high.',
    benefits: ['Stretches shoulders', 'Improves balance', 'Strengthens legs and ankles'],
    types: ['balance', 'backbend', 'peak']
  },
  {
    id: 'halfmoon', name: 'Half Moon Pose', sanskrit: 'Ardha Chandrasana', category: POSE_CATEGORIES.BALANCE, difficulty: 2, wrist: false, knee: false, pregnant: false, level: LEVELS.STANDING,
    cues: 'Stack hips and shoulders, lift back leg, top arm high.',
    teachingCue: 'From Triangle, bend front knee and slide bottom hand forward. Lift back leg parallel to floor.',
    benefits: ['Strengthens ankles', 'Expands chest', 'Improves balance'],
    types: ['balance', 'hip-opener']
  },

  // FLOOR / STRETCH / PEAK
  { 
    id: 'pigeon', name: 'Half Pigeon', sanskrit: 'Eka Pada Rajakapotasana', category: POSE_CATEGORIES.HIP_OPENER, difficulty: 2, wrist: true, knee: true, pregnant: true, level: LEVELS.PRONE, // Or Seated depending on entry, but functionally prone-ish
    cues: 'Right knee to right wrist, shin diagonal.', 
    teachingCue: 'Bring front knee behind wrist. Extend back leg long. Square hips and fold forward.',
    benefits: ['Stretches thighs', 'Opens hips', 'Stimulates abdominal organs'],
    types: ['hip-opener', 'rest']
  },
  {
    id: 'bridge', name: 'Bridge Pose', sanskrit: 'Setu Bandha Sarvangasana', category: POSE_CATEGORIES.BACKBEND, difficulty: 1, wrist: false, knee: false, pregnant: false, level: LEVELS.SUPINE,
    cues: 'Lift hips, interlace fingers under back.', 
    teachingCue: 'Lie on back, knees bent, feet flat. Press into feet to lift hips.',
    benefits: ['Stretches chest', 'Calms the brain', 'Rejuvenates tired legs'],
    types: ['backbend', 'spine']
  },
  {
    id: 'locust', name: 'Locust Pose', sanskrit: 'Salabhasana', category: POSE_CATEGORIES.BACKBEND, difficulty: 2, wrist: false, knee: false, pregnant: false, level: LEVELS.PRONE,
    cues: 'Lift chest, arms, and legs off mat, reach back.',
    teachingCue: 'Lie prone with arms along sides. On inhale, lift chest, arms, and legs away from the mat.',
    benefits: ['Strengthens back', 'Opens chest', 'Improves posture'],
    types: ['backbend', 'strength', 'core']
  },
  {
    id: 'camel', name: 'Camel Pose', sanskrit: 'Ustrasana', category: POSE_CATEGORIES.BACKBEND, difficulty: 2, wrist: false, knee: true, pregnant: false, level: LEVELS.KNEELING,
    cues: 'Kneel, hands to heels, press hips forward, heart lifts.',
    teachingCue: 'From a tall kneel, place hands on heels or blocks. Press hips forward.',
    benefits: ['Opens chest', 'Boosts energy', 'Strengthens back muscles'],
    types: ['backbend', 'peak', 'chest']
  },
  {
    id: 'wheel', name: 'Wheel Pose', sanskrit: 'Urdhva Dhanurasana', category: POSE_CATEGORIES.BACKBEND, difficulty: 3, wrist: true, knee: false, pregnant: false, level: LEVELS.SUPINE, // Starts supine
    cues: 'Press into hands and feet, lift entire body.',
    teachingCue: 'Hands by ears, fingers facing shoulders. Press into hands and feet to lift head and body off floor.',
    benefits: ['Strengthens arms', 'Increases energy', 'Strengthens arms, wrists, legs, buttocks, abdomen, and spine'],
    types: ['backbend', 'peak', 'strength']
  },
  { 
    id: 'boat', name: 'Boat Pose', sanskrit: 'Navasana', category: POSE_CATEGORIES.CORE, difficulty: 2, wrist: false, knee: false, pregnant: false, level: LEVELS.SEATED,
    cues: 'Lift feet, balance on sit bones, chest open.', 
    teachingCue: 'Balance on sit bones. Lift legs, bent or straight. Reach arms forward.',
    benefits: ['Strengthens abdomen', 'Improves digestion', 'Stimulates kidneys'],
    types: ['core', 'strength']
  },
  { 
    id: 'crow', name: 'Crow Pose', sanskrit: 'Bakasana', category: POSE_CATEGORIES.BALANCE, difficulty: 3, wrist: true, knee: false, pregnant: false, level: LEVELS.STANDING, // Often entered from standing/squat
    cues: 'Knees to armpits, lean forward, float feet.', 
    teachingCue: 'Plant hands. Place knees high on triceps. Lean forward until feet float off the floor.',
    benefits: ['Strengthens arms', 'Stretches upper back', 'Strengthens abdominal muscles'],
    types: ['arm-balance', 'peak', 'core']
  },
  {
    id: 'headstand', name: 'Headstand', sanskrit: 'Sirsasana', category: POSE_CATEGORIES.INVERSION, difficulty: 3, wrist: true, knee: false, pregnant: false, level: LEVELS.INVERSION,
    cues: 'Forearms down, interlace fingers, crown of head lightly down.',
    teachingCue: 'Interlace fingers, place forearms down. Set crown of head on mat. Walk feet in, lift hips.',
    benefits: ['Calms the brain', 'Strengthens arms', 'Improves digestion'],
    types: ['inversion', 'peak', 'core']
  },
  {
    id: 'shoulder', name: 'Shoulderstand', sanskrit: 'Sarvangasana', category: POSE_CATEGORIES.INVERSION, difficulty: 3, wrist: false, knee: false, pregnant: false, level: LEVELS.SUPINE,
    cues: 'Stack hips over shoulders, support back with hands.',
    teachingCue: 'From supine, lift hips and legs overhead, placing hands on low back.',
    benefits: ['Improves circulation', 'Calms nervous system', 'Stimulates thyroid and parathyroid'],
    types: ['inversion', 'peak', 'rest']
  },
  
  // RESTORATIVE / COOL DOWN
  { 
    id: 'paschi', name: 'Seated Forward Fold', sanskrit: 'Paschimottanasana', category: POSE_CATEGORIES.RESTORATIVE, difficulty: 1, wrist: false, knee: false, pregnant: false, level: LEVELS.SEATED,
    cues: 'Lengthen spine then fold, keep feet flexed.', 
    teachingCue: 'Sit with legs extended. Inhale to lengthen spine, exhale to fold forward from hips.',
    benefits: ['Calms the brain', 'Stretches spine', 'Stimulates liver and kidneys'],
    types: ['hamstring', 'spine', 'rest']
  },
  { 
    id: 'janu', name: 'Head to Knee', sanskrit: 'Janu Sirsasana', category: POSE_CATEGORIES.RESTORATIVE, difficulty: 1, wrist: false, knee: true, pregnant: false, level: LEVELS.SEATED,
    cues: 'One leg straight, one foot to inner thigh, fold.', 
    teachingCue: 'Extend one leg, place other foot to inner thigh. Rotate torso over extended leg and fold forward.',
    benefits: ['Calms the brain', 'Stretches spine', 'Stretches spine, shoulders, hamstrings, and groins'],
    types: ['hamstring', 'hip-opener', 'rest']
  },
  {
    id: 'twist', name: 'Supine Twist', sanskrit: 'Supta Matsyendrasana', category: POSE_CATEGORIES.TWIST, difficulty: 1, wrist: false, knee: false, pregnant: false, level: LEVELS.SUPINE,
    cues: 'Knees to one side, gaze opposite.',
    teachingCue: 'Lie on back. Draw knees to chest, then drop them to one side. Open arms wide.',
    benefits: ['Stretches back', 'Massages hips', 'Helps hydrate spinal disks'],
    types: ['twist', 'spine', 'rest']
  },
  {
    id: 'happy', name: 'Happy Baby', sanskrit: 'Ananda Balasana', category: POSE_CATEGORIES.HIP_OPENER, difficulty: 1, wrist: false, knee: false, pregnant: false, level: LEVELS.SUPINE,
    cues: 'Grab outer feet, pull knees toward armpits.',
    teachingCue: 'Lie on back. Grab outer edges of feet. Pull knees toward armpits.',
    benefits: ['Gently releases hips', 'Relieves back pain', 'Relieves lower back pain'],
    types: ['hip-opener', 'rest']
  },
  {
    id: 'legswall', name: 'Legs Up the Wall', sanskrit: 'Viparita Karani', category: POSE_CATEGORIES.RESTORATIVE, difficulty: 0, wrist: false, knee: false, pregnant: false, level: LEVELS.SUPINE,
    cues: 'Scoot hips to wall, extend legs upward, arms relaxed.',
    teachingCue: 'Sit close to a wall, roll onto back, and extend legs straight up the wall.',
    benefits: ['Relieves tired legs', 'Calms nervous system', 'Encourages venous drainage and lymph flow'],
    types: ['rest', 'inversion', 'grounding']
  },
  {
    id: 'sava', name: 'Corpse Pose', sanskrit: 'Savasana', category: POSE_CATEGORIES.SAVASANA, difficulty: 0, wrist: false, knee: false, pregnant: true, level: LEVELS.SUPINE,
    cues: 'Complete relaxation. Let go of breath control.',
    teachingCue: 'Lie flat on your back (or on left side if pregnant). Close eyes. Release all tension.',
    benefits: ['Calms the brain', 'Relieves stress', 'Relaxes the body'],
    types: ['rest', 'grounding']
  },
];

const DEFAULT_MUSIC_THEMES = [
  { id: 'electronic', name: 'Tribal / House', icon: <Activity size={16}/>, description: 'Upbeat rhythm for Vinyasa.', link: 'http://open.spotify.com/playlist/37i9dQZF1DX2sUQwD7tbmL' },
  { id: 'ambient', name: 'Ambient Drone', icon: <Wind size={16}/>, description: 'Deep, spacious sounds for focus.', link: 'http://open.spotify.com/playlist/37i9dQZF1DX6J5NfMJS675' },
  { id: 'nature', name: 'Rain & Forest', icon: <Sun size={16}/>, description: 'Grounding natural textures.', link: 'http://open.spotify.com/playlist/37i9dQZF1DX4wta20PHgwo' },
  { id: 'lofi', name: 'Lo-Fi Beats', icon: <Headphones size={16}/>, description: 'Chill hop for a relaxed groove.', link: 'http://open.spotify.com/playlist/37i9dQZF1DX8Uebhn9wzrS' },
  { id: 'indian', name: 'Indian Flute', icon: <Music size={16}/>, description: 'Traditional atmosphere.', link: 'http://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M' },
  { id: 'piano', name: 'Soft Piano', icon: <Music size={16}/>, description: 'Gentle, emotional classical keys.', link: 'http://open.spotify.com/playlist/37i9dQZF1DX4sWSpwq3LiO' },
];

export { POSE_CATEGORIES, TIMING_CONFIG, POSE_LIBRARY, DEFAULT_MUSIC_THEMES, GENERATION_CONFIG, LEVELS };