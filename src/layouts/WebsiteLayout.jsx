import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Activity, Sun, Moon, Menu, X, Instagram, Mail, MapPin, UserCircle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const WebsiteLayout = () => {
  const { darkMode, toggleTheme } = useTheme();
  const { currentUser } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Schedule', path: '/schedule' },
    { name: 'Retreats', path: '/retreats' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-900 text-stone-800 dark:text-stone-100 font-sans transition-colors duration-300 flex flex-col">
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-stone-900/80 backdrop-blur-md border-b border-stone-200 dark:border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="bg-teal-600 text-white p-2 rounded-xl group-hover:bg-teal-700 transition-colors shadow-sm">
                <Activity size={22} />
              </div>
              <div>
                <span className="block text-lg font-bold font-serif tracking-tight text-stone-900 dark:text-white leading-none">Jocelyn Yoga</span>
                <span className="text-[10px] uppercase tracking-widest text-teal-600 dark:text-teal-400 font-bold">Drayton, ON</span>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`text-sm font-bold tracking-wide transition-colors ${location.pathname === link.path ? 'text-teal-600 dark:text-teal-400' : 'text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100'}`}
                >
                  {link.name}
                </Link>
              ))}
              <div className="w-px h-6 bg-stone-200 dark:bg-stone-800"></div>
              {currentUser ? (
                <Link to="/dashboard" className="flex items-center gap-2 text-sm font-bold text-stone-600 hover:text-teal-600 dark:text-stone-300">
                  <UserCircle size={20} /> Dashboard
                </Link>
              ) : (
                <Link to="/login" className="text-sm font-bold text-stone-600 hover:text-teal-600 dark:text-stone-300">Log In</Link>
              )}
              <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500 dark:text-stone-400 transition-colors">
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            </nav>

            <div className="flex items-center gap-4 md:hidden">
               <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500 dark:text-stone-400 transition-colors">{darkMode ? <Sun size={18} /> : <Moon size={18} />}</button>
               <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-stone-600 dark:text-stone-300">{isMenuOpen ? <X size={24} /> : <Menu size={24} />}</button>
            </div>
          </div>
        </div>
        {isMenuOpen && (
          <div className="md:hidden border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 absolute w-full shadow-xl h-screen">
            <div className="px-4 pt-2 pb-6 space-y-1">
              {navLinks.map((link) => (
                <Link key={link.name} to={link.path} onClick={() => setIsMenuOpen(false)} className="block px-3 py-4 rounded-md text-lg font-serif font-bold text-stone-700 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800 border-b border-stone-100 dark:border-stone-800">{link.name}</Link>
              ))}
              {currentUser ? (
                <Link to="/dashboard" onClick={() => setIsMenuOpen(false)} className="block px-3 py-4 text-sm font-bold text-teal-600">Dashboard</Link>
              ) : (
                <Link to="/login" onClick={() => setIsMenuOpen(false)} className="block px-3 py-4 text-sm font-bold text-teal-600">Log In</Link>
              )}
              <Link to="/tools/zenflow" onClick={() => setIsMenuOpen(false)} className="block px-3 py-4 text-sm font-bold text-stone-400 uppercase tracking-widest mt-4">Teacher Tools</Link>
            </div>
          </div>
        )}
      </header>
      <main className="flex-1"><Outlet /></main>
      <footer className="bg-stone-100 dark:bg-stone-950 border-t border-stone-200 dark:border-stone-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <div className="flex items-center gap-2 mb-4"><Activity className="text-teal-600" size={20} /><span className="text-lg font-bold font-serif text-stone-900 dark:text-white">Jocelyn Yoga</span></div>
              <p className="text-stone-500 dark:text-stone-400 text-sm leading-relaxed mb-6">Creating space for mindful movement and connection in Drayton, Ontario.</p>
              <div className="flex gap-4">
                <a href="#" className="p-2 bg-white dark:bg-stone-900 rounded-full text-stone-600 hover:text-teal-600 shadow-sm transition-colors"><Instagram size={18} /></a>
                <a href="mailto:hello@jocelynyoga.com" className="p-2 bg-white dark:bg-stone-900 rounded-full text-stone-600 hover:text-teal-600 shadow-sm transition-colors"><Mail size={18} /></a>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-stone-900 dark:text-white mb-4 uppercase text-xs tracking-widest">Navigation</h4>
              <ul className="space-y-3 text-sm text-stone-500 dark:text-stone-400">
                <li><Link to="/" className="hover:text-teal-600">Home</Link></li>
                <li><Link to="/schedule" className="hover:text-teal-600">Schedule & Booking</Link></li>
                <li><Link to="/retreats" className="hover:text-teal-600">Retreats</Link></li>
                <li><Link to="/contact" className="hover:text-teal-600">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-stone-900 dark:text-white mb-4 uppercase text-xs tracking-widest">Location</h4>
              <div className="flex items-start gap-3 text-sm text-stone-500 dark:text-stone-400"><MapPin size={18} className="mt-0.5 text-teal-600 shrink-0" /><p>Drayton Community Hall<br/>123 Main Street<br/>Drayton, ON N0G 1P0</p></div>
            </div>
          </div>
          <div className="pt-8 mt-12 border-t border-stone-200 dark:border-stone-800 text-center text-xs text-stone-400">© {new Date().getFullYear()} Jocelyn Yoga. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
};

export default WebsiteLayout;