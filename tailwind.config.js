/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        serif: ['Cinzel', 'serif'],
        sans: ['Lato', 'sans-serif'], // Switched to Lato for a cleaner, friendlier read
      },
      colors: {
        // Custom "Sand" Palette - Replaces standard Stone
        stone: {
          50: '#FDFCF8',  // Creamier white
          100: '#F5F2ED', // Soft beige
          200: '#EBE5DE',
          300: '#D6D1CA',
          400: '#A8A29D',
          500: '#78716C',
          600: '#57534E',
          700: '#44403C',
          800: '#292524',
          900: '#1C1917', // Warm black
          950: '#0C0A09',
        },
        // Custom "Sage" Palette - Replaces standard Teal
        teal: {
          50: '#F2F9F7',
          100: '#E1EFEA',
          200: '#C2DDD5', // Soft Sage
          300: '#9BC3B8',
          400: '#73A599',
          500: '#53887C', // Main Brand Color - Muted, elegant green
          600: '#3F6C62',
          700: '#31544D',
          800: '#28433E',
          900: '#233834',
          950: '#111F1D',
        },
        // Custom "Clay" Palette - Replaces standard Rose
        rose: {
          50: '#FDF7F6',
          100: '#FCEFEF',
          200: '#F6DCD8',
          300: '#ECBDB6',
          400: '#DF968D', // Dusty Clay
          500: '#C86B5E',
          600: '#B34E40',
          700: '#963C30',
          800: '#7D332B',
          900: '#682F29',
        }
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'glow': '0 0 15px rgba(83, 136, 124, 0.3)', // Sage glow
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'breathe': 'breathe 8s ease-in-out infinite',
        'fade-in-up': 'fadeInUp 0.8s ease-out forwards',
        'gradient-x': 'gradient-x 15s ease infinite',
        'spin-slow': 'spin 12s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        breathe: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.9' },
          '50%': { transform: 'scale(1.05)', opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'gradient-x': {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          },
        },
      },
    },
  },
  plugins: [],
}