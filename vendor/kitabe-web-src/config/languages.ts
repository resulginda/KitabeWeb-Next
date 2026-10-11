export const ALL_LANGUAGES = ['tr', 'en', 'ru', 'ar', 'de', 'es', 'ja'] as const;

export type Language = (typeof ALL_LANGUAGES)[number];

export type LanguageOption = {
  code: Language;
  name: string;
  flag: string;
};

/** Yayındaki diller; yeni diller NEXT_PUBLIC_ENABLED_LOCALES ile açılır (lib/locales.ts ile aynı anahtar). */
const DEFAULT_ENABLED: readonly Language[] = ['tr', 'en', 'ru', 'ar'];

declare const process: { env: Record<string, string | undefined> };

function readEnabledEnv(): string | undefined {
  try {
    // Next build'de bu ifade sabit metinle değiştirilir; Vite'ta process yoktur.
    return process.env.NEXT_PUBLIC_ENABLED_LOCALES;
  } catch {
    return undefined;
  }
}

export function isKnownLanguage(value: unknown): value is Language {
  return typeof value === 'string' && (ALL_LANGUAGES as readonly string[]).includes(value);
}

function parseEnabled(raw: string | undefined): readonly Language[] {
  if (!raw) return DEFAULT_ENABLED;
  const list = raw
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(isKnownLanguage);
  return list.includes('tr') ? ALL_LANGUAGES.filter((l) => list.includes(l)) : DEFAULT_ENABLED;
}

export const ENABLED_LANGUAGES = parseEnabled(readEnabledEnv());

export function isEnabledLanguage(value: unknown): value is Language {
  return isKnownLanguage(value) && ENABLED_LANGUAGES.includes(value);
}

/** Kendi slug'ı olmayan diller İngilizce slug'ı kullanır: /de/istanbul/hagia-sophia */
export function slugLanguage(language: Language): Language {
  return DEFAULT_ENABLED.includes(language) ? language : 'en';
}

/** Eski diller önce tr'ye, yeni diller önce en'e düşer. */
export function languageFallbacks(language: Language): Language[] {
  const chain: Language[] = DEFAULT_ENABLED.includes(language)
    ? [language, 'tr', 'en']
    : [language, 'en', 'tr'];
  return [...new Set(chain)];
}

const DATE_LOCALES: Record<Language, string> = {
  tr: 'tr-TR',
  en: 'en-US',
  ru: 'ru-RU',
  ar: 'ar-SA',
  de: 'de-DE',
  es: 'es-ES',
  ja: 'ja-JP',
};

/** toLocaleDateString vb. için BCP 47 etiketi. */
export function dateLocale(language: string): string {
  return isKnownLanguage(language) ? DATE_LOCALES[language] : 'en-US';
}

const ALL_OPTIONS: LanguageOption[] = [
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
];

export const LANGUAGE_OPTIONS: LanguageOption[] = ALL_OPTIONS.filter((o) =>
  ENABLED_LANGUAGES.includes(o.code)
);

export function getLanguageOption(code: Language): LanguageOption {
  return ALL_OPTIONS.find((l) => l.code === code) ?? LANGUAGE_OPTIONS[0];
}
