import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { usePlaces } from '../contexts/PlacesContext';
import { useFiltre } from '../contexts/FiltreContext';
import MapView from '../components/MapView';
import { useCategories } from '../contexts/CategoriesContext';
import { getPlaceImageUri } from '../utils/imageUtils';
import { useFavorites } from '../contexts/FavoritesContext';
import './HomePage.css';

const HomePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { places, loading } = usePlaces();
  const { filtre, setFiltre } = useFiltre();
  const { categories } = useCategories();
  const { isFavorite, toggleFavorite } = useFavorites();

  const [showFilters, setShowFilters] = useState(false);
  const [selectedMainCategories, setSelectedMainCategories] = useState<string[]>([]);
  const [selectedSubCategories, setSelectedSubCategories] = useState<Record<string, string[]>>({});
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);

  const filteredPlaces = useMemo(() => {
    let filtered = places;

    // Arama
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

    // Şehir filtresi
    if (filtre.selectedCity) {
      filtered = filtered.filter(place => {
        const city = typeof place.city === 'string' ? place.city : place.city.tr || '';
        return city === filtre.selectedCity;
      });
    }

    // İlçe filtresi
    if (filtre.selectedDistrict) {
      filtered = filtered.filter(place => {
        const district = typeof place.district === 'string' ? place.district : place.district.tr || '';
        return district === filtre.selectedDistrict;
      });
    }

    // Kategori filtresi
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

  const toggleMainCategory = (mainId: string) => {
    setSelectedMainCategories((prev) =>
      prev.includes(mainId) ? prev.filter((c) => c !== mainId) : [...prev, mainId]
    );
  };

  const toggleSubCategory = (mainId: string, subId: string) => {
    setSelectedSubCategories((prev) => {
      const current = prev[mainId] || [];
      const next = current.includes(subId) ? current.filter((id) => id !== subId) : [...current, subId];
      return { ...prev, [mainId]: next };
    });
  };

  // Featured places - ilk 6 yer
  const featuredPlaces = useMemo(() => {
    return places.slice(0, 6).filter(p => {
      const imageUrl = getPlaceImageUri(p);
      return imageUrl && imageUrl !== '';
    });
  }, [places]);

  if (loading) {
    return (
      <div className="home-page">
        <div className="loading-skeleton">
          <div className="skeleton-hero"></div>
          <div className="skeleton-cards">
            {[1, 2, 3].map(i => <div key={i} className="skeleton-card"></div>)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-title">Türkiye'nin Kültürel Mirası</h1>
          <p className="hero-subtitle">Binlerce yıllık tarihi keşfedin, unutulmaz anılar biriktirin</p>
          <div className="hero-search">
            <input
              type="text"
              placeholder={t('home.searchPlaceholder') || 'Yer, şehir veya kategori ara...'}
              value={filtre.searchQuery}
              onChange={(e) => setFiltre({ ...filtre, searchQuery: e.target.value })}
              className="hero-search-input"
            />
            <button
              className="hero-filter-btn"
              onClick={() => setShowFilters(!showFilters)}
            >
              <span>🔍</span>
              {t('common.filter')}
            </button>
          </div>
        </div>
      </section>

      {/* Featured Places Carousel */}
      {featuredPlaces.length > 0 && (
        <section className="featured-section">
          <div className="section-header">
            <h2>Öne Çıkan Yerler</h2>
            <button className="view-all-btn" onClick={() => navigate('/list')}>
              Tümünü Gör <span>→</span>
            </button>
          </div>
          <div className="featured-grid">
            {featuredPlaces.map(place => {
              const name = typeof place.name === 'string' ? place.name : place.name.tr || '';
              const city = typeof place.city === 'string' ? place.city : place.city.tr || '';
              const imageUrl = getPlaceImageUri(place);

              return (
                <div
                  key={place.id}
                  className="featured-card"
                  onClick={() => navigate(`/detail/${place.id}`)}
                >
                  <div className="card-image-wrapper">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={name}
                        className="card-image"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="list-item-no-image">
                        <span className="material-icons">landscape</span>
                      </div>
                    )}
                    <div className="card-overlay"></div>
                    <button
                      className={`card-favorite-btn ${isFavorite(place.id) ? 'active' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(place);
                      }}
                    >
                      {isFavorite(place.id) ? '❤️' : '🤍'}
                    </button>
                    {place.isUnesco && (
                      <span className="card-badge unesco">UNESCO</span>
                    )}
                  </div>
                  <div className="card-content">
                    <h3 className="card-title">{name}</h3>
                    <p className="card-location">📍 {city}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Map Section */}
      <section className="map-section">
        <div className="section-header">
          <h2>Haritada Keşfet</h2>
          <p>Türkiye'nin dört bir yanındaki kültürel mirası keşfedin</p>
        </div>

        {showFilters && (
          <div className="filters-panel">
            <div className="filter-group">
              <label>{t('home.city')}</label>
              <select
                value={filtre.selectedCity}
                onChange={(e) => setFiltre({ ...filtre, selectedCity: e.target.value, selectedDistrict: '' })}
              >
                <option value="">{t('home.allCities')}</option>
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            {filtre.selectedCity && (
              <div className="filter-group">
                <label>{t('home.district')}</label>
                <select
                  value={filtre.selectedDistrict}
                  onChange={(e) => setFiltre({ ...filtre, selectedDistrict: e.target.value })}
                >
                  <option value="">{t('home.allDistricts')}</option>
                  {districts.map(district => (
                    <option key={district} value={district}>{district}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="filter-group">
              <label>{t('home.categories')}</label>
              <div className="category-chips">
                {categories.map(cat => (
                  <button
                    key={cat.value}
                    className={`category-chip ${selectedMainCategories.includes(cat.value) ? 'active' : ''}`}
                    style={{ borderColor: cat.color }}
                    onClick={() => toggleMainCategory(cat.value)}
                  >
                    {(typeof cat.name === 'string' && cat.name.trim()) || cat.value}
                  </button>
                ))}
              </div>
            </div>
            {selectedMainCategories.map((mainId) => {
              const main = categories.find((c) => c.value === mainId);
              const subs = (main as { subCategories?: Array<{ id: string; name?: string | { tr?: string; en?: string; ru?: string; ar?: string } }> } | undefined)?.subCategories || [];
              if (subs.length === 0) return null;
              return (
                <div key={`subs-${mainId}`} className="filter-group">
                  <label>{(typeof main?.name === 'string' && main.name) || mainId} Alt Kategorileri</label>
                  <div className="category-chips">
                    {subs.map((sub) => {
                      const active = (selectedSubCategories[mainId] || []).includes(sub.id);
                      const subLabel = typeof sub.name === 'string'
                        ? sub.name
                        : sub.name?.tr || sub.name?.en || sub.id;
                      return (
                        <button
                          key={`${mainId}-${sub.id}`}
                          className={`category-chip ${active ? 'active' : ''}`}
                          style={{ borderColor: main?.color || '#999' }}
                          onClick={() => toggleSubCategory(mainId, sub.id)}
                        >
                          {subLabel}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="map-container">
          <MapView
            places={filteredPlaces}
            center={filtre.selectedCity || filtre.selectedDistrict ? (() => {
              // Şehir veya ilçe seçilmişse, o bölgeye focus yap
              const filtered = filteredPlaces.filter(p => {
                const city = typeof p.city === 'string' ? p.city : p.city.tr || '';
                const district = typeof p.district === 'string' ? p.district : p.district.tr || '';
                if (filtre.selectedDistrict) {
                  return district === filtre.selectedDistrict;
                }
                return city === filtre.selectedCity;
              });

              if (filtered.length > 0) {
                const firstPlace = filtered[0];
                return {
                  lat: firstPlace.latitude,
                  lng: firstPlace.longitude
                };
              }
              return undefined;
            })() : undefined}
            zoom={filtre.selectedDistrict ? 12 : filtre.selectedCity ? 10 : undefined}
            onPlaceClick={(place) => {
              setSelectedPlaceId(place.id);
              navigate(`/detail/${place.id}`);
            }}
            selectedPlaceId={selectedPlaceId || undefined}
            showInfoWindow={true}
          />
        </div>
      </section>
    </div>
  );
};

export default HomePage;
