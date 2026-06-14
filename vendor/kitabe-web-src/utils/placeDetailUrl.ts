import type { Language } from '../contexts/LanguageContext';
import { API_BASE_URL } from '../config/api';

export type PlaceSlugSource = {
  id: string;
  slug?: Partial<Record<Language, string>> | Record<string, string>;
};

const LOCALE_ORDER: Language[] = ['tr', 'en', 'ru', 'ar'];

/**
 * SEO detay path'i: /tr/antalya/simena-kalekoy-antik-kenti-ve-kalesi
 * Slug yoksa eski /detail/:id döner.
 */
export function getPlaceDetailUrl(place: PlaceSlugSource, locale: Language): string {
  const slugObj = place.slug;
  if (slugObj && typeof slugObj === 'object') {
    const candidates = LOCALE_ORDER.map((loc) => ({
      loc,
      path: slugObj[loc],
    })).filter((e) => typeof e.path === 'string' && e.path.includes('/'));

    const match = candidates.find((e) => e.loc === locale) ?? candidates[0];
    if (match?.path) {
      const [citySlug, ...rest] = match.path.split('/');
      if (citySlug && rest.length > 0) {
        return `/${match.loc}/${citySlug}/${rest.join('/')}`;
      }
    }
  }
  return `/detail/${place.id}`;
}

export function getPlaceDetailAbsoluteUrl(
  place: PlaceSlugSource,
  locale: Language,
  origin = typeof window !== 'undefined' ? window.location.origin : 'https://kitabe.org'
): string {
  return `${origin}${getPlaceDetailUrl(place, locale)}`;
}

async function resolveSlugUrl(place: PlaceSlugSource, locale: Language): Promise<string> {
  let target = getPlaceDetailUrl(place, locale);
  if (!target.startsWith('/detail/')) return target;

  try {
    const res = await fetch(`${API_BASE_URL}/api/places/${encodeURIComponent(place.id)}`);
    const json = await res.json();
    if (json.success && json.data?.slug) {
      target = getPlaceDetailUrl({ id: place.id, slug: json.data.slug }, locale);
    }
  } catch {
    /* fallback /detail/:id */
  }
  return target;
}

/** Next.js ISR sayfasına git — React Router navigate kullanılmaz. */
export async function openPlaceDetail(place: PlaceSlugSource, locale: Language): Promise<void> {
  window.location.href = await resolveSlugUrl(place, locale);
}

export async function openPlaceDetailById(
  placeId: string,
  locale: Language,
  resolvePlace?: (id: string) => PlaceSlugSource | undefined
): Promise<void> {
  const place = resolvePlace?.(placeId);
  if (place) {
    await openPlaceDetail(place, locale);
    return;
  }
  window.location.href = await resolveSlugUrl({ id: placeId }, locale);
}
