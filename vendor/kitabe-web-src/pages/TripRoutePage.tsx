import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useRoute } from '../contexts/RouteContext';
import { useLanguage } from '../contexts/LanguageContext';
import { getPlaceImageUri } from '../utils/imageUtils';
import { getLocalizedText } from '../utils/multilang';
import { PageShell, PageEmpty } from '../components/PageShell';
import './TripRoutePage.css';

const TripRoutePage = () => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const { routePlaces, removeFromRoute, clearRoute } = useRoute();
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {}
      );
    }
  }, []);

  const openInMaps = () => {
    if (routePlaces.length === 0) return;

    const waypoints = routePlaces.slice(0, -1).map((p) => `${p.latitude},${p.longitude}`).join(';');
    const destination = routePlaces[routePlaces.length - 1];
    const destinationCoord = `${destination.latitude},${destination.longitude}`;

    if (userLocation) {
      const originCoord = `${userLocation.lat},${userLocation.lng}`;
      const url = `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${originCoord};${waypoints ? `${waypoints};` : ''}${destinationCoord}`;
      window.open(url, '_blank');
    } else {
      const start = routePlaces[0];
      const startCoord = `${start.latitude},${start.longitude}`;
      const routeTail = routePlaces.slice(1, -1).map((p) => `${p.latitude},${p.longitude}`).join(';');
      const url = `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${startCoord};${routeTail ? `${routeTail};` : ''}${destinationCoord}`;
      window.open(url, '_blank');
    }
  };

  const calculateTotalDistance = () => {
    if (routePlaces.length < 2) return 0;
    let total = 0;
    for (let i = 0; i < routePlaces.length - 1; i++) {
      const p1 = routePlaces[i];
      const p2 = routePlaces[i + 1];
      total += calculateDistance(p1.latitude, p1.longitude, p2.latitude, p2.longitude);
    }
    return total;
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const routeSubtitle =
    routePlaces.length > 0
      ? `${t('route.points') || 'Nokta'}: ${routePlaces.length} • ${t('route.totalDistance') || 'Toplam Mesafe'}: ${calculateTotalDistance().toFixed(1)} km`
      : undefined;

  return (
    <PageShell
      title={t('route.title') || 'Rotanız'}
      subtitle={routeSubtitle}
      backTo="/home"
      className="trip-route-page"
    >
      {routePlaces.length === 0 ? (
        <PageEmpty
          icon="route"
          title={t('route.emptyRoute') || 'Rotanız boş. Yerler ekleyerek rota oluşturun.'}
          subtitle={t('route.noPlacesMessage') || 'Ana sayfa/liste/harita sayfasından nokta ekledikçe buralarda çıkacak.'}
        />
      ) : (
        <>
          <div className="route-list">
            {routePlaces.map((place, index) => {
              const name = typeof place.name === 'string' ? place.name : getLocalizedText(place.name, currentLanguage);
              const city = typeof place.city === 'string' ? place.city : getLocalizedText(place.city, currentLanguage);
              const imageUrl = getPlaceImageUri(place);

              return (
                <div key={place.id} className="route-item">
                  <div className="route-number">{index + 1}</div>
                  {imageUrl && (
                    <img src={imageUrl} alt={name} onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }} />
                  )}
                  <div className="route-item-info">
                    <h3>{name}</h3>
                    <p>{city}</p>
                  </div>
                  <button
                    className="remove-btn"
                    onClick={() => removeFromRoute(place.id)}
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>

          <div className="route-actions">
            <button className="btn-clear" onClick={() => {
              if (window.confirm(t('route.clearRouteMessage') || 'Tüm noktalar çıkarılsın mı?')) {
                clearRoute();
              }
            }}>
              {t('route.clearRoute') || 'Rotayı Temizle'}
            </button>
            <button className="btn-open-maps" onClick={openInMaps}>
              {t('route.openInMaps') || 'Rotayı Haritalarda Aç'}
            </button>
          </div>
        </>
      )}
    </PageShell>
  );
};

export default TripRoutePage;
