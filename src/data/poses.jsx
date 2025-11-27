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
  TRANSITION_RULES: {
    // From: [Allowed Next Levels]
    [LEVELS.STANDING]: [LEVELS.STANDING, LEVELS.KNEELING, LEVELS.PRONE, LEVELS.INVERSION],
    [LEVELS.KNEELING]: [LEVELS.KNEELING, LEVELS.STANDING, LEVELS.SEATED, LEVELS.PRONE, LEVELS.SUPINE, LEVELS.INVERSION],
    [LEVELS.SEATED]: [LEVELS.SEATED, LEVELS.SUPINE, LEVELS.KNEELING],
    [LEVELS.PRONE]: [LEVELS.PRONE, LEVELS.KNEELING, LEVELS.SUPINE, LEVELS.INVERSION],
    [LEVELS.SUPINE]: [LEVELS.SUPINE, LEVELS.SEATED, LEVELS.KNEELING],
    [LEVELS.INVERSION]: [LEVELS.KNEELING, LEVELS.SUPINE, LEVELS.STANDING, LEVELS.PRONE]
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
    id: 'mukt', name: 'Simple Cross-Legged', sanskrit: 'Muktasana', category: POSE_CATEGORIES.CENTERING, difficulty: 0, wrist: false, knee: false, pregnant: true, level: LEVELS.SEATED,
    cues: 'Heels aligned in front of one another.', 
    teachingCue: 'Sit with legs crossed, aligning heels directly in front of your perineum.',
    benefits: ['Calms the mind', 'Opens hips', 'Grounds energy'],
    types: ['grounding', 'meditation']
  },
  { 
    id: 'ausp', name: 'Auspicious Pose', sanskrit: 'Svastikasana', category: POSE_CATEGORIES.CENTERING, difficulty: 0, wrist: false, knee: true, pregnant: true, level: LEVELS.SEATED,
    cues: 'Tuck toes between calves and thighs.', 
    teachingCue: 'Cross legs, placing each foot between the opposite calf and thigh muscle.',
    benefits: ['Ideal for meditation', 'Strengthens back', 'Reduces strain on legs'],
    types: ['meditation', 'grounding']
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
  { 
    id: 'lion', name: 'Lion Pose', sanskrit: 'Simhasana', category: POSE_CATEGORIES.WARMUP, difficulty: 0, wrist: true, knee: true, pregnant: true, level: LEVELS.KNEELING,
    cues: 'Exhale forcefully, tongue out, gaze at third eye.', 
    teachingCue: 'Kneel, place hands on knees. Inhale deep, then exhale with a "ha" sound, sticking tongue out and gazing up.',
    benefits: ['Relieves tension in face', 'Stimulates platysma', 'Clears throat'],
    types: ['face-yoga', 'breath', 'warmup']
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
    id: 'dd', name: 'Downward Facing Dog', sanskrit: 'Adho Mukha Svanasana', category: POSE_CATEGORIES.WARMUP, difficulty: 2, wrist: true, knee: false, pregnant: true, level: LEVELS.INVERSION,
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
  { 
    id: 'eight', name: 'Eight-Limbed Salutation', sanskrit: 'Ashtanga Namaskara', category: POSE_CATEGORIES.WARMUP, difficulty: 1, wrist: true, knee: true, pregnant: false, level: LEVELS.PRONE,
    cues: 'Knees, chest, and chin to floor, hips high.', 
    teachingCue: 'Lower knees, then chest and chin to the floor, keeping hips lifted. Elbows hug ribs.',
    benefits: ['Strengthens arms', 'Increases spinal flexibility', 'Prepares for backbends'],
    types: ['strength', 'warmup']
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
    id: 'updog', name: 'Upward Facing Dog', sanskrit: 'Urdhva Mukha Svanasana', category: POSE_CATEGORIES.SUN_SALUTATION, difficulty: 2, wrist: true, knee: false, pregnant: false, level: LEVELS.PRONE,
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
  {
    id: 'pyram', name: 'Intense Side Stretch', sanskrit: 'Parsvottanasana', category: POSE_CATEGORIES.STANDING, difficulty: 1, wrist: false, knee: false, pregnant: true, level: LEVELS.STANDING,
    cues: 'Hips square, fold over straight front leg.',
    teachingCue: 'Step back foot forward slightly, heel down. Straighten both legs and fold over the front thigh.',
    benefits: ['Calms the brain', 'Stretches spine', 'Stretches hips and hamstrings'],
    types: ['hamstring', 'balance', 'standing']
  },
  {
    id: 'prasar', name: 'Wide-Legged Forward Fold', sanskrit: 'Prasarita Padottanasana', category: POSE_CATEGORIES.STANDING, difficulty: 1, wrist: false, knee: false, pregnant: true, level: LEVELS.STANDING,
    cues: 'Feet wide and parallel, fold forward, hands to floor.',
    teachingCue: 'Step feet very wide. Hinge at hips to fold forward, placing hands on mat under shoulders.',
    benefits: ['Stretches inner thighs', 'Calms the mind', 'Relieves backache'],
    types: ['hamstring', 'inversion', 'standing']
  },
  {
    id: 'gate', name: 'Gate Pose', sanskrit: 'Parighasana', category: POSE_CATEGORIES.STANDING, difficulty: 1, wrist: false, knee: true, pregnant: true, level: LEVELS.KNEELING,
    cues: 'Kneel, extend one leg side, stretch over.',
    teachingCue: 'From kneeling, extend one leg out to the side. Reach opposite arm up and side bend over the straight leg.',
    benefits: ['Stretches sides of torso', 'Stimulates abdominal organs', 'Stretches hamstrings'],
    types: ['side-stretch', 'kneeling']
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
  {
    id: 'durv', name: 'Standing Leg Raise', sanskrit: 'Durvasasana', category: POSE_CATEGORIES.BALANCE, difficulty: 3, wrist: false, knee: false, pregnant: false, level: LEVELS.STANDING,
    cues: 'Lift leg high, maybe behind head, stand tall.',
    teachingCue: 'Root down. Lift one leg, holding foot or calf. Advanced: bring leg behind head/neck.',
    benefits: ['Deeply stretches hips', 'Improves focus', 'Strengthens standing leg'],
    types: ['balance', 'hip-opener', 'peak']
  },

  // FLOOR / STRETCH / PEAK
  { 
    id: 'pigeon', name: 'Half Pigeon', sanskrit: 'Eka Pada Rajakapotasana', category: POSE_CATEGORIES.HIP_OPENER, difficulty: 2, wrist: true, knee: true, pregnant: true, level: LEVELS.PRONE,
    cues: 'Right knee to right wrist, shin diagonal.', 
    teachingCue: 'Bring front knee behind wrist. Extend back leg long. Square hips and fold forward.',
    benefits: ['Stretches thighs', 'Opens hips', 'Stimulates abdominal organs'],
    types: ['hip-opener', 'rest']
  },
  { 
    id: 'kingpig', name: 'King Pigeon Variation', sanskrit: 'Eka Pada Rajakapotasana', category: POSE_CATEGORIES.BACKBEND, difficulty: 3, wrist: false, knee: true, pregnant: false, level: LEVELS.SEATED,
    cues: 'Back foot to head, elbow pointing up.', 
    teachingCue: 'From Pigeon, bend back knee. Reach back to catch foot, rotating shoulder to bring elbow high.',
    benefits: ['Deep backbend', 'Opens shoulders', 'Stretches entire front body'],
    types: ['backbend', 'hip-opener', 'peak']
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
    id: 'bow', name: 'Bow Pose', sanskrit: 'Dhanurasana', category: POSE_CATEGORIES.BACKBEND, difficulty: 2, wrist: false, knee: false, pregnant: false, level: LEVELS.PRONE,
    cues: 'Catch ankles, kick back to lift chest.',
    teachingCue: 'Lie on belly. Bend knees, reach back for ankles. Kick feet into hands to lift chest and thighs.',
    benefits: ['Stretches entire front body', 'Strengthens back muscles', 'Improves posture'],
    types: ['backbend', 'chest']
  },
  {
    id: 'frog', name: 'Frog Pose', sanskrit: 'Bhekasana', category: POSE_CATEGORIES.BACKBEND, difficulty: 2, wrist: true, knee: true, pregnant: false, level: LEVELS.PRONE,
    cues: 'Press feet down beside hips, lift chest.',
    teachingCue: 'Lie on belly. Bend knees. Press hands on top of feet to bring heels toward floor beside hips.',
    benefits: ['Stretches throat and chest', 'Stretches abdomen and groins', 'Strengthens back'],
    types: ['backbend', 'chest']
  },
  {
    id: 'wheel', name: 'Wheel Pose', sanskrit: 'Urdhva Dhanurasana', category: POSE_CATEGORIES.BACKBEND, difficulty: 3, wrist: true, knee: false, pregnant: false, level: LEVELS.SUPINE,
    cues: 'Press into hands and feet, lift entire body.',
    teachingCue: 'Hands by ears, fingers facing shoulders. Press into hands and feet to lift head and body off floor.',
    benefits: ['Strengthens arms', 'Increases energy', 'Strengthens arms, wrists, legs, buttocks, abdomen, and spine'],
    types: ['backbend', 'peak', 'strength']
  },
  {
    id: 'fish', name: 'Fish Pose', sanskrit: 'Matsyasana', category: POSE_CATEGORIES.BACKBEND, difficulty: 1, wrist: false, knee: false, pregnant: false, level: LEVELS.SUPINE,
    cues: 'Forearms under back, lift chest, crown to floor.',
    teachingCue: 'Lie on back. Hands under hips. Press elbows down to lift chest and drop head back.',
    benefits: ['Stretches throat', 'Stretches psoas', 'Relieves tension in neck/shoulders'],
    types: ['backbend', 'chest']
  },
  { 
    id: 'boat', name: 'Boat Pose', sanskrit: 'Navasana', category: POSE_CATEGORIES.CORE, difficulty: 2, wrist: false, knee: false, pregnant: false, level: LEVELS.SEATED,
    cues: 'Lift feet, balance on sit bones, chest open.', 
    teachingCue: 'Balance on sit bones. Lift legs, bent or straight. Reach arms forward.',
    benefits: ['Strengthens abdomen', 'Improves digestion', 'Stimulates kidneys'],
    types: ['core', 'strength']
  },
  { 
    id: 'staff', name: 'Staff Pose', sanskrit: 'Dandasana', category: POSE_CATEGORIES.CORE, difficulty: 0, wrist: true, knee: false, pregnant: true, level: LEVELS.SEATED,
    cues: 'Legs extended, spine tall, hands by hips.', 
    teachingCue: 'Sit with legs straight in front. Press hands into floor beside hips to lengthen spine.',
    benefits: ['Strengthens back muscles', 'Stretches shoulders', 'Improves posture'],
    types: ['core', 'spine']
  },

  // ARM BALANCES
  { 
    id: 'crow', name: 'Crow Pose', sanskrit: 'Bakasana', category: POSE_CATEGORIES.BALANCE, difficulty: 3, wrist: true, knee: false, pregnant: false, level: LEVELS.STANDING,
    cues: 'Knees to armpits, lean forward, float feet.', 
    teachingCue: 'Plant hands. Place knees high on triceps. Lean forward until feet float off the floor.',
    benefits: ['Strengthens arms', 'Stretches upper back', 'Strengthens abdominal muscles'],
    types: ['arm-balance', 'peak', 'core']
  },
  { 
    id: 'ashta', name: 'Ashtavakra Pose', sanskrit: 'Ashtavakrasana', category: POSE_CATEGORIES.BALANCE, difficulty: 3, wrist: true, knee: false, pregnant: false, level: LEVELS.SEATED,
    cues: 'Hook ankles, shift weight to hands, legs to side.', 
    teachingCue: 'From seated, hook one leg over arm. Hook ankles. Lean forward and lift hips, extending legs to side.',
    benefits: ['Strengthens wrists', 'Tones abdomen', 'Improves balance'],
    types: ['arm-balance', 'strength', 'twist', 'peak']
  },
  { 
    id: 'bhuj', name: 'Arm-Pressing Pose', sanskrit: 'Bhujapidasana', category: POSE_CATEGORIES.BALANCE, difficulty: 3, wrist: true, knee: false, pregnant: false, level: LEVELS.SEATED,
    cues: 'Legs over shoulders, cross ankles, lift.', 
    teachingCue: 'Squat, weave arms under legs. Place hands down. Lift feet and cross ankles in front.',
    benefits: ['Strengthens arms', 'Tones belly', 'Improves balance'],
    types: ['arm-balance', 'hip-opener', 'strength']
  },
  { 
    id: 'kaund', name: 'Sage Kaundinya Pose', sanskrit: 'Eka Pada Kaundinyasana', category: POSE_CATEGORIES.BALANCE, difficulty: 3, wrist: true, knee: false, pregnant: false, level: LEVELS.KNEELING,
    cues: 'Leg on tricep, split legs, lean forward.', 
    teachingCue: 'Twist deep, placing thigh on tricep. Lean forward to lift legs, extending them apart.',
    benefits: ['Strengthens core', 'Detoxifies', 'Strengthens wrists and arms'],
    types: ['arm-balance', 'twist', 'peak']
  },
  { 
    id: 'cock', name: 'Cockerel Pose', sanskrit: 'Kukkutasana', category: POSE_CATEGORIES.BALANCE, difficulty: 3, wrist: true, knee: true, pregnant: false, level: LEVELS.SEATED,
    cues: 'Lotus legs, arms through calves, lift.', 
    teachingCue: 'Sit in Lotus. Thread arms between calves and thighs. Press hands down to lift body.',
    benefits: ['Strengthens arms', 'Strengthens abdominal muscles', 'Tradition says it awakens Kundalini'],
    types: ['arm-balance', 'strength', 'core']
  },
  { 
    id: 'pend', name: 'Pendant Pose', sanskrit: 'Lolasana', category: POSE_CATEGORIES.BALANCE, difficulty: 3, wrist: true, knee: true, pregnant: false, level: LEVELS.SEATED,
    cues: 'Cross ankles, press hands, swing body.', 
    teachingCue: 'Cross ankles. Place hands beside hips. Round back and lift entire body off floor.',
    benefits: ['Strengthens wrists', 'Tones back muscles', 'Strengthens abs'],
    types: ['arm-balance', 'core', 'strength']
  },
  { 
    id: 'peac', name: 'Peacock Pose', sanskrit: 'Mayurasana', category: POSE_CATEGORIES.BALANCE, difficulty: 3, wrist: true, knee: false, pregnant: false, level: LEVELS.KNEELING,
    cues: 'Elbows to belly, lean forward, straight body.', 
    teachingCue: 'Hands reversed fingers toward feet. Elbows dig into gut. Lean forward until legs float parallel.',
    benefits: ['Detoxifies', 'Improves digestion', 'Strengthens forearms'],
    types: ['arm-balance', 'strength', 'detox']
  },

  // INVERSIONS
  {
    id: 'headstand', name: 'Headstand', sanskrit: 'Sirsasana', category: POSE_CATEGORIES.INVERSION, difficulty: 3, wrist: true, knee: false, pregnant: false, level: LEVELS.INVERSION,
    cues: 'Forearms down, interlace fingers, crown of head lightly down.',
    teachingCue: 'Interlace fingers, place forearms down. Set crown of head on mat. Walk feet in, lift hips.',
    benefits: ['Calms the brain', 'Strengthens arms', 'Improves digestion'],
    types: ['inversion', 'peak', 'core']
  },
  {
    id: 'hndstd', name: 'Handstand', sanskrit: 'Adho Mukha Vrksasana', category: POSE_CATEGORIES.INVERSION, difficulty: 3, wrist: true, knee: false, pregnant: false, level: LEVELS.INVERSION,
    cues: 'Hands shoulder-width, kick up, straight line.',
    teachingCue: 'Plant hands firmly. Kick one leg up, then the other. Hug ribs in, push floor away.',
    benefits: ['Strengthens shoulders', 'Increases energy', 'Improves balance'],
    types: ['inversion', 'strength', 'balance', 'peak']
  },
  {
    id: 'pincha', name: 'Forearm Balance', sanskrit: 'Pincha Mayurasana', category: POSE_CATEGORIES.INVERSION, difficulty: 3, wrist: false, knee: false, pregnant: false, level: LEVELS.INVERSION,
    cues: 'Forearms parallel, look forward, kick up.',
    teachingCue: 'Place forearms shoulder-width. Walk feet in. Kick up, stacking hips over shoulders.',
    benefits: ['Strengthens back', 'Stretches shoulders', 'Improves balance'],
    types: ['inversion', 'balance', 'shoulder', 'peak']
  },
  {
    id: 'shoulder', name: 'Shoulderstand', sanskrit: 'Sarvangasana', category: POSE_CATEGORIES.INVERSION, difficulty: 3, wrist: false, knee: false, pregnant: false, level: LEVELS.SUPINE,
    cues: 'Stack hips over shoulders, support back with hands.',
    teachingCue: 'From supine, lift hips and legs overhead, placing hands on low back.',
    benefits: ['Improves circulation', 'Calms nervous system', 'Stimulates thyroid and parathyroid'],
    types: ['inversion', 'peak', 'rest']
  },
  {
    id: 'plough', name: 'Plough', sanskrit: 'Halasana', category: POSE_CATEGORIES.INVERSION, difficulty: 2, wrist: false, knee: false, pregnant: false, level: LEVELS.INVERSION,
    cues: 'Feet overhead to floor, hands clasped.',
    teachingCue: 'From Shoulderstand, lower toes to floor behind head. Interlace fingers behind back.',
    benefits: ['Calms the brain', 'Stretches shoulders', 'Stretches spine'],
    types: ['inversion', 'spine']
  },
  {
    id: 'ear', name: 'Ear-Pressure Pose', sanskrit: 'Karnapidasana', category: POSE_CATEGORIES.INVERSION, difficulty: 2, wrist: false, knee: true, pregnant: false, level: LEVELS.INVERSION,
    cues: 'Knees by ears, squeezing head.',
    teachingCue: 'From Plough, bend knees to floor beside ears. Squeeze knees gently against ears.',
    benefits: ['Quiets the mind', 'Stretches spine', 'Stretches shoulders'],
    types: ['inversion', 'spine', 'rest']
  },
  
  // SEATED / HIP OPENERS / TWISTS
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
    id: 'arch', name: 'Archer Pose', sanskrit: 'Akarna Dhanurasana', category: POSE_CATEGORIES.HIP_OPENER, difficulty: 2, wrist: false, knee: true, pregnant: false, level: LEVELS.SEATED,
    cues: 'Foot to ear, like drawing a bow.',
    teachingCue: 'Hold big toes. Pull one foot back toward your ear while keeping the other leg extended on floor.',
    benefits: ['Improves digestion', 'Stretches groins', 'Improve concentration'],
    types: ['hip-opener', 'hamstring']
  },
  {
    id: 'heron', name: 'Heron Pose', sanskrit: 'Krounchasana', category: POSE_CATEGORIES.HIP_OPENER, difficulty: 2, wrist: false, knee: true, pregnant: false, level: LEVELS.SEATED,
    cues: 'One leg folded back, other leg lifted straight.',
    teachingCue: 'One leg in Hero pose (folded back). Lift other leg straight up, holding foot with hands.',
    benefits: ['Stretches hamstring', 'Stimulates abdominal organs', 'Stretches knee'],
    types: ['hamstring', 'core']
  },
  {
    id: 'tort', name: 'Tortoise Pose', sanskrit: 'Kurmasana', category: POSE_CATEGORIES.HIP_OPENER, difficulty: 2, wrist: false, knee: true, pregnant: false, level: LEVELS.SEATED,
    cues: 'Arms under bent knees, fold flat.',
    teachingCue: 'Legs wide, knees bent. Slide arms under knees. Fold forward, straightening legs if possible.',
    benefits: ['Soothing for nerves', 'Stretches spine', 'Stretches shoulders'],
    types: ['hamstring', 'hip-opener']
  },
  {
    id: 'splits', name: 'Splits', sanskrit: 'Hanumanasana', category: POSE_CATEGORIES.HIP_OPENER, difficulty: 3, wrist: false, knee: false, pregnant: false, level: LEVELS.SEATED,
    cues: 'Legs extended front and back, hips square.',
    teachingCue: 'Extend one leg forward, one back. Square hips. Lower pelvis toward floor.',
    benefits: ['Stretches thighs', 'Stretches hamstrings', 'Stimulates abdominal organs'],
    types: ['hamstring', 'hip-opener', 'peak']
  },
  {
    id: 'mari', name: 'Marichi’s Pose', sanskrit: 'Marichyasana', category: POSE_CATEGORIES.TWIST, difficulty: 2, wrist: false, knee: true, pregnant: false, level: LEVELS.SEATED,
    cues: 'Bind arms around bent knee, twist.',
    teachingCue: 'One leg straight, other bent knee up. Twist toward bent knee, binding arms around shin if accessible.',
    benefits: ['Massages abdominal organs', 'Stretches shoulders', 'Relieves backache'],
    types: ['twist', 'hip-opener']
  },
  {
    id: 'matsy', name: 'Seated Spinal Twist', sanskrit: 'Ardha Matsyendrasana', category: POSE_CATEGORIES.TWIST, difficulty: 2, wrist: false, knee: true, pregnant: false, level: LEVELS.SEATED,
    cues: 'Foot outside knee, twist toward leg.',
    teachingCue: 'Cross one foot outside opposite knee. Twist torso toward the top leg, hugging knee.',
    benefits: ['Increases spine flexibility', 'Cleanses internal organs', 'Relieves back pain'],
    types: ['twist', 'spine']
  },
  {
    id: 'cowh', name: 'Cowherd’s Pose', sanskrit: 'Gorakshasana', category: POSE_CATEGORIES.HIP_OPENER, difficulty: 3, wrist: false, knee: true, pregnant: false, level: LEVELS.SEATED,
    cues: 'Feet soles up, balance on knees/perineum.',
    teachingCue: 'From Cobbler pose, turn feet soles upward. Lift body to balance on knees and perineum.',
    benefits: ['Makes legs supple', 'Awakens Kundalini', 'Improves balance'],
    types: ['hip-opener', 'balance']
  },
  {
    id: 'embryo', name: 'Embryo Pose', sanskrit: 'Garbha Pindasana', category: POSE_CATEGORIES.HIP_OPENER, difficulty: 3, wrist: true, knee: true, pregnant: false, level: LEVELS.SEATED,
    cues: 'Arms through Lotus legs, hands to face.',
    teachingCue: 'Start in Lotus. Thread arms through legs. Bend elbows and hold face/ears. Balance on sit bones.',
    benefits: ['Massages organs', 'Tones belly', 'Calms the mind'],
    types: ['hip-opener', 'binding']
  },
  {
    id: 'manduk', name: 'Frog Variation', sanskrit: 'Mandukasana', category: POSE_CATEGORIES.HIP_OPENER, difficulty: 1, wrist: false, knee: true, pregnant: false, level: LEVELS.KNEELING,
    cues: 'Knees wide, fists to belly, fold.',
    teachingCue: 'Kneel. Make fists and place on belly. Exhale and fold forward, pressing fists into abdomen.',
    benefits: ['Massages internal organs', 'Aids digestion', 'Relieves diabetes symptoms (traditionally)'],
    types: ['hip-opener', 'detox']
  },
  {
    id: 'noose', name: 'Noose Pose', sanskrit: 'Pasasana', category: POSE_CATEGORIES.TWIST, difficulty: 3, wrist: false, knee: true, pregnant: false, level: LEVELS.KNEELING,
    cues: 'Squat with heels down, deep twist bind.',
    teachingCue: 'Squat with feet together. Twist torso to right, binding arms around shins.',
    benefits: ['Stretches ankles', 'Stretches groins', 'Relieves back tension'],
    types: ['twist', 'hip-opener', 'bind']
  },

  // RESTORATIVE / SUPINE
  {
    id: 'twist', name: 'Supine Twist', sanskrit: 'Supta Matsyendrasana', category: POSE_CATEGORIES.TWIST, difficulty: 1, wrist: false, knee: false, pregnant: false, level: LEVELS.SUPINE,
    cues: 'Knees to one side, gaze opposite.',
    teachingCue: 'Lie on back. Draw knees to chest, then drop them to one side. Open arms wide.',
    benefits: ['Stretches back', 'Massages hips', 'Helps hydrate spinal disks'],
    types: ['twist', 'spine', 'rest']
  },
  {
    id: 'jath', name: 'Reclined Belly Twist', sanskrit: 'Jathara Parivartanasana', category: POSE_CATEGORIES.TWIST, difficulty: 1, wrist: false, knee: false, pregnant: false, level: LEVELS.SUPINE,
    cues: 'Legs straight or bent to side.',
    teachingCue: 'Lie on back. Drop legs to one side, keeping shoulders grounded. Gaze opposite.',
    benefits: ['Removes stiffness in spine', 'Tones abdomen', 'Relieves gastritis'],
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
    id: 'supta', name: 'Reclined Big Toe Pose', sanskrit: 'Supta Padangusthasana', category: POSE_CATEGORIES.HIP_OPENER, difficulty: 1, wrist: false, knee: false, pregnant: false, level: LEVELS.SUPINE,
    cues: 'Leg vertical, holding toe or strap.',
    teachingCue: 'Lie on back. Lift one leg, holding big toe or using a strap. Keep other leg grounded.',
    benefits: ['Stretches hips', 'Stretches hamstrings', 'Relieves backache'],
    types: ['hamstring', 'hip-opener']
  },
  {
    id: 'reclstr', name: 'Reclining Stretch', sanskrit: 'Anantasana', category: POSE_CATEGORIES.RESTORATIVE, difficulty: 1, wrist: false, knee: false, pregnant: true, level: LEVELS.SUPINE,
    cues: 'Side-lying, lift top leg, hold toe.',
    teachingCue: 'Lie on side. Support head with hand. Lift top leg vertical, holding big toe.',
    benefits: ['Stretches sides of torso', 'Tones belly', 'Stretches hamstrings'],
    types: ['hamstring', 'balance']
  },
  {
    id: 'formid', name: 'Formidable Pose', sanskrit: 'Bhairavasana', category: POSE_CATEGORIES.HIP_OPENER, difficulty: 3, wrist: false, knee: false, pregnant: false, level: LEVELS.SUPINE,
    cues: 'Leg behind head, reclining.',
    teachingCue: 'From sitting or lying, bring one leg behind the head. Recline back, hands in prayer.',
    benefits: ['Deep hip opening', 'Stretches neck', 'Advanced flexibility'],
    types: ['hip-opener', 'peak']
  },
  {
    id: 'croc', name: 'Crocodile Pose', sanskrit: 'Makarasana', category: POSE_CATEGORIES.RESTORATIVE, difficulty: 0, wrist: false, knee: false, pregnant: false, level: LEVELS.PRONE,
    cues: 'Belly down, head on stacked hands.',
    teachingCue: 'Lie on belly. Stack hands under forehead. Relax legs wide.',
    benefits: ['Deep relaxation', 'Relieves back tension', 'Good for diaphragmatic breathing'],
    types: ['rest', 'breath']
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