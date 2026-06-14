export type AppLanguage = 'tr' | 'en' | 'ru' | 'ar';

export const DEFAULT_LANGUAGE: AppLanguage = 'en';
const LANG_KEY = 'kitabe_language';
const MANUAL_KEY = 'kitabe_language_manual';

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

export function hasManualLanguageChoice(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(MANUAL_KEY) === '1';
}

export function getStoredLanguage(): AppLanguage | null {
  if (typeof window === 'undefined') return null;
  const saved = localStorage.getItem(LANG_KEY);
  if (saved === 'tr' || saved === 'en' || saved === 'ru' || saved === 'ar') return saved;
  return null;
}

/** Manuel seçim yoksa her ziyarette tarayıcı dili; varsa kayıtlı tercih */
export function getInitialAppLanguage(): AppLanguage {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE;
  if (hasManualLanguageChoice()) {
    return getStoredLanguage() ?? DEFAULT_LANGUAGE;
  }
  return detectBrowserLanguage();
}

export function persistLanguageChoice(lang: AppLanguage, manual: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LANG_KEY, lang);
  if (manual) {
    localStorage.setItem(MANUAL_KEY, '1');
  } else {
    localStorage.removeItem(MANUAL_KEY);
  }
}
