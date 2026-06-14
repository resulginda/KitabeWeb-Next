import { cookies, headers } from 'next/headers';
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  detectLocaleFromAcceptLanguage,
  isSupportedLocale,
  type Locale,
} from '@/lib/detectLocale';

/** Cookie → Accept-Language → en */
export async function getPreferredLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const saved = cookieStore.get(LOCALE_COOKIE)?.value;
  if (saved && isSupportedLocale(saved)) return saved;

  const headerStore = await headers();
  return detectLocaleFromAcceptLanguage(headerStore.get('accept-language'));
}

/** İlk ziyarette tercih edilen dili cookie'ye yazar */
export async function ensureLocaleCookie(): Promise<Locale> {
  const cookieStore = await cookies();
  const existing = cookieStore.get(LOCALE_COOKIE)?.value;
  if (existing && isSupportedLocale(existing)) return existing;

  const headerStore = await headers();
  const detected = detectLocaleFromAcceptLanguage(headerStore.get('accept-language'));
  cookieStore.set(LOCALE_COOKIE, detected, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  });
  return detected;
}

export async function setLocaleCookie(locale: Locale): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(LOCALE_COOKIE, locale, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  });
}

export { DEFAULT_LOCALE, LOCALE_COOKIE };
