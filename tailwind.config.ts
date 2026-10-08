import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          950: "#14181a",
          900: "#1e2326",
          850: "#232a2e",
          800: "#272e33",
          750: "#2d353b",
          700: "#343f44",
          600: "#414b50",
          500: "#4f585e",
        },
        parchment: {
          100: "#fdf6e3",
          200: "#d3c6aa",
          300: "#9da9a0",
          400: "#7a8478",
          500: "#5a6258",
        },
        moss: {
          300: "#c3d9a5",
          400: "#b5cc92",
          500: "#a7c080", // Everforest Green
          600: "#8da101",
          700: "#475239",
          800: "#2c3325",
        },
        gold: {
          300: "#f8e0a8",
          400: "#ebd095",
          500: "#dbbc7f", // Everforest Gold / Sun
          600: "#c29d5b",
          700: "#6e5527",
        },
        lunar: {
          300: "#a3ded5",
          400: "#83c092",
          500: "#7fbbb3", // Everforest Aqua / Moon
          600: "#5a8c85",
        },
        scarlet: {
          400: "#f09193",
          500: "#e67e80", // Everforest Red / Geburah
          600: "#c5585a",
        },
        twilight: {
          400: "#e0adca",
          500: "#d699b6", // Everforest Purple / Vision
          600: "#aa6b8c",
        },
        amber: {
          500: "#e69875", // Everforest Orange / Fire
        }
      },
      fontFamily: {
        serif: ["Cinzel", "Cormorant Garamond", "Georgia", "serif"],
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      boxShadow: {
        arcane: "0 4px 25px -4px rgba(167, 192, 128, 0.08)",
        solar: "0 4px 25px -4px rgba(219, 188, 127, 0.12)",
        glow: "0 0 15px rgba(167, 192, 128, 0.2)",
      }
    },
  },
  plugins: [],
};

export default config;
