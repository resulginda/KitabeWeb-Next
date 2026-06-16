import type { Language } from '../contexts/LanguageContext';

export type LanguageOption = {
  code: Language;
  name: string;
  flag: string;
};

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
];

export function getLanguageOption(code: Language): LanguageOption {
  return LANGUAGE_OPTIONS.find((l) => l.code === code) ?? LANGUAGE_OPTIONS[0];
}
