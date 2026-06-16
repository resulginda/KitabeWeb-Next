import type { Locale } from './places';

export const FEATURED_CITY_IMAGES: Record<string, string> = {
  istanbul: '/cities/istanbul.webp',
  antalya: '/cities/antalya.webp',
  izmir: '/cities/izmir.webp',
  mugla: '/cities/mugla.webp',
  nevsehir: '/cities/nevsehir.webp',
  ankara: '/cities/ankara.webp',
  bursa: '/cities/bursa.webp',
  aydin: '/cities/aydin.webp',
  trabzon: '/cities/trabzon.webp',
};

export const FEATURED_EXPLORE_SLUGS = [
  'istanbul',
  'antalya',
  'izmir',
  'mugla',
  'nevsehir',
  'ankara',
  'bursa',
  'aydin',
  'trabzon',
] as const;

export function cityHubImage(slug: string): string | null {
  return FEATURED_CITY_IMAGES[slug] ?? null;
}
