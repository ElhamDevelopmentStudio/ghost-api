import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Workspace packages export TypeScript source directly. Without this Next.js
  // would refuse to transpile them.
  transpilePackages: ['@ghostapi/ui', '@ghostapi/types', '@ghostapi/config'],
  typedRoutes: true,
  webpack(config) {
    // Workspace packages use TS-spec ESM imports (`./foo.js`) which tsc accepts
    // for `.ts` source files but webpack does not. Tell webpack to also try
    // `.ts` / `.tsx` when a request ends in `.js` / `.jsx`.
    config.resolve = config.resolve ?? {};
    config.resolve.extensionAlias = {
      ...(config.resolve.extensionAlias ?? {}),
      '.js': ['.ts', '.tsx', '.js'],
      '.jsx': ['.tsx', '.jsx'],
    };
    return config;
  },
};

export default nextConfig;
