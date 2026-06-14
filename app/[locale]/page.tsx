import { redirect } from 'next/navigation';
import { LOCALES, type Locale } from '@/lib/places';
import { setLocaleCookie } from '@/lib/preferredLocale';

const SPA_BASE =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'https://kitabe.org';

/** /tr, /en vb. — detay değil; SPA ana sayfasına yönlendir */
export default async function LocaleRootPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (LOCALES.includes(locale as Locale)) {
    await setLocaleCookie(locale as Locale);
  }

  redirect(`${SPA_BASE}/home`);
}
