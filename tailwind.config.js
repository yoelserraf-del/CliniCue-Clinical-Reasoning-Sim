/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'medical-green': '#00ff41',
        'medical-red': '#ff0040',
        'medical-yellow': '#ffaa00',
        'medical-blue': '#0094ff',
      },
      animation: {
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ecg-line': 'ecgLine 1.5s ease-in-out infinite',
      },
      keyframes: {
        ecgLine: {
          '0%, 100%': { transform: 'translateX(0) scaleY(1)' },
          '25%': { transform: 'translateX(25%) scaleY(1.5)' },
          '50%': { transform: 'translateX(50%) scaleY(0.8)' },
          '75%': { transform: 'translateX(75%) scaleY(1.2)' },
        }
      }
    },
  },
  plugins: [],
}
