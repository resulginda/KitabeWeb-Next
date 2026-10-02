import type { Metadata } from 'next';
import { pickText, type Locale, type SeoPlace, LOCALES } from './places';
import { encodePathSegments } from './detectLocale';
import { absoluteOgImage, DEFAULT_OG } from './og';
import { HUB_SLUGS } from './listings';
import { fitMetaDescription } from './metaDescription';

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://kitabe.org';

function absolutePlaceUrl(locale: Locale, citySlug: string, placeSlugParts: string[]): string {
  const path = encodePathSegments(`/${locale}/${citySlug}/${placeSlugParts.join('/')}`);
  return `${SITE}${path}`;
}

/** Uzundan kısaya: fitMetaDescription sığan ilkini kullanır. */
function placeMetaSuffixes(locale: Locale, city: string, district: string): string[] {
  const where =
    district && district !== city && !/^merkez$/i.test(district) ? `${district}, ${city}` : city;
  if (locale === 'tr') {
    return [
      `${where} gezisi için tarihçe, ziyaret ipuçları ve harita Kitabe'de.`,
      'Tarihçe, ziyaret ipuçları ve harita Kitabe\'de.',
      'Harita ve ipuçları Kitabe\'de.',
    ];
  }
  if (locale === 'en') {
    return [
      `Plan your visit to ${where}: history, visiting tips and map on Kitabe.`,
      'History, visiting tips and map on Kitabe.',
      'Map and tips on Kitabe.',
    ];
  }
  if (locale === 'ru') {
    return [
      `${where}: история, советы для посещения и карта на Kitabe.`,
      'История, советы и карта на Kitabe.',
      'Карта и советы на Kitabe.',
    ];
  }
  return [
    `${where}: التاريخ ونصائح الزيارة والخريطة على Kitabe.`,
    'التاريخ ونصائح الزيارة والخريطة على Kitabe.',
    'الخريطة والنصائح على Kitabe.',
  ];
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

  const story = pickText(place.story as never, locale).replace(/[#*_>]+/g, ' ');
  const metaDesc = fitMetaDescription(description, [story], placeMetaSuffixes(locale, city, district));

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

/** <script type="application/ld+json"> içeriği: API metnindeki "</script>" etiketi kıramasın. */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

export function buildPlaceJsonLd(
  place: SeoPlace,
  locale: Locale,
  crumbs?: { label: string; href: string }[]
) {
  const name = pickText(place.name as never, locale);
  const description = pickText(place.description as never, locale);
  const cityLabel = pickText(place.city as never, locale);
  const fullSlug = place.slug?.[locale] ?? '';
  const [citySlug, ...rest] = fullSlug.split('/');
  const placeUrl = absolutePlaceUrl(locale, citySlug, rest);
  const hubSlug = HUB_SLUGS[locale];
  const cityHubUrl = `${SITE}${encodePathSegments(`/${locale}/${citySlug}/${hubSlug}`)}`;
  const trail = crumbs?.length
    ? crumbs.map((c) => ({ name: c.label, item: `${SITE}${encodePathSegments(c.href)}` }))
    : [
        { name: 'Kitabe', item: `${SITE}/${locale}` },
        { name: cityLabel, item: cityHubUrl },
      ];

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
        itemListElement: [...trail, { name, item: placeUrl }].map((entry, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: entry.name,
          item: entry.item,
        })),
      },
    ],
  };
}
