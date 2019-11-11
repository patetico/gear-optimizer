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
  rules: {
    'no-plusplus': ['error', { 'allowForLoopAfterthoughts': true }],
    'react/jsx-props-no-spreading': [
      'error',
      {
        html: 'enforce',
        custom: 'ignore',
        explicitSpread: 'ignore',
      },
    ],
    'jsx-a11y/label-has-associated-control': ['error', { 'assert': 'either', 'depth': 25 }],
  },
  overrides: [
    {
      files: ['*.test.js', '*.test.jsx'],
      env: {
        jest: true,
      },
    },
    {
      files: ['*.worker.js'],
      env: {
        es6: true,
        worker: true,
      },
    },
  ],
};
