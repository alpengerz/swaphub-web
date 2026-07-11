/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#e9f7ef",
          100: "#c9ecd7",
          200: "#98dbb4",
          300: "#63c88e",
          400: "#33b571",
          500: "#1b9a57",
          600: "#127c46",
          700: "#0f6339",
          800: "#0d4e2e",
          900: "#0a3d24",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 1px 3px rgba(16, 24, 40, 0.08), 0 1px 2px rgba(16, 24, 40, 0.04)",
        phone: "0 30px 60px -12px rgba(16, 24, 40, 0.35)",
      },
    },
  },
  plugins: [],
};
