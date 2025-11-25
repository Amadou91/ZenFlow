// File: generate-images.js
// Run this with: node generate-images.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// CONFIGURATION
const API_KEY = process.env.OPENAI_API_KEY || 'YOUR_OPENAI_KEY_HERE'; // Replace with your key
const OUTPUT_DIR = './public/poses';

// SIMPLIFIED POSE LIST (Matching IDs from App.jsx)
// COMPLETE POSE LIST (Matching IDs from App.jsx)
const POSES = [
    {
      id: 'suc',
      name: 'Sukhasana (Easy Pose)',
      prompt: 'Clean minimalist vector flat illustration of a person sitting cross-legged in Sukhasana (Easy Pose), neutral spine, hands resting on knees, relaxed shoulders. White background, soft teal and slate grey palette, simple crisp lines, animation-ready.'
    },
    {
      id: 'vir',
      name: 'Virasana (Hero Pose)',
      prompt: 'Clean minimalist vector flat illustration of a person in Virasana (Hero Pose), seated between heels, knees together, torso upright, hands resting on thighs. White background, soft teal and slate grey palette.'
    },
    {
      id: 'chi',
      name: 'Balasana (Child’s Pose)',
      prompt: 'Clean minimalist vector flat illustration of a person in Balasana (Child’s Pose), knees wide, torso folded down, forehead on mat, arms extended forward. White background, soft teal and slate grey palette.'
    },
    {
      id: 'cat',
      name: 'Marjaryasana (Cat Pose)',
      prompt: 'Clean minimalist vector flat illustration of a person in Cat Pose (Marjaryasana), rounded spine, head dropped, on all fours. White background, soft teal and slate grey palette.'
    },
    {
      id: 'cow',
      name: 'Bitilasana (Cow Pose)',
      prompt: 'Clean minimalist vector flat illustration of a person in Cow Pose (Bitilasana), spine arched, chest open, head lifted, on all fours. White background, soft teal and slate grey palette.'
    },
    {
      id: 'ttn',
      name: 'Thread the Needle',
      prompt: 'Clean minimalist vector flat illustration of a person in Thread the Needle pose, on all fours with one arm threaded under the chest, shoulder and head resting on the ground. White background, soft teal and slate grey palette.'
    },
    {
      id: 'dd',
      name: 'Adho Mukha Svanasana (Downward Dog)',
      prompt: 'Clean minimalist vector flat illustration of a person in Downward Facing Dog, hips lifted, arms straight, legs straight, forming an inverted V. White background, soft teal and slate grey palette.'
    },
    {
      id: 'rag',
      name: 'Ragdoll Fold',
      prompt: 'Clean minimalist vector flat illustration of a person in Ragdoll Forward Fold, knees soft, torso hanging over legs, arms hanging or holding elbows. White background, soft teal and slate grey palette.'
    },
    {
      id: 'mtn',
      name: 'Tadasana (Mountain Pose)',
      prompt: 'Clean minimalist vector flat illustration of a person standing tall in Tadasana, feet hip-width, neutral spine, arms by sides. White background, soft teal and slate grey palette.'
    },
    {
      id: 'plk',
      name: 'Plank Pose',
      prompt: 'Clean minimalist vector flat illustration of a person in Plank Pose, straight line from head to heels, arms straight, core engaged. White background, soft teal and slate grey palette.'
    },
    {
      id: 'cha',
      name: 'Chaturanga Dandasana',
      prompt: 'Clean minimalist vector flat illustration of a person in Chaturanga, elbows bent at 90 degrees, body parallel to floor, tight core. White background, soft teal and slate grey palette.'
    },
    {
      id: 'cob',
      name: 'Bhujangasana (Cobra Pose)',
      prompt: 'Clean minimalist vector flat illustration of a person in Cobra Pose, chest lifted, elbows bent close to ribs, legs on ground. White background, soft teal and slate grey palette.'
    },
    {
      id: 'updog',
      name: 'Urdhva Mukha Svanasana (Upward Facing Dog)',
      prompt: 'Clean minimalist vector flat illustration of a person in Upward Facing Dog, arms straight, thighs lifted off ground, chest open. White background, soft teal and slate grey palette.'
    },
    {
      id: 'w1',
      name: 'Virabhadrasana I (Warrior I)',
      prompt: 'Clean minimalist vector flat illustration of a person in Warrior I, front knee bent 90 degrees, back leg straight, hips squared, arms overhead. White background, soft teal and slate grey palette.'
    },
    {
      id: 'w2',
      name: 'Virabhadrasana II (Warrior II)',
      prompt: 'Clean minimalist vector flat illustration of a person in Warrior II, front knee bent, arms extended parallel, hips open, strong T-shape. White background, soft teal and slate grey palette.'
    },
    {
      id: 'tri',
      name: 'Trikonasana (Triangle Pose)',
      prompt: 'Clean minimalist vector flat illustration of a person in Triangle Pose, front leg straight, torso extended sideways, bottom hand to shin, top arm vertical. White background, soft teal and slate grey palette.'
    },
    {
      id: 'esa',
      name: 'Utthita Parsvakonasana (Extended Side Angle)',
      prompt: 'Clean minimalist vector flat illustration of a person in Extended Side Angle, front knee bent, forearm on thigh or hand to floor, top arm extended overhead on a diagonal. White background, soft teal and slate grey palette.'
    },
    {
      id: 'hig',
      name: 'High Lunge',
      prompt: 'Clean minimalist vector flat illustration of a person in High Lunge, front knee bent, back leg straight, arms overhead, torso upright. White background, soft teal and slate grey palette.'
    },
    {
      id: 'god',
      name: 'Goddess Pose',
      prompt: 'Clean minimalist vector flat illustration of a person in Goddess Pose, wide stance, knees bent, toes turned out, arms bent at 90 degrees. White background, soft teal and slate grey palette.'
    },
    {
      id: 'chr',
      name: 'Utkatasana (Chair Pose)',
      prompt: 'Clean minimalist vector flat illustration of a person in Chair Pose, knees bent deeply, hips back, arms overhead, spine long. White background, soft teal and slate grey palette.'
    },
    {
      id: 'tree',
      name: 'Vrksasana (Tree Pose)',
      prompt: 'Clean minimalist vector flat illustration of a person in Tree Pose, standing on one leg, other foot on inner thigh, hands in prayer at chest. White background, soft teal and slate grey palette.'
    },
    {
      id: 'eag',
      name: 'Garudasana (Eagle Pose)',
      prompt: 'Clean minimalist vector flat illustration of a person in Eagle Pose, one leg wrapped around the other, arms wrapped, slight squat, elbows lifted. White background, soft teal and slate grey palette.'
    },
    {
      id: 'w3',
      name: 'Virabhadrasana III (Warrior III)',
      prompt: 'Clean minimalist vector flat illustration of a person in Warrior III, standing on one leg, torso forward, back leg lifted straight, arms extended. White background, soft teal and slate grey palette.'
    },
    {
      id: 'dan',
      name: 'Natarajasana (Dancer Pose)',
      prompt: 'Clean minimalist vector flat illustration of a person in Dancer Pose, standing on one leg, back leg bent and held by the hand, opposite arm reaching forward. White background, soft teal and slate grey palette.'
    },
    {
      id: 'pigeon',
      name: 'Eka Pada Rajakapotasana (Half Pigeon)',
      prompt: 'Clean minimalist vector flat illustration of a person in Half Pigeon Pose, front leg folded, back leg extended, torso upright or folding forward. White background, soft teal and slate grey palette.'
    },
    {
      id: 'bridge',
      name: 'Setu Bandha Sarvangasana (Bridge Pose)',
      prompt: 'Clean minimalist vector flat illustration of a person in Bridge Pose, lying on back with knees bent, hips lifted, chest open. White background, soft teal and slate grey palette.'
    },
    {
      id: 'wheel',
      name: 'Urdhva Dhanurasana (Wheel Pose)',
      prompt: 'Clean minimalist vector flat illustration of a person in Wheel Pose, full backbend, hands and feet on ground, chest lifted. White background, soft teal and slate grey palette.'
    },
    {
      id: 'boat',
      name: 'Navasana (Boat Pose)',
      prompt: 'Clean minimalist vector flat illustration of a person in Boat Pose, balanced on sit bones, legs lifted straight, torso leaning back, arms extended forward. White background, soft teal and slate grey palette.'
    },
    {
      id: 'crow',
      name: 'Bakasana (Crow Pose)',
      prompt: 'Clean minimalist vector flat illustration of a person in Crow Pose, balancing on hands, knees on upper arms, feet lifted, compact body. White background, soft teal and slate grey palette.'
    },
    {
      id: 'headstand',
      name: 'Sirsasana (Headstand)',
      prompt: 'Clean minimalist vector flat illustration of a person in Supported Headstand, forearm base, straight legs stacked over hips. White background, soft teal and slate grey palette.'
    },
    {
      id: 'sf',
      name: 'Paschimottanasana (Seated Forward Fold)',
      prompt: 'Clean minimalist vector flat illustration of a person in Seated Forward Fold, legs straight, torso folding over legs, hands reaching toward feet. White background, soft teal and slate grey palette.'
    },
    {
      id: 'htk',
      name: 'Janu Sirsasana (Head to Knee)',
      prompt: 'Clean minimalist vector flat illustration of a person in Head-to-Knee Pose, one leg extended, other foot against inner thigh, torso folding over extended leg. White background, soft teal and slate grey palette.'
    },
    {
      id: 'stw',
      name: 'Supine Twist',
      prompt: 'Clean minimalist vector flat illustration of a person lying on their back in a Supine Twist, one knee crossed over the body, opposite arm extended. White background, soft teal and slate grey palette.'
    },
    {
      id: 'hb',
      name: 'Happy Baby',
      prompt: 'Clean minimalist vector flat illustration of a person on their back in Happy Baby Pose, knees bent wide, hands holding feet, spine grounded. White background, soft teal and slate grey palette.'
    },
    {
      id: 'corpse',
      name: 'Savasana (Corpse Pose)',
      prompt: 'Clean minimalist vector flat illustration of a person lying flat on back in Savasana, arms relaxed by sides, legs extended, neutral alignment. White background, soft teal and slate grey palette.'
    }
  ];
  

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function generateImage(pose) {
  console.log(`🎨 Generating: ${pose.name}...`);
  
  try {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: pose.prompt,
        n: 1,
        size: "1024x1024",
        response_format: "b64_json"
      })
    });

    const data = await response.json();
    
    if (data.error) throw new Error(data.error.message);

    const buffer = Buffer.from(data.data[0].b64_json, 'base64');
    const filePath = path.join(OUTPUT_DIR, `${pose.id}.png`);
    
    fs.writeFileSync(filePath, buffer);
    console.log(`✅ Saved: ${filePath}`);

  } catch (error) {
    console.error(`❌ Error generating ${pose.name}:`, error.message);
  }
}

async function main() {
  if (!fs.existsSync(OUTPUT_DIR)){
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // NOTE: Generates one by one to avoid rate limits
  for (const pose of POSES) {
    // Check if exists to skip
    if (fs.existsSync(path.join(OUTPUT_DIR, `${pose.id}.png`))) {
      console.log(`kipping ${pose.name} (already exists)`);
      continue;
    }
    await generateImage(pose);
  }
}

main();