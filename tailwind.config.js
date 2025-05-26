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
        },
        'stripe': {
          DEFAULT: '#635BFF',
          bg: '#635BFF'
        },
        'shopify': {
          DEFAULT: '#96BF47',
          bg: '#96BF47'
        },
        'charged': {
          DEFAULT: '#0070F3',
          bg: '#0070F3'
        },
        'vanmoof': {
          DEFAULT: '#0066FF',
          bg: '#0066FF'
        },
        'tnw': {
          DEFAULT: '#E31E3C',
          bg: '#E31E3C'
        },
        'xero': {
          DEFAULT: '#13B5EA',
          bg: '#13B5EA'
        }
      },
      backdropBlur: {
        'xs': '2px',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms')
  ],
} 