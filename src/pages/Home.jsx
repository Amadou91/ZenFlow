import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, Heart, Wind } from 'lucide-react';

const Home = () => {
  return (
    <div className="animate-in fade-in duration-500">
      <section className="relative overflow-hidden pt-20 pb-32 lg:pt-32 lg:pb-40 bg-stone-50 dark:bg-stone-900">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none opacity-40 dark:opacity-20">
             <div className="absolute top-10 right-0 w-96 h-96 bg-teal-200 rounded-full blur-3xl mix-blend-multiply dark:bg-teal-900"></div>
             <div className="absolute bottom-0 left-10 w-80 h-80 bg-rose-100 rounded-full blur-3xl mix-blend-multiply dark:bg-rose-900/50"></div>
        </div>
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-stone-900 dark:text-white mb-6 leading-tight">Move with Intention.<br/><span className="text-teal-600 italic">Breathe with Purpose.</span></h1>
          <p className="text-xl text-stone-600 dark:text-stone-300 mb-10 max-w-2xl mx-auto leading-relaxed">Welcome to Jocelyn Yoga. Joining the Drayton community to offer accessible, grounding, and energizing yoga practices for every body.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/schedule" className="w-full sm:w-auto px-8 py-4 bg-teal-700 hover:bg-teal-800 text-white rounded-xl font-bold text-lg shadow-xl shadow-teal-900/10 hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2">View Class Schedule <ArrowRight size={20} /></Link>
            <Link to="/about" className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-200 border border-stone-200 dark:border-stone-700 rounded-xl font-bold text-lg hover:bg-stone-50 dark:hover:bg-stone-700 transition-all">Meet Jocelyn</Link>
          </div>
        </div>
      </section>
      <section className="py-24 bg-white dark:bg-stone-800/50 border-y border-stone-100 dark:border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-3 gap-12">
            <Feature icon={<Heart className="text-rose-400" size={32} />} title="Community First" description="A welcoming space for Drayton locals. Connect with neighbors and build friendships on the mat." />
            <Feature icon={<Wind className="text-teal-500" size={32} />} title="Breath Centered" description="Classes that prioritize the breath, helping you regulate your nervous system and find calm." />
            <Feature icon={<Calendar className="text-amber-500" size={32} />} title="Consistent Practice" description="Regular weekly schedules designed to help you build a sustainable and rewarding routine." />
          </div>
        </div>
      </section>
      <section className="py-24 px-4 bg-stone-50 dark:bg-stone-900">
        <div className="max-w-5xl mx-auto bg-stone-900 dark:bg-teal-900/20 rounded-3xl p-8 md:p-16 text-center relative overflow-hidden shadow-2xl">
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-6">Start your journey today</h2>
            <p className="text-stone-300 mb-8 max-w-xl mx-auto text-lg">First class is always accessible. Check the schedule to find a time that works for you.</p>
            <Link to="/schedule" className="inline-block px-8 py-4 bg-teal-500 text-white rounded-xl font-bold text-lg hover:bg-teal-400 transition-colors">Book a Class</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

const Feature = ({ icon, title, description }) => (
  <div className="text-center">
    <div className="mb-6 w-16 h-16 mx-auto bg-stone-50 dark:bg-stone-800 rounded-full flex items-center justify-center shadow-sm border border-stone-100 dark:border-stone-700">{icon}</div>
    <h3 className="text-xl font-bold font-serif text-stone-900 dark:text-white mb-3">{title}</h3>
    <p className="text-stone-600 dark:text-stone-400 leading-relaxed">{description}</p>
  </div>
);

export default Home;