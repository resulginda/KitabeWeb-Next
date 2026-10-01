import type { ListingFilterResult } from './listings';
import type { TaxonomyCombination } from './listings';
import { hasListingGuide } from './listingGuides';

/** AdSense / SEO: hangi liste sayfaları indexlensin, hangileri geniş intro alsın */

export const MIN_PLACES_FOR_INDEX: Record<ListingFilterResult['kind'], number> = {
  city: 1,
  district: 8,
  category: 8,
  district_category: 15,
};

/** Geniş intro (ek paragraflar) için minimum yer sayısı */
export const MIN_PLACES_FOR_EXTENDED_INTRO = 5;

export function taxonomyKind(
  combo: Pick<TaxonomyCombination, 'filter' | 'districtSlug' | 'categorySlug' | 'filterTypes'>
): ListingFilterResult['kind'] {
  const filter = combo.filter ?? [];
  if (filter.length === 0) return 'city';
  if (filter.length === 1) {
    if (combo.districtSlug) return 'district';
    if (combo.categorySlug) return 'category';
    if (combo.filterTypes?.includes('district')) return 'district';
    return 'category';
  }
  return 'district_category';
}

/**
 * Şehir sayfaları her zaman; ilçe/kategori sayfaları yalnızca yeterli yer + o dilde
 * özgün rehber metni varsa indexlenir (şablon metinli sayfalar "düşük değerli içerik" sayılır).
 */
function isIndexable(
  kind: ListingFilterResult['kind'],
  total: number,
  groupKey: string | undefined,
  locale: ListingFilterResult['locale']
): boolean {
  if (total < MIN_PLACES_FOR_INDEX[kind]) return false;
  if (kind === 'city') return true;
  return hasListingGuide(groupKey, locale);
}

export function shouldIndexListing(
  data: Pick<ListingFilterResult, 'kind' | 'total' | 'groupKey' | 'locale'>
): boolean {
  return isIndexable(data.kind, data.total, data.groupKey, data.locale);
}

export function shouldIndexTaxonomy(combo: TaxonomyCombination): boolean {
  return isIndexable(taxonomyKind(combo), combo.placeCount, combo.groupKey, combo.locale);
}

export function shouldUseExtendedIntro(total: number): boolean {
  return total > MIN_PLACES_FOR_EXTENDED_INTRO;
}
