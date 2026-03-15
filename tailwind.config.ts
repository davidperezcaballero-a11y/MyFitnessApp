import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./features/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sand: "#f4efe7",
        ink: "#182028",
        coral: "#ef7d57",
        moss: "#6f8f72",
        teal: "#1f6f78",
        cream: "#fffaf2",
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        display: ["var(--font-display)"],
      },
      boxShadow: {
        panel: "0 18px 50px rgba(24, 32, 40, 0.12)",
      },
    },
  },
  plugins: [],
};

export default config;
