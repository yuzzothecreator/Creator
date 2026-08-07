import type { NextConfig } from 'next';
import path from 'node:path';

const nextConfig: NextConfig = {
  transpilePackages: ['@creator/ui', '@creator/editor', '@creator/shared'],
  outputFileTracingRoot: path.join(__dirname, '../..'),
  experimental: {
    optimizePackageImports: ['framer-motion'],
  },
};

export default nextConfig;
