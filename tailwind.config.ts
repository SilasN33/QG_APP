import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Dark surface system
        surface: {
          0: "#08080A",
          1: "#0D0D0F",
          2: "#161618",
          3: "#1E1E21",
          4: "#272729",
        },
        // Forest green — brand hero sections
        green: {
          950: "#040D09",
          900: "#091B13",
          800: "#0D2B1D",
          700: "#134028",
          600: "#1A5A38",
          500: "#27804F",
          100: "#9ED4B5",
          50: "#D4EFE0",
        },
        // Clay kept as-is for light-bg contexts (group pickers, etc.)
        clay: {
          600: "#A83D18",
          500: "#C94E1E",
          400: "#E05C25",
          300: "#F07040",
          100: "#FADDCE",
          50: "#FEF3EC",
        },
        // Electric lime — primary accent
        lime: {
          600: "#93B020",
          500: "#C9F135",
          400: "#D8F45E",
          300: "#E6F88A",
          100: "#F3FCC6",
          50:  "#F9FEE3",
        },
        mint: {
          DEFAULT: "#E8F5E9",
        },
      },
      fontFamily: {
        sans:    ["'DM Sans'",  "system-ui", "sans-serif"],
        display: ["'Syne'",     "system-ui", "sans-serif"],
      },
      boxShadow: {
        card:      "0 1px 3px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.06)",
        "card-lg": "0 8px 32px rgba(0,0,0,0.6), inset 0 0 0 1px rgba(255,255,255,0.07)",
        nav:       "0 8px 40px rgba(0,0,0,0.55), inset 0 0 0 1px rgba(255,255,255,0.09)",
        glow:      "0 0 24px rgba(201,241,53,0.4), 0 0 48px rgba(201,241,53,0.15)",
      },
    },
  },
  plugins: [],
};

export default config;
