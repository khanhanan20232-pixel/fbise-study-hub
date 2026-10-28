/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // FBISE board identity — the board's classic BLUE & WHITE theme:
        // deep board blue header bands on white, gold kept only as accent.
        fbise: {
          50: '#eef5fc',
          100: '#d8eaf9',
          200: '#b0d3f2',
          300: '#7db3e8',
          400: '#4a90d9',
          500: '#2273c4',
          600: '#0b5fa5',
          700: '#0a4c84',
          800: '#093d6b',
          900: '#072f52',
          950: '#051f38',
        },
        // The whole app was built on emerald/teal utility classes; remap
        // both palettes onto the same board blue so every surface follows
        // the blue & white board theme consistently.
        emerald: {
          50: '#eef5fc',
          100: '#d8eaf9',
          200: '#b0d3f2',
          300: '#7db3e8',
          400: '#4a90d9',
          500: '#2273c4',
          600: '#0b5fa5',
          700: '#0a4c84',
          800: '#093d6b',
          900: '#072f52',
          950: '#051f38',
        },
        teal: {
          50: '#eef5fc',
          100: '#d8eaf9',
          200: '#b0d3f2',
          300: '#7db3e8',
          400: '#4a90d9',
          500: '#2273c4',
          600: '#0b5fa5',
          700: '#0a4c84',
          800: '#093d6b',
          900: '#072f52',
          950: '#051f38',
        },
        gold: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
