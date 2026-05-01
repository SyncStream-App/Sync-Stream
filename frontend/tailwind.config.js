/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          purple: '#7C3AED',
          'purple-dark': '#4C1D95',
          'purple-light': '#EDE9FE',
          pink: '#EC4899',
          teal: '#0D9488',
          dark: '#1E1B2E',
          darker: '#12101E',
          text: '#F9FAFB',
          muted: '#9CA3AF',
          border: 'rgba(255,255,255,0.1)',
        },
      },
    },
  },
  plugins: [],
}