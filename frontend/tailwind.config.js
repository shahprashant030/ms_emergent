/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './src/pages/**/*.{js,jsx}',
    './src/components/**/*.{js,jsx}',
    './src/app/**/*.{js,jsx}',
    './src/**/*.{js,jsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "#E5E0D8",
        input: "#E5E0D8",
        ring: "#8B0000",
        background: "#FDFBF7",
        foreground: "#1A1A1A",
        primary: {
          DEFAULT: "#8B0000",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#DAA520",
          foreground: "#1A1A1A",
        },
        accent: {
          DEFAULT: "#2F4F4F",
          foreground: "#FFFFFF",
        },
        muted: {
          DEFAULT: "#F5F2EB",
          foreground: "#888888",
        },
        destructive: {
          DEFAULT: "#ef4444",
          foreground: "#FFFFFF",
        },
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#1A1A1A",
        },
        popover: {
          DEFAULT: "#FFFFFF",
          foreground: "#1A1A1A",
        },
      },
      fontFamily: {
        heading: ['Rozha One', 'serif'],
        body: ['Outfit', 'sans-serif'],
        accent: ['Gotu', 'sans-serif'],
      },
      borderRadius: {
        lg: "0.5rem",
        md: "calc(0.5rem - 2px)",
        sm: "calc(0.5rem - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}