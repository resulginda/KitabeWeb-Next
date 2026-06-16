import { useTranslation } from 'react-i18next';
import { useLanguage } from '../contexts/LanguageContext';
import {
  FEATURED_EXPLORE_CITIES,
  buildExploreCityUrl,
  buildLocaleHubUrl,
  type ExploreCityLocale,
} from '../data/featuredExploreCities';
import './ExploreCitiesGrid.css';

const ExploreCitiesGrid = () => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const locale = (['tr', 'en', 'ru', 'ar'].includes(currentLanguage)
    ? currentLanguage
    : 'tr') as ExploreCityLocale;

  return (
    <section className="explore-cities-section" aria-labelledby="explore-cities-heading">
      <div className="section-header">
        <div>
          <h2 id="explore-cities-heading">{t('home.exploreCitiesTitle')}</h2>
          <p className="explore-cities-subtitle">{t('home.exploreCitiesSubtitle')}</p>
        </div>
        <a className="view-all-btn" href={buildLocaleHubUrl(locale)}>
          {t('home.exploreAllCities')} <span>→</span>
        </a>
      </div>

      <div className="explore-cities-grid">
        {FEATURED_EXPLORE_CITIES.map((city, index) => {
          const name = city.names[locale] || city.names.tr;
          const alt = city.imageAlt[locale] || city.imageAlt.tr;
          const href = buildExploreCityUrl(locale, city.slug);
          const aboveFold = index < 3;

          return (
            <a key={city.slug} href={href} className="explore-city-card">
              <div className="explore-city-image-wrap">
                <img
                  src={city.image}
                  alt={alt}
                  loading={city.slug === 'antalya' ? 'eager' : aboveFold ? 'eager' : 'lazy'}
                  fetchPriority={city.slug === 'antalya' ? 'high' : undefined}
                  width={640}
                  height={400}
                  className="explore-city-image"
                />
                <div className="explore-city-overlay" />
              </div>
              <div className="explore-city-body">
                <h3 className="explore-city-name">{name}</h3>
                <p className="explore-city-cta">{t('home.exploreCityCta')}</p>
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
};

export default ExploreCitiesGrid;
