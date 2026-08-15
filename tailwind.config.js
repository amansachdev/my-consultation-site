import tokens from './src/design-system/tokens.js';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ...tokens.colors,
        // Legacy aliases kept for the existing landing page.
        ink: '#20201d',
        moss: '#596a5a',
        sage: '#e8eee4',
        clay: '#c4745c',
        mist: '#f6f7f3',
        line: '#dfe3da',
      },
      boxShadow: {
        soft: '0 18px 45px rgba(32, 32, 29, 0.12)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};
