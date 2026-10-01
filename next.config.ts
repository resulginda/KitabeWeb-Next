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

const securityHeaders = [
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Yakınımdaki yerler / rota konum ister; kamera ve mikrofon hiç kullanılmıyor.
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self)' },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    const longCache = 'public, max-age=31536000, immutable';
    const cacheHeader = [{ key: 'Cache-Control', value: longCache }];
    return [
      { source: '/:path*', headers: securityHeaders },
      ...publicAssetHeaders(),
      { source: '/cities/:path*', headers: cacheHeader },
      { source: '/fonts/:path*', headers: cacheHeader },
      { source: '/fonts/kitabe-fonts.css', headers: [{ key: 'Cache-Control', value: 'public, max-age=86400' }] },
      { source: '/icon-:size.png', headers: cacheHeader },
      { source: '/logo-:name.webp', headers: cacheHeader },
      { source: '/logo-header.webp', headers: cacheHeader },
      { source: '/:file.webp', headers: cacheHeader },
      { source: '/_next/static/css/:path*', headers: cacheHeader },
      { source: '/_next/static/media/:path*', headers: cacheHeader },
      { source: '/_next/static/chunks/:path*', headers: cacheHeader },
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
    // optimizeCss (beasties) Next 15.5'te CSS chunk dosyalarini emit etmiyor:
    // webpack runtime static/css/*.css'e referans veriyor ama dosyalar yazilmiyor
    // -> 404 -> ChunkLoadError -> ssr:false SPA (/home) cokuyor. Kritik CSS zaten
    // layout'ta HUB_CRITICAL_CSS ile elle inline edildigi icin buna gerek yok.
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
