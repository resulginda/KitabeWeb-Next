import {
  buildListingPath,
  getListingByFilter,
  pickListingText,
  type ListingBreadcrumb,
  type ListingPlace,
} from './listings';
import { encodePathSegments } from './detectLocale';
import { pickText, type Locale, type MultilingualText, type SeoPlace } from './places';
import { getCityFilterChips, type FilterChip } from './taxonomyChips';

const RELATED_LIMIT = 8;
const CATEGORY_LINK_LIMIT = 3;

export type PlaceRelated = {
  /** Son öğe (yerin kendisi) hariç */
  breadcrumb: ListingBreadcrumb[];
  related: ListingPlace[];
  exploreLinks: FilterChip[];
};

function norm(s: string): string {
  return s.normalize('NFC').toLocaleLowerCase('tr-TR').trim();
}

const TR_FOLD: Record<string, string> = { ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u', â: 'a', î: 'i', û: 'u' };

/** "Kaş" ↔ "Kas" ↔ slug "kas" eşleşsin diye Türkçe harfleri sadeleştirir. */
function fold(s: string): string {
  return norm(s)
    .replace(/[çğıöşüâîû]/g, (c) => TR_FOLD[c] ?? c)
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '');
}

function categoryLabels(category: unknown, locale: Locale): string[] {
  if (!category || typeof category !== 'object') return [];
  const c = category as { main?: unknown[]; sub?: Record<string, unknown[]> };
  const entries: unknown[] = [
    ...(Array.isArray(c.main) ? c.main : []),
    ...Object.values(c.sub ?? {}).flatMap((arr) => (Array.isArray(arr) ? arr : [])),
  ];
  const out = new Set<string>();
  for (const e of entries) {
    const text = pickText(e as MultilingualText | string, locale);
    if (text) out.add(norm(text));
  }
  return [...out];
}

/** Listede kendisinden sonra gelenler (dairesel): her yer farklı komşulardan link alır. */
function neighborsAfter(list: ListingPlace[], selfId: string, count: number): ListingPlace[] {
  if (list.length === 0 || count <= 0) return [];
  const start = Math.max(0, list.findIndex((p) => p.id === selfId));
  const out: ListingPlace[] = [];
  for (let i = 1; i <= list.length && out.length < count; i++) {
    const p = list[(start + i) % list.length];
    if (p.id !== selfId) out.push(p);
  }
  return out;
}

export async function getPlaceRelated(place: SeoPlace, locale: Locale): Promise<PlaceRelated | null> {
  const full = place.slug?.[locale];
  if (!full) return null;
  const slugCity = full.normalize('NFC').split('/')[0];
  if (!slugCity) return null;

  // Yer slug'ındaki şehir öneki eski bir yazım olabilir; liste sayfası kanonik slug'ı döndürür.
  const listing = await getListingByFilter(locale, slugCity, []);
  const citySlug = listing?.citySlug || slugCity;
  const chips = await getCityFilterChips(locale, citySlug);

  const cityLabel = listing?.labels.city || pickText(place.city, locale);
  const cityHref = encodePathSegments(buildListingPath(locale, citySlug));
  const districtLabel = pickText(place.district, locale);
  const districtKey = districtLabel ? fold(districtLabel) : '';
  const districtChip = districtKey
    ? chips.districts.find((c) => fold(c.label) === districtKey || fold(c.slug) === districtKey)
    : undefined;

  const catSet = new Set(categoryLabels(place.category, locale));
  const categoryChips = chips.categories
    .filter((c) => catSet.has(norm(c.label)))
    .slice(0, CATEGORY_LINK_LIMIT);

  const breadcrumb: ListingBreadcrumb[] = [
    { label: 'Kitabe', href: `/${locale}` },
    { label: cityLabel, href: cityHref },
  ];
  if (districtChip) breadcrumb.push({ label: districtLabel, href: districtChip.href });

  const cityPlaces = (listing?.places ?? []).filter((p) => p.detailPath || p.placeSlug);
  const sameDistrict = districtKey
    ? cityPlaces.filter((p) => fold(pickListingText(p.district, locale)) === districtKey)
    : [];
  const related = neighborsAfter(sameDistrict, place.id, RELATED_LIMIT);
  if (related.length < RELATED_LIMIT) {
    const taken = new Set([place.id, ...related.map((p) => p.id)]);
    const pool = cityPlaces.filter((p) => p.id === place.id || !taken.has(p.id));
    related.push(...neighborsAfter(pool, place.id, RELATED_LIMIT - related.length));
  }

  const exploreLinks: FilterChip[] = [
    { slug: citySlug, label: cityLabel, count: listing?.total ?? cityPlaces.length, href: cityHref },
    ...(districtChip ? [{ ...districtChip, label: districtLabel }] : []),
    ...categoryChips,
  ];

  return { breadcrumb, related, exploreLinks };
}
