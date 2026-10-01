import type { MetadataRoute } from 'next';
import { encodePathSegments } from '@/lib/detectLocale';
import { buildListingPath, getTaxonomyIndex } from '@/lib/listings';
import { shouldIndexTaxonomy } from '@/lib/listingQuality';
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
    const home = LOCALES.map((locale) => ({
      url: `${SITE}/${locale}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 1,
    }));
    const legalDocs = ['about', 'privacy', 'terms', 'contact'] as const;
    const legal = LOCALES.flatMap((locale) =>
      legalDocs.map((doc) => ({
        url: `${SITE}/legal/${locale}/${doc}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      }))
    );
    return [...home, ...legal];
  }

  if (id === 'listings') {
    const listings = (await getTaxonomyIndex()).filter(shouldIndexTaxonomy);
    const listingAlternates = new Map<string, Record<string, string>>();

    const groupOf = (combo: (typeof listings)[number]) =>
      combo.groupKey ?? `${combo.citySlug}::${(combo.filter || []).join('/')}`;
    const urlOf = (combo: (typeof listings)[number]) =>
      `${SITE}${encodePathSegments(buildListingPath(combo.locale, combo.citySlug, combo.filter || []))}`;

    for (const combo of listings) {
      const key = groupOf(combo);
      if (!listingAlternates.has(key)) listingAlternates.set(key, {});
      const group = listingAlternates.get(key)!;
      // Bir dilde aynı kimlikle iki slug varsa ilk gelen (en çok yer içeren) kalır
      if (!group[combo.locale]) group[combo.locale] = urlOf(combo);
    }

    return listings.map((combo) => {
      const url = urlOf(combo);
      const languages = { ...listingAlternates.get(groupOf(combo)), [combo.locale]: url };
      if (languages.tr) languages['x-default'] = languages.tr;
      return {
        url,
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
