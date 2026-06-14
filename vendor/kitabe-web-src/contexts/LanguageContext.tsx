import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import i18n from '../i18n';
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
    if (i18n.language !== lang) i18n.changeLanguage(lang);
    if (localeFromUrl) {
      persistLanguageChoice(localeFromUrl, true);
    } else if (!hasManualLanguageChoice()) {
      persistLanguageChoice(lang, false);
    }
    return lang;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (localeFromUrl) {
      setCurrentLanguage(localeFromUrl);
      i18n.changeLanguage(localeFromUrl);
      persistLanguageChoice(localeFromUrl, true);
      return;
    }
    const lang = hasManualLanguageChoice()
      ? (getStoredLanguage() ?? detectBrowserLanguage())
      : detectBrowserLanguage();
    setCurrentLanguage(lang);
    if (i18n.language !== lang) i18n.changeLanguage(lang);
    if (!hasManualLanguageChoice()) {
      persistLanguageChoice(lang, false);
    }
  }, [localeFromUrl]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (i18n.language !== currentLanguage) {
      i18n.changeLanguage(currentLanguage);
    }
    if (hasManualLanguageChoice()) {
      persistLanguageChoice(currentLanguage, true);
    }
  }, [currentLanguage]);

  const setLanguage = (lang: Language, options?: { manual?: boolean }) => {
    const manual = options?.manual !== false;
    persistLanguageChoice(lang, manual);
    setCurrentLanguage(lang);
    i18n.changeLanguage(lang);
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
