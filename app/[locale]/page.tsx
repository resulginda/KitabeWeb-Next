import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { HubStaticChrome } from '@/components/HubStaticChrome';
import { LocaleHubPage } from '@/components/LocaleHubPage';
import { hubLcpImage, hubLcpSrcSet } from '@/lib/hubLcpImage';
import { LOCALES, type Locale } from '@/lib/places';
import { DEFAULT_OG, SITE_URL } from '@/lib/og';
import '../seo-pages.css';
import '../hub-home.css';

const META: Record<Locale, { title: string; description: string }> = {
  tr: {
    title: 'Türkiye\'de Gezilecek Yerler | Kitabe',
    description:
      'İstanbul, Antalya, İzmir ve 81 ilde gezilecek yerler rehberi. Müzeler, antik kentler, kaleler ve doğal güzellikler — Kitabe.',
  },
  en: {
    title: 'Things to Do in Turkey | Kitabe',
    description:
      'Travel guide to cultural heritage across Turkey — museums, ancient cities, castles and natural wonders in all 81 provinces, with maps and stories.',
  },
  ru: {
    title: 'Достопримечательности Турции | Kitabe',
    description:
      'Путеводитель по культурному наследию Турции — музеи, античные города, крепости и природные красоты во всех 81 провинциях, с картами и историями.',
  },
  ar: {
    title: 'أماكن للزيارة في تركيا | Kitabe',
    description:
      'دليل التراث الثقافي في تركيا — متاحف ومدن أثرية وقلاع وعجائب طبيعية في جميع الولايات الـ81، مع الخرائط والقصص ونصائح الزيارة.',
  },
};

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

/**
 * true: tr/en/ru/ar build'de üretilir; diğer tek-segment istekler
 * (bot /index.php, /legal vb.) NoFallbackError yerine notFound() 404 verir.
 */
export const dynamicParams = true;
export const dynamic = 'force-static';
/** "Ekim'de nereye gidilir?" bölümü aya göre değiştiği için saatlik yenilenir. */
export const revalidate = 3600;

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
    languages[l] = `${SITE_URL}/${l}`;
  }
  languages['x-default'] = `${SITE_URL}/tr`;

  return {
    title: m.title,
    description: m.description,
    alternates: { canonical: `${SITE_URL}/${loc}`, languages },
    openGraph: {
      type: 'website',
      url: `${SITE_URL}/${loc}`,
      title: m.title,
      description: m.description,
      siteName: DEFAULT_OG.siteName,
      locale: loc === 'tr' ? 'tr_TR' : loc === 'en' ? 'en_US' : loc,
      images: DEFAULT_OG.images,
    },
    twitter: {
      card: 'summary_large_image',
      title: m.title,
      description: m.description,
      images: [DEFAULT_OG.images[0].url],
    },
  };
}

export default async function LocaleRootPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!LOCALES.includes(locale as Locale)) {
    notFound();
  }
  const loc = locale as Locale;

  return (
    <HubStaticChrome locale={loc}>
      <div className="page-container">
        <link
          rel="preload"
          as="image"
          href={hubLcpImage.src}
          type="image/webp"
          imageSrcSet={hubLcpSrcSet}
          imageSizes="100vw"
          {...({ fetchpriority: 'high' } as Record<string, string>)}
        />
        <LocaleHubPage locale={loc} />
      </div>
    </HubStaticChrome>
  );
}
