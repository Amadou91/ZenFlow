import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Star, X } from 'lucide-react';

const retreats = [
  {
    id: 1,
    title: 'Equinox Renewal in the Mountains',
    date: 'September 18-22, 2025',
    location: 'Blue Ridge, NC',
    description: 'A five-day immersion blending morning vinyasa, afternoon yin, and guided meditations under the stars.',
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80',
    spotsLeft: 8,
  },
  {
    id: 2,
    title: 'Coastal Quietude',
    date: 'October 9-12, 2025',
    location: 'Tofino, BC',
    description: 'Slow mornings, ocean air, restorative movement, and nourishing plant-based meals.',
    image: 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1200&q=80',
    spotsLeft: 4,
  },
];

const Retreats = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedRetreat, setSelectedRetreat] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '' });

  const openModal = (retreat) => {
    setSelectedRetreat(retreat);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedRetreat(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('We received your request!');
    closeModal();
  };

  return (
    <div className="animate-in fade-in-up pb-20 theme-surface relative">
      <div className="bg-grain" />

      <div className="relative h-[60vh] bg-[color-mix(in_srgb,var(--color-card)20%,transparent)] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-gradientFrom)]/40 to-[var(--color-gradientTo)]/40" />
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.35), transparent 35%), radial-gradient(circle at 80% 40%, rgba(0,0,0,0.15), transparent 45%)' }} />
        <div className="relative z-10 text-center max-w-3xl px-6">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[color-mix(in_srgb,var(--color-card)85%,transparent)] border border-[color-mix(in_srgb,var(--color-text)12%,transparent)] text-[var(--color-primary)] text-xs font-bold uppercase tracking-widest mb-6">
            <Star size={12} /> Retreats
          </span>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-[var(--color-text)] mb-4">Travel with the Studio</h1>
          <p className="theme-muted text-lg">Nourish yourself with immersive experiences designed to balance body, mind, and heart.</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-24 relative z-10">
        <div className="grid md:grid-cols-2 gap-8">
          {retreats.map((retreat) => (
            <div key={retreat.id} className="bg-[color-mix(in_srgb,var(--color-card)96%,transparent)] rounded-[2.5rem] overflow-hidden shadow-2xl shadow-[color-mix(in_srgb,var(--color-text)15%,transparent)] border border-[color-mix(in_srgb,var(--color-text)10%,transparent)]">
              <div className="bg-[color-mix(in_srgb,var(--color-card)90%,transparent)] min-h-[400px] relative overflow-hidden group">
                <img src={retreat.image} alt={retreat.title} className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-[color-mix(in_srgb,var(--color-text)55%,transparent)] to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 text-white drop-shadow-lg">
                  <div className="flex items-center gap-2 text-sm opacity-80">
                    <Calendar size={16} /> {retreat.date}
                  </div>
                  <h3 className="text-2xl font-serif font-bold mt-2">{retreat.title}</h3>
                  <p className="text-sm opacity-80 flex items-center gap-2 mt-1"><MapPin size={16} /> {retreat.location}</p>
                </div>
              </div>

              <div className="p-8 space-y-4">
                <p className="theme-muted leading-relaxed">{retreat.description}</p>
                <div className="flex flex-wrap gap-3 text-sm theme-muted">
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full theme-chip border border-[color-mix(in_srgb,var(--color-primary)35%,transparent)]"><Clock size={14} /> {retreat.date}</span>
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[color-mix(in_srgb,var(--color-card)90%,transparent)] border border-[color-mix(in_srgb,var(--color-text)12%,transparent)]">{retreat.spotsLeft} spots left</span>
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => openModal(retreat)} className="flex-1 py-3 bg-[var(--color-primary)] text-white rounded-xl font-bold shadow-lg shadow-[var(--color-primary)]/25 hover:brightness-110 transition-all">Reserve My Spot</button>
                  <button className="p-3 rounded-xl border border-[color-mix(in_srgb,var(--color-text)10%,transparent)] text-[var(--color-text)] hover:bg-[color-mix(in_srgb,var(--color-card)94%,transparent)]">Details</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showModal && selectedRetreat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[color-mix(in_srgb,var(--color-text)30%,transparent)] backdrop-blur-sm animate-in fade-in" onClick={closeModal}>
          <div className="theme-card rounded-3xl max-w-md w-full p-8 animate-in-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-serif font-bold text-[var(--color-text)]">Reserve for {selectedRetreat.title}</h3>
              <button onClick={closeModal} className="p-2 rounded-full hover:bg-[color-mix(in_srgb,var(--color-card)92%,transparent)]"><X size={20} className="theme-muted" /></button>
            </div>
            <p className="theme-muted text-sm mb-6 flex items-center gap-2"><Calendar size={16} /> {selectedRetreat.date}</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                required
                className="w-full p-4 rounded-xl bg-[color-mix(in_srgb,var(--color-card)92%,transparent)] border border-[color-mix(in_srgb,var(--color-text)10%,transparent)] focus:ring-2 focus:ring-[var(--color-primary)]/50 outline-none transition-all text-[var(--color-text)]"
                placeholder="Jane Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <input
                type="email"
                required
                className="w-full p-4 rounded-xl bg-[color-mix(in_srgb,var(--color-card)92%,transparent)] border border-[color-mix(in_srgb,var(--color-text)10%,transparent)] focus:ring-2 focus:ring-[var(--color-primary)]/50 outline-none transition-all text-[var(--color-text)]"
                placeholder="jane@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              <button type="submit" className="w-full py-4 bg-[var(--color-primary)] hover:brightness-110 text-white rounded-xl font-bold mt-2 shadow-lg shadow-[var(--color-primary)]/25 transition-all flex items-center justify-center gap-2">
                Submit Request
              </button>
              <button onClick={closeModal} type="button" className="w-full py-4 bg-[color-mix(in_srgb,var(--color-card)92%,transparent)] hover:bg-[color-mix(in_srgb,var(--color-card)96%,transparent)] font-bold rounded-xl text-[var(--color-text)] transition-colors">
                Close
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Retreats;
