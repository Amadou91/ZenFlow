import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Activity, Sun, Moon, Menu, X, Github, Twitter } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useState } from 'react';

const WebsiteLayout = () => {
  const { darkMode, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Classes', path: '/classes' }, // Placeholder for future expansion
  ];

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-900 text-stone-800 dark:text-stone-100 font-sans transition-colors duration-300 flex flex-col">
      {/* Navigation */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-stone-900/80 backdrop-blur-md border-b border-stone-200 dark:border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="bg-teal-600 text-white p-1.5 rounded-lg group-hover:bg-teal-700 transition-colors">
                <Activity size={20} />
              </div>
              <span className="text-xl font-bold font-serif tracking-tight text-stone-900 dark:text-white">
                ZenFlow
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`text-sm font-bold tracking-wide transition-colors ${
                    location.pathname === link.path
                      ? 'text-teal-600 dark:text-teal-400'
                      : 'text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <div className="w-px h-4 bg-stone-300 dark:bg-stone-700"></div>
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500 dark:text-stone-400 transition-colors"
              >
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <Link
                to="/app"
                className="bg-stone-900 dark:bg-white text-white dark:text-stone-900 px-5 py-2 rounded-full text-sm font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
              >
                Launch App
              </Link>
            </nav>

            {/* Mobile Menu Button */}
            <div className="flex items-center gap-4 md:hidden">
               <button
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500 dark:text-stone-400 transition-colors"
              >
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 text-stone-600 dark:text-stone-300"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav Dropdown */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 absolute w-full">
            <div className="px-4 pt-2 pb-6 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-3 py-3 rounded-md text-base font-bold text-stone-700 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800"
                >
                  {link.name}
                </Link>
              ))}
              <div className="pt-4">
                <Link
                  to="/app"
                  onClick={() => setIsMenuOpen(false)}
                  className="block w-full text-center bg-teal-600 text-white px-5 py-3 rounded-xl font-bold shadow-md"
                >
                  Launch App
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-stone-950 border-t border-stone-200 dark:border-stone-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="text-teal-600" size={24} />
                <span className="text-xl font-bold font-serif text-stone-900 dark:text-white">ZenFlow</span>
              </div>
              <p className="text-stone-500 dark:text-stone-400 max-w-sm mb-6 leading-relaxed">
                A mindful approach to yoga sequencing. Create, customize, and flow with integrated music and timing.
              </p>
              <div className="flex gap-4">
                <a href="#" className="p-2 bg-stone-100 dark:bg-stone-900 rounded-full text-stone-600 hover:text-teal-600 transition-colors"><Twitter size={18} /></a>
                <a href="#" className="p-2 bg-stone-100 dark:bg-stone-900 rounded-full text-stone-600 hover:text-teal-600 transition-colors"><Github size={18} /></a>
              </div>
            </div>
            <div>
              <h4 className="font-serif font-bold text-stone-900 dark:text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-stone-500 dark:text-stone-400">
                <li><Link to="/app" className="hover:text-teal-600">Sequence Builder</Link></li>
                <li><Link to="/classes" className="hover:text-teal-600">Live Classes</Link></li>
                <li><Link to="/about" className="hover:text-teal-600">Methodology</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-serif font-bold text-stone-900 dark:text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-stone-500 dark:text-stone-400">
                <li><a href="#" className="hover:text-teal-600">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-teal-600">Terms of Service</a></li>
                <li><a href="#" className="hover:text-teal-600">Cookie Settings</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-stone-100 dark:border-stone-900 text-center text-sm text-stone-400">
            © {new Date().getFullYear()} ZenFlow. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default WebsiteLayout;