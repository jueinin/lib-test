module.exports = {
  important: '#body',
  theme: {
    truncate: {
      lines: {
        1: '1',
        3: '3',
        2: '2',
        4: '4',
      }
    }
  },
  variants: {
    backgroundColor: ['hover', 'active'],
  },
  plugins: [
    require('tailwindcss-truncate-multiline')(),
  ],
};
