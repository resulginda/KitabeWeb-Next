import { notFound, permanentRedirect } from 'next/navigation';
import type { Metadata } from 'next';
import { AdSlot } from '@/components/AdSlot';
import {
  AppPromoBanner,
  ListingBreadcrumbs,
  PlaceListingCard,
} from '@/components/ListingPage';
import { buildListingJsonLd, buildListingMetadata } from '@/lib/listingSeo';
import { listingIntroParagraphs } from '@/lib/listingIntro';
import {
  getListingByFilter,
  isHubSegment,
  isHubDashSegment,
  listingTitle,
} from '@/lib/listings';
import { buildPlaceJsonLd, buildPlaceMetadata } from '@/lib/seo';
import { PlaceDetailLayout } from '@/components/PlaceDetailLayout';
import {
  getPlaceIndex,
  resolvePlaceForDetail,
  canonicalPlacePath,
  LOCALES,
  type Locale,
} from '@/lib/places';
import { encodePathSegments } from '@/lib/detectLocale';

export const revalidate = 3600;
export const dynamicParams = true;

type PageProps = {
  params: Promise<{ locale: string; city: string; segments?: string[] }>;
};

/**
 * Detay sayfalarını build anında üretme stratejisi:
 * - Sunucu bypass anahtarı (SERVER_API_KEY / REVALIDATE_SECRET) VARSA: tüm
 *   sayfalar build'de üretilir. Anahtar X-Kitabe-Internal-Key olarak gider ve
 *   backend rate-limit'ini bypass eder → ~8500 sayfa 429 yemeden üretilir.
 * - Anahtar YOKSA: build sırasında API rate-limit'e (HTTP 429) takılıp build
 *   patlamasın diye on-demand ISR'ye düşeriz (dynamicParams=true + revalidate).
 *   Bu durumda sayfa yine "var": ilk istekte tam SSR HTML üretilip cache'lenir.
 * - PRERENDER_DETAILS=0 ile build-de üretimi elle kapatabilirsin.
 */
export async function generateStaticParams() {
  const serverKey = process.env.SERVER_API_KEY || process.env.REVALIDATE_SECRET;
  if (process.env.PRERENDER_DETAILS === '0' || !serverKey) {
    return [];
  }

  const index = await getPlaceIndex();
  const params: { locale: string; city: string; segments?: string[] }[] = [];

  for (const place of index) {
    for (const locale of LOCALES) {
      const full = place.slug?.[locale];
      if (!full) continue;
      // Arapça slug'lar NFD saklanıyor; statik sayfa anahtarını NFC'ye sabitle
      const [city, ...rest] = full.normalize('NFC').split('/');
      if (!city || rest.length === 0) continue;
      params.push({ locale, city, segments: rest });
    }
  }

  console.log(`[ISR] generateStaticParams (detail): ${params.length} sayfa`);
  return params;
}

async function renderListing(
  locale: Locale,
  city: string,
  filterSegments: string[]
) {
  const data = await getListingByFilter(locale, city, filterSegments);
  if (!data) notFound();

  const jsonLd = buildListingJsonLd(data, locale);
  const heading = listingTitle(data, locale).replace(' | Kitabe', '');
  const introParagraphs = listingIntroParagraphs(data, locale);

  const countLabel =
    locale === 'tr' ? 'yer' : locale === 'en' ? 'places' : locale === 'ru' ? 'мест' : 'مكان';

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="listing-page-shell">
        <div className="listing-page-layout">
          <aside className="listing-ad-left">
            <AdSlot position="left-sidebar" />
          </aside>

          <main className="listing-main-column">
            <ListingBreadcrumbs items={data.breadcrumb} />
            <header className="listing-header">
              <h1>{heading}</h1>
              <p className="listing-subtitle">
                {data.total} {countLabel}
              </p>
            </header>

            <div className="listing-intro">
              {introParagraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 48)}>{paragraph}</p>
              ))}
            </div>

            <AppPromoBanner locale={locale} />

            <AdSlot position="in-content" />

            <div className="listing-grid">
              {data.places.map((place) => (
                <PlaceListingCard key={place.id} place={place} locale={locale} />
              ))}
            </div>

            <AdSlot position="below-content" />
          </main>

          <aside className="listing-ad-right">
            <AdSlot position="sidebar" />
          </aside>
        </div>
      </div>
    </>
  );
}
async function renderDetail(locale: Locale, city: string, placeSlugParts: string[]) {
  const slug = placeSlugParts.join('/');
  const place = await resolvePlaceForDetail(locale, city, slug);
  if (!place) notFound();

  const canonical = canonicalPlacePath(place, locale);
  const requested = encodePathSegments(`/${locale}/${city}/${slug}`);
  if (canonical && canonical !== requested) {
    permanentRedirect(canonical);
  }

  const jsonLd = buildPlaceJsonLd(place, locale);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PlaceDetailLayout place={place} locale={locale} />
    </>
  );
}
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, city, segments = [] } = await params;
  if (!LOCALES.includes(locale as Locale)) return { title: 'Kitabe' };

  const loc = locale as Locale;
  const segs = segments ?? [];

  if (segs.length > 0 && isHubSegment(loc, segs[0])) {
    const data = await getListingByFilter(loc, city, segs.slice(1));
    if (!data) return { title: 'Kitabe' };
    return buildListingMetadata(data, loc);
  }

  if (segs.length === 1 && isHubDashSegment(loc, segs[0])) {
    const data = await getListingByFilter(loc, city, [segs[0]]);
    if (!data) return { title: 'Kitabe' };
    return buildListingMetadata(data, loc);
  }

  if (segs.length > 0) {
    const place = await resolvePlaceForDetail(loc, city, segs.join('/'));
    if (!place) return { title: 'Kitabe' };
    return buildPlaceMetadata(place, loc);
  }

  return { title: 'Kitabe' };
}

export default async function CitySegmentsPage({ params }: PageProps) {
  const { locale, city, segments = [] } = await params;

  if (!LOCALES.includes(locale as Locale)) notFound();

  const loc = locale as Locale;
  const segs = segments ?? [];

  if (segs.length > 0 && isHubSegment(loc, segs[0])) {
    return renderListing(loc, city, segs.slice(1));
  }

  if (segs.length === 1 && isHubDashSegment(loc, segs[0])) {
    return renderListing(loc, city, [segs[0]]);
  }

  if (segs.length > 0) {
    return renderDetail(loc, city, segs);
  }

  notFound();
}
