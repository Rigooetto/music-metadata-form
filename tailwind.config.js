/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // NOT 'media'
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
        ibm: ['"IBM Plex Sans"', 'sans-serif'],
      },
      fontSize: {
        huge: ['5rem', '1'],
        tiny: ['0.625rem', '1.25rem'],
      },
    },
  },
  plugins: [],
}