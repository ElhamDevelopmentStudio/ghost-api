import { FlatCompat } from '@eslint/eslintrc';
import base from './base.js';

const compat = new FlatCompat();

/** @type {import('eslint').Linter.Config[]} */
export default [
  ...base,
  ...compat.extends('next/core-web-vitals'),
  // The next preset injects its own parser (without projectService); turn off
  // type-aware rules for all .ts/.tsx so they don't blow up.
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/consistent-type-imports': 'off',
    },
  },
  {
    ignores: ['.next/**', 'next-env.d.ts'],
  },
];
