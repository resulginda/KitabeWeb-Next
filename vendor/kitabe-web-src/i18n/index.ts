import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

export type I18nLanguage = 'tr' | 'en' | 'ru' | 'ar';

const loaders: Record<I18nLanguage, () => Promise<{ default: Record<string, unknown> }>> = {
  tr: () => import('./locales/tr.json'),
  en: () => import('./locales/en.json'),
  ru: () => import('./locales/ru.json'),
  ar: () => import('./locales/ar.json'),
};

/**
 * i18n instance'ı SENKRON başlatılır (boş resource ile). Böylece ilk render'da
 * useTranslation her zaman bir instance bulur — aksi halde react-i18next
 * "NO_I18NEXT_INSTANCE" verip metinleri çevirmeden anahtar olarak gösterir
 * (bundle'lar async yüklendiğinden init geç kalırsa toparlanamıyordu).
 * Gerçek diller ensureI18n ile sonradan eklenir.
 */
if (!i18n.isInitialized) {
  void i18n.use(initReactI18next).init({
    resources: {},
    lng: 'tr',
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    react: { useSuspense: false, bindI18nStore: 'added removed' },
  });
}

let loadingPromise: Promise<typeof i18n> | null = null;

async function addBundles(locale: I18nLanguage) {
  if (!i18n.hasResourceBundle(locale, 'translation')) {
    const primary = await loaders[locale]();
    i18n.addResourceBundle(locale, 'translation', primary.default, true, true);
  }
  if (locale !== 'en' && !i18n.hasResourceBundle('en', 'translation')) {
    const fallback = await loaders.en();
    i18n.addResourceBundle('en', 'translation', fallback.default, true, true);
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
