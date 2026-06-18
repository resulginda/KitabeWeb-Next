import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const LONG_CACHE = 'public, max-age=31536000, immutable';
const LOCALES = ['tr', 'en', 'ru', 'ar'];

/** Next'in kendi sunduğu (SSR/SSG/SEO) veya statik path'ler — SPA'ya gitmez */
const NEXT_OWNED_FIRST = new Set([
  'tr',
  'en',
  'ru',
  'ar',
  'detail',
  'api',
  '_next',
  'kitabe-app',
  '.well-known',
  'sitemap.xml',
  'robots.txt',
]);

/** public/ altındaki görseller — PSI önbellek (webp dahil) */
function wantsLongCache(pathname: string): boolean {
  if (pathname.startsWith('/cities/')) return true;
  if (pathname.startsWith('/fonts/')) return true;
  if (/^\/logo-[^/]+\.webp$/i.test(pathname)) return true;
  if (pathname === '/logo-header.webp') return true;
  return false;
}

/** App (giriş, hesap, admin, liste, blog...) path'leri → SPA adası */
function isSpaPath(pathname: string): boolean {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) return false; // "/" → hub redirect
  const first = segments[0];
  if (NEXT_OWNED_FIRST.has(first)) return false;
  if (/\.[a-zA-Z0-9]+$/.test(pathname)) return false; // statik dosya (.webp, .png, .txt...)
  return true;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isSpaPath(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = '/kitabe-app';
    return NextResponse.rewrite(url);
  }

  if (wantsLongCache(pathname)) {
    const response = NextResponse.next();
    response.headers.set('Cache-Control', LONG_CACHE);
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
