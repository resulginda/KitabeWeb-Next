import type { MetadataRoute } from 'next';

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://kitabe.org';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
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
    sitemap: `${SITE}/sitemap.xml`,
  };
}
