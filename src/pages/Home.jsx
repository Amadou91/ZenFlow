import React from 'react';
import { Link } from 'react-router-dom';
import { PlayCircle, Music, Layers, Activity, ArrowRight, Check } from 'lucide-react';

const Home = () => {
  return (
    <div className="animate-in fade-in duration-500">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32 lg:pt-32 lg:pb-40">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none opacity-30 dark:opacity-20">
             <div className="absolute top-20 right-0 w-96 h-96 bg-teal-200/50 rounded-full blur-3xl mix-blend-multiply dark:bg-teal-900/40"></div>
             <div className="absolute bottom-0 left-10 w-72 h-72 bg-amber-100/50 rounded-full blur-3xl mix-blend-multiply dark:bg-amber-900/30"></div>
        </div>

        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-900/30 border border-teal-100 dark:border-teal-800 text-teal-700 dark:text-teal-300 text-xs font-bold uppercase tracking-widest mb-6">
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
            v1.0 Now Live
          </div>
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-stone-900 dark:text-white mb-6 leading-tight">
            Find Your Rhythm.<br/>Create Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-teal-400">Flow.</span>
          </h1>
          <p className="text-xl text-stone-600 dark:text-stone-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            The intelligent yoga sequence builder that syncs your practice with Spotify. 
            Design custom flows in seconds, not hours.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              to="/app" 
              className="w-full sm:w-auto px-8 py-4 bg-stone-900 dark:bg-white text-white dark:text-stone-900 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
            >
              Start Building <ArrowRight size={20} />
            </Link>
            <Link 
              to="/about"
              className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-200 border border-stone-200 dark:border-stone-700 rounded-xl font-bold text-lg hover:bg-stone-50 dark:hover:bg-stone-700 transition-all"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-white dark:bg-stone-800 border-y border-stone-100 dark:border-stone-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-stone-900 dark:text-white mb-4">Everything you need to flow</h2>
            <p className="text-stone-500 dark:text-stone-400">Powerful tools for teachers and practitioners alike.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Layers className="text-teal-500" size={32} />}
              title="Smart Sequencing"
              description="Algorithmic generation creates balanced Vinyasa, Hatha, or Yin sequences based on your time and difficulty preferences."
            />
            <FeatureCard 
              icon={<Music className="text-rose-500" size={32} />}
              title="Spotify Integration"
              description="Connect your Premium account to play full tracks perfectly timed to your practice without leaving the app."
            />
            <FeatureCard 
              icon={<PlayCircle className="text-amber-500" size={32} />}
              title="Interactive Practice"
              description="Follow along with a visual player including large timers, pose cues, and auto-advance functionality."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto bg-stone-900 dark:bg-teal-900/20 rounded-3xl p-8 md:p-16 text-center relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-white mb-6">Ready to hit the mat?</h2>
            <p className="text-stone-300 mb-8 max-w-xl mx-auto text-lg">
              Join thousands of yogis creating better sequences today. No credit card required.
            </p>
            <Link to="/app" className="inline-block px-8 py-4 bg-teal-500 text-white rounded-xl font-bold text-lg hover:bg-teal-400 transition-colors shadow-lg shadow-teal-900/20">
              Launch ZenFlow
            </Link>
          </div>
          
          {/* Decorative Circles */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-teal-500/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
        </div>
      </section>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => (
  <div className="p-8 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-stone-100 dark:border-stone-800 hover:border-teal-200 dark:hover:border-teal-800/30 transition-colors">
    <div className="mb-6 bg-white dark:bg-stone-800 w-16 h-16 rounded-xl flex items-center justify-center shadow-sm border border-stone-100 dark:border-stone-700">
      {icon}
    </div>
    <h3 className="text-xl font-bold font-serif text-stone-900 dark:text-white mb-3">{title}</h3>
    <p className="text-stone-600 dark:text-stone-400 leading-relaxed">{description}</p>
  </div>
);

export default Home;