/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBg: '#0f172a', // Deep slate for our premium dark mode
        neonCyan: '#06b6d4' // Accent color
      }
    },
  },
  plugins: [],
}