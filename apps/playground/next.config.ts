import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@c0-ui/protocol', '@c0-ui/server', '@c0-ui/react'],
};

export default nextConfig;
