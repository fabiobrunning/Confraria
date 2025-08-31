/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#fffbeb',
          100: '#fef7d3',
          200: '#fdeaa7',
          300: '#fbdd7b',
          400: '#f9d04f',
          500: '#edc967',
          600: '#d2ac47',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        }
      }
    },
  },
  plugins: [],
};
