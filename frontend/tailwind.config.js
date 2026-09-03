/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#f2fbf6',
          100: '#e1f7ea',
          200: '#c5eed7',
          300: '#97debb',
          400: '#61c59a',
          500: '#3ba97d',
          600: '#2b8863',
          700: '#246d50',
          800: '#1f5641',
          900: '#1a4737',
          950: '#0c271e',
        },
        carbon: {
          800: '#1e262f',
          850: '#161d25',
          900: '#10161d',
          950: '#0b0f14',
        },
      },
    },
  },
  plugins: [],
};
