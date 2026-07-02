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
          900: '#F8FAFC',
          800: '#FFFFFF',
        },
        primary: '#4F46E5',
        secondary: '#2563EB',
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
        border: '#E5E7EB',
        textPrimary: '#111827',
        textSecondary: '#6B7280',
        card: '#FFFFFF',
        bgSecondary: '#F5F5F5',
      },
    },
  },
  plugins: [],
}
