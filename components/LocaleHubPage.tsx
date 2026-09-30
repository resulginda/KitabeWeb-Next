import Link from 'next/link';
import Image from 'next/image';
import { HubAdSlot } from '@/components/HubAdSlot';
import { SiteFooter } from '@/components/SiteFooter';
import { HubSearch } from '@/components/home/HubSearch';
import { getCityLabel, localeCitySlug } from '@/lib/citySlugLabel';
import { encodePathSegments } from '@/lib/detectLocale';
import { cityHubImage, FEATURED_EXPLORE_SLUGS } from '@/lib/featuredCities';
import { CITY_CARD_IMAGE_QUALITY, CITY_CARD_IMAGE_SIZES } from '@/lib/cityCardImage';
import { hubLcpImage, hubLcpSrcSet } from '@/lib/hubLcpImage';
import { HOME_COPY } from '@/lib/home/copy';
import { HOME_GUIDE } from '@/lib/home/guide';
import { pickResolved, resolveHomePlaces, UNESCO_REFS, type HomePlace } from '@/lib/home/places';
import { HOME_REGIONS } from '@/lib/home/regions';
import { HOME_ROUTES } from '@/lib/home/routes';
import { currentMonth, SEASON_LEAD, SEASON_PICKS, seasonForMonth, seasonTitle } from '@/lib/home/seasons';
import { legalPath } from '@/lib/legal/types';
import { buildListingPath, getTaxonomyIndex, type TaxonomyCombination } from '@/lib/listings';
import type { Locale } from '@/lib/places';
import { getNationalThemes } from '@/lib/taxonomyChips';

const SPA_BASE =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'https://kitabe.org';

const UNESCO_VISIBLE = 12;

