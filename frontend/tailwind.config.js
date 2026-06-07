/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        emerald: {
          DEFAULT: '#046A38',
          light:   '#057a42',
          dark:    '#034d29',
          50:      '#f0fdf6',
          100:     '#dcfce9',
          500:     '#046A38',
          600:     '#034d29',
        },
        gold: {
          DEFAULT: '#D4AF37',
          light:   '#e8c84a',
          pale:    '#f5e9a0',
        },
        brand: {
          black: '#111111',
          soft:  '#1a1a1a',
        },
      },
      fontFamily: {
        sans:  ['DM Sans', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
        display: ['Cormorant Garamond', 'serif'],
      },
      animation: {
        'fade-up': 'fadeUp 0.5s ease both',
        'fade-in': 'fadeIn 0.4s ease both',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
      keyframes: {
        fadeUp:  { from: { opacity: 0, transform: 'translateY(20px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        fadeIn:  { from: { opacity: 0 }, to: { opacity: 1 } },
      },
    },
  },
  plugins: [],
}
