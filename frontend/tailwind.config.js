/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        practo: {
          blue: '#14bef0',
          'blue-dark': '#0ea5d3',
          'blue-light': '#e8f8fd',
          navy: '#1a1a2e',
          'navy-light': '#2d2d44',
          orange: '#ff7043',
          green: '#01a400',
          'green-light': '#e8f5e9',
          gray: '#787887',
          'gray-light': '#f0f0f5',
          'gray-bg': '#f5f7fa',
          white: '#ffffff',
        }
      },
      boxShadow: {
        'card': '0 2px 8px rgba(0,0,0,0.08)',
        'card-hover': '0 4px 16px rgba(0,0,0,0.12)',
        'nav': '0 2px 4px rgba(0,0,0,0.06)',
        'button': '0 2px 8px rgba(20,190,240,0.3)',
      }
    },
  },
  plugins: [],
};
