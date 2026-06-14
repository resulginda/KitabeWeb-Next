import type { MetadataRoute } from 'next';
import { encodePathSegments } from '@/lib/detectLocale';
import { buildListingPath, getTaxonomyIndex } from '@/lib/listings';
import { getPlaceIndex, LOCALES } from '@/lib/places';

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://kitabe.org';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [index, listings] = await Promise.all([getPlaceIndex(), getTaxonomyIndex()]);
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
      alternates[loc] = `${SITE}${encodePathSegments(`/${loc}/${city}/${rest.join('/')}`)}`;
    }

    for (const locale of LOCALES) {
      const slug = place.slug?.[locale];
      if (!slug) continue;
      const [city, ...rest] = slug.split('/');

      entries.push({
        url: `${SITE}${encodePathSegments(`/${locale}/${city}/${rest.join('/')}`)}`,
        lastModified: new Date(place.updatedAt),
        changeFrequency: 'monthly',
        priority: 0.9,
        alternates: { languages: alternates },
      });
    }
  }

  const listingAlternates = new Map<string, Record<string, string>>();
  for (const combo of listings) {
    const groupKey = `${combo.citySlug}::${(combo.filter || []).join('/')}`;
    if (!listingAlternates.has(groupKey)) listingAlternates.set(groupKey, {});
    const path = buildListingPath(combo.locale, combo.citySlug, combo.filter || []);
    listingAlternates.get(groupKey)![combo.locale] =
      `${SITE}${encodePathSegments(path)}`;
  }

  for (const combo of listings) {
    const groupKey = `${combo.citySlug}::${(combo.filter || []).join('/')}`;
    const languages = { ...listingAlternates.get(groupKey) };
    if (languages.tr) languages['x-default'] = languages.tr;

    const path = buildListingPath(combo.locale, combo.citySlug, combo.filter || []);
    entries.push({
      url: `${SITE}${encodePathSegments(path)}`,
      lastModified: new Date(combo.lastModified || Date.now()),
      changeFrequency: 'weekly',
      priority: combo.filter?.length ? 0.75 : 0.8,
      alternates: { languages },
    });
  }

  return entries;
}
