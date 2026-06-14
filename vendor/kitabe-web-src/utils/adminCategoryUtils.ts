import type { CategoryOption } from '../contexts/CategoriesContext';
import type { CategoryStructure, Place } from '../types/place';

function norm(s: string): string {
  return String(s || '').trim().toLocaleLowerCase('tr-TR');
}

export function getCategoryOptionLabel(cat: CategoryOption): string {
  if (typeof cat.name === 'string' && cat.name.trim()) return cat.name.trim();
  if (cat.name && typeof cat.name === 'object') {
    return cat.name.tr || cat.name.en || cat.value;
  }
  return cat.value;
}

function buildNameToSlugMap(options: CategoryOption[]): Map<string, string> {
  const map = new Map<string, string>();
  options.forEach((opt) => {
    map.set(norm(opt.value), opt.value);
    const names: string[] = [];
    if (typeof opt.name === 'string') names.push(opt.name);
    else if (opt.name) {
      if (opt.name.tr) names.push(opt.name.tr);
      if (opt.name.en) names.push(opt.name.en);
      if (opt.name.ru) names.push(opt.name.ru);
      if (opt.name.ar) names.push(opt.name.ar);
    }
    names.forEach((n) => map.set(norm(n), opt.value));
  });
  return map;
}

export function tokenToCategorySlug(token: string, options: CategoryOption[]): string | null {
  const t = String(token || '').trim();
  if (!t) return null;
  const map = buildNameToSlugMap(options);
  if (map.has(norm(t))) return map.get(norm(t))!;
  if (options.some((o) => o.value === t)) return t;
  if (/^[a-z0-9]+(-[a-z0-9]+)*$/i.test(t)) return t.toLowerCase();
  return null;
}

/** DB'deki category alanından admin chip'leri için ana kategori slug listesi */
export function parsePlaceMainCategorySlugs(
  category: Place['category'],
  options: CategoryOption[]
): string[] {
  const slugs = new Set<string>();

  if (!category) return [];

  if (Array.isArray(category)) {
    category.forEach((c) => {
      const token = typeof c === 'string' ? c : (c as { tr?: string; en?: string }).tr || (c as { en?: string }).en || '';
      const slug = tokenToCategorySlug(token, options);
      if (slug) slugs.add(slug);
    });
    return [...slugs];
  }

  if (typeof category !== 'object') return [];

  const cat = category as CategoryStructure & { tr?: string[]; en?: string[] };

  if (Array.isArray(cat.main)) {
    cat.main.forEach((m) => {
      const token = typeof m === 'string' ? m : m.tr || m.en || '';
      const slug = tokenToCategorySlug(token, options);
      if (slug) slugs.add(slug);
    });
  }

  if (cat.sub && typeof cat.sub === 'object') {
    Object.keys(cat.sub).forEach((k) => slugs.add(k));
  }

  if (Array.isArray(cat.tr)) {
    cat.tr.forEach((t) => {
      const slug = tokenToCategorySlug(t, options);
      if (slug) slugs.add(slug);
    });
  }

  return [...slugs];
}

export function parsePlaceSubCategories(
  category: Place['category'],
  options: CategoryOption[]
): Record<string, string[]> {
  const result: Record<string, string[]> = {};
  if (!category || typeof category !== 'object' || Array.isArray(category)) return result;

  const cat = category as CategoryStructure;
  if (!cat.sub || typeof cat.sub !== 'object') return result;

  Object.entries(cat.sub).forEach(([mainSlug, subArray]) => {
    if (!Array.isArray(subArray)) return;
    const mainOpt = options.find((o) => o.value === mainSlug);
    const ids: string[] = [];

    subArray.forEach((item) => {
      const label = typeof item === 'string' ? item : item.tr || item.en || '';
      const match = mainOpt?.subCategories?.find((s) => {
        const sn =
          typeof s.name === 'string'
            ? s.name
            : s.name?.tr || s.name?.en || s.id;
        return norm(sn) === norm(label) || s.id === label;
      });
      ids.push(match?.id || label);
    });

    if (ids.length) result[mainSlug] = [...new Set(ids)];
  });

  return result;
}

export function getSubCategoryLabel(
  mainSlug: string,
  subId: string,
  options: CategoryOption[]
): string {
  const main = options.find((o) => o.value === mainSlug);
  const sub = main?.subCategories?.find((s) => s.id === subId);
  if (!sub) return subId;
  if (typeof sub.name === 'string') return sub.name;
  return sub.name?.tr || sub.name?.en || sub.id;
}

/** Kayıt için hiyerarşik category JSON */
export function buildPlaceCategoryPayload(
  mainSlugs: string[],
  subByMain: Record<string, string[]>,
  previousCategory: Place['category'] | undefined,
  options: CategoryOption[]
): CategoryStructure {
  const prev =
    previousCategory && typeof previousCategory === 'object' && !Array.isArray(previousCategory)
      ? (previousCategory as CategoryStructure)
      : null;
  const prevSub = prev?.sub && typeof prev.sub === 'object' ? prev.sub : {};

  const main = mainSlugs.map((slug) => {
    const prevEntry = prev?.main?.find((m) => {
      const token = typeof m === 'string' ? m : m.tr || m.en || '';
      return tokenToCategorySlug(token, options) === slug;
    });
    if (prevEntry && typeof prevEntry === 'object' && prevEntry.tr) {
      return prevEntry;
    }

    const opt = options.find((o) => o.value === slug);
    if (opt?.name && typeof opt.name === 'object') {
      return {
        tr: opt.name.tr || slug,
        en: opt.name.en || opt.name.tr || slug,
        ru: opt.name.ru || opt.name.tr || slug,
        ar: opt.name.ar || opt.name.tr || slug,
      };
    }
    const label = getCategoryOptionLabel(opt || { value: slug, icon: '', color: '#666' });
    return { tr: label, en: label, ru: label, ar: label };
  });

  const sub: CategoryStructure['sub'] = {};
  mainSlugs.forEach((slug) => {
    const selectedSubs = subByMain[slug];
    if (selectedSubs?.length) {
      const mainOpt = options.find((o) => o.value === slug);
      sub[slug] = selectedSubs.map((subId) => {
        const prevArr = prevSub[slug];
        const prevMatch = Array.isArray(prevArr)
          ? prevArr.find((item) => {
              const label = typeof item === 'string' ? item : item.tr || item.en || '';
              return norm(label) === norm(getSubCategoryLabel(slug, subId, options)) || label === subId;
            })
          : null;
        if (prevMatch && typeof prevMatch === 'object' && prevMatch.tr) {
          return prevMatch;
        }
        const subOpt = mainOpt?.subCategories?.find((s) => s.id === subId);
        if (subOpt?.name && typeof subOpt.name === 'object') {
          return {
            tr: subOpt.name.tr || subId,
            en: subOpt.name.en || subOpt.name.tr || subId,
            ru: subOpt.name.ru || subOpt.name.tr || subId,
            ar: subOpt.name.ar || subOpt.name.tr || subId,
          };
        }
        const subLabel = getSubCategoryLabel(slug, subId, options);
        return { tr: subLabel, en: subLabel, ru: subLabel, ar: subLabel };
      });
    } else if (prevSub[slug]) {
      sub[slug] = prevSub[slug];
    }
  });

  return { main, sub };
}
