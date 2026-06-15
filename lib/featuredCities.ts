import type { Locale } from './places';

export const FEATURED_CITY_IMAGES: Record<string, string> = {
  istanbul: '/cities/istanbul.jpg',
  antalya: '/cities/antalya.jpg',
  izmir: '/cities/izmir.jpg',
  mugla: '/cities/mugla.jpg',
  nevsehir: '/cities/nevsehir.jpg',
  ankara: '/cities/ankara.jpg',
  bursa: '/cities/bursa.jpg',
  aydin: '/cities/aydin.jpg',
  trabzon: '/cities/trabzon.jpg',
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
