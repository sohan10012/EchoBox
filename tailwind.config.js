/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: {
          dark: '#090909',
          light: '#fbfbfb',
        },
        surface: {
          DEFAULT: '#121212',
          subtle: '#181818',
          hover: '#202020',
          border: 'rgba(255, 255, 255, 0.08)',
        },
        surfaceLight: {
          DEFAULT: '#ffffff',
          subtle: '#f4f4f5',
          hover: '#e4e4e7',
          border: 'rgba(0, 0, 0, 0.08)',
        },
        brand: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        accent: {
          violet: '#8b5cf6',
          indigo: '#6366f1',
          cyan: '#06b6d4',
          emerald: '#10b981',
          rose: '#f43f5e',
          amber: '#f59e0b',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'sans-serif',
        ],
        display: [
          'Plus Jakarta Sans',
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'sans-serif',
        ],
      },
      boxShadow: {
        'glow-sm': '0 0 15px -3px rgba(255, 255, 255, 0.1)',
        'glow': '0 0 30px -5px rgba(255, 255, 255, 0.12)',
        'glow-brand': '0 0 35px -5px rgba(34, 197, 94, 0.25)',
        'card-dark': '0 20px 40px -15px rgba(0, 0, 0, 0.7)',
        'card-light': '0 10px 30px -10px rgba(0, 0, 0, 0.06)',
      },
      backgroundImage: {
        'radial-gradient-dark': 'radial-gradient(circle at 50% 0%, rgba(120, 119, 198, 0.1) 0%, transparent 60%)',
        'radial-spotlight': 'radial-gradient(circle at center, rgba(255, 255, 255, 0.06) 0%, transparent 70%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out forwards',
        'pulse-subtle': 'pulseSubtle 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
      },
    },
  },
  plugins: [],
};

