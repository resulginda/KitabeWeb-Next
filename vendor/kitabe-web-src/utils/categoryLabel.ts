import type { CategoryOption } from '../contexts/CategoriesContext';
import type { Language } from '../contexts/LanguageContext';
import { getLocalizedText } from './multilang';

export function getCategoryLabel(cat: CategoryOption, lang: Language): string {
  if (typeof cat.name === 'string' && cat.name.trim()) return cat.name;
  const localized = getLocalizedText(cat.name, lang);
  if (localized?.trim()) return localized;
  return cat.value.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}
