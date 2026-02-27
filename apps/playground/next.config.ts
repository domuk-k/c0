import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@c0/protocol', '@c0/server', '@c0/react'],
};

export default nextConfig;
