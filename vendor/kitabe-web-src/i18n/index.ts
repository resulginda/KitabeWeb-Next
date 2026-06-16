import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

export type I18nLanguage = 'tr' | 'en' | 'ru' | 'ar';

const loaders: Record<I18nLanguage, () => Promise<{ default: Record<string, unknown> }>> = {
  tr: () => import('./locales/tr.json'),
  en: () => import('./locales/en.json'),
  ru: () => import('./locales/ru.json'),
  ar: () => import('./locales/ar.json'),
};

let initPromise: Promise<typeof i18n> | null = null;
let initialized = false;

async function loadBundles(locale: I18nLanguage) {
  const primary = await loaders[locale]();
  const resources: Record<string, { translation: Record<string, unknown> }> = {
    [locale]: { translation: primary.default },
  };
  if (locale !== 'en') {
    const fallback = await loaders.en();
    resources.en = { translation: fallback.default };
  }
  return resources;
}

/** Aktif locale + en fallback — tüm dilleri başta yükleme */
export function ensureI18n(locale: I18nLanguage): Promise<typeof i18n> {
  if (initialized && i18n.hasResourceBundle(locale, 'translation')) {
    if (i18n.language !== locale) {
      return i18n.changeLanguage(locale).then(() => i18n);
    }
    return Promise.resolve(i18n);
  }

  if (!initPromise) {
    initPromise = (async () => {
      const resources = await loadBundles(locale);
      if (!initialized) {
        await i18n.use(initReactI18next).init({
          resources,
          lng: locale,
          fallbackLng: 'en',
          interpolation: { escapeValue: false },
        });
        initialized = true;
      } else {
        for (const [code, bundle] of Object.entries(resources)) {
          if (!i18n.hasResourceBundle(code, 'translation')) {
            i18n.addResourceBundle(code, 'translation', bundle.translation, true, true);
          }
        }
        await i18n.changeLanguage(locale);
      }
      return i18n;
    })();
  }

  return initPromise;
}

export async function loadI18nLanguage(locale: I18nLanguage) {
  if (!initialized) {
    await ensureI18n(locale);
    return;
  }
  if (!i18n.hasResourceBundle(locale, 'translation')) {
    const resources = await loadBundles(locale);
    for (const [code, bundle] of Object.entries(resources)) {
      if (!i18n.hasResourceBundle(code, 'translation')) {
        i18n.addResourceBundle(code, 'translation', bundle.translation, true, true);
      }
    }
  }
  await i18n.changeLanguage(locale);
}

export default i18n;
