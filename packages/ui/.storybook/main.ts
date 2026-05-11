import type { StorybookConfig } from '@storybook/react-vite';
import { mergeConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const config: StorybookConfig = {
  stories: [
    '../components/**/*.stories.@(ts|tsx|mdx)',
    '../blocks/**/*.stories.@(ts|tsx|mdx)',
    '../layouts/**/*.stories.@(ts|tsx|mdx)',
  ],
  addons: ['@storybook/addon-a11y'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  typescript: {
    reactDocgen: 'react-docgen-typescript',
  },
  // Two plugins to add to Storybook's Vite pipeline:
  //   1. @vitejs/plugin-react — @storybook/react-vite does NOT register the
  //      React plugin itself, so without this, Vite's built-in esbuild falls
  //      back to the classic JSX transform (`React.createElement`) and every
  //      story breaks with "React is not defined". `jsxRuntime: 'automatic'`
  //      is the default but pinning it makes the contract explicit.
  //   2. @tailwindcss/vite — processes the design-system globals.css the
  //      same way apps/web does.
  viteFinal: (vite) =>
    mergeConfig(vite, {
      plugins: [react({ jsxRuntime: 'automatic' }), tailwindcss()],
    }),
};

export default config;
