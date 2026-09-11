/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        sys: {
          bg: '#08090c',
          card: '#0e1117',
          surface: '#131822',
          border: 'rgba(56, 189, 248, 0.15)',
          borderHover: 'rgba(56, 189, 248, 0.4)',
          terminal: '#0c1017',
          green: '#00ff9d',
          'green-dim': '#059669',
          cyan: '#00f0ff',
          blue: '#0284c7',
          amber: '#f59e0b',
          red: '#ef4444',
          muted: '#64748b',
          text: '#e2e8f0',
          dim: '#94a3b8'
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'ui-monospace', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scanline': 'scanline 8s linear infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' }
        },
        glow: {
          '0%': { opacity: '0.4', filter: 'drop-shadow(0 0 4px rgba(0, 240, 255, 0.4))' },
          '100%': { opacity: '0.9', filter: 'drop-shadow(0 0 12px rgba(0, 240, 255, 0.8))' }
        }
      }
    },
  },
  plugins: [],
}
