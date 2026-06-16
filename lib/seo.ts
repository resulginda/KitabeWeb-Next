import type { Metadata } from 'next';
import { pickText, type Locale, type SeoPlace, LOCALES } from './places';
import { encodePathSegments } from './detectLocale';
import { absoluteOgImage, DEFAULT_OG } from './og';
import { HUB_SLUGS } from './listings';

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://kitabe.org';

function absolutePlaceUrl(locale: Locale, citySlug: string, placeSlugParts: string[]): string {
  const path = encodePathSegments(`/${locale}/${citySlug}/${placeSlugParts.join('/')}`);
  return `${SITE}${path}`;
}

export function buildPlaceMetadata(place: SeoPlace, locale: Locale): Metadata {
  const name = pickText(place.name as never, locale);
  const city = pickText(place.city as never, locale);
  const district = pickText(place.district as never, locale);
  const description =
    pickText(place.metaDescription, locale) ||
    pickText(place.description as never, locale);
  const title =
    pickText(place.metaTitle, locale) ||
    `${name} - ${city}${district ? `, ${district}` : ''} | Kitabe`;

  const metaDesc =
    description.length > 160 ? `${description.slice(0, 157)}...` : description;

  const fullSlug = place.slug?.[locale] ?? '';
  const [citySlug, ...rest] = fullSlug.split('/');
  const canonical = absolutePlaceUrl(locale, citySlug, rest);
  const image = absoluteOgImage(place.imageUrl || place.thumbnailUrl);

  const languages: Record<string, string> = {};
  for (const loc of LOCALES) {
    const s = place.slug?.[loc];
    if (!s) continue;
    const [c, ...r] = s.split('/');
    languages[loc] = absolutePlaceUrl(loc, c, r);
  }
  if (place.slug?.tr) {
    const [c, ...r] = place.slug.tr.split('/');
    languages['x-default'] = absolutePlaceUrl('tr', c, r);
  }

  return {
    title,
    description: metaDesc,
    alternates: { canonical, languages },
    openGraph: {
      type: 'website',
      url: canonical,
      title,
      description: metaDesc,
      siteName: DEFAULT_OG.siteName,
      locale: locale === 'tr' ? 'tr_TR' : locale === 'en' ? 'en_US' : locale,
      images: [{ url: image, width: 1200, height: 630, alt: name }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: metaDesc,
      images: [image],
    },
    robots: { index: true, follow: true },
  };
}

export function buildPlaceJsonLd(place: SeoPlace, locale: Locale) {
  const name = pickText(place.name as never, locale);
  const description = pickText(place.description as never, locale);
  const cityLabel = pickText(place.city as never, locale);
  const fullSlug = place.slug?.[locale] ?? '';
  const [citySlug, ...rest] = fullSlug.split('/');
  const placeUrl = absolutePlaceUrl(locale, citySlug, rest);
  const hubSlug = HUB_SLUGS[locale];
  const cityHubUrl = `${SITE}${encodePathSegments(`/${locale}/${citySlug}/${hubSlug}`)}`;

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'TouristAttraction',
        name,
        description,
        image: place.imageUrl || place.thumbnailUrl,
        url: placeUrl,
        geo: {
          '@type': 'GeoCoordinates',
          latitude: place.latitude,
          longitude: place.longitude,
        },
        address: {
          '@type': 'PostalAddress',
          addressLocality: cityLabel,
          addressRegion: pickText(place.district as never, locale),
          addressCountry: 'TR',
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Kitabe',
            item: `${SITE}/${locale}`,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: cityLabel,
            item: cityHubUrl,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name,
            item: placeUrl,
          },
        ],
      },
    ],
  };
}
