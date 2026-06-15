import type { Locale } from './places';

export type FeaturedExploreCity = {
  slug: string;
  names: Record<Locale, string>;
  image: string;
  imageAlt: Record<Locale, string>;
};

export const FEATURED_CITY_IMAGES: Record<string, string> = {
  istanbul: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Bosphorus_Bridge_%28cropped%29.jpg/800px-Bosphorus_Bridge_%28cropped%29.jpg',
  antalya: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Antalya_Kaleici_marina.jpg/800px-Antalya_Kaleici_marina.jpg',
  izmir: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Izmir_Clock_Tower.jpg/800px-Izmir_Clock_Tower.jpg',
  mugla: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Bodrum_Castle.jpg/800px-Bodrum_Castle.jpg',
  nevsehir: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Hot_air_balloons_in_Cappadocia.jpg/800px-Hot_air_balloons_in_Cappadocia.jpg',
  ankara: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Anit_Kabir_-_Ankara.jpg/800px-Anit_Kabir_-_Ankara.jpg',
  bursa: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Green_Mosque_Bursa.jpg/800px-Green_Mosque_Bursa.jpg',
  aydin: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Ephesus_Celsus_Library_Fa%C3%A7ade.jpg/800px-Ephesus_Celsus_Library_Fa%C3%A7ade.jpg',
  trabzon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Sumela_from_across_valley.jpg/800px-Sumela_from_across_valley.jpg',
  denizli: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/Pamukkale_30.jpg/800px-Pamukkale_30.jpg',
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
  'denizli',
] as const;

export function cityHubImage(slug: string): string | null {
  return FEATURED_CITY_IMAGES[slug] ?? null;
}
