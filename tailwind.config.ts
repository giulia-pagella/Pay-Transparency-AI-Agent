import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: '#0c1c3d',
        blue: '#0072bc',
        warn: '#f0b429',
      },
    },
  },
  plugins: [],
};

export default config;
