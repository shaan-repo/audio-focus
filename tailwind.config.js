/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    'text-white', 'text-9xl', 'bg-gradient-to-br', 'from-purple-900', 'to-purple-800',
    'rounded-2xl', 'backdrop-blur-xl', 'border', 'border-opacity-10',
    'bg-opacity-5', 'hover:scale-105', 'text-center', 'tracking-wider'
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
