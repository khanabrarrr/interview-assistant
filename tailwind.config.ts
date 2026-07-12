import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0A0A0F",
        "bg-secondary": "#13131A",
        card: "#1C1C26",
        accent: "#6C63FF",
        "accent-dark": "#564FDB",
        "accent-warm": "#FF9F5A",
        "text-secondary": "#A0A0B0",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      boxShadow: {
        glass: "0 8px 32px rgba(0,0,0,0.35)",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};

export default config;
