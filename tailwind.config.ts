import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        frost: '#0F1A1E',
        panel: '#16262B',
        panelRaised: '#1D3036',
        ice: '#E7F3F3',
        muted: '#7E97A0',
        mint: '#7FE7C4',
        yolk: '#F4B942',
        coral: '#F2765B',
        sand: '#D9B27C',
        chill: '#8FD3E8',
      },
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        sans: ['var(--font-body)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
