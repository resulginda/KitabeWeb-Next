import { encodePathSegments } from './detectLocale';
import {
  buildListingPath,
  getListingByFilter,
  getTaxonomyIndex,
  HUB_SLUGS,
  isHubDashSegment,
  isHubSegment,
  type ListingFilterResult,
  type Locale,
  type TaxonomyCombination,
} from './listings';
import {
  canonicalPlacePath,
  LOCALES,
  resolvePlaceForDetail,
} from './places';

function parseSeoPath(pathname: string): {
  locale: Locale;
  city: string;
  segments: string[];
} | null {
  const parts = pathname.split('/').filter(Boolean);
  if (!parts.length || !LOCALES.includes(parts[0] as Locale)) return null;
  return {
    locale: parts[0] as Locale,
    city: parts[1] ?? '',
    segments: parts.slice(2),
  };
}

function listingFilterSegments(locale: Locale, segments: string[]): string[] {
  if (!segments.length) return [];
  const first = segments[0];
  if (isHubSegment(locale, first)) return segments.slice(1);
  if (isHubDashSegment(locale, first)) return [first];
  return [];
}

function matchTaxonomy(
  source: ListingFilterResult,
  targetLocale: Locale,
  index: TaxonomyCombination[]
): TaxonomyCombination | undefined {
  return index.find((row) => {
    if (row.locale !== targetLocale || row.citySlug !== source.citySlug) return false;
    if (source.kind === 'city') return row.filter.length === 0;
    if (source.kind === 'district') {
      return row.districtSlug != null && source.filter[0] === row.districtSlug;
    }
    if (source.kind === 'category') {
      return row.categorySlug != null && source.filter[0] === row.categorySlug;
    }
    if (source.kind === 'district_category') {
      return (
        row.districtSlug === source.filter[0] && row.categorySlug === source.filter[1]
      );
    }
    return false;
  });
}

/** SEO rotasında eşdeğer sayfa — sunucu tarafı (detay slug + liste filtreleri) */
export async function resolveSeoLocalePath(
  pathname: string,
  targetLocale: Locale
): Promise<string | null> {
  const parsed = parseSeoPath(pathname);
  if (!parsed) return null;

  const { locale: currentLocale, city, segments } = parsed;
  if (currentLocale === targetLocale) return pathname;

  if (!city) return `/${targetLocale}`;

  if (!segments.length) {
    return encodePathSegments(buildListingPath(targetLocale, city, []));
  }

  const first = segments[0];
  const isListing =
    isHubSegment(currentLocale, first) || isHubDashSegment(currentLocale, first);

  if (isListing) {
    const filterSegments = listingFilterSegments(currentLocale, segments);
    const data = await getListingByFilter(currentLocale, city, filterSegments);
    if (data) {
      const index = await getTaxonomyIndex();
      const match = matchTaxonomy(data, targetLocale, index);
      if (match) {
        return encodePathSegments(
          buildListingPath(targetLocale, match.citySlug, match.filter)
        );
      }
      return encodePathSegments(buildListingPath(targetLocale, data.citySlug, []));
    }
  }

  const place = await resolvePlaceForDetail(currentLocale, city, segments.join('/'));
  if (place) {
    const canonical = canonicalPlacePath(place, targetLocale);
    if (canonical) return canonical;
  }

  return encodePathSegments(buildListingPath(targetLocale, city, []));
}

/** İstemci yedek — hub slug öneki değişimi (API erişilemezse) */
export function mapSeoPathToLocaleQuick(pathname: string, targetLocale: Locale): string | null {
  const parsed = parseSeoPath(pathname);
  if (!parsed) return null;

  const { locale: currentLocale, city, segments } = parsed;
  if (currentLocale === targetLocale) return pathname;

  if (!city) return `/${targetLocale}`;

  const oldHub = HUB_SLUGS[currentLocale];
  const newHub = HUB_SLUGS[targetLocale];

  const mapSeg = (seg: string) => {
    if (seg === oldHub) return newHub;
    if (seg.startsWith(`${oldHub}-`)) return newHub + seg.slice(oldHub.length);
    return seg;
  };

  const mapped = segments.map(mapSeg);
  return encodePathSegments(`/${targetLocale}/${city}/${mapped.join('/')}`);
}
