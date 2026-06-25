/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        archive: ["Georgia", "Cambria", "serif"],
        ui: ["Trebuchet MS", "Verdana", "sans-serif"]
      },
      colors: {
        paper: "#E7DDC8",
        ivory: "#F4EEDD",
        teal: "#496B68",
        ochre: "#B68A45",
        rust: "#9A4E3F",
        graphite: "#2F3231",
        cold: "#5F7684"
      }
    }
  },
  plugins: []
};
