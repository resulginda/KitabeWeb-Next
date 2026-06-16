import type { MetadataRoute } from 'next';
import { encodePathSegments } from '@/lib/detectLocale';
import { buildListingPath, getTaxonomyIndex } from '@/lib/listings';
import { getPlaceIndex, LOCALES, type Locale } from '@/lib/places';

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://kitabe.org';

export const revalidate = 3600;

/** Dil başına + liste + ana sayfa — tek 13MB dosya yerine parçalı sitemap */
export async function generateSitemaps() {
  return [
    ...LOCALES.map((locale) => ({ id: locale })),
    { id: 'listings' },
    { id: 'home' },
  ];
}

function placeEntriesForLocale(
  index: Awaited<ReturnType<typeof getPlaceIndex>>,
  locale: Locale
): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const place of index) {
    const slug = place.slug?.[locale];
    if (!slug) continue;
    const [city, ...rest] = slug.split('/');

    const alternates: Record<string, string> = {};
    for (const loc of LOCALES) {
      const s = place.slug?.[loc];
      if (!s) continue;
      const [c, ...r] = s.split('/');
      alternates[loc] = `${SITE}${encodePathSegments(`/${loc}/${c}/${r.join('/')}`)}`;
    }
    if (alternates.tr) alternates['x-default'] = alternates.tr;

    entries.push({
      url: `${SITE}${encodePathSegments(`/${locale}/${city}/${rest.join('/')}`)}`,
      lastModified: new Date(place.updatedAt),
      changeFrequency: 'monthly',
      priority: 0.9,
      alternates: { languages: alternates },
    });
  }

  return entries;
}

export default async function sitemap({
  id,
}: {
  id: string;
}): Promise<MetadataRoute.Sitemap> {
  if (id === 'home') {
    return LOCALES.map((locale) => ({
      url: `${SITE}/${locale}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    }));
  }

  if (id === 'listings') {
    const listings = await getTaxonomyIndex();
    const listingAlternates = new Map<string, Record<string, string>>();

    for (const combo of listings) {
      const groupKey = `${combo.citySlug}::${(combo.filter || []).join('/')}`;
      if (!listingAlternates.has(groupKey)) listingAlternates.set(groupKey, {});
      const path = buildListingPath(combo.locale, combo.citySlug, combo.filter || []);
      listingAlternates.get(groupKey)![combo.locale] =
        `${SITE}${encodePathSegments(path)}`;
    }

    return listings.map((combo) => {
      const groupKey = `${combo.citySlug}::${(combo.filter || []).join('/')}`;
      const languages = { ...listingAlternates.get(groupKey) };
      if (languages.tr) languages['x-default'] = languages.tr;
      const path = buildListingPath(combo.locale, combo.citySlug, combo.filter || []);
      return {
        url: `${SITE}${encodePathSegments(path)}`,
        lastModified: new Date(combo.lastModified || Date.now()),
        changeFrequency: 'weekly' as const,
        priority: combo.filter?.length ? 0.75 : 0.8,
        alternates: { languages },
      };
    });
  }

  if (LOCALES.includes(id as Locale)) {
    const index = await getPlaceIndex();
    return placeEntriesForLocale(index, id as Locale);
  }

  return [];
}
