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
        gitrium: {
          // Primary Dark Surfaces
          graphite: "#151A17",
          forest: "#18352B",
          olive: "#24352C",
          darkCard: "#1B2420",
          darkBorder: "#27382F",

          // Main Light Surfaces
          ivory: "#F7F6F1",
          cream: "#EFEEE8",
          white: "#FFFFFF",

          // Main Accent: Emerald
          emerald: "#159A72",
          deepEmerald: "#087453",
          softEmerald: "#DDF4EA",

          // Secondary Accent: Burnt Orange (Restrained)
          orange: "#D97745",
          softOrange: "#F3E3D8",

          // Typography & Borders
          textPrimary: "#17201B",
          textSecondary: "#56635C",
          textMuted: "#7A857E",
          border: "#DDE1DC",
        },
      },
      fontFamily: {
        sans: [
          "var(--font-inter)",
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        mono: [
          "var(--font-mono)",
          "IBM Plex Mono",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
      },
      backgroundImage: {
        "light-grid":
          "linear-gradient(to right, rgba(23, 32, 27, 0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(23, 32, 27, 0.04) 1px, transparent 1px)",
        "dark-grid":
          "linear-gradient(to right, rgba(221, 244, 234, 0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(221, 244, 234, 0.04) 1px, transparent 1px)",
      },
      boxShadow: {
        subtle: "0 1px 3px 0 rgba(21, 26, 23, 0.04), 0 1px 2px -1px rgba(21, 26, 23, 0.03)",
        card: "0 2px 8px -1px rgba(21, 26, 23, 0.05), 0 1px 4px -1px rgba(21, 26, 23, 0.03)",
        elevated: "0 10px 25px -4px rgba(21, 26, 23, 0.08), 0 4px 10px -2px rgba(21, 26, 23, 0.04)",
      },
      borderRadius: {
        btn: "7px",
        card: "12px",
        panel: "8px",
      },
    },
  },
  plugins: [],
};

export default config;
