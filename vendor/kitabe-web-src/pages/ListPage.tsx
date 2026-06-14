import { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { usePlaces } from '../contexts/PlacesContext';
import { useFiltre } from '../contexts/FiltreContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { useLanguage } from '../contexts/LanguageContext';
import { getPlaceListImageUri, resolveListImageFallbackUri } from '../utils/imageUtils';
import { openPlaceDetail } from '../utils/placeDetailUrl';
import { useCategories } from '../contexts/CategoriesContext';
import { getLocalizedText } from '../utils/multilang';
import './ListPage.css';

const ListPage = () => {
  const { t } = useTranslation();
  const { places, loading } = usePlaces();
  const { filtre, setFiltre } = useFiltre();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { currentLanguage } = useLanguage();
  const { categories } = useCategories();

  const [selectedMainCategories, setSelectedMainCategories] = useState<string[]>([]);
  const [selectedSubCategories, setSelectedSubCategories] = useState<Record<string, string[]>>({});
  const [imageFallbacks, setImageFallbacks] = useState<Record<string, string>>({});

  const handleListImageError = useCallback((placeId: string, failedUri: string, place: (typeof places)[number]) => {
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
      filtered = filtered.filter(place => {
        const name = typeof place.name === 'string' ? place.name : place.name.tr || '';
        const city = typeof place.city === 'string' ? place.city : place.city.tr || '';
        const desc = typeof place.description === 'string' ? place.description : place.description.tr || '';
        return name.toLowerCase().includes(query) ||
          city.toLowerCase().includes(query) ||
          desc.toLowerCase().includes(query);
      });
    }

    if (filtre.selectedCity) {
      filtered = filtered.filter(place => {
        const city = typeof place.city === 'string' ? place.city : place.city.tr || '';
        return city === filtre.selectedCity;
      });
    }

    if (filtre.selectedDistrict) {
      filtered = filtered.filter(place => {
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
        const hasMatchingMainCategory = effectiveMainIds.some((mainId) =>
          placeMainCategoryIds.includes(mainId)
        );
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

  const cities = useMemo(() => {
    const citySet = new Set<string>();
    places.forEach(place => {
      const city = typeof place.city === 'string' ? place.city : place.city.tr || '';
      if (city) citySet.add(city);
    });
    return Array.from(citySet).sort();
  }, [places]);

  const districts = useMemo(() => {
    if (!filtre.selectedCity) return [];
    const districtSet = new Set<string>();
    places.forEach(place => {
      const city = typeof place.city === 'string' ? place.city : place.city.tr || '';
      if (city === filtre.selectedCity) {
        const district = typeof place.district === 'string' ? place.district : place.district.tr || '';
        if (district) districtSet.add(district);
      }
    });
    return Array.from(districtSet).sort();
  }, [places, filtre.selectedCity]);

  if (loading) {
    return <div className="list-page loading">{t('common.loading')}</div>;
  }

  return (
    <div className="list-page">
      <header className="list-header">
        <h1>{t('list.allPlaces')}</h1>
        <div className="search-bar">
          <input
            type="text"
            placeholder={t('list.searchPlaceholder')}
            value={filtre.searchQuery}
            onChange={(e) => setFiltre({ ...filtre, searchQuery: e.target.value })}
          />
        </div>
        <div className="filters-row">
          <select
            value={filtre.selectedCity}
            onChange={(e) => setFiltre({ ...filtre, selectedCity: e.target.value, selectedDistrict: '' })}
          >
            <option value="">{t('list.allCities')}</option>
            {cities.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
          {filtre.selectedCity && (
            <select
              value={filtre.selectedDistrict}
              onChange={(e) => setFiltre({ ...filtre, selectedDistrict: e.target.value })}
            >
              <option value="">{t('list.allDistricts')}</option>
              {districts.map(district => (
                <option key={district} value={district}>{district}</option>
              ))}
            </select>
          )}
        </div>
        <div className="category-chips">
          {categories.map(cat => (
            <button
              key={cat.value}
              className={`category-chip ${selectedMainCategories.includes(cat.value) ? 'active' : ''}`}
              style={{ borderColor: cat.color }}
              onClick={() => setSelectedMainCategories(prev =>
                prev.includes(cat.value)
                  ? prev.filter(c => c !== cat.value)
                  : [...prev, cat.value]
              )}
            >
              {(typeof cat.name === 'string' && cat.name.trim()) || cat.value}
            </button>
          ))}
        </div>
        {selectedMainCategories.map((mainId) => {
          const main = categories.find((c) => c.value === mainId);
          const subs = (main as { subCategories?: Array<{ id: string; name?: string | { tr?: string; en?: string; ru?: string; ar?: string } }> } | undefined)?.subCategories || [];
          if (subs.length === 0) return null;
          return (
            <div key={`subs-${mainId}`} className="category-chips">
              {subs.map((sub) => {
                const active = (selectedSubCategories[mainId] || []).includes(sub.id);
                const subLabel = typeof sub.name === 'string'
                  ? sub.name
                  : getLocalizedText(sub.name, currentLanguage) || sub.id;
                return (
                  <button
                    key={`${mainId}-${sub.id}`}
                    className={`category-chip ${active ? 'active' : ''}`}
                    style={{ borderColor: main?.color || '#999' }}
                    onClick={() =>
                      setSelectedSubCategories((prev) => {
                        const current = prev[mainId] || [];
                        const next = current.includes(sub.id)
                          ? current.filter((id) => id !== sub.id)
                          : [...current, sub.id];
                        return { ...prev, [mainId]: next };
                      })
                    }
                  >
                    {subLabel}
                  </button>
                );
              })}
            </div>
          );
        })}
      </header>

      <div className="places-list">
        {filteredPlaces.length === 0 ? (
          <div className="no-results">
            <p>{t('list.noPlacesFound')}</p>
            <p className="no-results-sub">{t('list.noPlacesMessage')}</p>
          </div>
        ) : (
          filteredPlaces.map(place => {
            const name = typeof place.name === 'string' ? place.name : getLocalizedText(place.name, currentLanguage);
            const city = typeof place.city === 'string' ? place.city : getLocalizedText(place.city, currentLanguage);
            const desc = typeof place.description === 'string' ? place.description : getLocalizedText(place.description, currentLanguage);
            const imageUrl = imageFallbacks[place.id] || getPlaceListImageUri(place);

            return (
              <div key={place.id} className="list-item" onClick={() => void openPlaceDetail(place, currentLanguage)}>
                <div className="list-item-image-wrapper">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={name}
                      onError={() => handleListImageError(place.id, imageUrl, place)}
                    />
                  ) : (
                    <div className="list-item-no-image">
                      <span className="material-icons">landscape</span>
                    </div>
                  )}
                  <div className="list-item-image-overlay" />
                  <button
                    className={`favorite-btn ${isFavorite(place.id) ? 'active' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(place);
                    }}
                  >
                    {isFavorite(place.id) ? '❤️' : '🤍'}
                  </button>
                </div>
                <div className="list-item-info">
                  <h3>{name}</h3>
                  <p className="list-item-city">📍 {city}</p>
                  <p className="list-item-desc">{desc.substring(0, 150)}...</p>
                  {place.isUnesco && <span className="unesco-badge">UNESCO</span>}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ListPage;

