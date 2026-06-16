import Link from 'next/link';
import Image from 'next/image';
import { HubAdSlot } from '@/components/HubAdSlot';
import { getCityLabel } from '@/lib/citySlugLabel';
import { encodePathSegments } from '@/lib/detectLocale';
import { cityHubImage, FEATURED_EXPLORE_SLUGS } from '@/lib/featuredCities';
import {
  CITY_CARD_IMAGE_QUALITY,
  CITY_CARD_IMAGE_SIZES,
  cityCardLcpSrcSet,
} from '@/lib/cityCardImage';
import { hubLcpImage, hubLcpSrcSet, isHubLcpCitySlug } from '@/lib/hubLcpImage';
import { localeHubIntroParagraphs } from '@/lib/listingIntro';
import { buildListingPath, getTaxonomyIndex } from '@/lib/listings';
import type { Locale } from '@/lib/places';

const COPY: Record<
  Locale,
  {
    featuredTitle: string;
    allTitle: string;
    intro: string;
    places: string;
    explore: string;
    webApp: string;
  }
> = {
  tr: {
    featuredTitle: 'En Popüler Şehirler',
    allTitle: 'Tüm Şehirler',
    intro:
      'Türkiye\'nin 81 ilinde binlerce kültürel miras noktası. Şehrinizi seçin; müzeler, antik kentler, kaleler ve doğal güzellikleri keşfedin.',
    places: 'yer',
    explore: 'Keşfet',
    webApp: 'Haritada gez (web uygulaması)',
  },
  en: {
    featuredTitle: 'Most Popular Cities',
    allTitle: 'All Cities',
    intro:
      'Thousands of cultural heritage sites across Turkey. Pick a city to explore museums, ancient ruins, castles and natural wonders.',
    places: 'places',
    explore: 'Explore',
    webApp: 'Browse on map (web app)',
  },
  ru: {
    featuredTitle: 'Популярные города',
    allTitle: 'Все города',
    intro:
      'Тысячи объектов культурного наследия по всей Турции. Выберите город — музеи, античные города, крепости и природа.',
    places: 'мест',
    explore: 'Смотреть',
    webApp: 'Карта (веб-приложение)',
  },
  ar: {
    featuredTitle: 'المدن الأكثر شعبية',
    allTitle: 'جميع المدن',
    intro:
      'آلاف مواقع التراث الثقافي في تركيا. اختر مدينة لاكتشاف المتاحف والآثار والقلاع والجمال الطبيعي.',
    places: 'مكان',
    explore: 'استكشف',
    webApp: 'تصفح على الخريطة',
  },
};

const SPA_BASE =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'https://kitabe.org';

