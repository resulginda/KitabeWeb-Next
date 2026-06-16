import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePlaces } from '../contexts/PlacesContext';
import { useLanguage } from '../contexts/LanguageContext';
import { getTopPlacesByOpens } from '../services/stats';
import { getPlaceDetailUrl } from '../utils/placeDetailUrl';
import { getPlaceImageUri } from '../utils/imageUtils';
import { getLocalizedText } from '../utils/multilang';
import type { PlaceStats } from '../types/analytics';

export function PopularPlacesSection() {
  const { t } = useTranslation();
  const { places } = usePlaces();
  const { currentLanguage } = useLanguage();
  const [stats, setStats] = useState<PlaceStats[]>([]);

  useEffect(() => {
    getTopPlacesByOpens(10).then(setStats);
  }, []);

  const items = useMemo(() => {
    return stats
      .map((stat) => {
        const place = places.find((p) => p.id === stat.placeId);
        if (!place) return null;
        return { place, stat };
      })
      .filter(Boolean) as { place: (typeof places)[0]; stat: PlaceStats }[];
  }, [stats, places]);

  if (items.length === 0) return null;

  return (
    <section className="kb-carousel-section container">
      <div className="kb-carousel-header">
        <div>
          <p className="kb-meta">{t('home.popularPlacesEyebrow', { defaultValue: 'İstatistikler' })}</p>
          <h2>{t('home.popularPlacesTitle', { defaultValue: 'Popüler Yerler' })}</h2>
        </div>
        <a href="/list" className="btn btn-ghost btn-sm">
          {t('home.viewAllPlaces', { defaultValue: 'Tüm yerler' })} →
        </a>
      </div>
      <div className="kb-carousel-track">
        {items.map(({ place, stat }) => {
          const name = getLocalizedText(place.name, currentLanguage);
          const city = getLocalizedText(place.city, currentLanguage);
          const image = getPlaceImageUri(place);
          const href = getPlaceDetailUrl(place, currentLanguage);
          const initial = name.trim().charAt(0).toUpperCase() || 'K';

          return (
            <a key={place.id} href={href} className="kb-city-card kb-place-card-link">
              <div className="kb-city-card-img">
                {image ? (
                  <img src={image} alt="" loading="lazy" className="kb-place-card-photo" />
                ) : (
                  <span className="kb-place-card-initial" aria-hidden>
                    {initial}
                  </span>
                )}
                <span className="kb-tag" style={{ position: 'absolute', bottom: 12, left: 12 }}>
                  {stat.totalOpens.toLocaleString()} {t('home.viewsCount', { defaultValue: 'görüntüleme' })}
                </span>
              </div>
              <div className="kb-city-card-body">
                <h3>{name}</h3>
                {city ? <p className="kb-place-card-city">{city}</p> : null}
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
}
