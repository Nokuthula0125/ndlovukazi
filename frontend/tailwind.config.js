/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        emerald: {
          DEFAULT: '#0F766E',
          light:   '#14B8A6',
          dark:    '#0a5450',
          50:      '#F0FDFA',
          100:     '#CCFBF1',
          500:     '#0F766E',
          600:     '#0a5450',
        },
        teal: {
          DEFAULT: '#14B8A6',
          bright:  '#2DD4BF',
          electric:'#4ADE80',
        },
        gold: {
          DEFAULT: '#D4AF37',
          light:   '#e8c84a',
          pale:    '#f5e9a0',
        },
        brand: {
          black: '#040D0C',
          soft:  '#071412',
        },
      },
      fontFamily: {
        sans:    ['Plus Jakarta Sans', 'sans-serif'],
        serif:   ['Fraunces', 'serif'],
        display: ['Fraunces', 'serif'],
      },
      backgroundImage: {
        'teal-gradient':  'linear-gradient(135deg, #0F766E 0%, #14B8A6 50%, #2DD4BF 100%)',
        'ombre-gradient': 'linear-gradient(135deg, #2DD4BF 0%, #4ADE80 50%, #D4AF37 100%)',
        'hero-glow':      'radial-gradient(ellipse at 50% 0%, rgba(20,184,166,0.2) 0%, transparent 65%)',
        'card-glow':      'radial-gradient(ellipse at 50% 0%, rgba(20,184,166,0.08) 0%, transparent 70%)',
      },
      animation: {
        'fade-up':    'fadeUp 0.5s ease both',
        'fade-in':    'fadeIn 0.4s ease both',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'shimmer':    'shimmer 2.5s linear infinite',
      },
      keyframes: {
        fadeUp:  { from: { opacity: 0, transform: 'translateY(20px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        fadeIn:  { from: { opacity: 0 }, to: { opacity: 1 } },
        shimmer: { from: { backgroundPosition: '200% center' }, to: { backgroundPosition: '-200% center' } },
      },
    },
  },
  plugins: [],
}
