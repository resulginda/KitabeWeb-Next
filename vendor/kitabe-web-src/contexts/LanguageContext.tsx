import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { ensureI18n, loadI18nLanguage, type I18nLanguage } from '../i18n';
import {
  getInitialAppLanguage,
  hasManualLanguageChoice,
  persistLanguageChoice,
} from '../utils/detectLocale';

export type Language = 'tr' | 'en' | 'ru' | 'ar';

export type SeoLocaleSwitchResolver = (
  target: Language,
  pathname: string
) => Promise<string | null> | string | null;

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
  resolveSeoLocaleSwitch,
}: {
  children: ReactNode;
  defaultLanguage?: Language;
  /** Next.js /[locale]/... — URL dili */
  localeFromUrl?: Language;
  /** SEO sayfalarında dil değişince eşdeğer /{locale}/... adresine git */
  resolveSeoLocaleSwitch?: SeoLocaleSwitchResolver;
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
    if (localeFromUrl) {
      setCurrentLanguage(localeFromUrl);
      void ensureI18n(localeFromUrl as I18nLanguage);
      return;
    }
    const lang = resolveLanguage();
    void ensureI18n(lang as I18nLanguage);
  }, [localeFromUrl]);

  const setLanguage = (lang: Language, options?: { manual?: boolean }) => {
    const manual = options?.manual !== false;

    const applyLanguage = () => {
      persistLanguageChoice(lang, manual);
      setCurrentLanguage(lang);
      void loadI18nLanguage(lang as I18nLanguage);
    };

    if (
      typeof window !== 'undefined' &&
      localeFromUrl &&
      lang !== localeFromUrl &&
      resolveSeoLocaleSwitch
    ) {
      const pathname = window.location.pathname;
      void Promise.resolve(resolveSeoLocaleSwitch(lang, pathname)).then((next) => {
        if (next && next !== pathname) {
          persistLanguageChoice(lang, manual);
          window.location.assign(next);
          return;
        }
        applyLanguage();
      });
      return;
    }

    applyLanguage();
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
