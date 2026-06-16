import { memo, useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { usePlaces } from '../contexts/PlacesContext';
import { useFiltre } from '../contexts/FiltreContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { useLanguage } from '../contexts/LanguageContext';
import { getPlaceListImageUri, resolveListImageFallbackUri } from '../utils/imageUtils';
import { openPlaceDetail } from '../utils/placeDetailUrl';
import { useCategories } from '../contexts/CategoriesContext';
import { getLocalizedText } from '../utils/multilang';
import { getCategoryLabel } from '../utils/categoryLabel';
import MapView from '../components/MapView';
import { VirtualPlaceList } from '../components/VirtualPlaceList';
import type { Place } from '../types/place';
import './ListPage.css';

interface PlaceListItemProps {
  place: Place;
  isSelected: boolean;
  imageUrl: string | null;
  name: string;
  meta: string;
  isFav: boolean;
  onSelect: (id: string) => void;
  onOpenDetail: (place: Place) => void;
  onToggleFavorite: (place: Place) => void;
  onImageError: (placeId: string, failedUri: string, place: Place) => void;
  favLabel: string;
  detailLabel: string;
  setRef: (id: string, el: HTMLElement | null) => void;
}

const PlaceListItem = memo(function PlaceListItem({
  place,
  isSelected,
  imageUrl,
  name,
  meta,
  isFav,
  onSelect,
  onOpenDetail,
  onToggleFavorite,
  onImageError,
  favLabel,
  detailLabel,
  setRef,
}: PlaceListItemProps) {
  return (
    <article
      ref={(el) => setRef(place.id, el)}
      className={`kb-place-card ${isSelected ? 'is-selected' : ''}`}
      onClick={() => onSelect(place.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter') onSelect(place.id);
      }}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt=""
          className="kb-place-thumb"
          loading="lazy"
          decoding="async"
          onError={() => onImageError(place.id, imageUrl, place)}
        />
      ) : (
        <div className="kb-place-thumb list-thumb-fallback" aria-hidden />
      )}
      <div className="kb-place-card-body">
        <h3>{name}</h3>
        <p className="kb-place-meta">{meta}</p>
      </div>
      <div className="kb-place-card-actions">
        <button
          type="button"
          className="kb-place-detail-btn"
          aria-label={detailLabel}
          onClick={(e) => {
            e.stopPropagation();
            onOpenDetail(place);
          }}
        >
          <span className="material-icons">arrow_forward</span>
        </button>
        <button
          type="button"
          className={`list-fav-btn ${isFav ? 'active' : ''}`}
          aria-label={favLabel}
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(place);
          }}
        >
          <span className="material-icons">{isFav ? 'favorite' : 'favorite_border'}</span>
        </button>
      </div>
    </article>
  );
});

