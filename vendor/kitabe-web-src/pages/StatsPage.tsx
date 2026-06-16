import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { usePlaces } from '../contexts/PlacesContext';
import { useLanguage } from '../contexts/LanguageContext';
import { API_BASE_URL } from '../config/api';
import {
  getTopCitiesByOpens,
  getTopCitiesByRoutes,
  getTopCitiesByFavorites,
  getTopPlacesByOpens,
  getTopPlacesByRoutes,
  getTopPlacesByFavorites,
} from '../services/stats';
import { getLocalizedText } from '../utils/multilang';
import type { CityStats, PlaceStats } from '../types/analytics';
import { PageShell } from '../components/PageShell';

const StatsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { kullanici } = useAuth();
  const { places } = usePlaces();
  const { currentLanguage } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [totalStats, setTotalStats] = useState({
    totalPlaceOpens: 0,
    totalRouteOpens: 0,
    totalFavorites: 0,
    totalCities: 0,
    totalPlaces: 0,
  });
  const [topCitiesByOpens, setTopCitiesByOpens] = useState<CityStats[]>([]);
  const [topCitiesByRoutes, setTopCitiesByRoutes] = useState<CityStats[]>([]);
  const [topCitiesByFavorites, setTopCitiesByFavorites] = useState<CityStats[]>([]);
  const [topPlacesByOpens, setTopPlacesByOpens] = useState<PlaceStats[]>([]);
  const [topPlacesByRoutes, setTopPlacesByRoutes] = useState<PlaceStats[]>([]);
  const [topPlacesByFavorites, setTopPlacesByFavorites] = useState<PlaceStats[]>([]);
  const [placeNamesCache, setPlaceNamesCache] = useState<Record<string, any>>({});

  useEffect(() => {
    if (!kullanici || kullanici.rol !== 'admin') {
      navigate('/account');
      return;
    }
    loadStats();
  }, [kullanici, navigate, places]);

  const loadStats = async () => {
    try {
      setLoading(true);

      const summaryRes = await fetch(`${API_BASE_URL}/api/stats/summary`);
      const summaryJson = await summaryRes.json();
      if (summaryJson.success && summaryJson.data) {
        const d = summaryJson.data;
        setTotalStats({
          totalPlaceOpens: Number(d.totalPlaceOpens) || 0,
          totalRouteOpens: Number(d.totalRouteOpens) || 0,
          totalFavorites: Number(d.totalFavorites) || 0,
          totalCities: Number(d.totalCities) || 0,
          totalPlaces: Number(d.totalPlaces) || 0,
        });
      }

      const [
        citiesByOpens,
        citiesByRoutes,
        citiesByFavorites,
        placesByOpens,
        placesByRoutes,
        placesByFavorites,
      ] = await Promise.all([
        getTopCitiesByOpens(10),
        getTopCitiesByRoutes(10),
        getTopCitiesByFavorites(10),
        getTopPlacesByOpens(20),
        getTopPlacesByRoutes(20),
        getTopPlacesByFavorites(20),
      ]);

      setTopCitiesByOpens(citiesByOpens);
      setTopCitiesByRoutes(citiesByRoutes);
      setTopCitiesByFavorites(citiesByFavorites);
      setTopPlacesByOpens(placesByOpens);
      setTopPlacesByRoutes(placesByRoutes);
      setTopPlacesByFavorites(placesByFavorites);

      const namesCache: Record<string, unknown> = {};
      places.forEach((p) => {
        namesCache[p.id] = p.name;
      });
      setPlaceNamesCache(namesCache);
    } catch (error) {
      console.error('Stats yükleme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPlaceName = (placeId: string): string | null => {
    if (!placeId) return null;

    if (placeNamesCache[placeId]) {
      const nameData = placeNamesCache[placeId];
      return getLocalizedText(nameData, currentLanguage) || null;
    }

    const place = places.find((p) => p.id === placeId);
    if (place && place.name) {
      return typeof place.name === 'string' ? place.name : getLocalizedText(place.name, currentLanguage);
    }

    return null;
  };

  if (!kullanici || kullanici.rol !== 'admin') {
    return null;
  }

  if (loading) {
    return (
      <PageShell title={t('account.statistics')} backTo="/admin-hub" className="stats-page kb-page-wide">
        {t('common.loading')}
      </PageShell>
    );
  }

  const StatCard = ({ icon, title, value, color }: { icon: string; title: string; value: number | string; color: string }) => (
    <div className="kb-stat-card" style={{ '--stat-color': color } as React.CSSProperties}>
      <span className="material-icons kb-stat-icon">{icon}</span>
      <div className="kb-stat-content">
        <div className="kb-stat-title">{title}</div>
        <div className="kb-stat-value">{typeof value === 'number' ? value.toLocaleString('tr-TR') : value}</div>
      </div>
    </div>
  );

  const TopListCard = ({ title, data, type, valueType }: { title: string; data: CityStats[] | PlaceStats[]; type: 'city' | 'place'; valueType: 'opens' | 'routes' | 'favorites' }) => (
    <div className="list-card">
      <h3 className="list-card-title">{title}</h3>
      {data.length === 0 ? (
        <div className="empty-text">Henüz veri yok</div>
      ) : (
        <div className="list-items">
          {data
            .filter((item) => {
              if (type === 'city') return true;
              const placeStat = item as PlaceStats;
              return getPlaceName(placeStat.placeId || '') !== null;
            })
            .map((item, index) => {
              const isCity = type === 'city';
              const name = isCity
                ? (item as CityStats).city
                : getPlaceName((item as PlaceStats).placeId || '') || 'Bilinmeyen Yer';

              let value = 0;
              if (isCity) {
                const cityItem = item as CityStats;
                value = valueType === 'opens' ? cityItem.totalPlaceOpens : valueType === 'routes' ? cityItem.totalRouteOpens : cityItem.totalFavorites;
              } else {
                const placeItem = item as PlaceStats;
                value = valueType === 'opens' ? placeItem.totalOpens : valueType === 'routes' ? placeItem.totalRoutes : placeItem.totalFavorites;
              }

              return (
                <div key={`${isCity ? 'city' : 'place'}-${index}`} className="list-item">
                  <div className="list-item-rank">#{index + 1}</div>
                  <div className="list-item-content">
                    <div className="list-item-name">{name}</div>
                    {isCity && (
                      <div className="list-item-subtext">
                        Açılma: {(item as CityStats).totalPlaceOpens || 0} • Rota: {(item as CityStats).totalRouteOpens || 0} • Favori: {(item as CityStats).totalFavorites || 0}
                      </div>
                    )}
                    {!isCity && (
                      <div className="list-item-subtext">
                        Açılma: {(item as PlaceStats).totalOpens || 0} • Rota: {(item as PlaceStats).totalRoutes || 0} • Favori: {(item as PlaceStats).totalFavorites || 0}
                      </div>
                    )}
                  </div>
                  <div className="list-item-value">{value.toLocaleString('tr-TR')}</div>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );

  return (
    <PageShell title={t('account.statistics')} backTo="/admin-hub" className="stats-page kb-page-wide">
      <div className="section">
        <h2 className="section-title">Toplam İstatistikler</h2>
        <div className="kb-stats-grid">
          <StatCard icon="visibility" title="Toplam Açılma" value={totalStats.totalPlaceOpens} color="#4CAF50" />
          <StatCard icon="map" title="Toplam Rota" value={totalStats.totalRouteOpens} color="#2196F3" />
          <StatCard icon="favorite" title="Toplam Favori" value={totalStats.totalFavorites} color="#FF7043" />
          <StatCard icon="location_city" title="Şehir Sayısı" value={totalStats.totalCities} color="#9C27B0" />
          <StatCard icon="place" title="Yer Sayısı" value={totalStats.totalPlaces} color="#FF9800" />
        </div>
      </div>

      <div className="section">
        <TopListCard title="En Çok Tıklanan Şehirler (Top 10)" data={topCitiesByOpens} type="city" valueType="opens" />
      </div>

      <div className="section">
        <TopListCard title="En Çok Rota Açılan Şehirler (Top 10)" data={topCitiesByRoutes} type="city" valueType="routes" />
      </div>

      <div className="section">
        <TopListCard title="En Çok Favorilere Eklenen Şehirler (Top 10)" data={topCitiesByFavorites} type="city" valueType="favorites" />
      </div>

      <div className="section">
        <TopListCard title="En Çok Tıklanan Yerler (Top 20)" data={topPlacesByOpens} type="place" valueType="opens" />
      </div>

      <div className="section">
        <TopListCard title="En Çok Rota Açılan Yerler (Top 20)" data={topPlacesByRoutes} type="place" valueType="routes" />
      </div>

      <div className="section">
        <TopListCard title="En Çok Favorilere Eklenen Yerler (Top 20)" data={topPlacesByFavorites} type="place" valueType="favorites" />
      </div>
    </PageShell>
  );
};

export default StatsPage;

