import { LOCALES } from '@/lib/places';

const SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://kitabe.org').replace(/\/$/, '');

const SITEMAP_IDS = [...LOCALES, 'listings', 'home'] as const;

export const revalidate = 3600;

export async function GET() {
  const lastmod = new Date().toISOString();
  const entries = SITEMAP_IDS.map(
    (id) =>
      `  <sitemap>\n    <loc>${SITE}/sitemap/${id}.xml</loc>\n    <lastmod>${lastmod}</lastmod>\n  </sitemap>`
  ).join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</sitemapindex>\n`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
