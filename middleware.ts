import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  detectLocaleFromAcceptLanguage,
  isSupportedLocale,
  type Locale,
} from '@/lib/detectLocale';

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

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const preferred = readPreferred(request);

  if (pathname === '/') {
    const url = request.nextUrl.clone();
    url.pathname = `/${preferred}`;
    return withLocaleCookie(NextResponse.redirect(url), preferred, request);
  }

  const segment = pathname.split('/')[1];
  if (segment && !isSupportedLocale(segment) && !pathname.startsWith('/api')) {
    const url = request.nextUrl.clone();
    url.pathname = `/${preferred}${pathname}`;
    return withLocaleCookie(NextResponse.redirect(url), preferred, request);
  }

  return withLocaleCookie(NextResponse.next(), preferred, request);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)'],
};
