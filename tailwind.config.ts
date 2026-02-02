import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Jarvis Color System
        bg: {
          primary: '#0A0A0F',
          surface: '#111118',
          elevated: '#1A1A24',
        },
        border: {
          subtle: '#1A2A3A',
          glow: '#00D4FF',
        },
        primary: {
          DEFAULT: '#00D4FF', // Cyan - main accent
          dark: '#0099CC',
          light: '#00FFE0',
        },
        accent: '#00FFE0', // Turquoise
        warning: '#FFB800', // Amber
        error: '#FF3366', // Red-pink
        success: '#00FF88', // Green
        text: {
          primary: '#E0E8F0',
          secondary: '#6B7B8D',
          muted: '#3D4A5C',
        },
      },
      fontFamily: {
        display: ['Rajdhani', 'sans-serif'],
        code: ['"JetBrains Mono"', 'monospace'],
        body: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        glow: {
          sm: '0 0 5px rgba(0, 212, 255, 0.3)',
          DEFAULT: '0 0 15px rgba(0, 212, 255, 0.3)',
          md: '0 0 15px rgba(0, 212, 255, 0.3)',
          lg: '0 0 30px rgba(0, 212, 255, 0.4)',
        },
      },
      textShadow: {
        glow: '0 0 10px rgba(0, 212, 255, 0.5)',
      },
      borderRadius: {
        panel: '8px',
        card: '6px',
        input: '4px',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'scan-line': 'scan-line 3s linear infinite',
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-up': 'slide-up 0.3s ease-out',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': {
            opacity: '1',
            boxShadow: '0 0 15px rgba(0, 212, 255, 0.3)',
          },
          '50%': {
            opacity: '0.7',
            boxShadow: '0 0 30px rgba(0, 212, 255, 0.5)',
          },
        },
        'scan-line': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'slide-up': {
          from: {
            opacity: '0',
            transform: 'translateY(10px)',
          },
          to: {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
