import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const LOCALE_COOKIE = 'kitabe_locale';
const LOCALES = ['tr', 'en', 'ru', 'ar'] as const;

/** Nginx yoksa veya önce istek Next'e düşerse tarayıcı taramalarını kes */
const BLOCKED_PATTERNS = [
  /^\/\.git/i,
  /^\/\.env/i,
  /^\/\.htaccess/i,
  /^\/wp-admin/i,
  /^\/wp-content/i,
  /^\/wp-includes/i,
  /^\/wp-login\.php/i,
  /^\/admin\/controller/i,
  /^\/sites\/default\/files/i,
  /^\/phpmyadmin/i,
  /^\/pma\b/i,
  /^\/adminer/i,
  /\.(php|asp|aspx|cgi)$/i,
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === '/sitemap.xml') {
    return NextResponse.rewrite(new URL('/api/sitemap-index', request.url));
  }

  if (BLOCKED_PATTERNS.some((re) => re.test(pathname))) {
    return new NextResponse(null, { status: 404 });
  }

  const response = NextResponse.next();

  const localeMatch = pathname.match(/^\/(tr|en|ru|ar)\/?$/);
  if (localeMatch && LOCALES.includes(localeMatch[1] as (typeof LOCALES)[number])) {
    response.cookies.set(LOCALE_COOKIE, localeMatch[1], {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax',
    });
  }

  return response;
}

export const config = {
  matcher: [
    '/sitemap.xml',
    '/((?!_next/static|_next/image|favicon.ico|icon.png|og-default.jpg|robots.txt|sitemap/).*)',
  ],
};
