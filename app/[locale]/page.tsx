import type { Metadata } from 'next';
import { KitabeNavigation } from '@/components/KitabeNavigation';
import { LocaleHubPage } from '@/components/LocaleHubPage';
import { LOCALES, type Locale } from '@/lib/places';
import { setLocaleCookie } from '@/lib/preferredLocale';

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://kitabe.org';

const META: Record<Locale, { title: string; description: string }> = {
  tr: {
    title: 'Türkiye\'de Gezilecek Yerler | Kitabe',
    description:
      'İstanbul, Antalya, İzmir ve 81 ilde gezilecek yerler rehberi. Müzeler, antik kentler, kaleler ve doğal güzellikler — Kitabe.',
  },
  en: {
    title: 'Things to Do in Turkey | Kitabe',
    description:
      'Travel guide to cultural heritage across Turkey — museums, ancient sites, castles and natural wonders in every city.',
  },
  ru: {
    title: 'Достопримечательности Турции | Kitabe',
    description:
      'Путеводитель по культурному наследию Турции — музеи, античные города и природные красоты в каждом регионе.',
  },
  ar: {
    title: 'أماكن للزيارة في تركيا | Kitabe',
    description:
      'دليل التراث الثقافي في تركيا — متاحف ومواقع أثرية وقلاع وعجائب طبيعية في كل مدينة.',
  },
};

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const loc = LOCALES.includes(locale as Locale) ? (locale as Locale) : 'tr';
  const m = META[loc];

  const languages: Record<string, string> = {};
  for (const l of LOCALES) {
    languages[l] = `${SITE}/${l}`;
  }
  languages['x-default'] = `${SITE}/tr`;

  return {
    title: m.title,
    description: m.description,
    alternates: { canonical: `${SITE}/${loc}`, languages },
    openGraph: {
      title: m.title,
      description: m.description,
      url: `${SITE}/${loc}`,
      siteName: 'Kitabe',
      locale: loc,
      type: 'website',
    },
  };
}

export const revalidate = 3600;

export default async function LocaleRootPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const loc = LOCALES.includes(locale as Locale) ? (locale as Locale) : 'tr';

  await setLocaleCookie(loc);

  return (
    <>
      <LocaleHubPage locale={loc} />
      <KitabeNavigation locale={loc} />
    </>
  );
}
