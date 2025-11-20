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
        // Zama brand colors - Yellow & Black theme
        zama: {
          yellow: {
            DEFAULT: "#FFD700",
            light: "#FFED4E",
            dark: "#FFC700",
            glow: "#FFED4E",
          },
          black: {
            DEFAULT: "#000000",
            light: "#1A1A1A",
            lighter: "#2D2D2D",
          },
          gray: {
            DEFAULT: "#808080",
            light: "#CCCCCC",
            dark: "#404040",
          },
        },
      },
      backgroundImage: {
        "gradient-zama": "linear-gradient(135deg, #FFD700 0%, #FFC700 100%)",
        "gradient-dark": "linear-gradient(180deg, #000000 0%, #1A1A1A 100%)",
      },
      boxShadow: {
        "glow-yellow": "0 0 20px rgba(255, 215, 0, 0.5)",
        "glow-yellow-lg": "0 0 40px rgba(255, 215, 0, 0.6)",
      },
      animation: {
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "encrypt": "encrypt 0.5s ease-in-out",
      },
      keyframes: {
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(255, 215, 0, 0.5)" },
          "50%": { boxShadow: "0 0 40px rgba(255, 215, 0, 0.8)" },
        },
        "encrypt": {
          "0%": { opacity: "0", transform: "scale(0.9)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
    },
  },
  plugins: [],
};

