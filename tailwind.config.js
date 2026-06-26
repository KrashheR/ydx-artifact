/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        // Legacy light palette fonts
        archive: ["Georgia", "Cambria", "serif"],
        ui: ["Trebuchet MS", "Verdana", "sans-serif"],
        // Expedition menu fonts
        cormorant: ['"Cormorant Garamond"', "Georgia", "serif"],
        manrope: ["Manrope", "system-ui", "sans-serif"]
      },
      colors: {
        // ── Light "Anomaly Archive" palette (existing screens) ──────────────
        paper: "#E7DDC8",
        ivory: "#F4EEDD",
        teal: "#496B68",
        ochre: "#B68A45",
        rust: "#9A4E3F",
        graphite: "#2F3231",
        cold: "#5F7684",
        // ── Dark "Expedition" palette (campaign menu) ────────────────────────
        "exp-bg":      "#151B18",
        "exp-panel":   "#222A25",
        "exp-panel2":  "#27302B",
        "exp-parch":   "#D5C39A",
        "exp-brass":   "#B88A45",
        "exp-brass2":  "#D8AF63",
        "exp-emerald": "#2F6A57",
        "exp-leather": "#6F4935",
        "exp-muted":   "#879087",
        "exp-success": "#6FC69E",
        "exp-success2":"#9BD9BB"
      }
    }
  },
  plugins: []
};
