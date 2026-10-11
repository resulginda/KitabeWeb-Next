import { ALL_LANGUAGES, languageFallbacks, type Language } from '../config/languages';

export type { Language };

type LocalizedText = Partial<Record<Language, string>>;
type LocalizedArray = Partial<Record<Language, string[]>>;

export const getLocalizedText = (
  field: string | LocalizedText | undefined,
  language: Language = 'tr'
): string => {
  if (!field) return '';
  if (typeof field === 'string') return field;
  if (typeof field === 'object') {
    for (const lang of languageFallbacks(language)) {
      if (field[lang]) return field[lang] as string;
    }
    return '';
  }
  return '';
};

export const getLocalizedArray = (
  field: string[] | LocalizedArray | any[] | undefined,
  language: Language = 'tr'
): string[] => {
  if (!field) return [];

  if (
    typeof field === 'object' &&
    !Array.isArray(field) &&
    ALL_LANGUAGES.some((l) => (field as LocalizedArray)[l] !== undefined)
  ) {
    const localized = field as LocalizedArray;
    const order = [...languageFallbacks(language), ...ALL_LANGUAGES];
    const array = order
      .map((l) => localized[l])
      .find((a) => Array.isArray(a) && a.length > 0) ?? [];
    return array.map(item => typeof item === 'string' ? item : getLocalizedText(item, language));
  }

  if (Array.isArray(field)) {
    return field.map(item => {
      if (typeof item === 'string') return item;
      if (typeof item === 'object' && item !== null) {
        return getLocalizedText(item, language);
      }
      return String(item || '');
    });
  }

  return [];
};
