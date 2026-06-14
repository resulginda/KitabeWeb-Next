import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import i18n from '../i18n';

export type Language = 'tr' | 'en' | 'ru' | 'ar';

interface LanguageContextType {
  currentLanguage: Language;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({
  children,
  defaultLanguage = 'tr',
  localeFromUrl,
}: {
  children: ReactNode;
  defaultLanguage?: Language;
  /** Next.js /[locale]/... — URL dili localStorage'dan öncelikli */
  localeFromUrl?: Language;
}) => {
  const resolvedDefault = localeFromUrl ?? defaultLanguage;

  const [currentLanguage, setCurrentLanguage] = useState<Language>(() => {
    if (typeof window === 'undefined') return resolvedDefault;
    if (localeFromUrl) {
      if (i18n.language !== localeFromUrl) i18n.changeLanguage(localeFromUrl);
      return localeFromUrl;
    }
    const saved = localStorage.getItem('kitabe_language');
    const lang = (saved as Language) || defaultLanguage;
    if (i18n.language !== lang) {
      i18n.changeLanguage(lang);
    }
    return lang;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (localeFromUrl) {
      setCurrentLanguage(localeFromUrl);
      i18n.changeLanguage(localeFromUrl);
      return;
    }
    const saved = localStorage.getItem('kitabe_language');
    const lang = (saved as Language) || defaultLanguage;
    if (i18n.language !== lang) {
      i18n.changeLanguage(lang);
    }
  }, [localeFromUrl, defaultLanguage]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('kitabe_language', currentLanguage);
    // i18next dilini de güncelle
    if (i18n.language !== currentLanguage) {
      i18n.changeLanguage(currentLanguage);
    }
  }, [currentLanguage]);

  const setLanguage = (lang: Language) => {
    setCurrentLanguage(lang);
    // i18next dilini hemen değiştir
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

