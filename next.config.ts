import type { NextConfig } from 'next';
import path from 'path';

const kitabeSrc = path.join(__dirname, 'vendor/kitabe-web-src');

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'api.kitabe.org' },
      { protocol: 'https', hostname: '**.kitabe.org' },
      { protocol: 'https', hostname: 'storage.googleapis.com' },
      { protocol: 'https', hostname: '**.googleusercontent.com' },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    externalDir: true,
  },
  outputFileTracingRoot: path.join(__dirname),
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@kitabe': kitabeSrc,
    };
    return config;
  },
  async redirects() {
    return [
      { source: '/home', destination: '/tr', permanent: true },
    ];
  },
};

export default nextConfig;
