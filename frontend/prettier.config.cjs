module.exports = {
  printWidth: 100,
  tabWidth: 2,
  singleQuote: true,
  semi: true,
  trailingComma: 'all',
  arrowParens: 'always',
  endOfLine: 'lf',
  plugins: [require('prettier-plugin-sort-imports')],
  overrides: [
    {
      files: ['*.ts', '*.scss', '*.json', '*.html', '*.js'],
      options: { tabWidth: 4 },
    },
  ],
};
