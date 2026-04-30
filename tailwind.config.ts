import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'ntt-navy':        '#070F26',
        'ntt-blue':        '#0072BC',
        'ntt-blue-light':  '#19A3FC',
        'ntt-blue-dark':   '#005B96',
        'ntt-green':       '#00CB5D',
        'ntt-green-dark':  '#068941',
        'ntt-yellow':      '#FFC400',
        'ntt-orange':      '#E42600',
        'ntt-orange-dark': '#B22000',
        'ntt-gray-50':     '#E8E8E8',
        'ntt-gray-100':    '#949494',
        'ntt-text-gray':   '#2E404D',
        navy: '#070F26',
        blue: '#0072BC',
        warn: '#FFC400',
      },
      fontFamily: {
        sans:  ['Noto Sans', 'Arial', 'system-ui', 'sans-serif'],
        serif: ['Noto Serif', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};

export default config;
