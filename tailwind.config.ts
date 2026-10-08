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
        medium: {
          950: "#0a0a0a",
          900: "#121212", // Medium dark base
          850: "#181818",
          800: "#202020", // Card/Sidebar base
          750: "#262626", // Hover surface
          700: "#2e2e2e", // Borders
          600: "#3d3d3d",
          500: "#525252",
          400: "#737373",
          300: "#a3a3a3",
          200: "#d4d4d4",
          100: "#f5f5f5",
          50: "#fafafa",
        },
      },
      fontFamily: {
        serif: ["Newsreader", "Merriweather", "Charter", "Georgia", "serif"],
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: "68ch",
            color: "#d4d4d4",
            lineHeight: "1.8",
          },
        },
      },
    },
  },
  plugins: [],
};

export default config;
