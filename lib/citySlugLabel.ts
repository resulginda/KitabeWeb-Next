import { FEATURED_EXPLORE_CITIES } from '@kitabe/data/featuredExploreCities';
import { TURKIYE_ILLER } from '@kitabe/data/turkiyeIllerIlceler';
import type { Locale } from './places';

function cityNameToSlug(name: string): string {
  return name
    .toLocaleLowerCase('tr-TR')
    .replace(/ı/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '');
}

const SLUG_TO_TR: Record<string, string> = {};
for (const name of TURKIYE_ILLER) {
  SLUG_TO_TR[cityNameToSlug(name)] = name;
}

const SLUG_LOCALE_LABELS: Record<string, Partial<Record<Locale, string>>> = {};
for (const city of FEATURED_EXPLORE_CITIES) {
  SLUG_LOCALE_LABELS[city.slug] = city.names;
}

function asciiLabel(trName: string): string {
  return trName
    .replace(/İ/g, 'I')
    .replace(/ı/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/Ğ/g, 'G')
    .replace(/ü/g, 'u')
    .replace(/Ü/g, 'U')
    .replace(/ş/g, 's')
    .replace(/Ş/g, 'S')
    .replace(/ö/g, 'o')
    .replace(/Ö/g, 'O')
    .replace(/ç/g, 'c')
    .replace(/Ç/g, 'C');
}

function titleCaseSlug(slug: string): string {
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/** Human-readable city name when taxonomy-index omits labels.city */
export function getCityLabel(citySlug: string, locale: Locale): string {
  const slug = citySlug.trim().toLowerCase();
  const featured = SLUG_LOCALE_LABELS[slug];
  if (featured?.[locale]) return featured[locale];

  const tr = SLUG_TO_TR[slug];
  if (tr) {
    if (locale === 'tr') return tr;
    if (locale === 'en') return asciiLabel(tr);
    return tr;
  }

  return titleCaseSlug(slug);
}
