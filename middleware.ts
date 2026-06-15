import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  LOCALE_COOKIE,
  detectLocaleFromAcceptLanguage,
  isSupportedLocale,
  type Locale,
} from '@/lib/detectLocale';
import { HUB_SLUGS } from '@/lib/listings';

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

function pathParts(pathname: string): string[] {
  return pathname.split('/').filter(Boolean);
}

/** /tr, /en — yalnızca dil segmenti */
function isLocaleOnlyPath(pathname: string): boolean {
  const parts = pathParts(pathname);
  return parts.length === 1 && isSupportedLocale(parts[0]);
}

function isHubSegmentForLocale(locale: Locale, segment: string): boolean {
  const expected = HUB_SLUGS[locale];
  return segment?.toLowerCase() === expected?.toLowerCase();
}

/** /tr/antalya/yer-slug veya /tr/antalya/kesfet/... */
function isCityContentPath(pathname: string): boolean {
  const parts = pathParts(pathname);
  if (parts.length < 3 || !isSupportedLocale(parts[0])) return false;
  const locale = parts[0] as Locale;
  const third = parts[2];
  if (parts.length === 3) {
    return isHubSegmentForLocale(locale, third) || third.length > 0;
  }
  return isHubSegmentForLocale(locale, third);
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const preferred = readPreferred(request);

  if (pathname === '/') {
    return withLocaleCookie(
      NextResponse.redirect(`${SPA_BASE}/home`),
      preferred,
      request
    );
  }

  if (isLocaleOnlyPath(pathname)) {
    return withLocaleCookie(NextResponse.next(), preferred, request);
  }

  if (pathname.startsWith('/detail/') || isCityContentPath(pathname)) {
    const response = NextResponse.next();
    const locale = pathParts(pathname)[0] as Locale;
    if (isSupportedLocale(locale)) {
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
    '/:locale(tr|en|ru|ar)/:city/:segments*',
  ],
};
