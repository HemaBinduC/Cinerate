/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'Inter', 'sans-serif'],
      },
      colors: {
        ink: {
          950: '#0a0a0f',
          900: '#0f1018',
          850: '#141622',
          800: '#1a1d2b',
          700: '#262a3d',
          600: '#3a3f57',
        },
        gold: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
        },
        accent: {
          500: '#ef4444',
          600: '#dc2626',
        },
      },
      boxShadow: {
        glow: '0 0 40px -10px rgba(245, 158, 11, 0.35)',
        card: '0 10px 30px -12px rgba(0, 0, 0, 0.7)',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        grow: {
          '0%': { transform: 'scaleY(0)' },
          '100%': { transform: 'scaleY(1)' },
        },
      },
      animation: {
        'fade-up': 'fadeUp 0.5s ease-out both',
        'fade-in': 'fadeIn 0.4s ease-out both',
        grow: 'grow 0.7s ease-out both',
      },
    },
  },
  plugins: [],
};
