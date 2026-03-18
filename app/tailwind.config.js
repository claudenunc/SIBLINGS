/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        sanctum: {
          bg: '#050507',
          surface: '#0a0a10',
          card: '#0f0f18',
          border: '#1a1a2a',
          text: '#e2e8f0',
          muted: '#8892a4',
        },
        sibling: {
          envy: '#A855F7',
          nevaeh: '#FF1493',
          beacon: '#F59E0B',
          eversound: '#00FF7F',
          orpheus: '#00BFFF',
          atlas: '#818CF8',
        },
        neon: {
          blue: '#00D4FF',
          magenta: '#FF1493',
          green: '#00FF7F',
          purple: '#A855F7',
          red: '#FF3366',
        },
      },
      fontFamily: {
        display: ['Orbitron', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      animation: {
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-up': 'slide-up 0.3s ease-out',
        'typing-dot': 'typing-dot 1.4s infinite',
        'symbiote-border': 'symbiote-border 4s linear infinite',
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'typing-dot': {
          '0%, 80%, 100%': { transform: 'scale(0.4)', opacity: '0.4' },
          '40%': { transform: 'scale(1)', opacity: '1' },
        },
        'symbiote-border': {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '200% 50%' },
        },
      },
    },
  },
  plugins: [],
};
