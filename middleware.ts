import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { LEGACY_LEGAL_REDIRECTS } from '@/lib/legal/types';

const LONG_CACHE = 'public, max-age=31536000, immutable';
const LOCALES = ['tr', 'en', 'ru', 'ar'];

/** Next'in kendi sunduğu (SSR/SSG/SEO) veya statik path'ler — SPA'ya gitmez */
const NEXT_OWNED_FIRST = new Set([
  'tr',
  'en',
  'ru',
  'ar',
  'legal',
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

const ROOT_PUBLIC_FILES = new Set([
  'favicon.ico',
  'robots.txt',
  'sitemap.xml',
  'ads.txt',
  'app-ads.txt',
  'icon.png',
  'icon-180.png',
  'app-icon.png',
  'og-default.jpg',
  'logo-header.webp',
  'logo-header.png',
  'logo-160.webp',
  'logo-260.webp',
]);

function hasFileExtension(pathname: string): boolean {
  return /\.[a-zA-Z0-9]+$/.test(pathname);
}

/** Arama motoru site doğrulama dosyaları (Yandex, Google, Bing) */
const VERIFICATION_FILE = /^(yandex_[a-f0-9]+\.html|google[a-z0-9]+\.html|BingSiteAuth\.xml)$/i;

function isRealStaticAsset(pathname: string): boolean {
  const file = pathname.replace(/^\//, '');
  if (ROOT_PUBLIC_FILES.has(file)) return true;
  if (VERIFICATION_FILE.test(file)) return true;
  if (pathname.startsWith('/cities/')) return true;
  if (pathname.startsWith('/fonts/')) return true;
  if (pathname.startsWith('/_next/')) return true;
  if (pathname.startsWith('/.well-known/')) return true;
  return false;
}

/** App (giriş, hesap, admin, liste, blog...) path'leri → SPA adası */
function isSpaPath(pathname: string): boolean {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) return false; // "/" → hub redirect
  const first = segments[0];
  if (NEXT_OWNED_FIRST.has(first)) return false;
  if (hasFileExtension(pathname)) return false;
  return true;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const segments = pathname.split('/').filter(Boolean);

  const legacyTarget = LEGACY_LEGAL_REDIRECTS[pathname];
  if (legacyTarget) {
    return NextResponse.redirect(new URL(legacyTarget, request.url), 308);
  }

  if (request.method === 'POST' && request.headers.has('next-action')) {
    return new NextResponse(null, { status: 404 });
  }

  // /index.php, /wp-login.php vb. [locale] rotasına düşmesin → NoFallbackError
  if (hasFileExtension(pathname) && !isRealStaticAsset(pathname)) {
    return new NextResponse(null, { status: 404 });
  }

  const first = segments[0];

  // /legal tek başına [locale]=legal olurdu; yasal ana sayfaya al
  if (first === 'legal' && segments.length < 3) {
    const loc = LOCALES.includes(segments[1] ?? '') ? segments[1] : 'tr';
    return NextResponse.redirect(new URL(`/legal/${loc}/about`, request.url), 308);
  }

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
