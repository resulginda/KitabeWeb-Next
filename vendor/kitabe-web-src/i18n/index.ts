import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import tr from './locales/tr.json';
import en from './locales/en.json';
import ru from './locales/ru.json';
import ar from './locales/ar.json';

// localStorage'dan dil tercihini oku (SSR güvenli)
const savedLanguage =
  typeof window !== 'undefined' ? localStorage.getItem('kitabe_language') || 'tr' : 'tr';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      tr: { translation: tr },
      en: { translation: en },
      ru: { translation: ru },
      ar: { translation: ar },
    },
    lng: savedLanguage as 'tr' | 'en' | 'ru' | 'ar',
    fallbackLng: 'tr',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;

