import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      colors: {
        // ASU maroon brand
        maroon: {
          DEFAULT: "#8C1D40",
          50: "#FBF2F5",
          100: "#F5E2EA",
          200: "#E8C0CF",
          300: "#D492A9",
          400: "#B85F7D",
          500: "#8C1D40",
          600: "#7A1838",
          700: "#65142E",
          800: "#501024",
          900: "#3E0C1B",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          muted: "#F7F7F8",
          subtle: "#F2F2F4",
        },
        ink: {
          DEFAULT: "#0B0B0C",
          muted: "#5A5A63",
          subtle: "#8A8A93",
          border: "#E7E7EB",
        },
      },
      boxShadow: {
        card: "0 1px 2px rgba(17, 17, 17, 0.04), 0 8px 24px rgba(17, 17, 17, 0.04)",
        subtle: "0 1px 2px rgba(17, 17, 17, 0.04)",
      },
      borderRadius: {
        xl: "14px",
        "2xl": "18px",
      },
    },
  },
  plugins: [],
};

export default config;
