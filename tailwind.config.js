/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './_includes/**/*.{html,js}',
    './_layouts/**/*.{html,js}',
    './*.{html,js}',
    './pages/**/*.{html,js,md}',
    './posts/**/*.{html,js,md}'
  ],
  theme: {
    extend: {
      colors: {
        'glass': {
          DEFAULT: 'rgba(255, 255, 255, 0.1)',
          dark: 'rgba(0, 0, 0, 0.1)',
        },
        'glass-border': {
          DEFAULT: 'rgba(255, 255, 255, 0.2)',
          dark: 'rgba(0, 0, 0, 0.2)',
        }
      },
      backdropBlur: {
        'xs': '2px',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
} 