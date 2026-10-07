import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { LEGACY_LEGAL_REDIRECTS } from '@/lib/legal/types';
import { isBlockedBot } from '@/lib/blockedBots';

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

/**
 * SPA'nın (vendor App.tsx) ilk segmentleri. Liste dışındaki adresler (eski kitap sitesinin
 * /roman/... URL'leri gibi) SPA'ya verilirse 200 + ana sayfa dönüp soft 404 oluyordu.
 */
const SPA_FIRST = new Set([
  'app',
  'list',
  'nearby',
  'route',
  'account',
  'favorites',
  'suggestion',
  'edit-suggestion',
  'my-suggestions',
  'editor-panel',
  'admin-panel',
  'admin-hub',
  'admin-push',
  'admin-push-logs',
  'admin-contact-forms',
  'user-management',
  'account-settings',
  'login',
  'register',
  'stats',
  'hakkimizda',
  'gizlilik-politikasi',
  'kullanim-sartlari',
  'iletisim',
  'blog',
  'delete-account',
  'hesap-silme',
  'reset-password',
  'verify-email',
  'notifications',
  'notification-settings',
  'photo-approval',
  'rating-approval',
  'profile',
  'language-selection',
]);

/**
 * Eski kitap sitesinin adresleri (/yazar/..., /hikaye-oyku/..., /category/..., /roman/...):
 * hiçbir rotaya ait olmayan ilk segment kalıcı olarak kaldırıldı (410) → arama motorları
 * 404'e göre çok daha hızlı dizinden düşürür.
 */
function isRetiredPath(first: string, pathname: string): boolean {
  return (
    !LOCALES.includes(first) &&
    !NEXT_OWNED_FIRST.has(first) &&
    !SPA_FIRST.has(first) &&
    !hasFileExtension(pathname)
  );
}

const GONE_HTML = `<!doctype html><html lang="tr"><head><meta charset="utf-8"><meta name="robots" content="noindex"><title>410 — Kitabe</title></head><body style="font-family:system-ui,sans-serif;max-width:36rem;margin:4rem auto;padding:0 1rem"><h1>Bu sayfa kaldırıldı</h1><p>Aradığınız içerik artık Kitabe'de yayında değil.</p><p><a href="/tr">Türkiye'nin kültürel miras rehberine git →</a></p></body></html>`;

/** App (giriş, hesap, admin, liste, blog...) path'leri → SPA adası */
function isSpaPath(pathname: string): boolean {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) return false; // "/" → hub redirect
  const first = segments[0];
  if (NEXT_OWNED_FIRST.has(first)) return false;
  if (hasFileExtension(pathname)) return false;
  return SPA_FIRST.has(first);
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

/** Görsel/font/js gibi dosyalar kaydı boğmasın; sitemap ve robots botlar için ilginç. */
const UNLOGGED_ASSET = /\.(webp|png|jpe?g|gif|svg|ico|avif|woff2?|ttf|css|js|map|json|webmanifest)$/i;

function clientIp(request: NextRequest): string {
  return (
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    '-'
  );
}

const SENSITIVE_PARAM = /token|code|pass|secret|key|email|auth/i;

/** Şifre sıfırlama / doğrulama bağlantıları log'a düşmesin. */
function redactedSearch(params: URLSearchParams): string {
  if ([...params.keys()].length === 0) return '';
  const out = new URLSearchParams();
  for (const [k, v] of params) out.append(k, SENSITIVE_PARAM.test(k) ? '***' : v);
  return `?${out.toString()}`;
}

function redactPathToken(pathname: string): string {
  return pathname.replace(/^\/(reset-password|verify-email)\/[^/]+/, '/$1/***');
}

/** Eski nginx access log'unun yerine: IP, istek, referer ve user-agent stdout'a. */
function logRequest(request: NextRequest, pathname: string) {
  if (UNLOGGED_ASSET.test(pathname)) return;
  if (request.headers.has('next-router-prefetch')) return;
  const search = redactedSearch(request.nextUrl.searchParams);
  const referer = (request.headers.get('referer') || '-').replace(
    /([?&][^=&]*(?:token|code|pass|secret|key|email|auth)[^=&]*=)[^&]*/gi,
    '$1***'
  );
  const ua = request.headers.get('user-agent') || '-';
  console.log(
    `[req] ${clientIp(request)} ${request.method} ${redactPathToken(pathname)}${search} "${referer}" "${ua}"`
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  logRequest(request, pathname);

  // robots.txt açık kalır ki botlar yasağı okuyabilsin
  if (pathname !== '/robots.txt' && isBlockedBot(request.headers.get('user-agent'))) {
    return new NextResponse(null, { status: 403, headers: { 'Cache-Control': 'no-store' } });
  }

  const segments = pathname.split('/').filter(Boolean);

  if (segments.length === 0 || pathname === '/home') {
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

  if (isRetiredPath(first, pathname)) {
    return new NextResponse(GONE_HTML, {
      status: 410,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'X-Robots-Tag': 'noindex',
        'Cache-Control': 'public, max-age=86400',
      },
    });
  }

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
