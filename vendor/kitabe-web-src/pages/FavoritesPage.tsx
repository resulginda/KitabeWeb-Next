import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useFavorites } from '../contexts/FavoritesContext';
import { useLanguage, type Language } from '../contexts/LanguageContext';
import { getLocalizedText } from '../utils/multilang';
import { useCategories } from '../contexts/CategoriesContext';
import { getPlaceImageUri } from '../utils/imageUtils';
import { placeMatchesCategoryFilter } from '../utils/categoryUtils';
import { openPlaceDetail } from '../utils/placeDetailUrl';
import { PageShell, PageEmpty } from '../components/PageShell';
import type { CategoryOption } from '../contexts/CategoriesContext';

function getCategoryLabel(cat: CategoryOption, lang: Language): string {
  if (typeof cat.name === 'string' && cat.name.trim()) return cat.name;
  const localized = getLocalizedText(cat.name, lang);
  if (localized?.trim()) return localized;
  return cat.value.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

const FavoritesPage = () => {
  const { t } = useTranslation();
  const { favorites, toggleFavorite } = useFavorites();
  const { currentLanguage } = useLanguage();
  const { categories } = useCategories();
  const [search, setSearch] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const cities = useMemo(() => {
    const citySet = new Set<string>();
    favorites.forEach((place) => {
      const city = typeof place.city === 'string' ? place.city : getLocalizedText(place.city, currentLanguage);
      if (city) citySet.add(city);
    });
    return Array.from(citySet).sort();
  }, [favorites, currentLanguage]);

  const districts = useMemo(() => {
    if (!selectedCity) return [];
    const districtSet = new Set<string>();
    favorites.forEach((place) => {
      const city = typeof place.city === 'string' ? place.city : getLocalizedText(place.city, currentLanguage);
      if (city === selectedCity) {
        const district =
          typeof place.district === 'string' ? place.district : getLocalizedText(place.district, currentLanguage);
        if (district) districtSet.add(district);
      }
    });
    return Array.from(districtSet).sort();
  }, [favorites, selectedCity, currentLanguage]);

  const filteredFavorites = useMemo(() => {
    return favorites.filter((place) => {
      const name = typeof place.name === 'string' ? place.name : getLocalizedText(place.name, currentLanguage);
      const city = typeof place.city === 'string' ? place.city : getLocalizedText(place.city, currentLanguage);
      const district =
        typeof place.district === 'string' ? place.district : getLocalizedText(place.district, currentLanguage);
      if (
        search &&
        !name.toLowerCase().includes(search.toLowerCase()) &&
        !city.toLowerCase().includes(search.toLowerCase())
      )
        return false;
      if (selectedCity && city !== selectedCity) return false;
      if (selectedDistrict && district !== selectedDistrict) return false;
      if (selectedCategories.length > 0 && !placeMatchesCategoryFilter(place.category, selectedCategories))
        return false;
      return true;
    });
  }, [favorites, search, selectedCity, selectedDistrict, selectedCategories, currentLanguage]);

  const visibleCategories = useMemo(() => categories.slice(0, 10), [categories]);

  return (
    <PageShell
      title={t('account.myFavorites')}
      subtitle={t('favorites.subtitle', 'Kaydettiğiniz kültürel miras noktaları')}
      backTo="/account"
      shellClassName="kb-page-wide"
    >
      <div className="fav-toolbar">
        <input
          type="search"
          placeholder={t('favorites.searchPlaceholder', 'Ara (ad, şehir...)')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          value={selectedCity}
          onChange={(e) => {
            setSelectedCity(e.target.value);
            setSelectedDistrict('');
          }}
        >
          <option value="">{t('favorites.allCities', 'Tüm Şehirler')}</option>
          {cities.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
        {selectedCity && (
          <select value={selectedDistrict} onChange={(e) => setSelectedDistrict(e.target.value)}>
            <option value="">{t('favorites.allDistricts', 'Tüm İlçeler')}</option>
            {districts.map((district) => (
              <option key={district} value={district}>
                {district}
              </option>
            ))}
          </select>
        )}
      </div>

      {visibleCategories.length > 0 && (
        <div className="fav-chips">
          {visibleCategories.map((cat) => (
            <button
              key={cat.value}
              type="button"
              className={`fav-chip ${selectedCategories.includes(cat.value) ? 'is-active' : ''}`}
              onClick={() =>
                setSelectedCategories((prev) =>
                  prev.includes(cat.value) ? prev.filter((c) => c !== cat.value) : [...prev, cat.value]
                )
              }
            >
              {getCategoryLabel(cat, currentLanguage)}
            </button>
          ))}
        </div>
      )}

      <div className="fav-count-bar">
        <span>
          <strong>{filteredFavorites.length}</strong> {t('favorites.placesCount', 'yer')}
        </span>
        {favorites.length !== filteredFavorites.length && (
          <span>
            {t('favorites.filteredFrom', 'toplam {{total}} favoriden', { total: favorites.length })}
          </span>
        )}
      </div>

      {filteredFavorites.length === 0 ? (
        <PageEmpty
          icon="favorite_border"
          title={t('favorites.noFavorites', 'Favori yer bulunamadı')}
          subtitle={t('favorites.emptyHint', 'Liste veya haritadan kalp ikonuna tıklayarak ekleyin')}
        />
      ) : (
        <div className="fav-grid">
          {filteredFavorites.map((place) => {
            const name = typeof place.name === 'string' ? place.name : getLocalizedText(place.name, currentLanguage);
            const city = typeof place.city === 'string' ? place.city : getLocalizedText(place.city, currentLanguage);
            const district =
              typeof place.district === 'string' ? place.district : getLocalizedText(place.district, currentLanguage);
            const desc =
              typeof place.description === 'string' ? place.description : getLocalizedText(place.description, currentLanguage);
            const imageUrl = getPlaceImageUri(place);

            return (
              <article
                key={place.id}
                className="fav-card"
                onClick={() => void openPlaceDetail(place, currentLanguage)}
              >
                <button
                  type="button"
                  className="fav-card-heart"
                  aria-label={t('favorites.remove', 'Favoriden çıkar')}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(place);
                  }}
                >
                  <span className="material-icons">favorite</span>
                </button>
                <div className="fav-card-image">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt=""
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : null}
                </div>
                <div className="fav-card-body">
                  <h3>{name}</h3>
                  <p className="fav-card-meta">
                    <span className="material-icons">place</span>
                    {city}
                    {district ? ` · ${district}` : ''}
                  </p>
                  {desc && <p className="fav-card-desc">{desc}</p>}
                  {place.isUnesco && <span className="unesco-badge">UNESCO</span>}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </PageShell>
  );
};

export default FavoritesPage;
