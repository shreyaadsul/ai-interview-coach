/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          900: '#0B1120',
          800: '#111827',
        },
        primary: '#7C3AED',
        secondary: '#3B82F6',
        success: '#22C55E',
      },
    },
  },
  plugins: [],
}
