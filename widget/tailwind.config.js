/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      colors: {
        // ── LSC Brand Colors (confirmed from lakestatecleaning.com) ──────
        lsc: {
          orange:      "#F07623",   // primary CTA / active state
          "orange-dk": "#D4611A",   // hover / pressed orange
          navy:        "#1B3F5C",   // header background / strong text
          "navy-dk":   "#122C40",   // deeper navy for contrast
          teal:        "#29ABD4",   // icon color / secondary accent
          "teal-lt":   "#E8F7FC",   // very light teal for hover backgrounds
        },
      },
    },
  },
  plugins: [],
};
