/** @type {import('tailwindcss').Config} */
export default {
  content: ['./*.html', './js/**/*.js'],
  theme: {
    extend: {
      fontFamily: {
        orbitron: ['Orbitron', 'Exo 2', 'system-ui', 'sans-serif'],
        exo: ['Exo 2', 'Orbitron', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        '3xl': '0 35px 60px -12px rgba(0, 0, 0, 0.25)',
      },
    },
  },
  plugins: [],
};
