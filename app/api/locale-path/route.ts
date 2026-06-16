import { NextResponse } from 'next/server';
import { resolveSeoLocalePath } from '@/lib/seoLocaleSwitch';
import { LOCALES, type Locale } from '@/lib/places';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get('path') ?? '/';
  const locale = searchParams.get('locale');

  if (!locale || !LOCALES.includes(locale as Locale)) {
    return NextResponse.json({ error: 'invalid locale' }, { status: 400 });
  }

  const resolved = await resolveSeoLocalePath(path, locale as Locale);
  if (!resolved) {
    return NextResponse.json({ error: 'not a seo path' }, { status: 404 });
  }

  return NextResponse.json({ path: resolved });
}
