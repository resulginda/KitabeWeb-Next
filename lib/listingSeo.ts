import type { Metadata } from 'next';
import { encodePathSegments } from './detectLocale';
import {
  buildListingPath,
  listingDescription,
  listingTitle,
  type ListingFilterResult,
  type Locale,
  HUB_SLUGS,
} from './listings';
import { shouldIndexListing } from './listingQuality';
import { LOCALES } from './places';
import { cityOgImage, DEFAULT_OG } from './og';

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://kitabe.org';

export function buildListingMetadata(
  data: ListingFilterResult,
  locale: Locale
): Metadata {
  const title = listingTitle(data, locale);
  const description = listingDescription(data, locale);
  const canonical = `${SITE}${encodePathSegments(buildListingPath(locale, data.citySlug, data.filter))}`;

  const languages: Record<string, string> = {};
  for (const loc of LOCALES) {
    const hub = HUB_SLUGS[loc];
    const path = buildListingPath(loc, data.citySlug, data.filter);
    languages[loc] = `${SITE}${encodePathSegments(path)}`;
  }
  languages['x-default'] = languages.tr || canonical;

  const ogImage = cityOgImage(data.citySlug);
  const indexable = shouldIndexListing(data);

  return {
    title,
    description,
    alternates: { canonical, languages },
    openGraph: {
      type: 'website',
      url: canonical,
      title,
      description,
      siteName: DEFAULT_OG.siteName,
      locale: locale === 'tr' ? 'tr_TR' : locale === 'en' ? 'en_US' : locale,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: { card: 'summary_large_image', title, description, images: [ogImage] },
    robots: indexable
      ? { index: true, follow: true }
      : { index: false, follow: true },
  };
}

export function buildListingJsonLd(data: ListingFilterResult, locale: Locale) {
  const title = listingTitle(data, locale).replace(' | Kitabe', '');
  const url = `${SITE}${encodePathSegments(buildListingPath(locale, data.citySlug, data.filter))}`;

  return [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: data.breadcrumb.map((item, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: item.label,
        item: item.href.startsWith('http') ? item.href : `${SITE}${encodePathSegments(item.href)}`,
      })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: title,
      numberOfItems: data.total,
      url,
      itemListElement: data.places.slice(0, 50).map((place, i) => {
        const detailUrl = place.detailPath
          ? `${SITE}${encodePathSegments(place.detailPath)}`
          : undefined;
        const name =
          typeof place.name === 'string'
            ? place.name
            : place.name?.[locale] || place.name?.tr;
        return {
          '@type': 'ListItem',
          position: i + 1,
          url: detailUrl,
          name,
        };
      }),
    },
  ];
}
