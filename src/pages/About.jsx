import React from 'react';

const About = () => {
  return (
    <div className="animate-in fade-in duration-500">
      <div className="max-w-4xl mx-auto px-4 py-16 md:py-24">
        <div className="flex flex-col md:flex-row gap-12 items-start">
          
          {/* Image Placeholder */}
          <div className="w-full md:w-1/3 aspect-[3/4] bg-stone-200 dark:bg-stone-800 rounded-2xl flex items-center justify-center text-stone-400">
            <span className="text-sm font-bold uppercase tracking-widest">[Photo of Jocelyn]</span>
          </div>

          <div className="flex-1">
            <h1 className="text-4xl font-serif font-bold text-stone-900 dark:text-white mb-6">Hi, I'm Jocelyn.</h1>
            <div className="space-y-6 text-stone-600 dark:text-stone-300 leading-relaxed text-lg">
              <p>
                My yoga journey began [Year]... [Insert Jocelyn's bio here. Talk about her training, her philosophy, and why she loves teaching in Drayton.]
              </p>
              <p>
                I believe yoga is for everyone. Whether you can touch your toes or not is irrelevant; what matters is showing up for yourself and finding a moment of peace in a busy world.
              </p>
              <p>
                When I'm not on the mat, you can find me [Hobbies/Interests], enjoying the beautiful Ontario countryside with my family.
              </p>
            </div>

            <div className="mt-12 p-6 bg-teal-50 dark:bg-teal-900/20 border border-teal-100 dark:border-teal-800 rounded-xl">
              <h3 className="font-serif font-bold text-teal-800 dark:text-teal-200 mb-2">My Certifications</h3>
              <ul className="list-disc list-inside text-sm text-teal-700 dark:text-teal-300 space-y-1">
                <li>200HR RYT - [School Name]</li>
                <li>Restorative Yoga Certification</li>
                <li>Trauma-Informed Yoga Training</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;