export async function LocaleHubPage({ locale }: { locale: Locale }) {
  const t = HOME_COPY[locale];
  const month = currentMonth();
  const season = seasonForMonth(month);
  const picks = SEASON_PICKS[season];

  const [all, themes, resolved] = await Promise.all([
    getTaxonomyIndex(),
    getNationalThemes(locale).catch(() => []),
    resolveHomePlaces(
      [...picks.map((p) => p.ref), ...HOME_ROUTES.flatMap((r) => r.stops), ...UNESCO_REFS],
      locale
    ),
  ]);

  const cityHubs = all
    .filter((c) => c.locale === locale && (!c.filter || c.filter.length === 0))
    .sort((a, b) => b.placeCount - a.placeCount);
  const hubBySlug = new Map(cityHubs.map((c) => [c.citySlug, c]));
  const hubSlugs = new Set(hubBySlug.keys());
  const trHubs = all.filter((c) => c.locale === 'tr' && (!c.filter || c.filter.length === 0));
  const statHubs = trHubs.length > 0 ? trHubs : cityHubs;
  const totalPlaces = statHubs.reduce((s, c) => s + c.placeCount, 0);

  const featured = FEATURED_EXPLORE_SLUGS
    .map((slug) => hubBySlug.get(slug))
    .filter((c): c is TaxonomyCombination => Boolean(c));

  const seasonCards = picks
    .map((p) => ({ place: resolved.get(p.ref.id), note: p.note[locale] }))
    .filter((c): c is { place: HomePlace; note: string } => Boolean(c.place));
  const routes = HOME_ROUTES
    .map((route) => ({ route, stops: pickResolved(route.stops, resolved) }))
    .filter((r) => r.stops.length >= 3);
  const unesco = pickResolved(UNESCO_REFS, resolved).slice(0, UNESCO_VISIBLE);
  const guide = HOME_GUIDE[locale];

  return (
    <div className="listing-page-shell locale-hub-page">
      <section className="hub-hero">
        <div className="hub-hero-media" aria-hidden>
          <img
            className="hub-hero-bg"
            src={hubLcpImage.src}
            srcSet={hubLcpSrcSet}
            sizes="100vw"
            alt=""
            width={hubLcpImage.width}
            height={hubLcpImage.height}
            fetchPriority="high"
            decoding="async"
          />
        </div>
        <div className="hub-hero-content">
          <p className="hub-hero-eyebrow">{t.eyebrow}</p>
          <h1>{t.h1}</h1>
          <p className="hub-hero-lead">{t.lead}</p>
          <HubSearch
            locale={locale}
            placeholder={t.searchPlaceholder}
            buttonLabel={t.searchButton}
            labels={t.searchLabels}
          />
          <p className="hub-hero-stats">
            {statHubs.length} {t.cities} · {totalPlaces.toLocaleString(locale === 'ar' ? 'ar' : locale)} {t.places}
          </p>
          <nav className="hub-hero-links">
            {seasonCards.length > 0 ? <a href="#season">{t.linkSeason}</a> : null}
            {routes.length > 0 ? <a href="#routes">{t.linkRoutes}</a> : null}
            {unesco.length > 0 ? <a href="#unesco">{t.linkUnesco}</a> : null}
            <a href={`${SPA_BASE}/home`}>{t.linkMap} →</a>
          </nav>
        </div>
      </section>

      <div className="listing-page-layout">
        <aside className="listing-ad-left">
          <HubAdSlot position="left-sidebar" />
        </aside>

        <main className="listing-main-column locale-hub-main">
          {seasonCards.length > 0 && (
            <section id="season" className="hub-section" aria-labelledby="season-title">
              <h2 id="season-title">{seasonTitle(month, locale)}</h2>
              <p className="hub-section-lead">{SEASON_LEAD[season][locale]}</p>
              <div className="hub-pick-grid">
                {seasonCards.map(({ place, note }) => (
                  <Link key={place.id} href={place.href} className="hub-pick-card">
                    <PlaceImage place={place} />
                    <div className="hub-pick-body">
                      <h3>{place.name}</h3>
                      <p className="hub-card-meta">{place.city}</p>
                      <p className="hub-pick-note">{note}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {featured.length > 0 && (
            <section className="hub-section" aria-labelledby="featured-cities">
              <h2 id="featured-cities">{t.featuredTitle}</h2>
              <div className="locale-hub-grid locale-hub-grid-featured">
                {featured.map((city) => (
                  <CityHubCard key={city.citySlug} locale={locale} city={city} places={t.places} explore={t.explore} />
                ))}
              </div>
            </section>
          )}

          <HubAdSlot position="in-content" />

          {routes.length > 0 && (
            <section id="routes" className="hub-section" aria-labelledby="routes-title">
              <h2 id="routes-title">{t.routesTitle}</h2>
              <p className="hub-section-lead">{t.routesLead}</p>
              <div className="hub-route-grid">
                {routes.map(({ route, stops }) => {
                  const copy = route.copy[locale];
                  const cover = stops.find((s) => s.image) ?? stops[0];
                  return (
                    <article key={route.id} className="hub-route-card">
                      <div className="hub-route-cover">
                        <PlaceImage place={cover} alt={copy.title} />
                        <span className="hub-route-badge">
                          {t.days(route.days)} · {t.stops(stops.length)}
                        </span>
                      </div>
                      <div className="hub-route-body">
                        <h3>{copy.title}</h3>
                        <p>{copy.summary}</p>
                        <ol className="hub-route-stops">
                          {stops.map((stop) => (
                            <li key={stop.id}>
                              <Link href={stop.href}>{stop.name}</Link>
                              <span>{stop.city}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          )}

          {unesco.length > 0 && (
            <section id="unesco" className="hub-section" aria-labelledby="unesco-title">
              <h2 id="unesco-title">{t.unescoTitle}</h2>
              <p className="hub-section-lead">{t.unescoLead}</p>
              <div className="hub-mini-grid">
                {unesco.map((place) => (
                  <Link key={place.id} href={place.href} className="hub-mini-card">
                    <PlaceImage place={place} />
                    <div className="hub-mini-body">
                      <h3>{place.name}</h3>
                      <p className="hub-card-meta">{place.city}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {themes.length > 0 && (
            <section id="themes" className="hub-section" aria-labelledby="themes-title">
              <h2 id="themes-title">{t.themesTitle}</h2>
              <p className="hub-section-lead">{t.themesLead}</p>
              <div className="hub-theme-grid">
                {themes.map((theme) => (
                  <div key={theme.slug} className="hub-theme-card">
                    <h3>
                      {theme.label} <span>{theme.total}</span>
                    </h3>
                    <p className="hub-card-meta">{t.themeTopCities}</p>
                    <ul>
                      {theme.cities.map((city) => (
                        <li key={city.citySlug}>
                          <Link href={city.href}>
                            {city.label} <span>{city.count}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section id="regions" className="hub-section" aria-labelledby="regions-title">
            <h2 id="regions-title">{t.regionsTitle}</h2>
            <p className="hub-section-lead">{t.regionsLead}</p>
            <div className="hub-region-list">
              {HOME_REGIONS.map((region) => {
                const cities = region.cities
                  .map((trSlug) => {
                    const slug = localeCitySlug(trSlug, hubSlugs);
                    const hub = slug ? hubBySlug.get(slug) : undefined;
                    return hub ? { trSlug, hub } : null;
                  })
                  .filter((c): c is { trSlug: string; hub: TaxonomyCombination } => Boolean(c))
                  .sort((a, b) => b.hub.placeCount - a.hub.placeCount);
                if (cities.length === 0) return null;
                return (
                  <div key={region.id} className="hub-region">
                    <h3>{region.name[locale]}</h3>
                    <p>{region.text[locale]}</p>
                    <ul className="hub-region-cities">
                      {cities.map(({ trSlug, hub }) => (
                        <li key={hub.citySlug}>
                          <Link href={encodePathSegments(buildListingPath(locale, hub.citySlug, []))}>
                            {hub.labels.city || getCityLabel(trSlug, locale)} <span>{hub.placeCount}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </section>

          <article id="guide" className="hub-guide" aria-labelledby="guide-title">
            <h2 id="guide-title">{guide.title}</h2>
            {guide.sections.map((section) => (
              <section key={section.heading}>
                <h3>{section.heading}</h3>
                {section.paragraphs.map((p) => (
                  <p key={p.slice(0, 40)}>{p}</p>
                ))}
              </section>
            ))}
          </article>

          <section className="hub-about" aria-labelledby="about-title">
            <h2 id="about-title">{t.aboutTitle}</h2>
            <p>{t.aboutText}</p>
            <p className="hub-about-links">
              <Link href={legalPath(locale, 'about')}>{t.aboutLink}</Link>
              <Link href={legalPath(locale, 'contact')}>{t.contactLink}</Link>
              <a href={`${SPA_BASE}/suggestion`}>{t.suggestLink}</a>
            </p>
          </section>

          <HubAdSlot position="below-content" />
        </main>

        <aside className="listing-ad-right">
          <HubAdSlot position="sidebar" />
        </aside>
      </div>
      <SiteFooter locale={locale} />
    </div>
  );
}

function PlaceImage({ place, alt }: { place: HomePlace; alt?: string }) {
  return (
    <div className="hub-card-image">
      {place.image ? (
        <img src={place.image} alt={alt ?? place.name} loading="lazy" decoding="async" />
      ) : (
        <span className="hub-card-initial" aria-hidden>
          {place.name.trim().charAt(0).toUpperCase() || 'K'}
        </span>
      )}
    </div>
  );
}

function CityHubCard({
  locale,
  city,
  places,
  explore,
}: {
  locale: Locale;
  city: TaxonomyCombination;
  places: string;
  explore: string;
}) {
  const href = encodePathSegments(buildListingPath(locale, city.citySlug, []));
  const image = cityHubImage(city.citySlug);
  const cityName = city.labels.city || getCityLabel(city.citySlug, locale);

  return (
    <Link href={href} className="locale-hub-card locale-hub-card-large">
      <div className="locale-hub-card-image">
        {image ? (
          <Image
            src={image}
            alt={cityName}
            fill
            sizes={CITY_CARD_IMAGE_SIZES}
            quality={CITY_CARD_IMAGE_QUALITY}
            className="locale-hub-card-img"
            loading="lazy"
          />
        ) : (
          <div className="locale-hub-card-placeholder" aria-hidden>
            <span>{cityName.trim().charAt(0).toUpperCase() || 'K'}</span>
          </div>
        )}
      </div>
      <div className="locale-hub-card-body">
        <h3>{cityName}</h3>
        <p>
          {city.placeCount} {places} · {explore}
        </p>
      </div>
    </Link>
  );
}
