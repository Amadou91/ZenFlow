// File: generate-images.js
// Run this with: node generate-images.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// CONFIGURATION
const API_KEY = process.env.OPENAI_API_KEY || 'YOUR_OPENAI_KEY_HERE'; // Replace with your key
const OUTPUT_DIR = './public/poses';

// SIMPLIFIED POSE LIST (Matching IDs from App.jsx)
const POSES = [
  { id: 'suc', name: 'Sukhasana (Easy Pose)', prompt: 'A clean, minimalist vector-style flat illustration of a person sitting in Yoga Easy Pose (Sukhasana), cross-legged, hands on knees, meditative posture. White background, soft teal and slate grey colors, simple lines, high quality.' },
  { id: 'vir', name: 'Virasana (Hero Pose)', prompt: 'A clean, minimalist vector-style flat illustration of a person in Yoga Hero Pose (Virasana), sitting between heels. White background, soft teal and slate grey colors.' },
  { id: 'chi', name: 'Balasana (Childs Pose)', prompt: 'A clean, minimalist vector-style flat illustration of a person in Yoga Childs Pose (Balasana), forehead on ground, arms forward. White background, soft teal and slate grey colors.' },
  { id: 'cat', name: 'Marjaryasana (Cat Pose)', prompt: 'A clean, minimalist vector-style flat illustration of a person in Yoga Cat Pose, rounded spine on all fours. White background, soft teal and slate grey colors.' },
  { id: 'cow', name: 'Bitilasana (Cow Pose)', prompt: 'A clean, minimalist vector-style flat illustration of a person in Yoga Cow Pose, arched back on all fours. White background, soft teal and slate grey colors.' },
  { id: 'dd', name: 'Adho Mukha Svanasana (Down Dog)', prompt: 'A clean, minimalist vector-style flat illustration of a person in Downward Facing Dog yoga pose. White background, soft teal and slate grey colors.' },
  { id: 'mtn', name: 'Tadasana (Mountain Pose)', prompt: 'A clean, minimalist vector-style flat illustration of a person standing in Mountain Pose yoga. White background, soft teal and slate grey colors.' },
  { id: 'w1', name: 'Virabhadrasana I (Warrior I)', prompt: 'A clean, minimalist vector-style flat illustration of a person in Warrior I yoga pose. White background, soft teal and slate grey colors.' },
  { id: 'w2', name: 'Virabhadrasana II (Warrior II)', prompt: 'A clean, minimalist vector-style flat illustration of a person in Warrior II yoga pose. White background, soft teal and slate grey colors.' },
  // ... Add prompts for all other poses here following the pattern
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