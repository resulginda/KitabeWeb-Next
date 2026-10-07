import type { MetadataRoute } from 'next';

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://kitabe.org';

/** Ziyaretçi getirmeyen, binlerce sayfayı tarayıp sunucuyu yoran veri toplama / SEO botları. */
const BLOCKED_BOTS = [
  'GPTBot',
  'ClaudeBot',
  'CCBot',
  'Bytespider',
  'Amazonbot',
  'meta-externalagent',
  'AhrefsBot',
  'SemrushBot',
  'MJ12bot',
  'DotBot',
  'PetalBot',
  'DataForSeoBot',
  'BLEXBot',
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: BLOCKED_BOTS, disallow: '/' },
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/home',
          '/list',
          '/nearby',
          '/route',
          '/account',
          '/favorites',
          '/notifications',
          '/login',
          '/register',
          '/profile',
          '/detail/',
          '/admin',
          '/editor-panel',
          '/stats',
          '/photo-approval',
          '/rating-approval',
          '/user-management',
        ],
      },
    ],
    sitemap: `${SITE}/sitemap.xml`,
  };
}
