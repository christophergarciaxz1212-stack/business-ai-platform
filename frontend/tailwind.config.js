/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        mono: [
          "JetBrains Mono",
          "Fira Code",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "monospace",
        ],
      },
      colors: {
        surface: {
          0: "#000000",
          50: "#09090B",
          100: "#111113",
          200: "#18181B",
          300: "#27272A",
        },
        border: {
          subtle: "rgba(255, 255, 255, 0.08)",
          default: "rgba(255, 255, 255, 0.12)",
          strong: "rgba(255, 255, 255, 0.22)",
        },
      },
      boxShadow: {
        subtle: "0 1px 2px 0 rgba(0, 0, 0, 0.4)",
        card: "0 0 0 1px rgba(255, 255, 255, 0.08), 0 4px 24px rgba(0, 0, 0, 0.5)",
        modal: "0 0 0 1px rgba(255, 255, 255, 0.12), 0 24px 64px rgba(0, 0, 0, 0.85)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-right": {
          "0%": { opacity: "0", transform: "translateX(12px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.97)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        pulseSubtle: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.45" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "slide-in": "slide-in-right 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "scale-in": "scale-in 0.18s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "pulse-subtle": "pulseSubtle 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
