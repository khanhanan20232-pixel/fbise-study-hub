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
        },
        // Figma "Web Design" theme (Phase A, 2026-11-04) — ADDED alongside the
        // fbise blue scale above, which the app pages still use this phase.
        // Vivid lime-yellow green primary accent (Tailwind lime family values).
        accent: {
          50: '#f7fee7',
          100: '#ecfccb',
          200: '#d9f99d',
          300: '#bef264',
          400: '#a3e635',
          500: '#84cc16',
          600: '#65a30d',
          700: '#4d7c0f',
          800: '#3f6212',
          900: '#365314',
          950: '#1a2e05',
        },
        // Pale warm cream (hero / page backgrounds).
        cream: {
          50: '#fffdf8',
          100: '#fff9ee',
          200: '#fff3d6',
          300: '#ffebc0',
        },
        // Dark navy (CTA panel, AI-check card).
        navy: {
          700: '#16294d',
          800: '#0f1f3d',
          900: '#0a1830',
          950: '#060f1f',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        // Serif display for Figma-style headings (system stack — no webfont
        // download, so offline builds stay safe).
        display: ['Georgia', "'Times New Roman'", 'Times', 'serif'],
      }
    },
  },
  plugins: [],
}
