/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'jarvis-bg': '#0a0a0a',
        'jarvis-card': '#141414',
        'jarvis-border': '#1a1a1a',
        'jarvis-amber': '#f59e0b',
        'jarvis-orange': '#ea580c',
        'jarvis-dim': '#1a1a1a',
      },
      fontFamily: {
        display: ['Orbitron', 'sans-serif'],
        body: ['Rajdhani', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};
