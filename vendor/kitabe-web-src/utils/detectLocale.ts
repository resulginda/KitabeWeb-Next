export type AppLanguage = 'tr' | 'en' | 'ru' | 'ar';

export const DEFAULT_LANGUAGE: AppLanguage = 'en';

export function resolveLanguageFromTag(tag: string): AppLanguage | null {
  const base = tag.toLowerCase().split('-')[0];
  if (base === 'tr' || base === 'en' || base === 'ru' || base === 'ar') return base;
  return null;
}

/** navigator.languages / Accept-Language benzeri liste */
export function detectLanguageFromTags(tags: string[]): AppLanguage {
  for (const tag of tags) {
    const lang = resolveLanguageFromTag(tag);
    if (lang) return lang;
  }
  return DEFAULT_LANGUAGE;
}

export function detectBrowserLanguage(): AppLanguage {
  if (typeof navigator === 'undefined') return DEFAULT_LANGUAGE;
  const tags =
    navigator.languages?.length > 0 ? [...navigator.languages] : [navigator.language];
  return detectLanguageFromTags(tags.filter(Boolean));
}

export function getInitialAppLanguage(): AppLanguage {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE;
  const saved = localStorage.getItem('kitabe_language');
  if (saved === 'tr' || saved === 'en' || saved === 'ru' || saved === 'ar') return saved;
  return detectBrowserLanguage();
}
