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
        canvas: '#07090E',
        card: '#0D121F',
        cardBorder: '#1A2235',
        cardHover: '#161F33',
        indigoBrand: {
          DEFAULT: '#4F46E5',
          dark: '#3730A3',
          light: '#6366F1',
          glow: 'rgba(99, 102, 241, 0.25)',
        },
        cyanSpark: {
          DEFAULT: '#06B6D4',
          dark: '#0891B2',
          light: '#22D3EE',
          glow: 'rgba(6, 182, 212, 0.25)',
        },
        emeraldVerified: '#10B981',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'glass-sm': '0 0 0 1px rgba(255, 255, 255, 0.08), 0 2px 4px rgba(0, 0, 0, 0.4)',
        'glass-md': '0 0 0 1px rgba(255, 255, 255, 0.08), 0 8px 24px -4px rgba(0, 0, 0, 0.6), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)',
        'glass-lg': '0 0 0 1px rgba(255, 255, 255, 0.1), 0 20px 40px -8px rgba(0, 0, 0, 0.8), inset 0 1px 1px 0 rgba(255, 255, 255, 0.15)',
        'glow-indigo': '0 0 35px -5px rgba(79, 70, 229, 0.35)',
        'glow-cyan': '0 0 35px -5px rgba(6, 182, 212, 0.35)',
      },
      animation: {
        'pulse-subtle': 'pulse 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'waveform': 'wave 1.2s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
        'radar': 'radar 3s ease-out infinite',
      },
      keyframes: {
        wave: {
          '0%, 100%': { height: '15%' },
          '50%': { height: '95%' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        radar: {
          '0%': { transform: 'scale(0.95)', opacity: '0.8' },
          '100%': { transform: 'scale(1.8)', opacity: '0' },
        }
      }
    },
  },
  plugins: [],
};
