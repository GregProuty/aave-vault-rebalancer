/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Design tokens
        baseBlack: '#000000',
        baseWhite: '#FFFFFF',
        successGreen: '#22C55E',
        gray1: '#0D0D0D',
        gray2: '#171717',
        gray3: '#202020',
        gray4: '#333333',
        gray5: '#777777',
        // Text tokens
        primary: '#FFFFFF',
        secondary: '#777777',
        tertiary: 'rgba(255,255,255,0.55)'
      },
      fontFamily: {
        body: ["var(--font-body)", "system-ui", "-apple-system", "Segoe UI", "Roboto", "Ubuntu", "Cantarell", "Noto Sans", "Helvetica Neue", "Arial", "sans-serif"],
        display: ["var(--font-display)", "var(--font-body)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
} 