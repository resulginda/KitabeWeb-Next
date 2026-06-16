import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

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

  if (BLOCKED_PATTERNS.some((re) => re.test(pathname))) {
    return new NextResponse(null, { status: 404 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icon.png|og-default.jpg|robots.txt|sitemap).*)',
  ],
};
