import { useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Place } from '../types/place';

interface MapViewProps {
  places: Place[];
  center?: { lat: number; lng: number };
  zoom?: number;
  onPlaceClick?: (place: Place) => void;
  /** Pin/liste tiklamasi — secim + (istege bagli) fly */
  onPlaceSelect?: (place: Place) => void;
  /** Popup X veya harita tiklamasi ile secim temizleme */
  onSelectionClear?: () => void;
  selectedPlaceId?: string;
  showInfoWindow?: boolean;
  /** Secili pin icin flyTo (sadece tiklamada kullan) */
  flyToSelected?: boolean;
  flyZoom?: number;
}

const DEFAULT_CENTER: [number, number] = [39.0, 35.0];
const DEFAULT_ZOOM = 6;

function placeName(place: Place): string {
  if (typeof place.name === 'string') return place.name;
  return place.name?.tr || place.name?.en || 'Unnamed';
}

function MapViewController({
  center,
  zoom,
  animate,
}: {
  center?: { lat: number; lng: number };
  zoom?: number;
  animate?: boolean;
}) {
  const map = useMap();
  const lastKeyRef = useRef<string>('');

  useEffect(() => {
    if (!center || typeof center.lat !== 'number' || typeof center.lng !== 'number') return;
    const key = `${center.lat.toFixed(5)},${center.lng.toFixed(5)},${zoom ?? ''},${animate ? 1 : 0}`;
    if (lastKeyRef.current === key) return;
    lastKeyRef.current = key;

    const z = zoom ?? 12;
    if (animate) {
      map.flyTo([center.lat, center.lng], z, { duration: 0.55, easeLinearity: 0.22 });
    } else {
      map.setView([center.lat, center.lng], z);
    }
  }, [center?.lat, center?.lng, zoom, map, center, animate]);
  return null;
}

/** Secili yer icin popup; kapatinca parent state temizlenir */
function SelectedPlaceSync({
  place,
  showPopup,
  detailLabel,
  onDetail,
  onClose,
}: {
  place: Place | null;
  showPopup?: boolean;
  detailLabel: string;
  onDetail?: (place: Place) => void;
  onClose?: () => void;
}) {
  const map = useMap();
  const popupRef = useRef<L.Popup | null>(null);
  const onDetailRef = useRef(onDetail);
  const onCloseRef = useRef(onClose);
  onDetailRef.current = onDetail;
  onCloseRef.current = onClose;

  useEffect(() => {
    if (popupRef.current) {
      map.closePopup(popupRef.current);
      popupRef.current = null;
    }
    if (!place || !showPopup) return;

    const name = placeName(place);
    const city = typeof place.city === 'string' ? place.city : place.city?.tr || '';
    const container = document.createElement('div');
    container.className = 'kitabe-map-popup-inner';
    container.innerHTML = `
      <strong class="kitabe-map-popup-title">${escapeHtml(name)}</strong>
      <p class="kitabe-map-popup-meta">${escapeHtml(city)}</p>
    `;
    if (onDetailRef.current) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'kitabe-map-popup-btn';
      btn.textContent = detailLabel;
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        onDetailRef.current?.(place);
      });
      container.appendChild(btn);
    }

    const popup = L.popup({
      closeButton: true,
      autoPan: true,
      offset: [0, -6],
      className: 'kitabe-map-popup',
    })
      .setLatLng([place.latitude, place.longitude])
      .setContent(container);

    const handleRemove = () => {
      popupRef.current = null;
      onCloseRef.current?.();
    };
    popup.on('remove', handleRemove);

    popup.openOn(map);
    popupRef.current = popup;

    return () => {
      popup.off('remove', handleRemove);
      map.closePopup(popup);
      popupRef.current = null;
    };
  }, [place?.id, showPopup, map, detailLabel, place]);

  return null;
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

const MapView = ({
  places,
  center,
  zoom,
  onPlaceClick,
  onPlaceSelect,
  onSelectionClear,
  selectedPlaceId,
  showInfoWindow = false,
  flyToSelected = false,
  flyZoom = 13,
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

  const selectedPlace = useMemo(
    () => validPlaces.find((p) => p.id === selectedPlaceId) ?? null,
    [validPlaces, selectedPlaceId]
  );

  const flyCenter =
    flyToSelected && selectedPlace
      ? { lat: selectedPlace.latitude, lng: selectedPlace.longitude }
      : undefined;

  const flyZoomLevel = flyToSelected && selectedPlace ? flyZoom : zoom;

  const initialCenter: [number, number] = center
    ? [center.lat, center.lng]
    : DEFAULT_CENTER;

  const initialZoom = zoom ?? (center ? 10 : DEFAULT_ZOOM);

  return (
    <div className="map-view-root">
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
        <MapViewController center={flyCenter} zoom={flyZoomLevel} animate={flyToSelected} />

        {flyToSelected && selectedPlace && showInfoWindow && (
          <SelectedPlaceSync
            place={selectedPlace}
            showPopup
            detailLabel="Detay"
            onDetail={onPlaceClick}
            onClose={onSelectionClear}
          />
        )}

        {validPlaces.map((place) => {
          const selected = selectedPlaceId === place.id;
          return (
            <CircleMarker
              key={place.id}
              center={[place.latitude, place.longitude]}
              radius={selected ? 13 : 7}
              pathOptions={{
                color: selected ? '#FF5722' : '#FFFFFF',
                fillColor: selected ? '#FF7043' : '#8D6E63',
                fillOpacity: selected ? 1 : 0.88,
                weight: selected ? 3 : 1.5,
              }}
              eventHandlers={{
                click: () => onPlaceSelect?.(place),
              }}
            />
          );
        })}
      </MapContainer>
    </div>
  );
};

export default MapView;
