import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, Heart, Wind, Star, Users } from 'lucide-react';

const Home = () => {
  return (
    <div className="overflow-hidden">
      <section className="relative min-h-[90vh] flex items-center pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-900/30 border border-teal-100 dark:border-teal-800/50 text-teal-800 dark:text-teal-200 text-xs font-bold uppercase tracking-widest mb-8 animate-in fade-in-up">
              <Star size={12} className="text-teal-500" /> New Studio in Drayton
            </div>
            
            <h1 className="text-6xl md:text-8xl font-serif font-bold text-stone-900 dark:text-stone-50 leading-[0.95] mb-8 animate-in fade-in-up" style={{ animationDelay: '0.1s' }}>
              Move with <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-teal-400 dark:from-teal-400 dark:to-teal-200">Intention.</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-stone-600 dark:text-stone-300 max-w-2xl leading-relaxed mb-12 animate-in fade-in-up" style={{ animationDelay: '0.2s' }}>
              Accessible, grounding, and energizing yoga practices. Join a community that breathes together.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 animate-in fade-in-up" style={{ animationDelay: '0.3s' }}>
              <Link to="/schedule" className="px-8 py-4 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-full font-bold text-lg shadow-xl shadow-stone-900/10 hover:transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-3">
                Book a Class <ArrowRight size={20} />
              </Link>
              <Link to="/about" className="px-8 py-4 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200 rounded-full font-bold text-lg border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-700 transition-all duration-300 text-center">
                Meet Jocelyn
              </Link>
            </div>
          </div>
        </div>

        <div className="absolute right-0 top-1/4 w-[600px] h-[600px] bg-gradient-to-br from-teal-100/40 to-transparent rounded-full blur-3xl -z-10 dark:from-teal-900/20 pointer-events-none"></div>
      </section>

      <section className="py-32 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Heart className="text-rose-400" size={32} />} 
              title="Community First" 
              desc="A welcoming space for Drayton locals. We focus on connection over perfection, building friendships on the mat."
              delay="0s"
            />
            <FeatureCard 
              icon={<Wind className="text-teal-500" size={32} />} 
              title="Breath Centered" 
              desc="Classes designed to regulate your nervous system. Find calm in the chaos through guided breathwork."
              delay="0.1s"
            />
            <FeatureCard 
              icon={<Calendar className="text-stone-500" size={32} />} 
              title="Consistent Practice" 
              desc="Regular weekly schedules help you build a sustainable routine. Drop-ins always welcome."
              delay="0.2s"
            />
          </div>
        </div>
      </section>

      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto bg-stone-900 dark:bg-stone-800 rounded-[2.5rem] p-8 md:p-20 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 opacity-10 dark:opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
          
          <div className="relative z-10 max-w-2xl mx-auto">
            <div className="w-16 h-16 mx-auto bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center text-white mb-8 border border-white/10">
              <Users size={32} />
            </div>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6">Begin your journey.</h2>
            <p className="text-stone-300 text-lg md:text-xl mb-10 leading-relaxed">
              Your first class is the hardest step. We make it easy. <br className="hidden md:block"/> Check the schedule to find a time that works for you.
            </p>
            <Link to="/schedule" className="inline-block px-10 py-4 bg-teal-500 text-white rounded-full font-bold text-lg hover:bg-teal-400 transition-colors shadow-lg shadow-teal-900/20">
              View Schedule
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc, delay }) => (
  <div className="group p-8 rounded-3xl bg-white/50 dark:bg-stone-800/30 border border-white/60 dark:border-stone-700/50 hover:bg-white dark:hover:bg-stone-800 transition-all duration-500 hover:shadow-xl hover:shadow-stone-200/50 dark:hover:shadow-none hover:-translate-y-2 backdrop-blur-sm animate-in fade-in-up" style={{ animationDelay: delay }}>
    <div className="mb-6 w-16 h-16 bg-stone-50 dark:bg-stone-900/50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-sm border border-stone-100 dark:border-stone-700">
      {icon}
    </div>
    <h3 className="text-2xl font-bold font-serif text-stone-900 dark:text-white mb-4">{title}</h3>
    <p className="text-stone-600 dark:text-stone-400 leading-relaxed font-medium">{desc}</p>
  </div>
);

export default Home;