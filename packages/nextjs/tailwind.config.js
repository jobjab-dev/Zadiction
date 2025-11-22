/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paper/Sketch Theme
        paper: {
          DEFAULT: "#FDFBF7", // Warm off-white paper
          dark: "#F5F2EB",    // Slightly darker paper for cards
        },
        ink: {
          DEFAULT: "#1A1A1A", // Black ink
          light: "#4A4A4A",   // Lighter ink/pencil
          lighter: "#808080", // Pencil sketch
        },
        marker: {
          yellow: "rgba(255, 215, 0, 0.6)", // Highlighter yellow transparent
          yellowSolid: "#FFD700",
        },
        zama: {
          yellow: "#FFE600",
          black: {
            DEFAULT: "#111111",
            light: "#1A1A1A",
            lighter: "#252525",
          },
        },
      },
      backgroundImage: {
        "paper-texture": "url(\"data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.05'/%3E%3C/svg%3E\")",
        "gradient-zama": "linear-gradient(135deg, #FFE600 0%, #FFD700 100%)",
        "gradient-dark": "linear-gradient(to bottom, #111111, #1A1A1A)",
      },
      boxShadow: {
        "sketch": "2px 2px 0px 0px #1A1A1A",
        "sketch-hover": "4px 4px 0px 0px #1A1A1A",
        "sketch-lg": "6px 6px 0px 0px #1A1A1A",
      },
      borderRadius: {
        "sketch": "255px 15px 225px 15px / 15px 225px 15px 255px",
        "sketch-sm": "255px 15px 225px 15px / 15px 225px 15px 255px",
      },
      animation: {
        "draw": "draw 2s ease-out forwards",
        "fade-in-up": "fadeInUp 0.8s ease-out forwards",
      },
      keyframes: {
        draw: {
          "0%": { strokeDasharray: "1000", strokeDashoffset: "1000" },
          "100%": { strokeDasharray: "1000", strokeDashoffset: "0" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

