/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable dark mode with 'dark' class
  theme: {
    extend: {
      // Define custom colors if used
      colors: {
        'brand-pink': '#FF2D55',
        'brand-purple': '#5856D6',
      },
    },
  },
  plugins: [],
}