'use client';

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import tr from '@kitabe/i18n/locales/tr.json';
import en from '@kitabe/i18n/locales/en.json';
import ru from '@kitabe/i18n/locales/ru.json';
import ar from '@kitabe/i18n/locales/ar.json';
import { getInitialAppLanguage } from '@kitabe/utils/detectLocale';

if (!i18n.isInitialized) {
  const initial = typeof window !== 'undefined' ? getInitialAppLanguage() : 'en';

  i18n.use(initReactI18next).init({
    resources: {
      tr: { translation: tr },
      en: { translation: en },
      ru: { translation: ru },
      ar: { translation: ar },
    },
    lng: initial,
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  });
}

export default i18n;