export async function LocaleHubPage({ locale }: { locale: Locale }) {
  const all = await getTaxonomyIndex();
  const cityHubs = all
    .filter((c) => c.locale === locale && (!c.filter || c.filter.length === 0))
    .sort((a, b) => b.placeCount - a.placeCount);

  const featuredSet = new Set<string>(FEATURED_EXPLORE_SLUGS);
  const featuredOrder = new Map<string, number>(
    FEATURED_EXPLORE_SLUGS.map((slug, index) => [slug, index])
  );
  const featured = cityHubs
    .filter((c) => featuredSet.has(c.citySlug))
    .sort(
      (a, b) =>
        (featuredOrder.get(a.citySlug) ?? 99) - (featuredOrder.get(b.citySlug) ?? 99)
    );
  const others = cityHubs.filter((c) => !featuredSet.has(c.citySlug));

  const t = COPY[locale];
  const totalPlaces = cityHubs.reduce((s, c) => s + c.placeCount, 0);
  const introParagraphs = localeHubIntroParagraphs(locale, cityHubs.length, totalPlaces);

  return (
    <div className="listing-page-shell locale-hub-page">
      <div className="listing-page-layout">
        <aside className="listing-ad-left">
          <HubAdSlot position="left-sidebar" />
        </aside>

        <main className="listing-main-column locale-hub-main">
          <header className="locale-hub-header">
            <nav className="listing-breadcrumb" aria-label="Breadcrumb">
              <ol>
                <li>
                  <Link href={encodePathSegments(`/${locale}`)}>Kitabe</Link>
                </li>
              </ol>
            </nav>
            <h1>
              {locale === 'tr' && 'Türkiye\'de Gezilecek Yerler'}
              {locale === 'en' && 'Things to Do in Turkey'}
              {locale === 'ru' && 'Достопримечательности Турции'}
              {locale === 'ar' && 'أماكن للزيارة في تركيا'}
            </h1>
            <div className="locale-hub-intro">
              {introParagraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 48)}>{paragraph}</p>
              ))}
            </div>
            <p className="locale-hub-stats">
              {cityHubs.length}{' '}
              {locale === 'tr'
                ? 'şehir'
                : locale === 'en'
                  ? 'cities'
                  : locale === 'ru'
                    ? 'городов'
                    : 'مدينة'}
              {' · '}
              {totalPlaces} {t.places}
            </p>
            <a className="locale-hub-web-link" href={`${SPA_BASE}/home`}>
              {t.webApp} →
            </a>
          </header>

          {featured.length > 0 && (
            <section className="locale-hub-section" aria-labelledby="featured-cities">
              <h2 id="featured-cities">{t.featuredTitle}</h2>
              <div className="locale-hub-grid locale-hub-grid-featured">
                {featured.map((city, index) => (
                  <CityHubCard
                    key={city.citySlug}
                    locale={locale}
                    city={city}
                    t={t}
                    large
                    aboveFold={index < 3}
                    lcp={index === 0}
                  />
                ))}
              </div>
            </section>
          )}

          <HubAdSlot position="in-content" />

          {others.length > 0 && (
            <section className="locale-hub-section" aria-labelledby="all-cities">
              <h2 id="all-cities">{t.allTitle}</h2>
              <div className="locale-hub-grid">
                {others.map((city) => (
                  <CityHubCard key={city.citySlug} locale={locale} city={city} t={t} />
                ))}
              </div>
            </section>
          )}

          <HubAdSlot position="below-content" />
        </main>

        <aside className="listing-ad-right">
          <HubAdSlot position="sidebar" />
        </aside>
      </div>
    </div>
  );
}

function CityHubCard({
  locale,
  city,
  t,
  large = false,
  aboveFold = false,
  lcp = false,
}: {
  locale: Locale;
  city: {
    citySlug: string;
    placeCount: number;
    labels?: { city?: string };
  };
  t: (typeof COPY)[Locale];
  large?: boolean;
  aboveFold?: boolean;
  lcp?: boolean;
}) {
  const href = encodePathSegments(buildListingPath(locale, city.citySlug, []));
  const image = cityHubImage(city.citySlug);
  const cityName = city.labels?.city ?? getCityLabel(city.citySlug, locale);
  const initial = cityName.trim().charAt(0).toUpperCase() || 'K';

  return (
    <Link href={href} className={`locale-hub-card${large ? ' locale-hub-card-large' : ''}`}>
      <div className="locale-hub-card-image">
        {image && lcp ? (
          <img
            src={isHubLcpCitySlug(city.citySlug) ? hubLcpImage.src : image.replace(/\.webp$/i, '-480.webp')}
            srcSet={isHubLcpCitySlug(city.citySlug) ? hubLcpSrcSet : cityCardLcpSrcSet(image)}
            sizes={CITY_CARD_IMAGE_SIZES}
            alt={cityName}
            className="locale-hub-card-img locale-hub-card-img-native"
            width={480}
            height={300}
            loading="eager"
            fetchPriority="high"
            decoding="async"
          />
        ) : image ? (
          <Image
            src={image}
            alt={cityName}
            fill
            sizes={CITY_CARD_IMAGE_SIZES}
            quality={CITY_CARD_IMAGE_QUALITY}
            className="locale-hub-card-img"
            loading={aboveFold ? 'eager' : 'lazy'}
          />
        ) : (
          <div className="locale-hub-card-placeholder" aria-hidden>
            <span>{initial}</span>
          </div>
        )}
      </div>
      <div className="locale-hub-card-body">
        <h3>{cityName}</h3>
        <p>
          {city.placeCount} {t.places} · {t.explore}
        </p>
      </div>
    </Link>
  );
}
