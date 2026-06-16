import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const LONG_CACHE = 'public, max-age=31536000, immutable';

/** public/ altındaki görseller — PSI önbellek (webp dahil) */
function wantsLongCache(pathname: string): boolean {
  if (pathname.startsWith('/cities/')) return true;
  if (pathname.startsWith('/fonts/')) return true;
  if (/^\/logo-[^/]+\.webp$/i.test(pathname)) return true;
  if (pathname === '/logo-header.webp') return true;
  return false;
}

export function middleware(request: NextRequest) {
  if (!wantsLongCache(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  const response = NextResponse.next();
  response.headers.set('Cache-Control', LONG_CACHE);
  return response;
}

export const config = {
  matcher: ['/cities/:path*', '/fonts/:path*', '/logo-header.webp', '/logo-:slug.webp'],
};
