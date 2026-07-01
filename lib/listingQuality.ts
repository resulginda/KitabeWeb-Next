import type { ListingFilterResult } from './listings';
import type { TaxonomyCombination } from './listings';

/** AdSense / SEO: hangi liste sayfaları indexlensin, hangileri geniş intro alsın */

export const MIN_PLACES_FOR_INDEX: Record<ListingFilterResult['kind'], number> = {
  city: 1,
  district: 5,
  category: 5,
  district_category: 3,
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

export function shouldIndexListing(data: Pick<ListingFilterResult, 'kind' | 'total'>): boolean {
  return data.total >= MIN_PLACES_FOR_INDEX[data.kind];
}

export function shouldIndexTaxonomy(combo: TaxonomyCombination): boolean {
  const kind = taxonomyKind(combo);
  return combo.placeCount >= MIN_PLACES_FOR_INDEX[kind];
}

export function shouldUseExtendedIntro(total: number): boolean {
  return total > MIN_PLACES_FOR_EXTENDED_INTRO;
}
