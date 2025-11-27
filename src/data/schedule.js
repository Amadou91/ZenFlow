export const UPCOMING_CLASSES = [
  {
    id: 1,
    title: "Sunrise Vinyasa",
    date: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
    duration: "60 min",
    location: "Drayton Community Hall",
    price: 15,
    spotsTotal: 15,
    spotsBooked: 12,
    difficulty: "All Levels",
    description: "Wake up with the sun. A gentle flow to energize your body and focus your mind for the day ahead."
  },
  {
    id: 2,
    title: "Power Flow",
    date: new Date(Date.now() + 172800000).toISOString(), // Day after tomorrow
    duration: "75 min",
    location: "The Loft Studio",
    price: 18,
    spotsTotal: 12,
    spotsBooked: 0,
    difficulty: "Intermediate",
    description: "Build heat and strength. We focus on core stability and balance in this dynamic evening session."
  },
  {
    id: 3,
    title: "Restorative & Yin",
    date: new Date(Date.now() + 259200000).toISOString(),
    duration: "90 min",
    location: "Drayton Community Hall",
    price: 20,
    spotsTotal: 20,
    spotsBooked: 18,
    difficulty: "Beginner Friendly",
    description: "Deep stretching and relaxation. Props are encouraged as we hold poses longer to release deep tension."
  }
];

export const FAQS = [
  { q: "Do I need to bring my own mat?", a: "We have a few spare mats, but for hygiene reasons, we highly recommend bringing your own." },
  { q: "Where in Drayton are you located?", a: "Classes are currently held at the Community Hall on Main St. Look for the sign out front!" },
  { q: "How do I pay?", a: "You can pay via e-transfer upon booking, or cash/card upon arrival." },
];