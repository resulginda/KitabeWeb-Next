import type { Locale } from './places';
import ar from '@/content/listing-guides/ar.json';
import en from '@/content/listing-guides/en.json';
import ru from '@/content/listing-guides/ru.json';
import tr from '@/content/listing-guides/tr.json';

/**
 * scripts/generate-listing-guides.mjs ile o sayfadaki gerçek yerlerden üretilen rehber metinleri.
 * Anahtar dilden bağımsız groupKey: "TR şehir|TR ilçe|kategori id".
 */
type GuideMap = Record<string, string[]>;

const GUIDES: Record<Locale, GuideMap> = {
  tr: tr as GuideMap,
  en: en as GuideMap,
  ru: ru as GuideMap,
  ar: ar as GuideMap,
};

export function listingGuideParagraphs(groupKey: string | undefined, locale: Locale): string[] {
  if (!groupKey) return [];
  return GUIDES[locale][groupKey] ?? [];
}

export function hasListingGuide(groupKey: string | undefined, locale: Locale): boolean {
  return listingGuideParagraphs(groupKey, locale).length > 0;
}
