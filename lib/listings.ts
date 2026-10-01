import { cache } from 'react';
import { getCityLabel } from './citySlugLabel';
import {
  ApiUnavailableError,
  fetchApi,
  LOCALES,
  pickText,
  tolerateDuringBuild,
  type Locale,
  type MultilingualText,
} from './places';

export type { Locale };
export { LOCALES };

const API = process.env.NEXT_PUBLIC_API_URL ?? 'https://api.kitabe.org';
export const HUB_SLUGS: Record<Locale, string> = {
  tr: 'kesfet',
  en: 'explore',
  ru: 'mesta',
  ar: 'istikshaf',
};

export type ListingPlace = {
  id: string;
  name: MultilingualText | string;
  city: MultilingualText | string;
  district: MultilingualText | string;
  thumbnailUrl?: string;
  imageUrl?: string;
  detailPath?: string | null;
  citySlug?: string | null;
  placeSlug?: string | null;
  /** Dil başına "şehir/yer" slug'ı */
  slug?: Partial<Record<Locale, string>> | null;
};

export type ListingBreadcrumb = { label: string; href: string };

export type ListingFilterResult = {
  kind: 'city' | 'district' | 'category' | 'district_category';
  locale: Locale;
  citySlug: string;
  hubSlug: string;
  filter: string[];
  /** Dilden bağımsız sayfa kimliği (TR şehir | TR ilçe | kategori id); eski backend'de yok */
  groupKey?: string;
  labels: {
    city: string;
    district: string | null;
    category: string | null;
  };
  total: number;
  places: ListingPlace[];
  breadcrumb: ListingBreadcrumb[];
};

export type TaxonomyCombination = {
  locale: Locale;
  citySlug: string;
  hubSlug: string;
  filter: string[];
  groupKey?: string;
  filterTypes: string[];
  districtSlug: string | null;
  categorySlug: string | null;
  placeCount: number;
  labels: {
    city: string;
    district: string | null;
    category: string | null;
  };
  lastModified: string;
};

type RawTaxonomyCombination = Partial<TaxonomyCombination> & {
  locale: Locale;
  citySlug: string;
  hubSlug: string;
  filter?: string[];
  placeCount: number;
  lastModified: string;
};

function normalizeTaxonomyCombination(raw: RawTaxonomyCombination): TaxonomyCombination {
  const filter = raw.filter ?? [];
  return {
    locale: raw.locale,
    citySlug: raw.citySlug,
    hubSlug: raw.hubSlug,
    filter,
    groupKey: raw.groupKey,
    filterTypes: raw.filterTypes ?? [],
    districtSlug: raw.districtSlug ?? null,
    categorySlug: raw.categorySlug ?? null,
    placeCount: raw.placeCount,
    labels: {
      city: raw.labels?.city ?? getCityLabel(raw.citySlug, raw.locale),
      district: raw.labels?.district ?? null,
      category: raw.labels?.category ?? null,
    },
    lastModified: raw.lastModified,
  };
}

export function isHubSegment(locale: Locale, segment: string): boolean {
  const expected = HUB_SLUGS[locale];
  return segment.trim().toLowerCase() === expected.toLowerCase();
}

/** kesfet-muzeler gibi tek segment (nginx 3-segment uyumlu) */
export function isHubDashSegment(locale: Locale, segment: string): boolean {
  const hub = HUB_SLUGS[locale].toLowerCase();
  const s = segment.trim().toLowerCase();
  return s === hub || s.startsWith(`${hub}-`);
}

export function buildListingPath(
  locale: Locale,
  citySlug: string,
  filter: string[] = []
): string {
  const hub = HUB_SLUGS[locale];
  const base = `/${locale}/${citySlug}`;
  if (!filter.length) return `${base}/${hub}`;
  return `${base}/${hub}-${filter.join('-')}`;
}

