import Link from 'next/link';
import { encodePathSegments } from '@/lib/detectLocale';
import { cityHubImage, FEATURED_EXPLORE_SLUGS } from '@/lib/featuredCities';
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
  const featured = cityHubs.filter((c) => featuredSet.has(c.citySlug));
  const others = cityHubs.filter((c) => !featuredSet.has(c.citySlug));

  const t = COPY[locale];

  return (
    <div className="locale-hub-shell">
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
        <p className="locale-hub-intro">{t.intro}</p>
        <p className="locale-hub-stats">
          {cityHubs.length} {locale === 'tr' ? 'şehir' : locale === 'en' ? 'cities' : locale === 'ru' ? 'городов' : 'مدينة'}
          {' · '}
          {cityHubs.reduce((s, c) => s + c.placeCount, 0)} {t.places}
        </p>
        <a className="locale-hub-web-link" href={`${SPA_BASE}/home`}>
          {t.webApp} →
        </a>
      </header>

      {featured.length > 0 && (
        <section className="locale-hub-section" aria-labelledby="featured-cities">
          <h2 id="featured-cities">{t.featuredTitle}</h2>
          <div className="locale-hub-grid locale-hub-grid-featured">
            {featured.map((city) => (
              <CityHubCard key={city.citySlug} locale={locale} city={city} t={t} large />
            ))}
          </div>
        </section>
      )}

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
    </div>
  );
}

function CityHubCard({
  locale,
  city,
  t,
  large = false,
}: {
  locale: Locale;
  city: {
    citySlug: string;
    placeCount: number;
    labels: { city: string };
  };
  t: (typeof COPY)[Locale];
  large?: boolean;
}) {
  const href = encodePathSegments(buildListingPath(locale, city.citySlug, []));
  const image = cityHubImage(city.citySlug);
  const initial = city.labels.city.trim().charAt(0).toUpperCase() || 'K';

  return (
    <Link href={href} className={`locale-hub-card${large ? ' locale-hub-card-large' : ''}`}>
      <div className="locale-hub-card-image">
        {image ? (
          <img src={image} alt={city.labels.city} loading="lazy" />
        ) : (
          <div className="locale-hub-card-placeholder" aria-hidden>
            <span>{initial}</span>
          </div>
        )}
      </div>
      <div className="locale-hub-card-body">
        <h3>{city.labels.city}</h3>
        <p>
          {city.placeCount} {t.places} · {t.explore}
        </p>
      </div>
    </Link>
  );
}
