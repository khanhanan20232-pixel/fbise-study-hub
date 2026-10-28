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
        // FBISE board identity — anchored on the official fbise.edu.pk
        // brand green #007b5e (sampled from the live site's own styles),
        // deepened to #002a20 for header bands and the footer.
        fbise: {
          50: '#eefaf4',
          100: '#d8f3e5',
          200: '#b0e6cd',
          300: '#7dd1ad',
          400: '#43b588',
          500: '#1f9d6c',
          600: '#007b5e',
          700: '#00644c',
          800: '#00523f',
          900: '#003e30',
          950: '#002a20',
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
