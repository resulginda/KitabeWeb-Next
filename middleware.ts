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

function hasFileExtension(pathname: string): boolean {
  return /\.[a-zA-Z0-9]+$/.test(pathname);
}

/**
 * Tarayıcı botlarının yokladığı sunucu/yapılandırma dosyaları. Engelleme listesi
 * kasıtlı: izin listesi olursa sitemap/*.xml, doğrulama .html vb. meşru dosyalar da kesilir.
 */
const PROBE_EXTENSION =
  /\.(php\d?|phtml|asp|aspx|ashx|jsp|jspx|cgi|pl|env|ini|sql|bak|old|orig|swp|log|sh|conf|cfg)$/i;

/** App (giriş, hesap, admin, liste, blog...) path'leri → SPA adası */
function isSpaPath(pathname: string): boolean {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) return false; // "/" → hub redirect
  const first = segments[0];
  if (NEXT_OWNED_FIRST.has(first)) return false;
  if (hasFileExtension(pathname)) return false;
  return true;
}

/** Başlıksız istekler (Googlebot, AdSense tarayıcısı) x-default olan /tr'ye gider. */
function preferredLocale(acceptLanguage: string | null): string {
  if (!acceptLanguage) return 'tr';
  const ranked = acceptLanguage
    .split(',')
    .map((part) => {
      const [tag, ...params] = part.trim().split(';');
      const q = params.find((p) => p.trim().startsWith('q='));
      return { lang: tag.trim().toLowerCase().split('-')[0], q: q ? Number(q.trim().slice(2)) || 0 : 1 };
    })
    .sort((a, b) => b.q - a.q);
  return ranked.find((r) => LOCALES.includes(r.lang))?.lang ?? 'en';
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length === 0) {
    const url = request.nextUrl.clone();
    url.pathname = `/${preferredLocale(request.headers.get('accept-language'))}`;
    const response = NextResponse.redirect(url, 307);
    response.headers.set('Vary', 'Accept-Language');
    return response;
  }

  const legacyTarget = LEGACY_LEGAL_REDIRECTS[pathname];
  if (legacyTarget) {
    return NextResponse.redirect(new URL(legacyTarget, request.url), 308);
  }

  if (request.method === 'POST' && request.headers.has('next-action')) {
    return new NextResponse(null, { status: 404 });
  }

  if (PROBE_EXTENSION.test(pathname)) {
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
