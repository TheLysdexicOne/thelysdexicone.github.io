const colors = require('tailwindcss/colors');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      textColor: {
        primary: '#f6eade', // Title/Header color
        secondary: '#dabda1', // Bulk text color
      },

      fontFamily: {
        pixel: ['TimesNewPixel', 'monospace'],
      },

      backgroundColor: {
        main: colors.stone[950],

        body: {
          DEFAULT: colors.stone[800],
          btn: {
            highlight: colors.amber[800] + 'CC',
          },
        },

        nav: {
          DEFAULT: colors.stone[900],
          btn: {
            highlight: colors.amber[800] + 'CC',
          },
        },

        card: {
          DEFAULT: colors.stone[800],
          header: colors.stone[900],
        },

        btn: {
          primary: {
            DEFAULT: colors.stone[900],
            highlight: colors.amber[800] + 'CC',
          },
        },

        primary: colors.stone[900],
        secondary: colors.stone[800],
        highlight: colors.amber[800] + 'CC',
        hover: colors.stone[700],
      },
      borderColor: {
        nav: colors.amber[800] + 'CC',

        btn: {
          DEFAULT: colors.stone[600],
          highlight: colors.amber[950],
          dark: colors.stone[900],
        },

        highlight: colors.amber[800] + 'CC',
        input_highlight: colors.stone[700],
        primary: colors.stone[600],
        secondary: colors.stone[500],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('tailwindcss-animate'),
  ],
};
