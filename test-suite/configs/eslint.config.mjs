import js from '@eslint/js';
import globals from 'globals';

export default [
  // Global ignores
  {
    ignores: [
      '_site/**/*.js',
      'vendor/**/*.js',
      'node_modules/**/*.js',
      'test-suite/**/*.js',
      'assets/js/lib/**/*.js',
      'assets/js/*.min.js',
    ],
  },

  // Main config for browser JS files
  {
    ...js.configs.recommended,

    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'script',
      globals: {
        ...globals.browser,
        Disqus: 'readonly',
        localStorage: 'readonly',
      },
    },

    rules: {
      ...js.configs.recommended.rules,
      'indent': ['error', 2],
      'linebreak-style': ['error', 'unix'],
      'quotes': ['error', 'single'],
      'semi': ['error', 'always'],
      'no-unused-vars': ['warn'],
      'no-console': ['warn', { allow: ['error', 'warn'] }],
      'eqeqeq': ['error', 'always'],
      'curly': ['error', 'all'],
      'brace-style': ['error', '1tbs'],
      'no-var': 'error',
      'prefer-const': 'warn',
      'no-multiple-empty-lines': ['error', { max: 1 }],
      'comma-dangle': ['error', 'always-multiline'],
      'arrow-spacing': 'error',
      'space-before-function-paren': ['error', {
        anonymous: 'always',
        named: 'never',
        asyncArrow: 'always',
      }],
    },
  },
];
