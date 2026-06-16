import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { ensureI18n, loadI18nLanguage, type I18nLanguage } from '../i18n';
import {
  detectBrowserLanguage,
  getInitialAppLanguage,
  getStoredLanguage,
  hasManualLanguageChoice,
  persistLanguageChoice,
} from '../utils/detectLocale';

export type Language = 'tr' | 'en' | 'ru' | 'ar';

interface LanguageContextType {
  currentLanguage: Language;
  setLanguage: (lang: Language, options?: { manual?: boolean }) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

function resolveLanguage(localeFromUrl?: Language): Language {
  if (localeFromUrl) return localeFromUrl;
  return getInitialAppLanguage();
}

export const LanguageProvider = ({
  children,
  defaultLanguage = 'en',
  localeFromUrl,
}: {
  children: ReactNode;
  defaultLanguage?: Language;
  /** Next.js /[locale]/... — URL dili manuel tercih sayılır */
  localeFromUrl?: Language;
}) => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(() => {
    if (typeof window === 'undefined') return localeFromUrl ?? defaultLanguage;
    const lang = resolveLanguage(localeFromUrl);
    if (localeFromUrl) {
      persistLanguageChoice(localeFromUrl, true);
    } else if (!hasManualLanguageChoice()) {
      persistLanguageChoice(lang, false);
    }
    return lang;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const lang = localeFromUrl ?? resolveLanguage(localeFromUrl);
    void ensureI18n(lang as I18nLanguage);
  }, [localeFromUrl]);

  const setLanguage = (lang: Language, options?: { manual?: boolean }) => {
    const manual = options?.manual !== false;
    persistLanguageChoice(lang, manual);
    setCurrentLanguage(lang);
    void loadI18nLanguage(lang as I18nLanguage);
  };

  return (
    <LanguageContext.Provider value={{ currentLanguage, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};
