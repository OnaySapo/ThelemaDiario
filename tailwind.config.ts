import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        medium: {
          950: "rgb(var(--color-medium-950) / <alpha-value>)",
          900: "rgb(var(--color-medium-900) / <alpha-value>)", // Base canvas background
          850: "rgb(var(--color-medium-850) / <alpha-value>)", // Sidebars / Cards / Ribbons
          800: "rgb(var(--color-medium-800) / <alpha-value>)", // Inputs / Buttons / Surfaces
          750: "rgb(var(--color-medium-750) / <alpha-value>)", // Hover surfaces
          700: "rgb(var(--color-medium-700) / <alpha-value>)", // Borders
          600: "rgb(var(--color-medium-600) / <alpha-value>)", // Subtle borders
          500: "rgb(var(--color-medium-500) / <alpha-value>)", // Faint text
          400: "rgb(var(--color-medium-400) / <alpha-value>)", // Muted text / Captions
          300: "rgb(var(--color-medium-300) / <alpha-value>)", // Secondary text
          200: "rgb(var(--color-medium-200) / <alpha-value>)", // Body text
          100: "rgb(var(--color-medium-100) / <alpha-value>)", // Heading text
          50: "rgb(var(--color-medium-50) / <alpha-value>)",  // Bright highlight
        },
        themeAccent: "rgb(var(--theme-accent) / <alpha-value>)",
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
            color: "var(--theme-body-color, #d4d4d4)",
            lineHeight: "1.8",
          },
        },
      },
    },
  },
  plugins: [],
};

export default config;
