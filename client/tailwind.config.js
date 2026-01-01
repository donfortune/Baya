/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        // Old animations
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-red': 'pulseRed 2s infinite',
        
        // NEW Magical Landing Page animations
        'marquee': 'marquee 25s linear infinite',
        'float-up': 'floatUp 2s ease-out forwards',
      },
      keyframes: {
        // Old keyframes
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseRed: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(239, 68, 68, 0.7)' },
          '70%': { boxShadow: '0 0 0 10px rgba(239, 68, 68, 0)' },
        },
        
        // NEW Keyframes
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        floatUp: {
          '0%': { transform: 'translateY(0) scale(0.5)', opacity: '0' },
          '10%': { opacity: '1', transform: 'translateY(-20px) scale(1.2)' },
          '100%': { transform: 'translateY(-400px) scale(1)', opacity: '0' },
        }
      }
    },
  },
  plugins: [],
}