function pathKey(path: string): string {
  let decoded = path;
  try {
    decoded = decodeURIComponent(path);
  } catch {
    // olduğu gibi karşılaştır
  }
  return decoded.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

/**
 * Şehir/ilçe adı yerlerde farklı yazıldığında (RU "анталия" / "antalya") backend takma adı
 * kanonik slug'a çözer; istek kanonik dash veya slash biçiminde değilse kanonik yol döner.
 */
export function listingRedirectTarget(
  data: Pick<ListingFilterResult, 'locale' | 'citySlug' | 'filter'>,
  city: string,
  segments: string[]
): string | null {
  const canonical = buildListingPath(data.locale, data.citySlug, data.filter);
  const slashForm = [`/${data.locale}/${data.citySlug}/${HUB_SLUGS[data.locale]}`, ...data.filter].join('/');
  const requested = pathKey(`/${data.locale}/${city}/${segments.join('/')}`);
  if (requested === pathKey(canonical) || requested === pathKey(slashForm)) return null;
  return canonical;
}

export const getListingByFilter = cache(async (
  locale: Locale,
  citySlug: string,
  filterSegments: string[] = []
): Promise<ListingFilterResult | null> => {
  const qs = new URLSearchParams({ locale, city: citySlug });

  if (filterSegments.length === 1) {
    const seg = filterSegments[0];
    if (isHubDashSegment(locale, seg) && !isHubSegment(locale, seg)) {
      qs.set('hubSegment', seg);
    } else if (!isHubSegment(locale, seg)) {
      qs.set('filter', seg);
    }
  } else if (filterSegments.length > 1) {
    qs.set('filter', filterSegments.join('/'));
  }

  const res = await fetchApi(`${API}/api/places/seo/filter?${qs}`, {
    next: { tags: ['listings-index'], revalidate: 3600 },
  }).catch((err) => tolerateDuringBuild(err, null));
  if (!res || res.status === 404) return null;
  if (!res.ok) {
    console.warn(`[listings] filter HTTP ${res.status}`);
    return null;
  }
  const json = await res.json();
  return json.data ?? null;
});

/** Backend'i aynı anda onlarca büyük şehir isteğiyle boğmamak için. */
export async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>
): Promise<R[]> {
  const out = new Array<R>(items.length);
  let next = 0;
  const worker = async () => {
    while (next < items.length) {
      const i = next++;
      out[i] = await fn(items[i]);
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return out;
}

export const getTaxonomyIndex = cache(async (): Promise<TaxonomyCombination[]> => {
  const all: TaxonomyCombination[] = [];
  try {
    for (const locale of LOCALES) {
      const qs = new URLSearchParams({ locale, minimal: '1' });
      const res = await fetchApi(`${API}/api/places/seo/taxonomy-index?${qs}`, {
        next: { tags: ['listings-index'], revalidate: 3600 },
      });
      if (!res.ok) {
        throw new ApiUnavailableError(`[listings] taxonomy-index HTTP ${res.status} (${locale})`);
      }
      const json = await res.json();
      const batch: RawTaxonomyCombination[] = json.data?.combinations ?? [];
      all.push(...batch.map(normalizeTaxonomyCombination));
    }
  } catch (err) {
    return tolerateDuringBuild(err, all);
  }
  return all;
});

/**
 * Aynı liste sayfasının dildeki eşdeğeri. Slug'lar dile göre değiştiği için groupKey ile
 * eşlenir; groupKey yoksa (eski backend) yalnızca birebir aynı slug'la var olan sayfa kabul edilir.
 * Bir dilde aynı kimlikle birden çok sayfa varsa en çok yer içeren (index sırası) seçilir.
 */
export function findListingEquivalent(
  source: Pick<ListingFilterResult, 'citySlug' | 'filter' | 'groupKey'>,
  targetLocale: Locale,
  index: TaxonomyCombination[]
): TaxonomyCombination | undefined {
  if (source.groupKey) {
    return index.find((c) => c.locale === targetLocale && c.groupKey === source.groupKey);
  }
  const filterKey = source.filter.join('/');
  return index.find(
    (c) =>
      c.locale === targetLocale &&
      c.citySlug === source.citySlug &&
      c.filter.join('/') === filterKey
  );
}

/** hreflang için: yalnızca gerçekten var olan dil eşdeğerlerinin path'leri */
export async function getListingAlternatePaths(
  data: ListingFilterResult
): Promise<Partial<Record<Locale, string>>> {
  const index = await getTaxonomyIndex();
  const paths: Partial<Record<Locale, string>> = {
    [data.locale]: buildListingPath(data.locale, data.citySlug, data.filter),
  };
  for (const loc of LOCALES) {
    if (loc === data.locale) continue;
    const match = findListingEquivalent(data, loc, index);
    if (match) paths[loc] = buildListingPath(loc, match.citySlug, match.filter);
  }
  return paths;
}

export function listingTitle(data: ListingFilterResult, locale: Locale): string {
  const { labels, total } = data;
  const city = labels.city;
  const district = labels.district;
  const category = labels.category;

  const templates: Record<Locale, Record<string, string>> = {
    tr: {
      city: `${city} Gezilecek Yerler`,
      district: `${district} Gezilecek Yerler — ${city}`,
      category: `${city} ${category}`,
      district_category: `${district} ${category} — ${city}`,
    },
    en: {
      city: `Things to Do in ${city}`,
      district: `Things to Do in ${district}, ${city}`,
      category: `${category} in ${city}`,
      district_category: `${category} in ${district}, ${city}`,
    },
    ru: {
      city: `Достопримечательности ${city}`,
      district: `Достопримечательности ${district}, ${city}`,
      category: `${category} в ${city}`,
      district_category: `${category} в ${district}, ${city}`,
    },
    ar: {
      city: `أماكن للزيارة في ${city}`,
      district: `أماكن للزيارة في ${district}، ${city}`,
      category: `${category} في ${city}`,
      district_category: `${category} في ${district}، ${city}`,
    },
  };

  const t = templates[locale][data.kind] || templates[locale].city;
  return `${t} (${total}) | Kitabe`;
}

export function listingDescription(data: ListingFilterResult, locale: Locale): string {
  const { labels, total } = data;
  const city = labels.city;
  const district = labels.district;
  const category = labels.category;

  const parts: Record<Locale, string> = {
    tr: `${city}${district ? ` ${district}` : ''}${category ? ` ${category}` : ' gezilecek yer'} rehberi. ${total} kültürel miras noktası, harita ve hikâyeleriyle Kitabe'de keşfedin.`,
    en: `Discover ${total} cultural heritage places${category ? ` — ${category}` : ''} in ${city}${district ? `, ${district}` : ''}. Maps, stories and travel tips on Kitabe.`,
    ru: `${total} мест${category ? ` — ${category}` : ''} в ${city}${district ? `, ${district}` : ''}. Карта, истории и советы на Kitabe.`,
    ar: `اكتشف ${total} مكاناً${category ? ` — ${category}` : ''} في ${city}${district ? `، ${district}` : ''}. خرائط وقصص على Kitabe.`,
  };

  const text = parts[locale] || parts.en;
  return text.length > 165 ? `${text.slice(0, 162)}...` : text;
}

export function pickListingText(
  field: MultilingualText | string | undefined,
  locale: Locale
): string {
  return pickText(field, locale);
}
