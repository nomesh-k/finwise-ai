import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: "#10251D",
        emerald: {
          DEFAULT: "#16A36A",
          50: "#F0FDF4",
          100: "#DDF8E8",
          500: "#16A36A",
          600: "#128A58",
          700: "#0E6C45",
          800: "#10251D",
        },
        bg: {
          main: "#F5F7F5",
          card: "#FFFFFF",
        },
        ink: {
          primary: "#17251D",
          secondary: "#64748B",
        },
        border: "#D9E2DC",
        warning: "#F59E0B",
        error: "#DC2626",
        info: "#2563EB",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "Geist", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
