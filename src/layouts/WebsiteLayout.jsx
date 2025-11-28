import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Sun, Moon, Menu, X, Instagram, Mail, MapPin, UserCircle } from 'lucide-react';
import LogoMark from '../components/LogoMark';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const WebsiteLayout = () => {
  const { darkMode, toggleTheme } = useTheme();
  const { currentUser, isAdmin } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

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
      <div className="bg-grain"></div>
      <div className="ambient-bg"></div>

      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-teal-100/30 dark:bg-teal-900/10 rounded-full blur-[100px] -z-10 animate-float"></div>
      <div className="fixed bottom-0 left-0 w-[600px] h-[600px] bg-rose-100/30 dark:bg-rose-900/10 rounded-full blur-[120px] -z-10 animate-float" style={{ animationDelay: '2s' }}></div>

      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-[color-mix(in_srgb,var(--color-card)95%,transparent)] dark:bg-[color-mix(in_srgb,var(--color-card)92%,transparent)] backdrop-blur-md shadow-soft border-b border-[color-mix(in_srgb,var(--color-text)12%,transparent)] py-2'
            : 'bg-transparent py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <Link to="/" className="flex items-center gap-3 group">
              <LogoMark size={52} className="group-hover:scale-[1.02] transition-transform duration-300" />
              <div className="flex flex-col">
                <span className="text-xl font-bold font-serif tracking-tight text-[var(--color-text)] leading-none">ZenFlow</span>
                <span className="text-[10px] uppercase tracking-[0.2em] theme-muted mt-0.5">Sanctuary</span>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              <div className="flex items-center bg-[color-mix(in_srgb,var(--color-card)85%,transparent)] dark:bg-[color-mix(in_srgb,var(--color-card)80%,transparent)] p-1.5 rounded-full border border-[color-mix(in_srgb,var(--color-text)10%,transparent)] backdrop-blur-sm mr-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 relative overflow-hidden${
                      location.pathname === link.path
                        ? ' text-[var(--color-text)] bg-[var(--color-primary)]/20 shadow-sm'
                        : ' theme-muted hover:text-[var(--color-text)] hover:bg-[color-mix(in_srgb,var(--color-card)92%,transparent)]'
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
              </div>

              {currentUser ? (
                <div className="flex items-center gap-2">
                  {isAdmin && (
                    <Link to="/admin" className="px-4 py-2 rounded-full text-sm font-bold text-[var(--color-primary)] bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20">Admin</Link>
                  )}
                  <Link to="/dashboard" className="flex items-center gap-2 px-4 py-2 text-sm font-bold theme-muted hover:text-[var(--color-primary)] transition-colors">
                    <UserCircle size={20} />
                  </Link>
                </div>
              ) : (
                <Link to="/login" className="px-5 py-2.5 text-sm font-bold text-[var(--color-text)] hover:opacity-70 transition-opacity">Log In</Link>
              )}

              <div className="w-px h-6 bg-[color-mix(in_srgb,var(--color-text)12%,transparent)] mx-2"></div>

              <button
                onClick={toggleTheme}
                className="p-2.5 rounded-full hover:bg-[color-mix(in_srgb,var(--color-card)92%,transparent)] text-[color-mix(in_srgb,var(--color-muted)95%,transparent)] transition-colors group"
                title="Toggle Theme"
              >
                {darkMode ? <Sun size={18} className="group-hover:rotate-45 transition-transform" /> : <Moon size={18} className="group-hover:-rotate-12 transition-transform" />}
              </button>
            </nav>

            <div className="flex items-center gap-4 md:hidden">
              <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-[color-mix(in_srgb,var(--color-card)92%,transparent)] text-[color-mix(in_srgb,var(--color-muted)95%,transparent)] transition-colors">{darkMode ? <Sun size={20} /> : <Moon size={20} />}</button>
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-[var(--color-text)] transition-transform active:scale-90">{isMenuOpen ? <X size={28} /> : <Menu size={28} />}</button>
            </div>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-[color-mix(in_srgb,var(--color-card)95%,transparent)] backdrop-blur-xl border-b border-[color-mix(in_srgb,var(--color-text)10%,transparent)] shadow-xl animate-in fade-in-up origin-top">
            <div className="px-6 py-8 space-y-4">
              {navLinks.map((link) => (
                <Link key={link.name} to={link.path} onClick={() => setIsMenuOpen(false)} className="block text-2xl font-serif font-bold text-[var(--color-text)] hover:text-[var(--color-primary)] transition-colors">{link.name}</Link>
              ))}
              <div className="h-px bg-[color-mix(in_srgb,var(--color-text)10%,transparent)] my-4"></div>
              {currentUser ? (
                <Link to="/dashboard" onClick={() => setIsMenuOpen(false)} className="block text-lg font-medium theme-muted hover:text-[var(--color-text)]">Dashboard</Link>
              ) : (
                <Link to="/login" onClick={() => setIsMenuOpen(false)} className="block text-lg font-medium theme-muted hover:text-[var(--color-text)]">Log In</Link>
              )}
              {isAdmin && (
                <>
                  <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="block py-3 px-4 mt-4 bg-[color-mix(in_srgb,var(--color-card)92%,transparent)] rounded-xl text-center text-sm font-bold text-[var(--color-primary)] uppercase tracking-widest border border-[color-mix(in_srgb,var(--color-text)12%,transparent)]">Admin Panel</Link>
                  <Link to="/tools/zenflow" onClick={() => setIsMenuOpen(false)} className="block py-3 px-4 mt-2 bg-[color-mix(in_srgb,var(--color-card)92%,transparent)] rounded-xl text-center text-sm font-bold text-[var(--color-primary)] uppercase tracking-widest border border-[color-mix(in_srgb,var(--color-text)12%,transparent)]">Teacher Tools</Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="flex-1 relative z-10"><Outlet /></main>

      <footer className="relative bg-[color-mix(in_srgb,var(--color-surface)90%,transparent)] backdrop-blur-md border-t border-[color-mix(in_srgb,var(--color-text)10%,transparent)] pt-16 pb-8 mt-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <LogoMark size={48} />
                <span className="text-2xl font-bold font-serif text-[var(--color-text)]">ZenFlow</span>
              </div>
              <p className="theme-muted text-lg leading-relaxed max-w-md">
                Creating space for mindful movement, breath, and connection in the heart of Drayton, Ontario.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-[var(--color-text)] mb-6 uppercase text-xs tracking-widest opacity-80">Explore</h4>
              <ul className="space-y-4 theme-muted font-medium">
                <li><Link to="/schedule" className="hover:text-[var(--color-primary)] transition-colors">Class Schedule</Link></li>
                <li><Link to="/retreats" className="hover:text-[var(--color-primary)] transition-colors">Retreats</Link></li>
                {isAdmin && (
                  <li><Link to="/tools/zenflow" className="hover:text-[var(--color-primary)] transition-colors">Sequence Builder</Link></li>
                )}
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-[var(--color-text)] mb-6 uppercase text-xs tracking-widest opacity-80">Visit Us</h4>
              <div className="space-y-4 theme-muted">
                <p className="flex items-start gap-3"><MapPin size={18} className="mt-1 shrink-0" /> Drayton Community Hall<br/>123 Main St, Drayton, ON</p>
                <div className="flex gap-4 pt-2">
                  <a href="#" className="w-10 h-10 rounded-full border border-[color-mix(in_srgb,var(--color-text)12%,transparent)] flex items-center justify-center hover:bg-[color-mix(in_srgb,var(--color-card)92%,transparent)] transition-colors"><Instagram size={18} /></a>
                  <a href="mailto:hello@zenflow.com" className="w-10 h-10 rounded-full border border-[color-mix(in_srgb,var(--color-text)12%,transparent)] flex items-center justify-center hover:bg-[color-mix(in_srgb,var(--color-card)92%,transparent)] transition-colors"><Mail size={18} /></a>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-[color-mix(in_srgb,var(--color-text)10%,transparent)] flex flex-col md:flex-row justify-between items-center gap-4 text-xs theme-muted font-medium">
            <p>© {new Date().getFullYear()} ZenFlow Yoga. All rights reserved.</p>
            <p>Designed with intention.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default WebsiteLayout;
