import React from 'react';
import { Mail, MapPin, Phone } from 'lucide-react';

const Contact = () => {
  return (
    <div className="animate-in fade-in duration-500">
      <div className="bg-stone-100 dark:bg-stone-800 py-16 px-4 text-center">
        <h1 className="text-4xl font-serif font-bold text-stone-900 dark:text-white mb-4">Contact & Policies</h1>
        <p className="text-stone-600 dark:text-stone-300 max-w-xl mx-auto">Have a question? We'd love to hear from you. Please review our studio policies below before visiting.</p>
      </div>
      <div className="max-w-5xl mx-auto px-4 py-16 grid md:grid-cols-2 gap-12">
        <div>
          <h2 className="text-2xl font-serif font-bold text-stone-900 dark:text-white mb-6">Get in Touch</h2>
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="bg-teal-100 dark:bg-teal-900/30 p-3 rounded-full text-teal-700 dark:text-teal-400"><Mail size={20} /></div>
              <div><h4 className="font-bold text-stone-900 dark:text-white">Email</h4><p className="text-stone-500 dark:text-stone-400">hello@jocelynyoga.com</p></div>
            </div>
            <div className="flex items-start gap-4">
              <div className="bg-teal-100 dark:bg-teal-900/30 p-3 rounded-full text-teal-700 dark:text-teal-400"><Phone size={20} /></div>
              <div><h4 className="font-bold text-stone-900 dark:text-white">Phone</h4><p className="text-stone-500 dark:text-stone-400">(519) 555-0123</p></div>
            </div>
            <div className="flex items-start gap-4">
              <div className="bg-teal-100 dark:bg-teal-900/30 p-3 rounded-full text-teal-700 dark:text-teal-400"><MapPin size={20} /></div>
              <div><h4 className="font-bold text-stone-900 dark:text-white">Studio</h4><p className="text-stone-500 dark:text-stone-400">Drayton Community Hall<br/>123 Main St, Drayton, ON</p></div>
            </div>
          </div>
          <div className="mt-8 h-64 bg-stone-200 dark:bg-stone-800 rounded-xl flex items-center justify-center text-stone-400 font-bold uppercase tracking-widest">[Google Map Embed Here]</div>
        </div>
        <div className="space-y-8">
          <section>
            <h3 className="text-xl font-bold text-stone-900 dark:text-white mb-3">Cancellation Policy</h3>
            <p className="text-stone-600 dark:text-stone-300 leading-relaxed text-sm">We understand that life happens. However, to be fair to other students and the teacher, please cancel your booking at least <strong>12 hours</strong> in advance. Late cancellations will be charged the full drop-in rate.</p>
          </section>
          <section>
            <h3 className="text-xl font-bold text-stone-900 dark:text-white mb-3">Arrival & Lateness</h3>
            <p className="text-stone-600 dark:text-stone-300 leading-relaxed text-sm">Please arrive at least 5-10 minutes before class starts to settle in. The doors will be locked precisely at the start time to ensure the safety and quiet of the practice space.</p>
          </section>
          <section>
            <h3 className="text-xl font-bold text-stone-900 dark:text-white mb-3">What to Bring</h3>
            <ul className="list-disc list-inside text-stone-600 dark:text-stone-300 text-sm space-y-2">
              <li>Your own yoga mat (hygiene policy).</li>
              <li>A water bottle.</li>
              <li>Comfortable clothing that allows movement.</li>
              <li>Optional: A small towel or blanket for warmth during Savasana.</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Contact;