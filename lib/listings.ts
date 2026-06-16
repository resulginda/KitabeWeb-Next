import { cache } from 'react';
import { getCityLabel } from './citySlugLabel';
import {
  LOCALES,
  pickText,
  type Locale,
  type MultilingualText,
} from './places';

export type { Locale };
export { LOCALES };

const API = process.env.NEXT_PUBLIC_API_URL ?? 'https://api.kitabe.org';
const SERVER_KEY = process.env.SERVER_API_KEY || process.env.REVALIDATE_SECRET;

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
};

export type ListingBreadcrumb = { label: string; href: string };

export type ListingFilterResult = {
  kind: 'city' | 'district' | 'category' | 'district_category';
  locale: Locale;
  citySlug: string;
  hubSlug: string;
  filter: string[];
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

function apiHeaders(): HeadersInit {
  if (!SERVER_KEY) return {};
  return { 'X-Kitabe-Internal-Key': SERVER_KEY };
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

  try {
    const res = await fetch(`${API}/api/places/seo/filter?${qs}`, {
      headers: apiHeaders(),
      next: { tags: ['listings-index'], revalidate: 3600 },
    });
    if (res.status === 404) return null;
    if (!res.ok) {
      console.warn(`[listings] filter HTTP ${res.status}`);
      return null;
    }
    const json = await res.json();
    return json.data ?? null;
  } catch (err) {
    console.warn('[listings] filter fetch failed:', err);
    return null;
  }
});

export const getTaxonomyIndex = cache(async (): Promise<TaxonomyCombination[]> => {
  const all: TaxonomyCombination[] = [];
  for (const locale of LOCALES) {
    try {
      const qs = new URLSearchParams({ locale, minimal: '1' });
      const res = await fetch(`${API}/api/places/seo/taxonomy-index?${qs}`, {
        headers: apiHeaders(),
        next: { tags: ['listings-index'], revalidate: 3600 },
      });
      if (!res.ok) {
        console.warn(`[listings] taxonomy-index HTTP ${res.status} (${locale})`);
        continue;
      }
      const json = await res.json();
      const batch: RawTaxonomyCombination[] = json.data?.combinations ?? [];
      all.push(...batch.map(normalizeTaxonomyCombination));
    } catch (err) {
      console.warn(`[listings] taxonomy-index fetch failed (${locale}):`, err);
    }
  }
  return all;
});

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
      district: `${district} — ${city}`,
      category: `${category} в ${city}`,
      district_category: `${category} в ${district}, ${city}`,
    },
    ar: {
      city: `أماكن للزيارة في ${city}`,
      district: `${district} — ${city}`,
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
