import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { buildPlaceJsonLd, buildPlaceMetadata } from '@/lib/seo';
import {
  getPlaceIndex,
  resolvePlaceForDetail,
  LOCALES,
  type Locale,
} from '@/lib/places';
import { PlaceDetailLayout } from '@/components/PlaceDetailLayout';
import { KitabeNavigation } from '@/components/KitabeNavigation';

export const revalidate = 86400;

type PageProps = {
  params: Promise<{ locale: string; city: string; slug: string }>;
};

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

export const dynamicParams = true;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, city, slug } = await params;
  if (!LOCALES.includes(locale as Locale)) return { title: 'Kitabe' };

  const place = await resolvePlaceForDetail(locale as Locale, city, slug);
  if (!place) return { title: 'Yer bulunamadı | Kitabe' };

  return buildPlaceMetadata(place, locale as Locale);
}

export default async function PlacePage({ params }: PageProps) {
  const { locale, city, slug } = await params;

  if (!LOCALES.includes(locale as Locale)) notFound();

  const place = await resolvePlaceForDetail(locale as Locale, city, slug);
  if (!place) notFound();

  const jsonLd = buildPlaceJsonLd(place, locale as Locale);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <PlaceDetailLayout place={place} locale={locale as Locale} />
      <KitabeNavigation locale={locale as Locale} />
    </>
  );
}
