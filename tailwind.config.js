/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FDF8F3',
          100: '#F9F0E6',
          200: '#F2E0CC',
          300: '#E8C9A8',
          400: '#D4A574',
          500: '#C48B52',
        },
        terracotta: {
          50: '#FDF4F1',
          100: '#FCE8E1',
          200: '#F9D0C3',
          300: '#F3B09A',
          400: '#E88A6B',
          500: '#D4694A',
          600: '#B8503A',
          700: '#984032',
          800: '#7C372C',
          900: '#673028',
        },
        sage: {
          50: '#F4F7F4',
          100: '#E4EBE4',
          500: '#6B8F71',
          600: '#55755A',
          700: '#455E49',
        }
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
