/** @type {import('tailwindcss').Config} */
import colors from 'tailwindcss/colors';
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      colors: {
        transparent: "transparent",
        current: "currentColor",
        black: "#000000",
        white: "#ffffff",
        offWhite: "#fefefe",
        slate: colors.slate,
        teal: {
          50: "#FBFEFE",
          100: "#F4FBFB",
          200: "#E6F7F7",
          300: "#D5F0F0",
          400: "#C0E6E6",
          500: "#A6D9D9",
          600: "#85C5C5",
          700: "#5AAEAE",
          800: "#0A9191",
          900: "#087F7F",
          950: "#103C3C",
        },
      },
    },
  },
  plugins: [
    require("preline/plugin"),
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
  ],
};
