/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          ink: '#051F20',
          deep: '#0B2B26',
          plum: '#163832',
          pink: '#235347',
          rose: '#8EB69B',
          blush: '#DAF1DE',
        },
        health: {
          50: '#DAF1DE',
          100: '#8EB69B',
          200: '#8EB69B',
          300: '#235347',
          400: '#235347',
          500: '#235347',
          600: '#163832',
          700: '#163832',
          800: '#0B2B26',
          900: '#0B2B26',
          950: '#051F20',
          primary: '#235347',
          secondary: '#0B2B26',
          accent: '#8EB69B',
          lightBg: '#DAF1DE',
          lightText: '#163832',
        },
        // pharmacy-* alias for shared UI components (Button, Card, Table)
        pharmacy: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#16a34a',
          600: '#15803d',
          700: '#166534',
          800: '#14532d',
          900: '#052e16',
        },
      },
      fontFamily: {
        serif: ['Merriweather', 'Georgia', 'serif'],
        sans: ['"Source Sans 3"', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

