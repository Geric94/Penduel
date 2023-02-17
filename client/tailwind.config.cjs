/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        siteblack: '#131519',
        siteDimBlack: '#191d23',
        siteViolet: '#7f46f0',
        siteWhite: '#9eacc7',
      },
      backgroundImage: {
        sister: "url('/src/assets/background/sister.jpg')",
        letters1: "url('/src/assets/background/letters1.png')",
        letters2: "url('/src/assets/background/letters2.png')",
        penduel: "url('/src/assets/background/penduel.gif')",
      },
      fontFamily: {
        rajdhani: ['Rajdhani', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
