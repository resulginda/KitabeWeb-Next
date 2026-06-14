import type { MetadataRoute } from 'next';
import { getPlaceIndex, LOCALES } from '@/lib/places';

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://kitabe.org';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const index = await getPlaceIndex();
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of LOCALES) {
    entries.push({
      url: `${SITE}/${locale}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    });
  }

  for (const place of index) {
    const alternates: Record<string, string> = {};
    for (const loc of LOCALES) {
      const slug = place.slug?.[loc];
      if (!slug) continue;
      const [city, ...rest] = slug.split('/');
      alternates[loc] = `${SITE}/${loc}/${city}/${rest.join('/')}`;
    }

    for (const locale of LOCALES) {
      const slug = place.slug?.[locale];
      if (!slug) continue;
      const [city, ...rest] = slug.split('/');

      entries.push({
        url: `${SITE}/${locale}/${city}/${rest.join('/')}`,
        lastModified: new Date(place.updatedAt),
        changeFrequency: 'monthly',
        priority: 0.9,
        alternates: { languages: alternates },
      });
    }
  }

  return entries;
}
