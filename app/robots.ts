import type { MetadataRoute } from 'next';
import { BLOCKED_BOTS } from '@/lib/blockedBots';

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://kitabe.org';

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
