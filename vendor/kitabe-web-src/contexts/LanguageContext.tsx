import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import i18n from '../i18n';

export type Language = 'tr' | 'en' | 'ru' | 'ar';

interface LanguageContextType {
  currentLanguage: Language;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('kitabe_language');
    const lang = (saved as Language) || 'tr';
    // i18next dilini de başlat
    if (i18n.language !== lang) {
      i18n.changeLanguage(lang);
    }
    return lang;
  });

  // İlk yüklemede i18next dilini ayarla
  useEffect(() => {
    const saved = localStorage.getItem('kitabe_language');
    const lang = (saved as Language) || 'tr';
    if (i18n.language !== lang) {
      i18n.changeLanguage(lang);
    }
  }, []);

  useEffect(() => {
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

