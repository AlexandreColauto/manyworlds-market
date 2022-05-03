module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Rubik"],
        body: ["Rubik"],
      },
      colors: {
        primary: "#404D3A",
        secondary: "#404D3A",
        normal: "#708496",
      },
    },
  },
  plugins: [],
};
