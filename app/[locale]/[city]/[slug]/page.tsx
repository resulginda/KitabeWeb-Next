import { notFound, redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { buildPlaceJsonLd, buildPlaceMetadata } from '@/lib/seo';
import {
  getPlaceBySlug,
  getPlaceIndex,
  LOCALES,
  type Locale,
} from '@/lib/places';
import { PlacePhotoStrip } from '@/components/PlacePhotoStrip';
import { PlaceDetailClient } from '@/components/PlaceDetailClient';
import { AdSlot } from '@/components/AdSlot';

export const revalidate = 86400;

type PageProps = {
  params: Promise<{ locale: string; city: string; slug: string }>;
};

/** Tüm yayınlanmış yerler × 4 dil — build sırasında statik HTML üretilir */
export async function generateStaticParams() {
  const index = await getPlaceIndex();
  const params: { locale: string; city: string; slug: string }[] = [];

  for (const place of index) {
    for (const locale of LOCALES) {
      const full = place.slug?.[locale];
      if (!full) continue;
      const [city, ...rest] = full.split('/');
      if (!city || rest.length === 0) continue;
      params.push({ locale, city, slug: rest.join('/') });
    }
  }

  console.log(`[ISR] generateStaticParams: ${params.length} sayfa üretilecek`);
  return params;
}

/** Build'de olmayan yeni slug'lar ilk istekte ISR ile üretilir */
export const dynamicParams = true;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, city, slug } = await params;
  if (!LOCALES.includes(locale as Locale)) return { title: 'Kitabe' };

  const place = await getPlaceBySlug(locale as Locale, city, slug);
  if (!place) return { title: 'Yer bulunamadı | Kitabe' };

  return buildPlaceMetadata(place, locale as Locale);
}

export default async function PlacePage({ params }: PageProps) {
  const { locale, city, slug } = await params;

  if (!LOCALES.includes(locale as Locale)) notFound();

  const place = await getPlaceBySlug(locale as Locale, city, slug);
  if (!place) notFound();

  const jsonLd = buildPlaceJsonLd(place, locale as Locale);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Sunucu tarafı fotoğraf şeridi — her sayfada görünür, botlar tarar */}
      <PlacePhotoStrip place={place} locale={locale as Locale} />

      <div className="place-page-layout">
        <div>
          <PlaceDetailClient place={place as unknown as Record<string, unknown>} locale={locale as Locale} />
          <AdSlot position="in-content" />
          <AdSlot position="below-content" />
        </div>
        <aside className="place-sidebar">
          <AdSlot position="sidebar" />
        </aside>
      </div>
    </>
  );
}
