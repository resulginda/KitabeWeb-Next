import { cache } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'https://api.kitabe.org';
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
    const res = await fetch(`${API}/api/places/seo/index`, {
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

export const getPlaceBySlug = cache(async (
  locale: Locale,
  citySlug: string,
  placeSlug: string
): Promise<SeoPlace | null> => {
  try {
    const res = await fetch(
      `${API}/api/places/by-slug/${locale}/${encodeURIComponent(citySlug)}/${encodeURIComponent(placeSlug)}`,
      { next: { revalidate: 86400 } }
    );
    if (res.status === 404) return null;
    if (!res.ok) {
      console.warn(
        `[places] by-slug HTTP ${res.status}: ${locale}/${citySlug}/${placeSlug}`
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
