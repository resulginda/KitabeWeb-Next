import type { NextConfig } from 'next';
import path from 'path';
import fs from 'fs';

const kitabeSrc = path.join(__dirname, 'vendor/kitabe-web-src');

function publicAssetHeaders(): { source: string; headers: { key: string; value: string }[] }[] {
  const longCache = 'public, max-age=31536000, immutable';
  const header = [{ key: 'Cache-Control', value: longCache }];
  const sources = new Set<string>([
    '/logo-header.webp',
    '/logo-160.webp',
    '/logo-260.webp',
  ]);

  const citiesDir = path.join(__dirname, 'public', 'cities');
  if (fs.existsSync(citiesDir)) {
    for (const file of fs.readdirSync(citiesDir)) {
      sources.add(`/cities/${file}`);
    }
  }

  return [...sources].map((source) => ({ source, headers: header }));
}

const nextConfig: NextConfig = {
  async headers() {
    const longCache = 'public, max-age=31536000, immutable';
    const cacheHeader = [{ key: 'Cache-Control', value: longCache }];
    return [
      ...publicAssetHeaders(),
      { source: '/cities/:path*', headers: cacheHeader },
      { source: '/fonts/:path*', headers: cacheHeader },
      { source: '/fonts/kitabe-fonts.css', headers: [{ key: 'Cache-Control', value: 'public, max-age=86400' }] },
      { source: '/icon-:size.png', headers: cacheHeader },
      { source: '/logo-:name.webp', headers: cacheHeader },
      { source: '/logo-header.webp', headers: cacheHeader },
      { source: '/:file.webp', headers: cacheHeader },
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
  webpack: (config, { isServer, webpack }) => {
    const emptyPolyfill = path.join(__dirname, 'lib/empty-polyfill.js');
    config.resolve.alias = {
      ...config.resolve.alias,
      '@kitabe': kitabeSrc,
    };
    if (!isServer) {
      config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(
          /next[\\/]dist[\\/]build[\\/]polyfills[\\/]polyfill-module(\.js)?$/,
          emptyPolyfill
        )
      );
    }
    return config;
  },
};

export default nextConfig;
