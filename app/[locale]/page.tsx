import type { Metadata } from 'next';
import Link from 'next/link';
import { LOCALES, type Locale } from '@/lib/places';
import { DETAIL_LABELS } from '@/lib/detailLabels';
import { ensureLocaleCookie, setLocaleCookie } from '@/lib/preferredLocale';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const titles: Record<Locale, string> = {
    tr: 'Kitabe — Kültürel Miras Rehberi',
    en: 'Kitabe — Cultural Heritage Guide',
    ru: 'Kitabe — Путеводитель по культурному наследию',
    ar: 'Kitabe — دليل التراث الثقافي',
  };
  const l = LOCALES.includes(locale as Locale) ? (locale as Locale) : 'en';
  return { title: titles[l] };
}

export default async function LocaleHomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  await ensureLocaleCookie();

  if (!LOCALES.includes(locale as Locale)) {
    return <p>Invalid language.</p>;
  }

  const l = locale as Locale;
  await setLocaleCookie(l);
  const labels = DETAIL_LABELS[l];
  const langNames: Record<Locale, string> = {
    tr: 'Türkçe',
    en: 'English',
    ru: 'Русский',
    ar: 'العربية',
  };

  return (
    <main style={{ maxWidth: 720, margin: '2rem auto', padding: '0 1rem' }}>
      <h1>Kitabe</h1>
      <p>
        {l === 'tr' && 'Türkiye\'nin tarihi ve kültürel yerlerini keşfedin.'}
        {l === 'en' && 'Discover historical and cultural places in Türkiye.'}
        {l === 'ru' && 'Откройте для себя исторические и культурные места Турции.'}
        {l === 'ar' && 'اكتشف المواقع التاريخية والثقافية في تركيا.'}
      </p>
      <p>
        <a href="https://kitabe.org/home">kitabe.org</a>
      </p>
      <nav aria-label="Language">
        <p>{labels.description === 'Description' ? 'Language' : 'Dil'}:</p>
        <ul>
          {LOCALES.map((code) => (
            <li key={code}>
              <Link href={`/${code}`}>{langNames[code]}</Link>
            </li>
          ))}
        </ul>
      </nav>
    </main>
  );
}
