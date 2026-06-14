import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { usePlaces } from '../contexts/PlacesContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { getPlaceImageUri } from '../utils/imageUtils';
import MapView from '../components/MapView';
import './NearbyPage.css';

interface UserLocation {
  latitude: number;
  longitude: number;
}

const NearbyPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { places, loading } = usePlaces();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locationError, setLocationError] = useState('');
  const [selectedRadius, setSelectedRadius] = useState(10); // km

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        () => {
          setLocationError(t('nearby.locationDenied') || 'Konum erişimi reddedildi.');
        }
      );
    } else {
      setLocationError('Geolocation desteklenmiyor');
    }
  }, [t]);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const nearbyPlaces = useMemo(() => {
    if (!userLocation) return [];
    return places
      .map(place => ({
        place,
        distance: calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          place.latitude,
          place.longitude
        ),
      }))
      .filter(item => item.distance <= selectedRadius)
      .sort((a, b) => a.distance - b.distance);
  }, [places, userLocation, selectedRadius]);

  if (loading) {
    return <div className="nearby-page loading">{t('common.loading') || 'Yükleniyor...'}</div>;
  }

  return (
    <div className="nearby-page">
      <header className="nearby-header">
        <h1>{t('nearby.title') || 'Yakınımdaki Yerler'}</h1>

        {!userLocation && !locationError && (
          <p className="loading-location">{t('nearby.loadingLocation') || 'Konumunuz bulunuyor...'}</p>
        )}

        {locationError && <p className="location-error">{locationError}</p>}

        {userLocation && (
          <div className="radius-selector glass-panel">
            <span>{t('nearby.distance') || 'Mesafe'}:</span>
            <div className="radius-buttons">
              {[5, 10, 25, 50].map(radius => (
                <button
                  key={radius}
                  className={selectedRadius === radius ? 'active' : ''}
                  onClick={() => setSelectedRadius(radius)}
                >
                  {radius} km
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Main Layout Area */}
      <div className="nearby-layout">

        {/* Map Section */}
        {userLocation && nearbyPlaces.length > 0 && (
          <div className="map-section">
            <div className="map-container">
              <MapView
                places={nearbyPlaces.map(item => item.place)}
                center={{ lat: userLocation.latitude, lng: userLocation.longitude }}
                zoom={12}
                onPlaceClick={(place) => navigate(`/detail/${place.id}`)}
                showInfoWindow={true}
              />
            </div>
          </div>
        )}

        {/* Places List / Side Panel */}
        <div className="list-section">
          {userLocation && nearbyPlaces.length === 0 && (
            <div className="no-nearby glass-panel">
              <p>{t('nearby.noNearbyPlaces') || 'Seçilen yarıçap içinde yer bulunamadı. Lütfen mesafeyi artırın.'}</p>
            </div>
          )}

          {/* Fallback Grid when no location */}
          {!userLocation && !locationError && (
            <div className="places-grid">
              {places.slice(0, 10).map(place => {
                const name = typeof place.name === 'string' ? place.name : place.name.tr || '';
                const city = typeof place.city === 'string' ? place.city : place.city.tr || '';
                const imageUrl = getPlaceImageUri(place);

                return (
                  <div key={place.id} className="place-card" onClick={() => navigate(`/detail/${place.id}`)}>
                    <div className="card-image-wrapper">
                      {imageUrl ? (
                        <img className="card-image" src={imageUrl} alt={name} onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }} />
                      ) : (
                        <div className="list-item-no-image">
                          <span className="material-icons">landscape</span>
                        </div>
                      )}
                      <div className="card-overlay" />
                    </div>
                    <div className="card-content">
                      <h3 className="card-title">{name}</h3>
                      <p className="card-location">📍 {city}</p>
                      {place.isUnesco && <span className="card-badge unesco">UNESCO</span>}
                      <button
                        className={`card-favorite-btn ${isFavorite(place.id) ? 'active' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(place);
                        }}
                      >
                        {isFavorite(place.id) ? '❤️' : '🤍'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Actual Nearby List */}
          {userLocation && nearbyPlaces.length > 0 && (
            <div className="places-list">
              <div className="list-header">
                <h2>{nearbyPlaces.length} Yer Bulundu</h2>
              </div>

              {nearbyPlaces.map(({ place, distance }) => {
                const name = typeof place.name === 'string' ? place.name : place.name.tr || '';
                const city = typeof place.city === 'string' ? place.city : place.city.tr || '';
                const desc = typeof place.description === 'string' ? place.description : place.description.tr || '';
                const imageUrl = getPlaceImageUri(place);

                return (
                  <div key={place.id} className="nearby-item glass-card" onClick={() => navigate(`/detail/${place.id}`)}>
                    <div className="item-image-wrapper">
                      {imageUrl ? (
                        <img src={imageUrl} alt={name} onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }} />
                      ) : (
                        <div className="list-item-no-image">
                          <span className="material-icons">landscape</span>
                        </div>
                      )}
                      <div className="card-overlay" />
                      <button
                        className={`item-favorite-btn ${isFavorite(place.id) ? 'active' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(place);
                        }}
                      >
                        {isFavorite(place.id) ? '❤️' : '🤍'}
                      </button>
                    </div>

                    <div className="nearby-item-info">
                      <div>
                        <h3>{name}</h3>
                        <p className="nearby-item-city">📍 {city}</p>
                        <p className="nearby-item-desc">{desc.substring(0, 90)}...</p>
                      </div>
                      <div className="item-footer">
                        <div className="distance-badge">
                          🚶 {distance.toFixed(1)} km {t('nearby.radiusIndicator') || 'uzakta'}
                        </div>
                        {place.isUnesco && <span className="unesco-badge">UNESCO</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NearbyPage;

