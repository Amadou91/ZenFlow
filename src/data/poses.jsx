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

// Dynamic Timing Configuration
const TIMING_CONFIG = {
  [POSE_CATEGORIES.WARMUP]: { label: '3–5 breaths', seconds: 30 },
  [POSE_CATEGORIES.SUN_SALUTATION]: { label: '1 breath', seconds: 10 }, // Fast flow
  [POSE_CATEGORIES.STANDING]: { label: '5–8 breaths', seconds: 45 },
  [POSE_CATEGORIES.BALANCE]: { label: '3–6 breaths', seconds: 40 },
  [POSE_CATEGORIES.INVERSION]: { label: '5–10 breaths', seconds: 60 },
  [POSE_CATEGORIES.BACKBEND]: { label: '5–8 breaths', seconds: 45 },
  [POSE_CATEGORIES.TWIST]: { label: '5–8 breaths', seconds: 45 },
  [POSE_CATEGORIES.HIP_OPENER]: { label: '8–10 breaths', seconds: 60 },
  [POSE_CATEGORIES.CORE]: { label: '30 seconds', seconds: 30 },
  [POSE_CATEGORIES.RESTORATIVE]: { label: '2–5 minutes', seconds: 180 },
  [POSE_CATEGORIES.CENTERING]: { label: '1–2 minutes', seconds: 90 },
  [POSE_CATEGORIES.SAVASANA]: { label: '5 minutes', seconds: 300 },
};

