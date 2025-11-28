import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Activity, Sun, Moon, Menu, X, Instagram, Mail, MapPin, UserCircle, Wind } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const WebsiteLayout = () => {
  const { darkMode, toggleTheme } = useTheme();
  const { currentUser } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Schedule', path: '/schedule' },
    { name: 'Retreats', path: '/retreats' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <div className="min-h-screen font-sans transition-colors duration-500 relative flex flex-col">
      {/* Global Ambient Background Layers */}
      <div className="bg-grain"></div>
      <div className="ambient-bg"></div>
      
      {/* Dynamic Aurora blob for extra mood */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-teal-100/30 dark:bg-teal-900/10 rounded-full blur-[100px] -z-10 animate-float"></div>
      <div className="fixed bottom-0 left-0 w-[600px] h-[600px] bg-rose-100/30 dark:bg-rose-900/10 rounded-full blur-[120px] -z-10 animate-float" style={{ animationDelay: '2s' }}></div>

      <header 
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled 
            ? 'bg-white/80 dark:bg-stone-900/80 backdrop-blur-md shadow-soft border-b border-stone-100/50 dark:border-stone-800/50 py-2' 
            : 'bg-transparent py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-teal-200/50 dark:bg-teal-500/20 rounded-full blur-md group-hover:blur-lg transition-all duration-500"></div>
                <div className="relative bg-white dark:bg-stone-800 text-teal-600 dark:text-teal-400 p-2.5 rounded-full border border-teal-100 dark:border-stone-700 shadow-sm group-hover:scale-105 transition-transform duration-300">
                  <Wind size={20} className="animate-spin-slow" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold font-serif tracking-tight text-stone-900 dark:text-stone-100 leading-none">ZenFlow</span>
                <span className="text-[10px] uppercase tracking-[0.2em] text-stone-500 dark:text-stone-400 mt-0.5">Sanctuary</span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              <div className="flex items-center bg-white/50 dark:bg-stone-800/50 p-1.5 rounded-full border border-stone-200/50 dark:border-stone-700/50 backdrop-blur-sm mr-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 relative overflow-hidden ${
                      location.pathname === link.path 
                        ? 'text-teal-800 dark:text-teal-100 bg-teal-50 dark:bg-teal-900/30 shadow-sm' 
                        : 'text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200 hover:bg-stone-100/50 dark:hover:bg-stone-700/30'
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
              </div>

              {currentUser ? (
                <Link to="/dashboard" className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-stone-600 hover:text-teal-600 dark:text-stone-300 transition-colors">
                  <UserCircle size={20} />
                </Link>
              ) : (
                <Link to="/login" className="px-5 py-2.5 text-sm font-bold text-stone-900 dark:text-white hover:opacity-70 transition-opacity">Log In</Link>
              )}
              
              <div className="w-px h-6 bg-stone-200 dark:bg-stone-700 mx-2"></div>

              <button 
                onClick={toggleTheme} 
                className="p-2.5 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500 dark:text-stone-400 transition-colors group"
                title="Toggle Theme"
              >
                {darkMode ? <Sun size={18} className="group-hover:rotate-45 transition-transform" /> : <Moon size={18} className="group-hover:-rotate-12 transition-transform" />}
              </button>
            </nav>

            {/* Mobile Toggle */}
            <div className="flex items-center gap-4 md:hidden">
               <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300 transition-colors">{darkMode ? <Sun size={20} /> : <Moon size={20} />}</button>
               <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-stone-800 dark:text-stone-100 transition-transform active:scale-90">{isMenuOpen ? <X size={28} /> : <Menu size={28} />}</button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-white/95 dark:bg-stone-900/95 backdrop-blur-xl border-b border-stone-200 dark:border-stone-800 shadow-xl animate-in fade-in-up origin-top">
            <div className="px-6 py-8 space-y-4">
              {navLinks.map((link) => (
                <Link key={link.name} to={link.path} onClick={() => setIsMenuOpen(false)} className="block text-2xl font-serif font-bold text-stone-800 dark:text-stone-100 hover:text-teal-600 dark:hover:text-teal-400 transition-colors">{link.name}</Link>
              ))}
              <div className="h-px bg-stone-100 dark:bg-stone-800 my-4"></div>
              {currentUser ? (
                <Link to="/dashboard" onClick={() => setIsMenuOpen(false)} className="block text-lg font-medium text-stone-600 dark:text-stone-300">Dashboard</Link>
              ) : (
                <Link to="/login" onClick={() => setIsMenuOpen(false)} className="block text-lg font-medium text-stone-600 dark:text-stone-300">Log In</Link>
              )}
              <Link to="/tools/zenflow" onClick={() => setIsMenuOpen(false)} className="block py-3 px-4 mt-4 bg-stone-50 dark:bg-stone-800 rounded-xl text-center text-sm font-bold text-teal-700 dark:text-teal-400 uppercase tracking-widest border border-stone-100 dark:border-stone-700">Teacher Tools</Link>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1 relative z-10"><Outlet /></main>

      <footer className="relative bg-white/60 dark:bg-stone-950/60 backdrop-blur-md border-t border-stone-200/50 dark:border-stone-800/50 pt-16 pb-8 mt-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-stone-900 dark:bg-white text-white dark:text-stone-900 p-2 rounded-lg"><Activity size={20} /></div>
                <span className="text-2xl font-bold font-serif text-stone-900 dark:text-white">ZenFlow</span>
              </div>
              <p className="text-stone-500 dark:text-stone-400 text-lg leading-relaxed max-w-md">
                Creating space for mindful movement, breath, and connection in the heart of Drayton, Ontario.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold text-stone-900 dark:text-white mb-6 uppercase text-xs tracking-widest opacity-80">Explore</h4>
              <ul className="space-y-4 text-stone-500 dark:text-stone-400 font-medium">
                <li><Link to="/schedule" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">Class Schedule</Link></li>
                <li><Link to="/retreats" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">Retreats</Link></li>
                <li><Link to="/tools/zenflow" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">Sequence Builder</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-stone-900 dark:text-white mb-6 uppercase text-xs tracking-widest opacity-80">Visit Us</h4>
              <div className="space-y-4 text-stone-500 dark:text-stone-400">
                <p className="flex items-start gap-3"><MapPin size={18} className="mt-1 shrink-0" /> Drayton Community Hall<br/>123 Main St, Drayton, ON</p>
                <div className="flex gap-4 pt-2">
                  <a href="#" className="w-10 h-10 rounded-full border border-stone-200 dark:border-stone-700 flex items-center justify-center hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"><Instagram size={18} /></a>
                  <a href="mailto:hello@zenflow.com" className="w-10 h-10 rounded-full border border-stone-200 dark:border-stone-700 flex items-center justify-center hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"><Mail size={18} /></a>
                </div>
              </div>
            </div>
          </div>
          
          <div className="pt-8 border-t border-stone-200/50 dark:border-stone-800/50 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-stone-400 dark:text-stone-500 font-medium">
            <p>© {new Date().getFullYear()} ZenFlow Yoga. All rights reserved.</p>
            <p>Designed with intention.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default WebsiteLayout;