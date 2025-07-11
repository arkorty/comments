/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        error: {
          DEFAULT: '#dc2626', // red-600
        },
        accent: {
          DEFAULT: '#6b7280', // gray-500
        },
      },
    },
  },
  plugins: [],
} 