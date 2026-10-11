import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
// Varsayılan (tr) ve fallback (en) STATİK gömülür → ilk render'da çeviriler
// senkron hazır. Yavaş bağlantıda ham anahtar ("common.xxx") flash'ı önlenir.
import trTranslation from './locales/tr.json';
import enTranslation from './locales/en.json';
import type { Language } from '../config/languages';

export type I18nLanguage = Language;

// tr+en bundle içinde; diğer diller talep üzerine (lazy) yüklenir.
const lazyLoaders: Record<
  Exclude<I18nLanguage, 'tr' | 'en'>,
  () => Promise<{ default: Record<string, unknown> }>
> = {
  ru: () => import('./locales/ru.json'),
  ar: () => import('./locales/ar.json'),
  de: () => import('./locales/de.json'),
  es: () => import('./locales/es.json'),
  ja: () => import('./locales/ja.json'),
};

/**
 * i18n instance'ı SENKRON ve DOLU başlatılır (tr + en gömülü). Böylece ilk
 * render'da useTranslation gerçek metinleri döndürür; "common.xxx" gibi ham
 * anahtarlar hiçbir zaman görünmez. Diğer dillerin kullanıcıları kendi paketleri
 * yüklenene kadar (kısa süre) en/tr fallback görür — ham anahtar değil.
 */
if (!i18n.isInitialized) {
  void i18n.use(initReactI18next).init({
    resources: {
      tr: { translation: trTranslation as Record<string, unknown> },
      en: { translation: enTranslation as Record<string, unknown> },
    },
    lng: 'tr',
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    react: { useSuspense: false, bindI18nStore: 'added removed' },
  });
}

let loadingPromise: Promise<typeof i18n> | null = null;

async function addBundles(locale: I18nLanguage) {
  if (locale !== 'tr' && locale !== 'en' && !i18n.hasResourceBundle(locale, 'translation')) {
    const primary = await lazyLoaders[locale]();
    i18n.addResourceBundle(locale, 'translation', primary.default, true, true);
  }
}

/** Aktif locale + en fallback — tüm dilleri başta yükleme */
export function ensureI18n(locale: I18nLanguage): Promise<typeof i18n> {
  loadingPromise = (async () => {
    await addBundles(locale);
    // changeLanguage her durumda 'languageChanged' yayar → consumer'lar re-render
    await i18n.changeLanguage(locale);
    return i18n;
  })();
  return loadingPromise;
}

export async function loadI18nLanguage(locale: I18nLanguage) {
  await ensureI18n(locale);
}

export default i18n;
