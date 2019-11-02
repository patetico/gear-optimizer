module.exports = {
  env: {
    browser: true,
    es6: true,
  },
  parser: 'babel-eslint',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  extends: 'airbnb',
  plugins: ['react'],
  rules: {},
  overrides: [
    {
      files: ['*.test.js', '*.test.jsx'],
      env: {
        jest: true,
      },
    },
  ],
};
