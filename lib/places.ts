import { cache } from 'react';
import { encodePathSegments } from './detectLocale';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'https://api.kitabe.org';
/** Sunucu tarafı fetch — backend rate-limit bypass (REVALIDATE_SECRET ile aynı) */
const SERVER_KEY = process.env.SERVER_API_KEY || process.env.REVALIDATE_SECRET;

export const LOCALES = ['tr', 'en', 'ru', 'ar'] as const;
export type Locale = (typeof LOCALES)[number];

export type MultilingualText = {
  tr?: string;
  en?: string;
  ru?: string;
  ar?: string;
};

export type PlaceIndexEntry = {
  id: string;
  slug: Record<string, string>;
  city: MultilingualText;
  updatedAt: string;
};

export type SeoPlace = {
  id: string;
  name: MultilingualText | string;
  city: MultilingualText | string;
  district: MultilingualText | string;
  category: unknown;
  description: MultilingualText | string;
  latitude: number;
  longitude: number;
  story?: MultilingualText | string;
  visitTips?: MultilingualText | string[] | Record<Locale, string[]>;
  period?: MultilingualText | string;
  isUnesco?: boolean;
  imageUrl?: string;
  thumbnailUrl?: string;
  photos?: unknown[];
  googlePhotos?: { url?: string; thumbUrl?: string; photo_reference?: string }[];
  listGalleryThumbs?: string[];
  slug: Record<string, string>;
  metaTitle?: MultilingualText;
  metaDescription?: MultilingualText;
  updatedAt?: string;
};

function apiHeaders(): HeadersInit {
  if (!SERVER_KEY) return {};
  return { 'X-Kitabe-Internal-Key': SERVER_KEY };
}

async function fetchApi(url: string, init?: RequestInit): Promise<Response> {
  const maxRetries = 4;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const res = await fetch(url, {
      ...init,
      headers: { ...apiHeaders(), ...(init?.headers ?? {}) },
    });
    if (res.status !== 429 || attempt === maxRetries - 1) return res;
    const waitMs = 1000 * 2 ** attempt;
    console.warn(`[places] HTTP 429, retry ${attempt + 1}/${maxRetries - 1} in ${waitMs}ms`);
    await new Promise((r) => setTimeout(r, waitMs));
  }
  throw new Error('fetchApi: unreachable');
}

export function pickText(
  field: MultilingualText | string | undefined,
  locale: Locale,
  fallback = ''
): string {
  if (!field) return fallback;
  if (typeof field === 'string') return field;
  return field[locale] || field.tr || field.en || fallback;
}

export const getPlaceIndex = cache(async (): Promise<PlaceIndexEntry[]> => {
  try {
    const res = await fetchApi(`${API}/api/places/seo/index`, {
      next: { tags: ['places-index'], revalidate: 3600 },
    });
    if (!res.ok) {
      console.warn(`[places] SEO index HTTP ${res.status}`);
      return [];
    }
    const json = await res.json();
    return (json.data ?? []).map((row: { id: string; slug: Record<string, string>; city: MultilingualText; updatedAt: string }) => ({
      id: row.id,
      slug: row.slug ?? {},
      city: row.city ?? {},
      updatedAt: row.updatedAt,
    }));
  } catch (err) {
    console.warn('[places] SEO index fetch failed:', err);
    return [];
  }
});

function normalizeSlugSegment(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return trimmed;
  try {
    const decoded = decodeURIComponent(trimmed);
    return decoded.normalize('NFC');
  } catch {
    return trimmed.normalize('NFC');
  }
}

