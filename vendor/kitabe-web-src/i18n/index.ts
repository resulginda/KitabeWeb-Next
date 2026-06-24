import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
// Varsayılan (tr) ve fallback (en) STATİK gömülür → ilk render'da çeviriler
// senkron hazır. Yavaş bağlantıda ham anahtar ("common.xxx") flash'ı önlenir.
import trTranslation from './locales/tr.json';
import enTranslation from './locales/en.json';

export type I18nLanguage = 'tr' | 'en' | 'ru' | 'ar';

// Yalnızca ru/ar talep üzerine (lazy) yüklenir; tr+en zaten bundle içinde.
const lazyLoaders: Record<'ru' | 'ar', () => Promise<{ default: Record<string, unknown> }>> = {
  ru: () => import('./locales/ru.json'),
  ar: () => import('./locales/ar.json'),
};

/**
 * i18n instance'ı SENKRON ve DOLU başlatılır (tr + en gömülü). Böylece ilk
 * render'da useTranslation gerçek metinleri döndürür; "common.xxx" gibi ham
 * anahtarlar hiçbir zaman görünmez. ru/ar kullanıcıları kendi paketleri
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
  // tr ve en zaten gömülü; sadece ru/ar lazy yüklenir.
  if (
    (locale === 'ru' || locale === 'ar') &&
    !i18n.hasResourceBundle(locale, 'translation')
  ) {
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
