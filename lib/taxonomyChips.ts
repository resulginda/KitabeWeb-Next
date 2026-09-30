import { cache } from 'react';
import { TURKIYE_ILCELER } from '@kitabe/data/turkiyeIllerIlceler';
import { getCityLabel } from './citySlugLabel';
import { encodePathSegments } from './detectLocale';
import {
  buildListingPath,
  getTaxonomyIndex,
  type Locale,
  type TaxonomyCombination,
} from './listings';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'https://api.kitabe.org';

export type FilterChip = {
  slug: string;
  label: string;
  count: number;
  href: string;
};

export type CityChips = {
  districts: FilterChip[];
  categories: FilterChip[];
};

/** Türkçe karakterleri ASCII'ye indirger (taxonomy TR slug kuralı). */
function slugifyAscii(name: string): string {
  return name
    .toLocaleLowerCase('tr-TR')
    .replace(/ı/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Bilinmeyen karakterleri tire yapar (bazı locale slug'ları: Sarıyer → sar-yer). */
function slugifyDash(name: string): string {
  return name
    .toLocaleLowerCase('tr-TR')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function titleCase(slug: string): string {
  return slug
    .split('-')
    .filter(Boolean)
    .map((w) => w.charAt(0).toLocaleUpperCase('tr-TR') + w.slice(1))
    .join(' ');
}

type RawCategory = {
  id: string;
  name?: Partial<Record<Locale, string>>;
  subCategories?: RawCategory[];
};

/**
 * /api/categories'ten locale bazlı kategori etiket haritası kurar.
 * Taxonomy slug'ları çoğul olabildiğinden (cami → camiler) hem id hem de
 * slugify(name) anahtarlanır; çözümleme aşamasında çoğul ekleri soyulur.
 */
const getCategoryLabelMap = cache(async (locale: Locale): Promise<Map<string, string>> => {
  const map = new Map<string, string>();
  try {
    const res = await fetch(`${API}/api/categories`, {
      next: { revalidate: 86400, tags: ['categories'] },
    });
    if (!res.ok) return map;
    const json = await res.json();
    const cats: RawCategory[] = json.data ?? [];

    const add = (entry: RawCategory) => {
      const name = entry.name?.[locale] ?? entry.name?.tr;
      if (!name) return;
      map.set(entry.id.toLowerCase(), name);
      map.set(slugifyAscii(name), name);
      map.set(slugifyDash(name), name);
    };

    for (const top of cats) {
      add(top);
      for (const sub of top.subCategories ?? []) add(sub);
    }
  } catch {
    /* sessiz: harita boş kalırsa titleCase fallback devreye girer */
  }
  return map;
});

function resolveCategoryLabel(slug: string, map: Map<string, string>): string {
  const s = slug.toLowerCase();
  if (map.has(s)) return map.get(s)!;

  // Türkçe çoğul ekleri: -ler / -lar
  for (const suf of ['ler', 'lar']) {
    if (s.endsWith(suf)) {
      const base = s.slice(0, -3);
      if (map.has(base)) return map.get(base)!;
    }
  }
  // İngilizce çoğul: -es / -s
  if (s.endsWith('es') && map.has(s.slice(0, -2))) return map.get(s.slice(0, -2))!;
  if (s.endsWith('s') && map.has(s.slice(0, -1))) return map.get(s.slice(0, -1))!;

  return titleCase(slug);
}

/** Şehir için ilçe slug → proper Türkçe etiket haritası (TURKIYE_ILCELER). */
function buildDistrictLabelMap(citySlug: string): Map<string, string> {
  const map = new Map<string, string>();
  const cityTrName = getCityLabel(citySlug, 'tr');
  const districts = TURKIYE_ILCELER[cityTrName] ?? [];
  for (const name of districts) {
    map.set(slugifyAscii(name), name);
    map.set(slugifyDash(name), name);
  }
  return map;
}

/**
 * locale bazlı kategori slug sözlüğü: 2-segmentli kombolarda 2. pozisyondaki
 * slug'lar her zaman kategoridir. Bu set, tek segmentli kombolarda ilçe/kategori
 * ayrımını yapmak için kullanılır.
 */
function buildCategorySlugSet(localeCombos: TaxonomyCombination[]): Set<string> {
  const set = new Set<string>();
  for (const c of localeCombos) {
    if (c.filter.length === 2) set.add(c.filter[1].toLowerCase());
  }
  return set;
}

function chipHref(locale: Locale, citySlug: string, filter: string[]): string {
  return encodePathSegments(buildListingPath(locale, citySlug, filter));
}

/** Şehir hub sayfası için ilçe + kategori çipleri. */
export const getCityFilterChips = cache(async (
  locale: Locale,
  citySlug: string
): Promise<CityChips> => {
  const all = await getTaxonomyIndex();
  const localeCombos = all.filter((c) => c.locale === locale);
  const categorySlugs = buildCategorySlugSet(localeCombos);
  const cityCombos = localeCombos.filter((c) => c.citySlug === citySlug);

  const categoryLabels = await getCategoryLabelMap(locale);
  const districtLabels = buildDistrictLabelMap(citySlug);

  const districts: FilterChip[] = [];
  const categories: FilterChip[] = [];

  for (const combo of cityCombos) {
    if (combo.filter.length !== 1) continue;
    const slug = combo.filter[0];
    const isCategory = categorySlugs.has(slug.toLowerCase());

    if (isCategory) {
      categories.push({
        slug,
        label: resolveCategoryLabel(slug, categoryLabels),
        count: combo.placeCount,
        href: chipHref(locale, citySlug, [slug]),
      });
    } else {
      districts.push({
        slug,
        label: districtLabels.get(slug.toLowerCase()) ?? titleCase(slug),
        count: combo.placeCount,
        href: chipHref(locale, citySlug, [slug]),
      });
    }
  }

  districts.sort((a, b) => b.count - a.count);
  categories.sort((a, b) => b.count - a.count);

  return { districts, categories };
});

export type NationalTheme = {
  slug: string;
  label: string;
  total: number;
  cities: { citySlug: string; label: string; count: number; href: string }[];
};

/** Ülke geneli en kalabalık kategoriler; her biri için en çok yeri olan şehirler. */
export const getNationalThemes = cache(async (
  locale: Locale,
  limit = 8,
  citiesPerTheme = 4
): Promise<NationalTheme[]> => {
  const all = await getTaxonomyIndex();
  const localeCombos = all.filter((c) => c.locale === locale);
  const categorySlugs = buildCategorySlugSet(localeCombos);
  const categoryLabels = await getCategoryLabelMap(locale);

  const bySlug = new Map<string, TaxonomyCombination[]>();
  for (const combo of localeCombos) {
    if (combo.filter.length !== 1) continue;
    const slug = combo.filter[0].toLowerCase();
    if (!categorySlugs.has(slug)) continue;
    const list = bySlug.get(slug) ?? [];
    list.push(combo);
    bySlug.set(slug, list);
  }

  return [...bySlug.entries()]
    .map(([slug, combos]) => ({
      slug,
      label: resolveCategoryLabel(slug, categoryLabels),
      total: combos.reduce((sum, c) => sum + c.placeCount, 0),
      cities: [...combos]
        .sort((a, b) => b.placeCount - a.placeCount)
        .slice(0, citiesPerTheme)
        .map((c) => ({
          citySlug: c.citySlug,
          label: c.labels.city,
          count: c.placeCount,
          href: chipHref(locale, c.citySlug, [c.filter[0]]),
        })),
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, limit);
});

/** İlçe sayfası için o ilçeye ait kategori çipleri (district_category kombolar). */
export const getDistrictCategoryChips = cache(async (
  locale: Locale,
  citySlug: string,
  districtSlug: string
): Promise<FilterChip[]> => {
  const all = await getTaxonomyIndex();
  const cityCombos = all.filter(
    (c) => c.locale === locale && c.citySlug === citySlug
  );
  const categoryLabels = await getCategoryLabelMap(locale);
  const ds = districtSlug.toLowerCase();

  const categories: FilterChip[] = [];
  for (const combo of cityCombos) {
    if (combo.filter.length !== 2) continue;
    if (combo.filter[0].toLowerCase() !== ds) continue;
    const catSlug = combo.filter[1];
    categories.push({
      slug: catSlug,
      label: resolveCategoryLabel(catSlug, categoryLabels),
      count: combo.placeCount,
      href: chipHref(locale, citySlug, [districtSlug, catSlug]),
    });
  }

  categories.sort((a, b) => b.count - a.count);
  return categories;
});
