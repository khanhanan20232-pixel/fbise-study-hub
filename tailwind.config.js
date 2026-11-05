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
        //   fbise  -> the black ramp (brand bands, wordmarks, icon squares)
        //   emerald/teal -> the lime ramp (primary actions + success states,
        //   which stay genuinely green). Red/amber semantics are untouched.
        // 2026-11-05 (Abdul's order): NO navy/blue anywhere — the Figma dark
        // colour is BLACK. fbise/navy are neutral black, and slate is
        // remapped to neutral zinc grey so no blue-grey tint survives.
        // Site palette is now only: lime green + cream + white + black/grey.
        fbise: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#404040',
          700: '#262626',
          800: '#171717',
          900: '#0a0a0a',
          950: '#000000',
        },
        slate: {
          50: '#fafafa',
          100: '#f4f4f5',
          200: '#e4e4e7',
          300: '#d4d4d8',
          400: '#a1a1aa',
          500: '#71717a',
          600: '#52525b',
          700: '#3f3f46',
          800: '#27272a',
          900: '#18181b',
          950: '#09090b',
        },
        // Leftover tint scales pinned to the Figma palette too (2026-11-05):
        // sky/violet/purple -> neutral grey or lime, so no blue/purple tint
        // survives anywhere (landing icon chips, one rubric bar).
        sky: {
          50: '#fafafa',
          100: '#f4f4f5',
          200: '#e4e4e7',
          300: '#d4d4d8',
          400: '#a1a1aa',
          500: '#71717a',
          600: '#52525b',
          700: '#3f3f46',
          800: '#27272a',
          900: '#18181b',
          950: '#09090b',
        },
        violet: {
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
        purple: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#404040',
          700: '#262626',
          800: '#171717',
          900: '#0a0a0a',
          950: '#000000',
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
        // Black (CTA panel, AI-check card) — Figma's dark is black,
        // not navy (Abdul, 2026-11-05).
        navy: {
          700: '#262626',
          800: '#171717',
          900: '#0a0a0a',
          950: '#000000',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        // Serif display for Figma-style headings (system stack — no webfont
        // download, so offline builds stay safe).
        display: ['Georgia', "'Times New Roman'", 'Times', 'serif'],
      },
      // Site animations (Abdul, 2026-11-05): gentle fade-up entrances,
      // floating hero cards, and a slow subjects marquee on the landing.
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-9px)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.6s ease-out both',
        float: 'float 5s ease-in-out infinite',
        marquee: 'marquee 30s linear infinite',
      }
    },
  },
  plugins: [],
}