const ListPage = () => {
  const { t } = useTranslation();
  const { places, loading, error } = usePlaces();
  const { filtre, setFiltre } = useFiltre();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { currentLanguage } = useLanguage();
  const { categories } = useCategories();

  const [selectedMainCategories, setSelectedMainCategories] = useState<string[]>([]);
  const [selectedSubCategories] = useState<Record<string, string[]>>({});
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [imageFallbacks, setImageFallbacks] = useState<Record<string, string>>({});
  const cardRefs = useRef<Record<string, HTMLElement | null>>({});

  const handleListImageError = useCallback((placeId: string, failedUri: string, place: Place) => {
    setImageFallbacks((prev) => {
      if (prev[placeId]) return prev;
      const next = resolveListImageFallbackUri(failedUri, place);
      return next ? { ...prev, [placeId]: next } : prev;
    });
  }, []);

  const filteredPlaces = useMemo(() => {
    let filtered = places;

    if (filtre.searchQuery) {
      const query = filtre.searchQuery.toLowerCase();
      filtered = filtered.filter((place) => {
        const name = typeof place.name === 'string' ? place.name : place.name.tr || '';
        const city = typeof place.city === 'string' ? place.city : place.city.tr || '';
        const desc = typeof place.description === 'string' ? place.description : place.description.tr || '';
        return (
          name.toLowerCase().includes(query) ||
          city.toLowerCase().includes(query) ||
          desc.toLowerCase().includes(query)
        );
      });
    }

    if (filtre.selectedCity) {
      filtered = filtered.filter((place) => {
        const city = typeof place.city === 'string' ? place.city : place.city.tr || '';
        return city === filtre.selectedCity;
      });
    }

    if (filtre.selectedDistrict) {
      filtered = filtered.filter((place) => {
        const district = typeof place.district === 'string' ? place.district : place.district.tr || '';
        return district === filtre.selectedDistrict;
      });
    }

    const mainIdsFromSubSelection = Object.keys(selectedSubCategories).filter(
      (mid) => selectedSubCategories[mid] && selectedSubCategories[mid].length > 0
    );
    const effectiveMainIds = Array.from(new Set([...selectedMainCategories, ...mainIdsFromSubSelection]));
    if (effectiveMainIds.length > 0) {
      filtered = filtered.filter((p) => {
        if (!p.category || typeof p.category !== 'object') return false;
        const cat = p.category as Record<string, unknown>;
        const subObj = (cat.sub as Record<string, unknown>) || {};
        const placeMainCategoryIds = Object.keys(subObj);
        const hasMatchingMainCategory = effectiveMainIds.some((mainId) => placeMainCategoryIds.includes(mainId));
        if (!hasMatchingMainCategory) return false;
        for (const mainId of effectiveMainIds) {
          const selectedSubs = selectedSubCategories[mainId] || [];
          if (selectedSubs.length === 0) continue;
          const placeSubsRaw = subObj[mainId];
          const placeSubs = Array.isArray(placeSubsRaw) ? placeSubsRaw : [];
          const placeSubIds = placeSubs
            .map((s) => (typeof s === 'string' ? s : (s as { id?: string })?.id || ''))
            .filter(Boolean);
          const subMatch = selectedSubs.some((subId) => placeSubIds.includes(subId));
          if (!subMatch) return false;
        }
        return true;
      });
    }

    return filtered;
  }, [places, filtre, selectedMainCategories, selectedSubCategories]);

  useEffect(() => {
    if (selectedPlaceId && !filteredPlaces.some((p) => p.id === selectedPlaceId)) {
      setSelectedPlaceId(null);
    }
  }, [filteredPlaces, selectedPlaceId]);

  const cities = useMemo(() => {
    const citySet = new Set<string>();
    places.forEach((place) => {
      const city = typeof place.city === 'string' ? place.city : place.city.tr || '';
      if (city) citySet.add(city);
    });
    return Array.from(citySet).sort();
  }, [places]);

  const districts = useMemo(() => {
    if (!filtre.selectedCity) return [];
    const districtSet = new Set<string>();
    places.forEach((place) => {
      const city = typeof place.city === 'string' ? place.city : place.city.tr || '';
      if (city === filtre.selectedCity) {
        const district = typeof place.district === 'string' ? place.district : place.district.tr || '';
        if (district) districtSet.add(district);
      }
    });
    return Array.from(districtSet).sort();
  }, [places, filtre.selectedCity]);

  const handlePlaceClick = useCallback(
    (place: Place) => {
      void openPlaceDetail(place, currentLanguage);
    },
    [currentLanguage]
  );

  const selectPlace = useCallback((id: string) => {
    setSelectedPlaceId(id);
    requestAnimationFrame(() => {
      cardRefs.current[id]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedPlaceId(null);
  }, []);

  const setCardRef = useCallback((id: string, el: HTMLElement | null) => {
    cardRefs.current[id] = el;
  }, []);

  const placeMeta = useCallback(
    (place: Place) => {
      const city = typeof place.city === 'string' ? place.city : getLocalizedText(place.city, currentLanguage);
      const district =
        typeof place.district === 'string' ? place.district : getLocalizedText(place.district, currentLanguage);
      return district ? `${city} · ${district}` : city;
    },
    [currentLanguage]
  );

  const placeName = useCallback(
    (place: Place) =>
      typeof place.name === 'string' ? place.name : getLocalizedText(place.name, currentLanguage),
    [currentLanguage]
  );

  if (loading) {
    return (
      <div className="list-page kb-discover-layout">
        <aside className="kb-discover-list">
          <div className="kb-discover-list-head">
            <h2>{t('navigation.list', { defaultValue: 'Keşfet' })}</h2>
            <p>{t('common.loading')}</p>
          </div>
          <div className="kb-list-skeleton" aria-busy="true" aria-label={t('common.loading')}>
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="kb-skeleton-place-card" />
            ))}
          </div>
        </aside>
        <div className="kb-discover-map kb-discover-map-skeleton" aria-hidden />
      </div>
    );
  }

  return (
    <div className="list-page kb-discover-layout">
      <aside className="kb-discover-list">
        <div className="kb-discover-list-head">
          <h2>{t('navigation.list', { defaultValue: 'Keşfet' })}</h2>
          <p>
            {filteredPlaces.length} {t('list.placesCount', { defaultValue: 'yer' })} ·{' '}
            {t('list.mapSync', { defaultValue: 'Harita ile senkron' })}
          </p>
        </div>

        <div className="list-filters-bar">
          <input
            type="search"
            className="list-search-input"
            placeholder={t('list.searchPlaceholder')}
            value={filtre.searchQuery}
            onChange={(e) => setFiltre({ ...filtre, searchQuery: e.target.value })}
          />
          <div className="list-select-row">
            <select
              value={filtre.selectedCity}
              onChange={(e) => setFiltre({ ...filtre, selectedCity: e.target.value, selectedDistrict: '' })}
            >
              <option value="">{t('list.allCities')}</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
            {filtre.selectedCity && (
              <select
                value={filtre.selectedDistrict}
                onChange={(e) => setFiltre({ ...filtre, selectedDistrict: e.target.value })}
              >
                <option value="">{t('list.allDistricts')}</option>
                {districts.map((district) => (
                  <option key={district} value={district}>
                    {district}
                  </option>
                ))}
              </select>
            )}
          </div>
          <div className="kb-discover-filters">
            {categories.slice(0, 8).map((cat) => (
              <button
                key={cat.value}
                type="button"
                className={`kb-filter-chip ${selectedMainCategories.includes(cat.value) ? 'is-active' : ''}`}
                onClick={() =>
                  setSelectedMainCategories((prev) =>
                    prev.includes(cat.value) ? prev.filter((c) => c !== cat.value) : [...prev, cat.value]
                  )
                }
              >
                {getCategoryLabel(cat, currentLanguage)}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="list-empty list-error">
            <p>{t('list.loadError', { defaultValue: 'Yerler yüklenemedi' })}</p>
            <p>{error}</p>
          </div>
        )}
        {!error && filteredPlaces.length === 0 ? (
          <div className="list-empty">
            <p>{t('list.noPlacesFound')}</p>
            <p>{t('list.noPlacesMessage')}</p>
          </div>
        ) : (
          <VirtualPlaceList
            className="kb-place-list"
            items={filteredPlaces}
            getKey={(place) => place.id}
            renderItem={(place) => (
              <PlaceListItem
                place={place}
                isSelected={selectedPlaceId === place.id}
                imageUrl={imageFallbacks[place.id] || getPlaceListImageUri(place)}
                name={placeName(place)}
                meta={placeMeta(place)}
                isFav={isFavorite(place.id)}
                onSelect={selectPlace}
                onOpenDetail={handlePlaceClick}
                onToggleFavorite={toggleFavorite}
                onImageError={handleListImageError}
                favLabel={t('favorites.toggle', { defaultValue: 'Favori' })}
                detailLabel={t('common.details', { defaultValue: 'Detay' })}
                setRef={setCardRef}
              />
            )}
          />
        )}
      </aside>

      <div className="kb-discover-map">
        <MapView
          places={filteredPlaces}
          onPlaceClick={handlePlaceClick}
          onPlaceSelect={(place) => selectPlace(place.id)}
          onSelectionClear={clearSelection}
          selectedPlaceId={selectedPlaceId || undefined}
          showInfoWindow
          flyToSelected={!!selectedPlaceId}
          flyZoom={14}
          zoom={filtre.selectedDistrict ? 11 : filtre.selectedCity ? 9 : 6}
        />
      </div>
    </div>
  );
};

export default ListPage;
