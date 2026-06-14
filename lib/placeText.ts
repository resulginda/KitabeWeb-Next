import { pickText, type Locale, type MultilingualText } from '@/lib/places';

export function pickArray(field: unknown, locale: Locale): string[] {
  if (!field) return [];
  if (Array.isArray(field)) return field.map(String).filter(Boolean);
  if (typeof field === 'object' && field !== null) {
    const o = field as Record<string, unknown>;
    const localized = o[locale] ?? o.tr ?? o.en;
    if (Array.isArray(localized)) return localized.map(String).filter(Boolean);
    if (Array.isArray(o.main)) {
      return o.main
        .map((m) => pickText(m as MultilingualText | string, locale))
        .filter(Boolean);
    }
  }
  return [];
}