const POSE_LIBRARY = [
  // CENTERING
  { 
    id: 'suc', name: 'Easy Pose', sanskrit: 'Sukhasana', category: POSE_CATEGORIES.CENTERING, difficulty: 0, wrist: false, knee: false, pregnant: true, 
    cues: 'Sit tall, ground sit bones, hands on knees.', 
    teachingCue: 'Find a comfortable seat. Root down through your sit bones and lengthen through the crown of your head. Soften your shoulders.',
    benefits: ['Calms the brain', 'Strengthens the back', 'Stretches knees and ankles'],
    types: ['grounding', 'meditation']
  },
  { 
    id: 'vir', name: 'Hero Pose', sanskrit: 'Virasana', category: POSE_CATEGORIES.CENTERING, difficulty: 1, wrist: false, knee: false, pregnant: true, 
    cues: 'Knees together, feet apart, sit between heels.', 
    teachingCue: 'Kneel with knees touching and feet wider than hips. Lower your seat between your heels, using a block if needed.',
    benefits: ['Stretches thighs and knees', 'Improves digestion', 'Relieves tired legs'],
    types: ['grounding', 'knees']
  },
  { 
    id: 'chi', name: 'Child\'s Pose', sanskrit: 'Balasana', category: POSE_CATEGORIES.CENTERING, difficulty: 0, wrist: false, knee: true, pregnant: true, 
    cues: 'Knees wide, big toes touch, forehead to mat.', 
    teachingCue: 'Bring big toes to touch, knees wide. Sink your hips back to your heels and extend arms forward, resting forehead on the mat.',
    benefits: ['Gently stretches hips and thighs', 'Calms the mind', 'Relieves back and neck pain'],
    types: ['grounding', 'hip-opener', 'rest']
  },

  // WARMUP
  { 
    id: 'cat', name: 'Cat Pose', sanskrit: 'Marjaryasana', category: POSE_CATEGORIES.WARMUP, difficulty: 1, wrist: true, knee: true, pregnant: true, 
    cues: 'Exhale, round spine to ceiling, chin to chest.', 
    teachingCue: 'On an exhale, press into your palms, round your back like a halloween cat, and tuck your chin to your chest.',
    benefits: ['Increases spine flexibility', 'Stretches back torso and neck', 'Stimulates abdominal organs'],
    types: ['spine', 'warmup']
  },
  { 
    id: 'cow', name: 'Cow Pose', sanskrit: 'Bitilasana', category: POSE_CATEGORIES.WARMUP, difficulty: 1, wrist: true, knee: true, pregnant: true, 
    cues: 'Inhale, drop belly, lift gaze.', 
    teachingCue: 'Inhale to drop the belly low, lift the gaze and tailbone, drawing the heart forward through the gates of the arms.',
    benefits: ['Stretches front torso and neck', 'Massages spine', 'Calms the mind'],
    types: ['spine', 'warmup']
  },
  { 
    id: 'thread', name: 'Thread the Needle', sanskrit: 'Parsva Balasana', category: POSE_CATEGORIES.WARMUP, difficulty: 1, wrist: true, knee: true, pregnant: true, 
    cues: 'Slide arm under chest, rest shoulder on mat.', 
    teachingCue: 'From Table Top, slide one arm underneath the other, lowering your shoulder and cheek to the mat for a gentle twist.',
    benefits: ['Opens shoulders', 'Gentle spinal twist', 'Relieves tension in upper back'],
    types: ['twist', 'shoulder']
  },
  { 
    id: 'dd', name: 'Downward Facing Dog', sanskrit: 'Adho Mukha Svanasana', category: POSE_CATEGORIES.WARMUP, difficulty: 2, wrist: true, knee: false, pregnant: true, 
    cues: 'Hips high, heels down, press into knuckles.', 
    teachingCue: 'Tuck your toes and lift your hips up and back. Press firmly into your hands and lengthen your spine, melting heels toward the earth.',
    benefits: ['Energizes the body', 'Stretches shoulders, hamstrings, calves', 'Strengthens arms and legs'],
    types: ['hamstring', 'inversion', 'strength']
  },
  { 
    id: 'rag', name: 'Ragdoll Fold', sanskrit: 'Uttanasana Variation', category: POSE_CATEGORIES.WARMUP, difficulty: 1, wrist: false, knee: false, pregnant: true, 
    cues: 'Hold opposite elbows, sway gently side to side.', 
    teachingCue: 'Step feet hip-width apart. Hinge at the hips, bend knees deeply, and grab opposite elbows. Let the head hang heavy.',
    benefits: ['Releases lower back', 'Calms the nervous system', 'Stretches hamstrings'],
    types: ['hamstring', 'spine']
  },

  // SUN SALUTATION
  { 
    id: 'mtn', name: 'Mountain Pose', sanskrit: 'Tadasana', category: POSE_CATEGORIES.SUN_SALUTATION, difficulty: 0, wrist: false, knee: false, pregnant: true, 
    cues: 'Feet grounded, palms forward, crown lifts.', 
    teachingCue: 'Stand tall with feet together or hip-width. Engage quads, draw navel in, and roll shoulders back. Palms face forward.',
    benefits: ['Improves posture', 'Strengthens thighs, knees, and ankles', 'Firms abdomen and buttocks'],
    types: ['standing', 'grounding']
  },
  { 
    id: 'plk', name: 'Plank Pose', sanskrit: 'Phalakasana', category: POSE_CATEGORIES.SUN_SALUTATION, difficulty: 2, wrist: true, knee: false, pregnant: false, 
    cues: 'Core engaged, heels press back, dome upper back.', 
    teachingCue: 'Plant hands shoulder-width. Step back to a high push-up. Engage core, press heels back, and create a long line from crown to heels.',
    benefits: ['Strengthens arms, wrists, and spine', 'Tones abdomen', 'Prepares body for advanced arm balances'],
    types: ['core', 'strength']
  },
  { 
    id: 'chat', name: 'Chaturanga', sanskrit: 'Chaturanga Dandasana', category: POSE_CATEGORIES.SUN_SALUTATION, difficulty: 3, wrist: true, knee: false, pregnant: false, 
    cues: 'Lower halfway, elbows hug ribs.', 
    teachingCue: 'Shift forward, bend elbows straight back to lower halfway. Keep elbows hugged in to ribs and body in one straight line.',
    benefits: ['Develops core stability', 'Strengthens arms and wrists', 'Tones abdomen'],
    types: ['strength', 'arm-balance']
  },
  { 
    id: 'cobra', name: 'Cobra Pose', sanskrit: 'Bhujangasana', category: POSE_CATEGORIES.SUN_SALUTATION, difficulty: 1, wrist: true, knee: false, pregnant: false, 
    cues: 'Lift chest, little weight in hands, press tops of feet.', 
    teachingCue: 'Lower to belly. Press tops of feet down. Peel chest off the floor using back strength, keeping little to no weight in the hands.',
    benefits: ['Strengthens the spine', 'Stretches chest and lungs, shoulders, and abdomen', 'Stimulates abdominal organs'],
    types: ['backbend', 'spine']
  },
  { 
    id: 'updog', name: 'Upward Facing Dog', sanskrit: 'Urdhva Mukha Svanasana', category: POSE_CATEGORIES.SUN_SALUTATION, difficulty: 2, wrist: true, knee: false, pregnant: false, 
    cues: 'Thighs lifted, chest open, shoulders down.', 
    teachingCue: 'Press into hands and tops of feet to lift thighs off the mat. Draw chest forward and shoulders down away from ears.',
    benefits: ['Improves posture', 'Strengthens spine, arms, wrists', 'Stretches chest and lungs'],
    types: ['backbend', 'strength']
  },

  // STANDING
  { 
    id: 'w1', name: 'Warrior I', sanskrit: 'Virabhadrasana I', category: POSE_CATEGORIES.STANDING, difficulty: 2, wrist: false, knee: false, pregnant: true, 
    cues: 'Back heel down 45 degrees, hips square to front.', 
    teachingCue: 'Step one foot back, heel down at 45 degrees. Bend front knee over ankle. Reach arms high and square hips forward.',
    benefits: ['Stretches chest and lungs', 'Strengthens shoulders and arms', 'Strengthens and stretches thighs and calves'],
    types: ['strength', 'hip-opener', 'standing']
  },
  { 
    id: 'w2', name: 'Warrior II', sanskrit: 'Virabhadrasana II', category: POSE_CATEGORIES.STANDING, difficulty: 1, wrist: false, knee: false, pregnant: true, 
    cues: 'Front knee over ankle, gaze over front middle finger.', 
    teachingCue: 'Open hips to the side. Front heel aligns with back arch. Arms reach wide parallel to floor. Gaze over front fingers.',
    benefits: ['Increases stamina', 'Strengthens legs and ankles', 'Stretches groins, chest and shoulders'],
    types: ['strength', 'hip-opener', 'standing']
  },
  { 
    id: 'tri', name: 'Triangle Pose', sanskrit: 'Trikonasana', category: POSE_CATEGORIES.STANDING, difficulty: 2, wrist: false, knee: false, pregnant: true, 
    cues: 'Lengthen side body, hand to shin or block.', 
    teachingCue: 'Straighten front leg. Reach forward then down, placing hand on shin or block. Extend top arm high, stacking shoulders.',
    benefits: ['Stretches hips, groins, hamstrings', 'Opens chest and shoulders', 'Relieves backache'],
    types: ['hamstring', 'hip-opener', 'standing']
  },
  { 
    id: 'extside', name: 'Extended Side Angle', sanskrit: 'Utthita Parsvakonasana', category: POSE_CATEGORIES.STANDING, difficulty: 2, wrist: false, knee: false, pregnant: true, 
    cues: 'Forearm to thigh or hand to floor, long diagonal line.', 
    teachingCue: 'Bend front knee. Rest forearm on thigh or hand on floor. Reach top arm overhead to create a long diagonal line from heel to fingertips.',
    benefits: ['Strengthens legs, knees, and ankles', 'Stretches groins, spine, waist', 'Stimulates abdominal organs'],
    types: ['strength', 'side-stretch', 'standing']
  },
  { 
    id: 'lunge', name: 'High Lunge', sanskrit: 'Ashta Chandrasana', category: POSE_CATEGORIES.STANDING, difficulty: 2, wrist: false, knee: false, pregnant: true, 
    cues: 'Back heel lifted, hips square, arms reach up.', 
    teachingCue: 'Step back, keeping back heel lifted. Bend front knee to 90 degrees. Sweep arms up, engaging core and lifting chest.',
    benefits: ['Strengthens legs and arms', 'Stretches hip flexors', 'Develops balance and stability'],
    types: ['strength', 'balance', 'standing']
  },
  { 
    id: 'goddess', name: 'Goddess Pose', sanskrit: 'Utkata Konasana', category: POSE_CATEGORIES.STANDING, difficulty: 2, wrist: false, knee: false, pregnant: true, 
    cues: 'Toes out, heels in, sink hips, cactus arms.', 
    teachingCue: 'Step feet wide, toes turned out. Sink hips low into a squat. Cactus the arms, drawing elbows back to open the chest.',
    benefits: ['Opens hips and chest', 'Strengthens legs and glutes', 'Builds heat'],
    types: ['strength', 'hip-opener', 'standing']
  },
  {
    id: 'chair', name: 'Chair Pose', sanskrit: 'Utkatasana', category: POSE_CATEGORIES.STANDING, difficulty: 2, wrist: false, knee: false, pregnant: true,
    cues: 'Sit back into heels, lift chest, tuck tailbone slightly.',
    teachingCue: 'Feet together or hip-width. Bend knees and sink hips back as if sitting in a chair. Reach arms high, keeping chest lifted.',
    benefits: ['Strengthens ankles, thighs, calves, and spine', 'Stretches shoulders and chest', 'Stimulates heart and diaphragm'],
    types: ['strength', 'standing']
  },
  {
    id: 'revwar', name: 'Revolved Crescent Lunge', sanskrit: 'Parivrtta Anjaneyasana', category: POSE_CATEGORIES.STANDING, difficulty: 3, wrist: false, knee: false, pregnant: false,
    cues: 'Twist over front leg, back heel lifted, prayer hands.',
    teachingCue: 'From High Lunge, bring hands to heart. Lengthen spine, then hook opposite elbow outside front knee and twist, pressing palms together to deepen.',
    benefits: ['Builds heat and detoxifies', 'Strengthens legs and core', 'Improves balance and focus'],
    types: ['twist', 'standing', 'strength', 'peak']
  },

  // BALANCE
  { 
    id: 'tree', name: 'Tree Pose', sanskrit: 'Vrksasana', category: POSE_CATEGORIES.BALANCE, difficulty: 1, wrist: false, knee: false, pregnant: true, 
    cues: 'Foot to calf or thigh (not knee), hands to heart.', 
    teachingCue: 'Ground through standing leg. Place sole of opposite foot on calf or inner thigh. Bring hands to heart center or reach up.',
    benefits: ['Strengthens thighs, calves, ankles, and spine', 'Stretches groins and inner thighs', 'Improves balance'],
    types: ['balance', 'hip-opener']
  },
  { 
    id: 'eagle', name: 'Eagle Pose', sanskrit: 'Garudasana', category: POSE_CATEGORIES.BALANCE, difficulty: 3, wrist: false, knee: false, pregnant: true, 
    cues: 'Wrap right leg over left, right arm under left.', 
    teachingCue: 'Wrap one leg over the other, sinking hips low. Wrap corresponding arm under the other. Lift elbows to shoulder height.',
    benefits: ['Strengthens and stretches ankles and calves', 'Stretches thighs, hips, shoulders, and upper back', 'Improves concentration'],
    types: ['balance', 'twist', 'peak']
  },
  { 
    id: 'w3', name: 'Warrior III', sanskrit: 'Virabhadrasana III', category: POSE_CATEGORIES.BALANCE, difficulty: 3, wrist: false, knee: false, pregnant: true, 
    cues: 'T-shape body, hips square to floor.', 
    teachingCue: 'Shift weight to standing leg. Hinge forward, lifting back leg until body and leg are parallel to floor in a T-shape.',
    benefits: ['Strengthens ankles and legs', 'Strengthens shoulders and muscles of the back', 'Tones the abdomen'],
    types: ['balance', 'strength', 'hamstring']
  },
  {
    id: 'dancer', name: 'Dancer Pose', sanskrit: 'Natarajasana', category: POSE_CATEGORIES.BALANCE, difficulty: 3, wrist: false, knee: false, pregnant: true,
    cues: 'Catch inside of back foot, kick into hand.',
    teachingCue: 'Catch inside edge of back foot. Kick foot into hand to lift leg high while reaching opposite arm forward.',
    benefits: ['Stretches shoulders, chest, thighs, groins, and abdomen', 'Strengthens legs and ankles', 'Improves balance'],
    types: ['balance', 'backbend', 'peak']
  },
  {
    id: 'halfmoon', name: 'Half Moon Pose', sanskrit: 'Ardha Chandrasana', category: POSE_CATEGORIES.BALANCE, difficulty: 2, wrist: false, knee: false, pregnant: true,
    cues: 'Stack hips and shoulders, lift back leg, top arm high.',
    teachingCue: 'From Triangle, bend front knee and slide bottom hand forward. Lift back leg parallel to floor while opening chest and hips, reaching top arm skyward.',
    benefits: ['Strengthens ankles, thighs, and core', 'Improves balance', 'Expands chest and side body'],
    types: ['balance', 'hip-opener']
  },

  // FLOOR / STRETCH / PEAK
  { 
    id: 'pigeon', name: 'Half Pigeon', sanskrit: 'Eka Pada Rajakapotasana', category: POSE_CATEGORIES.HIP_OPENER, difficulty: 2, wrist: true, knee: true, pregnant: true, 
    cues: 'Right knee to right wrist, shin diagonal.', 
    teachingCue: 'Bring front knee behind wrist. Extend back leg long. Square hips and fold forward over the front leg if accessible.',
    benefits: ['Stretches thighs, groins and psoas', 'Opens hips', 'Stimulates abdominal organs'],
    types: ['hip-opener', 'rest']
  },
  {
    id: 'bridge', name: 'Bridge Pose', sanskrit: 'Setu Bandha Sarvangasana', category: POSE_CATEGORIES.BACKBEND, difficulty: 1, wrist: false, knee: false, pregnant: true,
    cues: 'Lift hips, interlace fingers under back.',
    teachingCue: 'Lie on back, knees bent, feet flat. Press into feet to lift hips. Interlace fingers underneath you and roll shoulders under.',
    benefits: ['Stretches chest, neck, and spine', 'Calms the brain', 'Rejuvenates tired legs'],
    types: ['backbend', 'spine']
  },
  {
    id: 'locust', name: 'Locust Pose', sanskrit: 'Salabhasana', category: POSE_CATEGORIES.BACKBEND, difficulty: 2, wrist: false, knee: false, pregnant: false,
    cues: 'Lift chest, arms, and legs off mat, reach back.',
    teachingCue: 'Lie prone with arms along sides. On inhale, lift chest, arms, and legs away from the mat, lengthening through toes and fingertips while keeping neck long.',
    benefits: ['Strengthens back, glutes, and hamstrings', 'Opens chest and shoulders', 'Improves posture'],
    types: ['backbend', 'strength', 'core']
  },
  {
    id: 'camel', name: 'Camel Pose', sanskrit: 'Ustrasana', category: POSE_CATEGORIES.BACKBEND, difficulty: 2, wrist: false, knee: true, pregnant: false,
    cues: 'Kneel, hands to heels, press hips forward, heart lifts.',
    teachingCue: 'From a tall kneel, place hands on heels or blocks. Press hips forward, lift through the sternum, and allow head to release back if comfortable.',
    benefits: ['Opens chest and hip flexors', 'Strengthens back muscles', 'Boosts energy and mood'],
    types: ['backbend', 'peak', 'chest']
  },
  {
    id: 'wheel', name: 'Wheel Pose', sanskrit: 'Urdhva Dhanurasana', category: POSE_CATEGORIES.BACKBEND, difficulty: 3, wrist: true, knee: false, pregnant: false,
    cues: 'Press into hands and feet, lift entire body.',
    teachingCue: 'Hands by ears, fingers facing shoulders. Press into hands and feet to lift head and body off floor, arching spine.',
    benefits: ['Strengthens arms, wrists, legs, buttocks, abdomen, and spine', 'Stimulates thyroid and pituitary', 'Increases energy'],
    types: ['backbend', 'peak', 'strength']
  },
  { 
    id: 'boat', name: 'Boat Pose', sanskrit: 'Navasana', category: POSE_CATEGORIES.CORE, difficulty: 2, wrist: false, knee: false, pregnant: false, 
    cues: 'Lift feet, balance on sit bones, chest open.', 
    teachingCue: 'Balance on sit bones. Lift legs, bent or straight. Reach arms forward. Keep spine long and chest broad.',
    benefits: ['Strengthens abdomen, hip flexors, and spine', 'Stimulates kidneys', 'Improves digestion'],
    types: ['core', 'strength']
  },
  { 
    id: 'crow', name: 'Crow Pose', sanskrit: 'Bakasana', category: POSE_CATEGORIES.BALANCE, difficulty: 3, wrist: true, knee: false, pregnant: false, 
    cues: 'Knees to armpits, lean forward, float feet.', 
    teachingCue: 'Plant hands. Place knees high on triceps. Lean forward until feet float off the floor. Engage core and round upper back.',
    benefits: ['Strengthens arms and wrists', 'Stretches upper back', 'Strengthens abdominal muscles'],
    types: ['arm-balance', 'peak', 'core']
  },
  {
    id: 'headstand', name: 'Headstand', sanskrit: 'Sirsasana', category: POSE_CATEGORIES.INVERSION, difficulty: 3, wrist: true, knee: false, pregnant: false,
    cues: 'Forearms down, interlace fingers, crown of head lightly down.',
    teachingCue: 'Interlace fingers, place forearms down. Set crown of head on mat. Walk feet in, lift hips, and float legs up vertically.',
    benefits: ['Calms the brain', 'Strengthens arms, legs and spine', 'Improves digestion'],
    types: ['inversion', 'peak', 'core']
  },
  {
    id: 'shoulder', name: 'Shoulderstand', sanskrit: 'Sarvangasana', category: POSE_CATEGORIES.INVERSION, difficulty: 3, wrist: false, knee: false, pregnant: false,
    cues: 'Stack hips over shoulders, support back with hands.',
    teachingCue: 'From supine, lift hips and legs overhead, placing hands on low back. Walk elbows closer and lengthen legs toward the ceiling to stack ankles over shoulders.',
    benefits: ['Improves circulation', 'Stimulates thyroid and parathyroid', 'Calms the nervous system'],
    types: ['inversion', 'peak', 'rest']
  },
  
  // RESTORATIVE / COOL DOWN
  { 
    id: 'paschi', name: 'Seated Forward Fold', sanskrit: 'Paschimottanasana', category: POSE_CATEGORIES.RESTORATIVE, difficulty: 1, wrist: false, knee: false, pregnant: true, 
    cues: 'Lengthen spine then fold, keep feet flexed.', 
    teachingCue: 'Sit with legs extended. Inhale to lengthen spine, exhale to fold forward from hips, reaching for feet or shins.',
    benefits: ['Calms the brain', 'Stretches the spine, shoulders and hamstrings', 'Stimulates liver and kidneys'],
    types: ['hamstring', 'spine', 'rest']
  },
  { 
    id: 'janu', name: 'Head to Knee', sanskrit: 'Janu Sirsasana', category: POSE_CATEGORIES.RESTORATIVE, difficulty: 1, wrist: false, knee: true, pregnant: true, 
    cues: 'One leg straight, one foot to inner thigh, fold.', 
    teachingCue: 'Extend one leg, place other foot to inner thigh. Rotate torso over extended leg and fold forward, keeping spine long.',
    benefits: ['Calms the brain', 'Stretches spine, shoulders, hamstrings, and groins', 'Stimulates liver and kidneys'],
    types: ['hamstring', 'hip-opener', 'rest']
  },
  {
    id: 'twist', name: 'Supine Twist', sanskrit: 'Supta Matsyendrasana', category: POSE_CATEGORIES.TWIST, difficulty: 1, wrist: false, knee: false, pregnant: true,
    cues: 'Knees to one side, gaze opposite.',
    teachingCue: 'Lie on back. Draw knees to chest, then drop them to one side. Open arms wide and gaze in the opposite direction.',
    benefits: ['Stretches the back muscles and glutes', 'Massages back and hips', 'Helps hydrate spinal disks'],
    types: ['twist', 'spine', 'rest']
  },
  {
    id: 'happy', name: 'Happy Baby', sanskrit: 'Ananda Balasana', category: POSE_CATEGORIES.HIP_OPENER, difficulty: 1, wrist: false, knee: false, pregnant: true,
    cues: 'Grab outer feet, pull knees toward armpits.',
    teachingCue: 'Lie on back. Grab outer edges of feet. Pull knees toward armpits while keeping tailbone grounded on the mat.',
    benefits: ['Gently releases hips', 'Calms the brain', 'Relieves lower back pain'],
    types: ['hip-opener', 'rest']
  },
  {
    id: 'legswall', name: 'Legs Up the Wall', sanskrit: 'Viparita Karani', category: POSE_CATEGORIES.RESTORATIVE, difficulty: 0, wrist: false, knee: false, pregnant: true,
    cues: 'Scoot hips to wall, extend legs upward, arms relaxed.',
    teachingCue: 'Sit close to a wall, roll onto back, and extend legs straight up the wall. Let arms rest by sides with palms up, allowing breath to slow.',
    benefits: ['Relieves tired legs and feet', 'Calms the nervous system', 'Encourages venous drainage and lymph flow'],
    types: ['rest', 'inversion', 'grounding']
  },
  {
    id: 'sava', name: 'Corpse Pose', sanskrit: 'Savasana', category: POSE_CATEGORIES.SAVASANA, difficulty: 0, wrist: false, knee: false, pregnant: true,
    cues: 'Complete relaxation. Let go of breath control.',
    teachingCue: 'Lie flat on your back, arms by sides, palms up. Close eyes. Release all tension and rest completely.',
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

export { POSE_CATEGORIES, TIMING_CONFIG, POSE_LIBRARY, DEFAULT_MUSIC_THEMES };
