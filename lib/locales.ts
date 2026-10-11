/**
 * Sitenin tanıdığı tüm diller. Yeni dil: buraya ekle, Record<Locale, …> metinlerini doldur,
 * hazır olunca NEXT_PUBLIC_ENABLED_LOCALES ile yayına aç.
 */
export const ALL_LOCALES = ['tr', 'en', 'ru', 'ar', 'de', 'es', 'ja'] as const;
export type Locale = (typeof ALL_LOCALES)[number];

const DEFAULT_ENABLED: readonly Locale[] = ['tr', 'en', 'ru', 'ar'];

function parseEnabled(raw: string | undefined): readonly Locale[] {
  const codes = String(raw || '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  const picked = ALL_LOCALES.filter((l) => codes.includes(l));
  return picked.includes('tr') ? picked : DEFAULT_ENABLED;
}

/**
 * Yayındaki diller (menü, yönlendirme, sitemap, hreflang). Build sırasında sabitlenir;
 * env yoksa yalnızca tr/en/ru/ar.
 */
export const LOCALES: readonly Locale[] = parseEnabled(process.env.NEXT_PUBLIC_ENABLED_LOCALES);

export const RTL_LOCALES: readonly Locale[] = ['ar'];

export function isKnownLocale(value: string): value is Locale {
  return (ALL_LOCALES as readonly string[]).includes(value);
}

export function isEnabledLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

const LEGACY_LOCALES: readonly Locale[] = ['tr', 'en', 'ru', 'ar'];

/** İçerik çevirisi eksikse sırayla denenecek diller (yeni diller önce İngilizceye düşer). */
export function localeFallbacks(locale: Locale): Locale[] {
  if (LEGACY_LOCALES.includes(locale)) return [locale, 'tr', 'en'];
  return [locale, 'en', 'tr'];
}

/** Kendi slug'ı olmayan diller İngilizce slug'ı kullanır: /de/istanbul/hagia-sophia (backend ile aynı kural). */
export function slugLocale(locale: Locale): Locale {
  return LEGACY_LOCALES.includes(locale) ? locale : 'en';
}

/** Yerin bu dildeki "şehir/yer" slug yolu. */
export function placeSlugPath(
  slug: Partial<Record<string, string>> | null | undefined,
  locale: Locale
): string | undefined {
  return slug?.[slugLocale(locale)] || undefined;
}
