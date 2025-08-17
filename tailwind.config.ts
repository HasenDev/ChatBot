module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: "#0d0d0d",
        grayBorder: "#3a3a3a",
      },
      animation: {
        'fade-pink': 'fadePink 10s infinite',
        'fade-yellow': 'fadeYellow 10s infinite',
        'fade-cyan': 'fadeCyan 10s infinite',
        'fade-white': 'fadeWhite 10s infinite',
      },
      keyframes: {
        fadePink: {
          '0%, 100%': { backgroundColor: '#ff69b4' },
          '50%': { backgroundColor: '#ffb6c1' },
        },
        fadeYellow: {
          '0%, 100%': { backgroundColor: '#ffff66' },
          '50%': { backgroundColor: '#ffeb3b' },
        },
        fadeCyan: {
          '0%, 100%': { backgroundColor: '#00ffff' },
          '50%': { backgroundColor: '#40e0d0' },
        },
        fadeWhite: {
          '0%, 100%': { backgroundColor: '#ffffff' },
          '50%': { backgroundColor: '#f0f0f0' },
        },
      },
    },
  },
  plugins: [],
}
