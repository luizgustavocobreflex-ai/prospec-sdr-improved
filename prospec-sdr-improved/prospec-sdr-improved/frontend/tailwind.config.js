/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        display: ['Syne', 'sans-serif'],
      },
      colors: {
        cobreflex: {
          900: '#071220',
          800: '#0B1F33',
          700: '#0e2a45',
          600: '#143656',
          500: '#1a4a72',
        },
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0,0,0,0.06), 0 1px 2px -1px rgba(0,0,0,0.04)',
        'card-md': '0 4px 12px -2px rgba(11, 31, 51, 0.08)',
        'card-lg': '0 8px 30px -4px rgba(11, 31, 51, 0.12)',
      },
    },
  },
  plugins: [],
};
