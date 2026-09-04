/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#111111',
        paper: '#FFFFFF',
        paperAlt: '#F8F8F8',
        sun: {
          DEFAULT: '#FFD600',
          dark: '#E6C200',
        },
      },
    },
  },
  plugins: [],
}
