import type { NextConfig } from 'next';
import path from 'path';

const kitabeSrc = path.join(__dirname, 'vendor/kitabe-web-src');

const nextConfig: NextConfig = {
  async headers() {
    const longCache = 'public, max-age=31536000, immutable';
    return [
      { source: '/cities/:path*', headers: [{ key: 'Cache-Control', value: longCache }] },
      { source: '/fonts/:path*', headers: [{ key: 'Cache-Control', value: longCache }] },
      { source: '/fonts/kitabe-fonts.css', headers: [{ key: 'Cache-Control', value: 'public, max-age=86400' }] },
      { source: '/icon-:size.png', headers: [{ key: 'Cache-Control', value: longCache }] },
      { source: '/logo-:name.webp', headers: [{ key: 'Cache-Control', value: longCache }] },
    ];
  },
  async rewrites() {
    return {
      beforeFiles: [
        { source: '/sitemap.xml', destination: '/api/sitemap-index' },
      ],
    };
  },
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
  output: 'standalone',
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@kitabe': kitabeSrc,
    };
    return config;
  },
};

export default nextConfig;
