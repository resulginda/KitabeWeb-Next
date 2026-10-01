import { NextRequest, NextResponse } from 'next/server';
import {
  LOCALE_COOKIE,
  detectLocaleFromAcceptLanguage,
  isSupportedLocale,
  slugPathForLocale,
} from '@/lib/detectLocale';
import { getPlaceById, type Locale } from '@/lib/places';

/** Eski /detail/:id deep link'lerini slug URL'ye yönlendirir (çerez yazabilmek için route handler). */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const saved = req.cookies.get(LOCALE_COOKIE)?.value;
  const preferred: Locale =
    saved && isSupportedLocale(saved)
      ? saved
      : detectLocaleFromAcceptLanguage(req.headers.get('accept-language'));

  const place = await getPlaceById(id).catch(() => null);
  const target =
    slugPathForLocale(place?.slug, preferred) ||
    slugPathForLocale(place?.slug, 'en') ||
    slugPathForLocale(place?.slug, 'tr');

  if (!target) {
    return new NextResponse('Not found', { status: 404 });
  }

  const response = NextResponse.redirect(new URL(target, req.url), 308);
  if (!saved) {
    response.cookies.set(LOCALE_COOKIE, preferred, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax',
    });
  }
  return response;
}
