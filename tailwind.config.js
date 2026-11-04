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
        // Phase F (2026-11-04): the Figma "Web Design" theme now applies
        // site-wide. The app was built on fbise/emerald/teal utility classes,
        // so those scales are remapped onto the Figma palette:
        //   fbise  -> the navy ramp (brand bands, wordmarks, icon squares)
        //   emerald/teal -> the lime ramp (primary actions + success states,
        //   which stay genuinely green). Red/amber semantics are untouched.
        fbise: {
          50: '#eef2f8',
          100: '#dfe8f3',
          200: '#c2d2e6',
          300: '#97b0cf',
          400: '#5f7fae',
          500: '#35568a',
          600: '#1d3a68',
          700: '#16294d',
          800: '#0f1f3d',
          900: '#0a1830',
          950: '#060f1f',
        },
        emerald: {
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
        teal: {
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
        // Figma "Web Design" theme (Phase A landing, Phase F site-wide,
        // 2026-11-04). Vivid lime-yellow green primary accent (Tailwind lime
        // family values — the emerald/teal scales above mirror these).
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
