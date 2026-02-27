/**
 * Shared Tailwind theme configuration for all projects
 * Gamer-friendly dark theme with earthy tones
 *
 * NOTE: Fonts are NOT included here - each project defines its own font stack
 */

const colors = require("tailwindcss/colors");

module.exports = {
  textColor: {
    primary: "#f6eade", // Title/Header color - warm cream
    secondary: "#dabda1", // Bulk text color - muted tan
  },

  backgroundColor: {
    main: colors.stone[950],

    body: {
      DEFAULT: colors.stone[800],
      btn: {
        highlight: colors.amber[800] + "CC",
      },
    },

    nav: {
      DEFAULT: colors.stone[900],
      btn: {
        highlight: colors.amber[800] + "CC",
      },
    },

    card: {
      DEFAULT: colors.stone[800],
      header: colors.stone[900],
    },

    btn: {
      primary: {
        DEFAULT: colors.stone[900],
        highlight: colors.amber[800] + "CC",
      },
    },

    primary: colors.stone[900],
    secondary: colors.stone[800],
    highlight: colors.amber[800] + "CC",
    hover: colors.stone[700],
  },

  borderColor: {
    nav: colors.amber[800] + "CC",

    btn: {
      DEFAULT: colors.stone[600],
      highlight: colors.amber[950],
      dark: colors.stone[900],
    },

    highlight: colors.amber[800] + "CC",
    input_highlight: colors.stone[700],
    primary: colors.stone[600],
    secondary: colors.stone[500],
  },
};
