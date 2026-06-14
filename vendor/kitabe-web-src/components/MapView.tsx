import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { Place } from '../types/place';

interface MapViewProps {
  places: Place[];
  center?: { lat: number; lng: number };
  zoom?: number;
  onPlaceClick?: (place: Place) => void;
  selectedPlaceId?: string;
  showInfoWindow?: boolean;
}

const DEFAULT_CENTER: [number, number] = [39.0, 35.0];
const DEFAULT_ZOOM = 6;

function placeName(place: Place): string {
  if (typeof place.name === 'string') return place.name;
  return place.name?.tr || place.name?.en || 'Unnamed';
}

/** Harita dışından gelen center/zoom güncellemeleri */
function MapViewController({
  center,
  zoom,
}: {
  center?: { lat: number; lng: number };
  zoom?: number;
}) {
  const map = useMap();
  useEffect(() => {
    if (center && typeof center.lat === 'number' && typeof center.lng === 'number') {
      map.setView([center.lat, center.lng], zoom ?? 10);
    }
  }, [center?.lat, center?.lng, zoom, map, center]);
  return null;
}

const MapView = ({
  places,
  center,
  zoom,
  onPlaceClick,
  selectedPlaceId,
  showInfoWindow = false,
}: MapViewProps) => {
  const validPlaces = useMemo(
    () =>
      places.filter(
        (p) =>
          typeof p.latitude === 'number' &&
          typeof p.longitude === 'number' &&
          !Number.isNaN(p.latitude) &&
          !Number.isNaN(p.longitude)
      ),
    [places]
  );

  const initialCenter: [number, number] = center
    ? [center.lat, center.lng]
    : DEFAULT_CENTER;

  const initialZoom = zoom ?? (center ? 10 : DEFAULT_ZOOM);

  return (
    <div style={{ width: '100%', height: '100%', minHeight: '400px', position: 'relative' }}>
      <MapContainer
        center={initialCenter}
        zoom={initialZoom}
        style={{ width: '100%', height: '100%', minHeight: '400px' }}
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />
        <MapViewController center={center} zoom={zoom} />

        {validPlaces.map((place) => {
          const name = placeName(place);
          const selected = selectedPlaceId === place.id;
          return (
            <CircleMarker
              key={place.id}
              center={[place.latitude, place.longitude]}
              radius={selected ? 11 : 8}
              pathOptions={{
                color: selected ? '#b91c1c' : '#8b5a2b',
                fillColor: selected ? '#ef4444' : '#c9a227',
                fillOpacity: 0.9,
                weight: 2,
              }}
              eventHandlers={{
                click: () => {
                  if (!showInfoWindow && onPlaceClick) {
                    onPlaceClick(place);
                  }
                },
              }}
            >
              {showInfoWindow && (
                <Popup>
                  <div style={{ minWidth: 120 }}>
                    <strong style={{ display: 'block', marginBottom: 8 }}>{name}</strong>
                    {onPlaceClick && (
                      <button
                        type="button"
                        style={{
                          padding: '6px 12px',
                          background: '#8b5a2b',
                          color: '#fff',
                          border: 'none',
                          borderRadius: 6,
                          cursor: 'pointer',
                        }}
                        onClick={() => onPlaceClick(place)}
                      >
                        Detay
                      </button>
                    )}
                  </div>
                </Popup>
              )}
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default MapView;
