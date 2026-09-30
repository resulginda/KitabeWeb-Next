import { getCityLabel } from '../citySlugLabel';
import { encodePathSegments } from '../detectLocale';
import {
  getListingByFilter,
  mapWithConcurrency,
  pickListingText,
  type ListingPlace,
  type Locale,
} from '../listings';

/** Ana sayfa içeriğindeki yer referansı; ad/görsel/link her dilde API'den çözülür. */
export type PlaceRef = { city: string; id: string };

export type HomePlace = {
  id: string;
  name: string;
  district: string;
  city: string;
  citySlug: string;
  image: string | null;
  href: string;
};

export function localizedPlacePath(place: ListingPlace, locale: Locale): string | null {
  const full = place.slug?.[locale];
  if (full && full.includes('/')) return `/${locale}/${full}`;
  if (locale === 'tr' && place.detailPath) return place.detailPath;
  return null;
}

function toHomePlace(place: ListingPlace, citySlug: string, locale: Locale): HomePlace | null {
  const href = localizedPlacePath(place, locale);
  if (!href) return null;
  return {
    id: place.id,
    name: pickListingText(place.name, locale),
    district: pickListingText(place.district, locale),
    city: getCityLabel(citySlug, locale),
    citySlug,
    image: place.thumbnailUrl || place.imageUrl || null,
    href: encodePathSegments(href),
  };
}

/**
 * Şehir slug'ları dile göre değiştiği için (ayd-n, Kiril slug'lar) her zaman TR listesi okunur;
 * TR yanıtı tüm dillerin ad ve slug'ını taşır. Yayından kalkmış yerler sessizce düşer.
 */
export async function resolveHomePlaces(
  refs: PlaceRef[],
  locale: Locale
): Promise<Map<string, HomePlace>> {
  const cities = [...new Set(refs.map((r) => r.city))];
  const listings = await mapWithConcurrency(cities, 4, (city) =>
    getListingByFilter('tr', city, []).catch(() => null)
  );

  const wanted = new Set(refs.map((r) => r.id));
  const out = new Map<string, HomePlace>();
  listings.forEach((listing, i) => {
    if (!listing) return;
    for (const place of listing.places) {
      if (!wanted.has(place.id)) continue;
      const resolved = toHomePlace(place, cities[i], locale);
      if (resolved) out.set(place.id, resolved);
    }
  });
  return out;
}

export function pickResolved(refs: PlaceRef[], resolved: Map<string, HomePlace>): HomePlace[] {
  return refs.map((r) => resolved.get(r.id)).filter((p): p is HomePlace => Boolean(p));
}

export const UNESCO_REFS: PlaceRef[] = [
  { city: 'istanbul', id: 'tAhmK3g81xN8BYqRUm9E' },
  { city: 'nevsehir', id: 'KDyCD4FMix3PN2Q3L9TW' },
  { city: 'izmir', id: 'QwwZhZOToP7dhUvLVIpO' },
  { city: 'sanliurfa', id: 'W0MS0rpQIcFXTufTZ3UM' },
  { city: 'denizli', id: 'RCeuwkGTdmv6mAVg_6Vo' },
  { city: 'adiyaman', id: 'Ztm3OZpMlwR2ZatL9Mne' },
  { city: 'edirne', id: 'rNagnfRTOCFkmTcSJueR' },
  { city: 'corum', id: 'cQKuo0sri52V30rmtg0n' },
  { city: 'kars', id: '5epTWIj4pBD3n35iyaAw' },
  { city: 'konya', id: 'O2iecrF2ppOvee0VjLlF' },
  { city: 'canakkale', id: 'GFmsCgNPLi15KiiT9Ii6' },
  { city: 'karabuk', id: 'LuoBU0nNsLDs5qW1BJ4s' },
  { city: 'aydin', id: 'LFSc5qTQCRuzKU0y8p7d' },
  { city: 'antalya', id: 'w42irveEWguKV4YvqY1i' },
  { city: 'sivas', id: 'P7ctCLK71EHarBtnjjqo' },
  { city: 'diyarbakir', id: 'gxPeBUdZRjH28LztEkGV' },
  { city: 'malatya', id: 'tWCDNp5IN81npQ09tZ7f' },
  { city: 'ankara', id: 'SDck0US1vNBJGC4w3Gzm' },
];
