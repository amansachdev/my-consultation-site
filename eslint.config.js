// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import js from '@eslint/js';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

export default [{ ignores: ['dist'] }, {
  files: ['**/*.{js,jsx}'],
  languageOptions: {
    ecmaVersion: 2020,
    globals: {
      alert: 'readonly',
      FormData: 'readonly',
      document: 'readonly',
      process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        console: 'readonly',
      crypto: 'readonly',
      fetch: 'readonly',
      localStorage: 'readonly',
      URLSearchParams: 'readonly',
      window: 'readonly',
    },
    parserOptions: {
      ecmaVersion: 'latest',
      ecmaFeatures: { jsx: true },
      sourceType: 'module',
    },
  },
  plugins: {
    react,
    'react-hooks': reactHooks,
    'react-refresh': reactRefresh,
  },
  rules: {
    ...js.configs.recommended.rules,
    ...reactHooks.configs.recommended.rules,
    'no-unused-vars': 'off',
    'react/jsx-no-undef': 'error',
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
  },
}, ...storybook.configs["flat/recommended"]];
