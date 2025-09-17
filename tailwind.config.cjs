/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'rural': {
          background: '#F5F2E7',
          text: '#3C454A',
          primary: '#67806D',
          secondary: '#805A36',
          alternate: '#F9E9D0',
          alert: '#F8B36A',
          card: '#FFFFFF'
        }
      },
      fontFamily: {
        'sans': ['Inter', 'Poppins', 'Nunito', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
