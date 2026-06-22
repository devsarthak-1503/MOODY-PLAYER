/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBg: "#0B0F14",
        darkSurface: "#121821",
        darkCard: "#171F2B",
        primaryAccent: "#00E5FF",
        secondaryAccent: "#1DB954",
        textPrimary: "#FFFFFF",
        textSecondary: "#A0AEC0"
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'premium': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'accent-glow': '0 0 15px rgba(0, 229, 255, 0.4)',
        'spotify-glow': '0 0 15px rgba(29, 185, 84, 0.4)'
      }
    },
  },
  plugins: [],
}
