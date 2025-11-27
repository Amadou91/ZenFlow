import { POSE_LIBRARY } from '../data/poses';

const SEQUENCE_METHODS = {
  STANDARD: 'standard',
  PEAK: 'peak',
  THEME: 'theme',
  TARGET: 'target',
  LADDER: 'ladder'
};

const PEAK_POSES = POSE_LIBRARY.filter((p) => p.types.includes('peak')).map((p) => ({ id: p.id, name: p.name }));

const THEMES = [
  { id: 'grounding', name: 'Grounding & Stability', types: ['grounding', 'balance', 'standing'] },
  { id: 'energy', name: 'Energy & Power', types: ['strength', 'core', 'backbend'] },
  { id: 'detox', name: 'Detox & Twist', types: ['twist', 'core'] },
  { id: 'heart', name: 'Heart Opening', types: ['backbend', 'chest'] },
  { id: 'rest', name: 'Relaxation & Restore', types: ['rest', 'grounding'] },
];

const TARGET_AREAS = [
  { id: 'hips', name: 'Hips & Emotions', types: ['hip-opener'] },
  { id: 'core', name: 'Core Fire', types: ['core'] },
  { id: 'spine', name: 'Spine Health', types: ['spine'] },
  { id: 'hamstrings', name: 'Hamstrings & Release', types: ['hamstring'] },
  { id: 'shoulders', name: 'Shoulders & Neck', types: ['shoulder'] },
];

export { SEQUENCE_METHODS, PEAK_POSES, THEMES, TARGET_AREAS };
