import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        green: {
          950: "#0D2B1E",
          900: "#1C4A35",
          800: "#245C42",
          700: "#2D6E4F",
          600: "#3A8A63",
          500: "#4CAF7D",
          100: "#D1EDD9",
          50: "#EAF7EE",
        },
        clay: {
          600: "#A83D18",
          500: "#C94E1E",
          400: "#E05C25",
          300: "#F07040",
          100: "#FADDCE",
          50: "#FEF3EC",
        },
        mint: {
          DEFAULT: "#E8F5E9",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["'Inter'", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 2px 12px rgba(0,0,0,0.08)",
        "card-lg": "0 4px 24px rgba(0,0,0,0.12)",
      },
    },
  },
  plugins: [],
};

export default config;
