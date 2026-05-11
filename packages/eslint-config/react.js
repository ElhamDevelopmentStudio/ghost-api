import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';

import base from './base.js';

/** Flat-config preset for React + Vite SPAs (apps/app).
 *
 * Distinct from `./next.js` because Next ships its own parser that doesn't
 * expose project services, which forces us to disable type-aware rules there.
 * In a Vite app we can leave them on. */
/** @type {import('eslint').Linter.Config[]} */
export default [
  ...base,
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      globals: { ...globals.browser },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,
      // We use TypeScript for prop validation everywhere.
      'react/prop-types': 'off',
    },
  },
  {
    ignores: ['dist/**', 'node_modules/**'],
  },
];
