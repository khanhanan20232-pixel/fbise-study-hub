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
          50: '#f0f7fe',
          100: '#e1effc',
          200: '#c4e0fb',
          300: '#97c7f7',
          400: '#62a9f1',
          500: '#3d8be4',
          600: '#2b7cd3',
          700: '#1f66b4',
          800: '#1c5491',
          900: '#1a4a7d',
          950: '#143a61',
        },
        // The whole app was built on emerald/teal utility classes; remap
        // both palettes onto the same board blue so every surface follows
        // the blue & white board theme consistently.
        emerald: {
          50: '#f0f7fe',
          100: '#e1effc',
          200: '#c4e0fb',
          300: '#97c7f7',
          400: '#62a9f1',
          500: '#3d8be4',
          600: '#2b7cd3',
          700: '#1f66b4',
          800: '#1c5491',
          900: '#1a4a7d',
          950: '#143a61',
        },
        teal: {
          50: '#f0f7fe',
          100: '#e1effc',
          200: '#c4e0fb',
          300: '#97c7f7',
          400: '#62a9f1',
          500: '#3d8be4',
          600: '#2b7cd3',
          700: '#1f66b4',
          800: '#1c5491',
          900: '#1a4a7d',
          950: '#143a61',
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
