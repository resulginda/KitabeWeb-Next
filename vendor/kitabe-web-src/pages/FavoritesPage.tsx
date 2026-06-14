import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useFavorites } from '../contexts/FavoritesContext';
import { useLanguage } from '../contexts/LanguageContext';
import { getLocalizedText } from '../utils/multilang';
import { useCategories } from '../contexts/CategoriesContext';
import { getPlaceImageUri } from '../utils/imageUtils';
import { placeMatchesCategoryFilter } from '../utils/categoryUtils';
import './FavoritesPage.css';

const FavoritesPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { favorites, toggleFavorite } = useFavorites();
  const { currentLanguage } = useLanguage();
  const { categories } = useCategories();
  const [search, setSearch] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const cities = useMemo(() => {
    const citySet = new Set<string>();
    favorites.forEach(place => {
      const city = typeof place.city === 'string' ? place.city : getLocalizedText(place.city, currentLanguage);
      if (city) citySet.add(city);
    });
    return Array.from(citySet).sort();
  }, [favorites, currentLanguage]);

  const districts = useMemo(() => {
    if (!selectedCity) return [];
    const districtSet = new Set<string>();
    favorites.forEach(place => {
      const city = typeof place.city === 'string' ? place.city : getLocalizedText(place.city, currentLanguage);
      if (city === selectedCity) {
        const district = typeof place.district === 'string' ? place.district : getLocalizedText(place.district, currentLanguage);
        if (district) districtSet.add(district);
      }
    });
    return Array.from(districtSet).sort();
  }, [favorites, selectedCity, currentLanguage]);

  const filteredFavorites = useMemo(() => {
    return favorites.filter(place => {
      const name = typeof place.name === 'string' ? place.name : getLocalizedText(place.name, currentLanguage);
      const city = typeof place.city === 'string' ? place.city : getLocalizedText(place.city, currentLanguage);
      const district = typeof place.district === 'string' ? place.district : getLocalizedText(place.district, currentLanguage);
      if (search && !name.toLowerCase().includes(search.toLowerCase()) &&
        !city.toLowerCase().includes(search.toLowerCase())) return false;
      if (selectedCity && city !== selectedCity) return false;
      if (selectedDistrict && district !== selectedDistrict) return false;
      if (selectedCategories.length > 0 && !placeMatchesCategoryFilter(place.category, selectedCategories)) return false;
      return true;
    });
  }, [favorites, search, selectedCity, selectedDistrict, selectedCategories, currentLanguage]);

  return (
    <div className="favorites-page">
      <header className="favorites-header">
        <h1>{t('account.myFavorites')}</h1>
        <div className="search-bar">
          <input
            type="text"
            placeholder={t('favorites.searchPlaceholder') || 'Ara...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="filters-row">
          <select
            value={selectedCity}
            onChange={(e) => {
              setSelectedCity(e.target.value);
              setSelectedDistrict('');
            }}
          >
            <option value="">{t('favorites.allCities') || 'Tüm Şehirler'}</option>
            {cities.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
          {selectedCity && (
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
            >
              <option value="">{t('favorites.allDistricts') || 'Tüm İlçeler'}</option>
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
              className={`category-chip ${selectedCategories.includes(cat.value) ? 'active' : ''}`}
              style={{ borderColor: cat.color }}
              onClick={() => setSelectedCategories(prev =>
                prev.includes(cat.value)
                  ? prev.filter(c => c !== cat.value)
                  : [...prev, cat.value]
              )}
            >
              {t(`categories.${cat.value}`) || cat.value}
            </button>
          ))}
        </div>
      </header>

      <div className="favorites-list">
        {filteredFavorites.length === 0 ? (
          <div className="no-favorites">
            <p>{t('favorites.noFavorites') || 'Favori yer bulunamadı'}</p>
          </div>
        ) : (
          filteredFavorites.map(place => {
            const name = typeof place.name === 'string' ? place.name : getLocalizedText(place.name, currentLanguage);
            const city = typeof place.city === 'string' ? place.city : getLocalizedText(place.city, currentLanguage);
            const desc = typeof place.description === 'string' ? place.description : getLocalizedText(place.description, currentLanguage);
            const imageUrl = getPlaceImageUri(place);

            return (
              <div key={place.id} className="favorite-item" onClick={() => navigate(`/detail/${place.id}`)}>
                {imageUrl && (
                  <img src={imageUrl} alt={name} onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }} />
                )}
                <div className="favorite-item-info">
                  <h3>{name}</h3>
                  <p className="favorite-item-city">{city}</p>
                  <p className="favorite-item-desc">{desc.substring(0, 100)}...</p>
                  {place.isUnesco && <span className="unesco-badge">UNESCO</span>}
                </div>
                <button
                  className="favorite-btn active"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(place);
                  }}
                >
                  ❤️
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;

