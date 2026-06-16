import { LOCALES, type Locale } from '@/lib/places';

export { LOCALES, type Locale };
export const DEFAULT_LOCALE: Locale = 'tr';
export const LOCALE_COOKIE = 'kitabe_locale';

/** tr/en/ru/ar veya null (desteklenmiyor → caller en kullanır) */
export function resolveLocaleFromLanguageTag(tag: string): Locale | null {
  const base = tag.toLowerCase().split('-')[0];
  if (base === 'tr' || base === 'en' || base === 'ru' || base === 'ar') {
    return base;
  }
  return null;
}

/** Accept-Language başlığından en uygun dili seç; desteklenmeyenler → en */
export function detectLocaleFromAcceptLanguage(acceptLanguage: string | null | undefined): Locale {
  if (!acceptLanguage?.trim()) return DEFAULT_LOCALE;

  const ranked = acceptLanguage
    .split(',')
    .map((part) => {
      const [tag, ...params] = part.trim().split(';');
      const qParam = params.find((p) => p.trim().startsWith('q='));
      const q = qParam ? parseFloat(qParam.trim().slice(2)) : 1;
      return { tag: tag.trim(), q: Number.isFinite(q) ? q : 0 };
    })
    .sort((a, b) => b.q - a.q);

  for (const { tag } of ranked) {
    const locale = resolveLocaleFromLanguageTag(tag);
    if (locale) return locale;
  }

  return DEFAULT_LOCALE;
}

export function isSupportedLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

/** Kiril/Arap slug'lar — HTTP Location header yalnızca ASCII kabul eder */
export function encodePathSegments(path: string): string {
  return path
    .split('/')
    .map((segment) => {
      if (!segment) return segment;
      try {
        return encodeURIComponent(decodeURIComponent(segment));
      } catch {
        return encodeURIComponent(segment);
      }
    })
    .join('/');
}

export function slugPathForLocale(
  slugMap: Record<string, string> | undefined,
  locale: Locale
): string | null {
  const full = slugMap?.[locale];
  if (!full) return null;
  const [city, ...rest] = full.split('/');
  if (!city || rest.length === 0) return null;
  const raw = `/${locale}/${city}/${rest.join('/')}`;
  return encodePathSegments(raw);
}

/** Tarayıcı navigator.languages (client) */
export function detectLocaleFromNavigator(): Locale {
  if (typeof navigator === 'undefined') return DEFAULT_LOCALE;
  const langs =
    navigator.languages?.length > 0 ? navigator.languages : [navigator.language];
  for (const lang of langs) {
    const locale = resolveLocaleFromLanguageTag(lang);
    if (locale) return locale;
  }
  return DEFAULT_LOCALE;
}
