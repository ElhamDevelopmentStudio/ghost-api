import config from '@ghostapi/eslint-config/react';

export default [
  ...config,
  {
    ignores: ['dist/**', '.vite/**'],
  },
];
