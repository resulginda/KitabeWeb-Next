import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  LOCALE_COOKIE,
  detectLocaleFromAcceptLanguage,
  isSupportedLocale,
  type Locale,
} from '@/lib/detectLocale';

const SPA_BASE =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'https://kitabe.org';

function readPreferred(request: NextRequest): Locale {
  const saved = request.cookies.get(LOCALE_COOKIE)?.value;
  if (saved && isSupportedLocale(saved)) return saved;
  return detectLocaleFromAcceptLanguage(request.headers.get('accept-language'));
}

function withLocaleCookie(response: NextResponse, locale: Locale, request: NextRequest) {
  if (!request.cookies.get(LOCALE_COOKIE)) {
    response.cookies.set(LOCALE_COOKIE, locale, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax',
    });
  }
  return response;
}

/** /tr, /en — yalnızca dil segmenti (detay değil) */
function isLocaleOnlyPath(pathname: string): boolean {
  const parts = pathname.split('/').filter(Boolean);
  return parts.length === 1 && isSupportedLocale(parts[0]);
}

/** /tr/antalya/yer-slug */
function isDetailPath(pathname: string): boolean {
  const parts = pathname.split('/').filter(Boolean);
  return parts.length === 3 && isSupportedLocale(parts[0]);
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const preferred = readPreferred(request);

  // Ana sayfa ve dil kökü → KitabeWeb SPA
  if (pathname === '/' || isLocaleOnlyPath(pathname)) {
    const locale = isLocaleOnlyPath(pathname)
      ? (pathname.split('/').filter(Boolean)[0] as Locale)
      : preferred;
    return withLocaleCookie(
      NextResponse.redirect(`${SPA_BASE}/home`),
      locale,
      request
    );
  }

  if (pathname.startsWith('/detail/') || isDetailPath(pathname)) {
    const response = NextResponse.next();
    if (isDetailPath(pathname)) {
      const locale = pathname.split('/').filter(Boolean)[0] as Locale;
      response.cookies.set(LOCALE_COOKIE, locale, {
        path: '/',
        maxAge: 60 * 60 * 24 * 365,
        sameSite: 'lax',
      });
    } else {
      withLocaleCookie(response, preferred, request);
    }
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/detail/:path*',
    '/:locale(tr|en|ru|ar)',
    '/:locale(tr|en|ru|ar)/:city/:slug',
  ],
};