export const getPlaceBySlug = cache(async (
  locale: Locale,
  citySlug: string,
  placeSlug: string
): Promise<SeoPlace | null> => {
  const city = normalizeSlugSegment(citySlug);
  const slug = normalizeSlugSegment(placeSlug);

  try {
    const url = `${API}/api/places/by-slug/${locale}/${encodeURIComponent(city)}/${encodeURIComponent(slug)}`;
    const res = await fetchApi(url, { next: { revalidate: 86400 } });
    if (res.status === 404) return null;
    if (!res.ok) {
      console.warn(
        `[places] by-slug HTTP ${res.status}: ${locale}/${city}/${slug} → ${url}`
      );
      return null;
    }
    const json = await res.json();
    return json.data ?? null;
  } catch (err) {
    console.warn(`[places] by-slug fetch failed: ${locale}/${citySlug}/${placeSlug}`, err);
    return null;
  }
});

export const getPlaceById = cache(async (id: string): Promise<SeoPlace | null> => {
  try {
    const res = await fetchApi(`${API}/api/places/${id}`, {
      next: { revalidate: 86400 },
    });
    if (res.status === 404) return null;
    if (!res.ok) {
      console.warn(`[places] by-id HTTP ${res.status}: ${id}`);
      return null;
    }
    const json = await res.json();
    return json.data ?? null;
  } catch (err) {
    console.warn(`[places] by-id fetch failed: ${id}`, err);
    return null;
  }
});

/** Kiril/Arap slug API eşleşmezse SEO index + id ile yedek çözüm */
export const resolvePlaceForDetail = cache(async (
  locale: Locale,
  citySlug: string,
  placeSlug: string
): Promise<SeoPlace | null> => {
  const place = await getPlaceBySlug(locale, citySlug, placeSlug);
  if (place) return place;

  const city = normalizeSlugSegment(citySlug);
  const slug = normalizeSlugSegment(placeSlug);
  const targetPath = `${city}/${slug}`;

  const index = await getPlaceIndex();

  // Tam path herhangi bir dilde eşleşirse (index NFD, hedef NFC → iki taraf da NFC)
  const entry = index.find((row) =>
    LOCALES.some((l) => row.slug[l] && row.slug[l].normalize('NFC') === targetPath)
  );
  if (entry) return getPlaceById(entry.id);

  // Yer slug'ı doğru, şehir slug'ı yanlış (örn. /ar/amasya/... → ar/أماسيا/...)
  const placeOnly = index.find((row) => {
    const path = row.slug[locale];
    if (!path) return false;
    const parts = path.normalize('NFC').split('/');
    return parts.length >= 2 && parts.slice(1).join('/') === slug;
  });
  if (placeOnly) return getPlaceById(placeOnly.id);

  return null;
});

/** Kanonik detay path'i — redirect için */
export function canonicalPlacePath(place: SeoPlace, locale: Locale): string | null {
  const full = place.slug?.[locale];
  if (!full) return null;
  const [city, ...rest] = full.split('/');
  if (!city || rest.length === 0) return null;
  return encodePathSegments(`/${locale}/${city}/${rest.join('/')}`);
}

export function collectGalleryUrls(place: SeoPlace): string[] {
  const urls: string[] = [];
  const seen = new Set<string>();
  const add = (u?: string | null) => {
    if (!u || !u.startsWith('http') || seen.has(u)) return;
    seen.add(u);
    urls.push(u);
  };

  add(place.imageUrl);
  add(place.thumbnailUrl);

  if (Array.isArray(place.listGalleryThumbs)) {
    for (const u of place.listGalleryThumbs) add(u);
  }

  if (Array.isArray(place.photos)) {
    for (const p of place.photos) {
      if (typeof p === 'string') add(p);
      else if (p && typeof p === 'object') {
        const o = p as { url?: string; uri?: string };
        add(o.url || o.uri);
      }
    }
  }

  if (Array.isArray(place.googlePhotos)) {
    for (const g of place.googlePhotos) {
      if (g?.url) add(g.url);
      else if (g?.photo_reference) {
        add(`${API}/api/google/photo?reference=${encodeURIComponent(g.photo_reference)}`);
      }
    }
  }

  return urls;
}
