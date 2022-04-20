module.exports = {
  env: {
    browser: false,
    node: true,
    es2021: true,
  },
  extends: ['airbnb-base', 'plugin:prettier/recommended', 'prettier'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  settings: {
    'import/resolver': {
      typescript: {},
    },
  },
  plugins: ['@typescript-eslint', 'prettier'],
  rules: {
    'import/prefer-default-export': 'off',
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        js: 'never',
        ts: 'never',
      },
    ],
    'no-param-reassign': [2, { props: false }],
    'no-unused-vars': 'warn',
    'no-plusplus': 'off',
    'no-restricted-syntax': 'off',
    'no-use-before-define': ['error', { functions: false }],
    'lines-between-class-members': 'off',
    'prefer-regex-literals': 'off',
    'class-methods-use-this': 'off',
  },
};
