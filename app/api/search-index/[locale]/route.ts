import { NextResponse } from 'next/server';
import { getCityLabel, localeCitySlug } from '@/lib/citySlugLabel';
import { encodePathSegments } from '@/lib/detectLocale';
import { localizedPlacePath } from '@/lib/home/places';
import {
  buildListingPath,
  getListingByFilter,
  getTaxonomyIndex,
  mapWithConcurrency,
  pickListingText,
  LOCALES,
  type Locale,
  type TaxonomyCombination,
} from '@/lib/listings';
import { getCityFilterChips } from '@/lib/taxonomyChips';

export const dynamic = 'force-static';
export const revalidate = 21600;

export function generateStaticParams() {
  return [];
}

/** [tür, ad, alt satır, href, sayı, diğer ad] — tür: 0 şehir, 1 ilçe, 2 kategori, 3 yer */
type SearchEntry = [0 | 1 | 2 | 3, string, string, string, number, string?];

const CONCURRENCY = 4;

/** İl adı olmayan ama çok aranan bölge adları */
const CITY_ALIASES: Record<string, string> = {
  nevsehir: 'Kapadokya Cappadocia Каппадокия كابادوكيا',
};

/**
 * Şehirler TR hub'larından gezilir: TR dışı dillerde slug'lar tutarsız (ayd-n, Kiril kopyalar).
 * Yerler TR listesinden okunur; yanıt her dilin ad ve slug'ını taşır.
 */
async function buildIndex(locale: Locale): Promise<SearchEntry[]> {
  const all = await getTaxonomyIndex();
  const hubsOf = (l: Locale) => all.filter((c) => c.locale === l && c.filter.length === 0);
  const localeHubs = new Map(hubsOf(locale).map((c) => [c.citySlug, c]));
  const localeSlugs = new Set(localeHubs.keys());
  const cities = hubsOf('tr')
    .map((tr) => {
      const slug = localeCitySlug(tr.citySlug, localeSlugs);
      const hub = slug ? localeHubs.get(slug) : undefined;
      return hub ? { trSlug: tr.citySlug, hub, label: getCityLabel(tr.citySlug, locale) } : null;
    })
    .filter((c): c is { trSlug: string; hub: TaxonomyCombination; label: string } => Boolean(c))
    .sort((a, b) => b.hub.placeCount - a.hub.placeCount);

  const entries: SearchEntry[] = [];
  for (const { trSlug, hub, label } of cities) {
    const entry: SearchEntry = [
      0,
      label,
      '',
      encodePathSegments(buildListingPath(locale, hub.citySlug, [])),
      hub.placeCount,
    ];
    if (CITY_ALIASES[trSlug]) entry.push(CITY_ALIASES[trSlug]);
    entries.push(entry);
  }

  const results = await mapWithConcurrency(cities, CONCURRENCY, async (city) => {
    const [listing, chips] = await Promise.all([
      getListingByFilter('tr', city.trSlug, []).catch(() => null),
      getCityFilterChips(locale, city.hub.citySlug).catch(() => null),
    ]);
    return { city: city.label, listing, chips };
  });

  for (const { city, listing, chips } of results) {
    for (const d of chips?.districts ?? []) entries.push([1, d.label, city, d.href, d.count]);
    for (const c of chips?.categories ?? []) {
      if (c.count >= 2) entries.push([2, c.label, city, c.href, c.count]);
    }
    for (const place of listing?.places ?? []) {
      const href = localizedPlacePath(place, locale);
      if (!href) continue;
      const name = pickListingText(place.name, locale);
      const district = pickListingText(place.district, locale);
      const trName = locale === 'tr' ? '' : pickListingText(place.name, 'tr');
      const entry: SearchEntry = [3, name, district ? `${district}, ${city}` : city, encodePathSegments(href), 0];
      if (trName && trName !== name) entry.push(trName);
      entries.push(entry);
    }
  }
  return entries;
}

export async function GET(_request: Request, { params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!LOCALES.includes(locale as Locale)) {
    return NextResponse.json({ error: 'invalid locale' }, { status: 404 });
  }
  const entries = await buildIndex(locale as Locale);
  return NextResponse.json(entries, {
    headers: { 'Cache-Control': 'public, max-age=3600, s-maxage=21600, stale-while-revalidate=86400' },
  });
}
