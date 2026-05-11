import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

/** @type {import('eslint').Linter.Config[]} */
export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: { ...globals.node },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports', disallowTypeAnnotations: false },
      ],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
  // JS config files (eslint.config.*, postcss.config.*, etc.) don't need type-aware linting.
  {
    files: ['**/*.{js,mjs,cjs}'],
    rules: {
      '@typescript-eslint/consistent-type-imports': 'off',
    },
  },
  prettier,
  {
    ignores: [
      'dist/**',
      '.next/**',
      '.turbo/**',
      '.vite/**',
      'node_modules/**',
      'coverage/**',
      'storybook-static/**',
    ],
  },
];
