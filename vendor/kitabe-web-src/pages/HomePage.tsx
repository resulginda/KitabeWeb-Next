import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { usePlaces } from '../contexts/PlacesContext';
import { useFiltre } from '../contexts/FiltreContext';
import { useAuth } from '../contexts/AuthContext';
import ExploreCitiesGrid from '../components/ExploreCitiesGrid';
import { PopularPlacesSection } from '../components/PopularPlacesSection';
import './HomePage.css';

const HomePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { loading } = usePlaces();
  const { filtre, setFiltre } = useFiltre();
  const { kullanici } = useAuth();

  if (loading) {
    return (
      <div className="home-page loading">
        {t('common.loading')}
      </div>
    );
  }

  const handleSearch = () => {
    navigate('/list');
  };

  return (
    <div className="home-page">
      <section className="kb-hero">
        <div className="kb-hero-bg" aria-hidden />
        <div className="kb-hero-content">
          <p className="kb-meta">{t('home.heroEyebrow', { defaultValue: 'Türkiye Kültürel Miras' })}</p>
          <h1>{t('home.heroTitle')}</h1>
          <p className="kb-lead">{t('home.heroSubtitle')}</p>
          <form
            className="kb-search-box"
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
          >
            <input
              type="search"
              placeholder={t('home.searchPlaceholder') || 'Şehir, yer veya kategori ara…'}
              value={filtre.searchQuery}
              onChange={(e) => setFiltre({ ...filtre, searchQuery: e.target.value })}
              aria-label={t('home.searchPlaceholder')}
            />
            <button type="submit" className="btn btn-navy">
              {t('home.exploreCta', { defaultValue: 'Keşfet' })}
            </button>
          </form>
          <div className="kb-quick-badges">
            <button
              type="button"
              className="kb-quick-badge"
              onClick={() => (kullanici ? navigate('/nearby') : navigate('/login', { state: { from: '/nearby' } }))}
            >
              {t('navigation.nearby')}
            </button>
            <button type="button" className="kb-quick-badge" onClick={() => navigate('/list')}>
              {t('navigation.list')}
            </button>
            <button type="button" className="kb-quick-badge" onClick={() => navigate('/blog')}>
              {t('navigation.blog', { defaultValue: 'Blog' })}
            </button>
          </div>
        </div>
      </section>

      <ExploreCitiesGrid />

      <PopularPlacesSection />

      <section className="kb-carousel-section container home-cta-section">
        <div className="kb-panel home-cta-panel">
          <h2>{t('home.ctaTitle', { defaultValue: 'Haritada keşfetmeye başlayın' })}</h2>
          <p className="kb-lead">
            {t('home.ctaSubtitle', {
              defaultValue: 'Tüm yerleri liste ve harita yan yana görün — masaüstünde split-screen deneyim.',
            })}
          </p>
          <button type="button" className="btn btn-primary" onClick={() => navigate('/list')}>
            {t('home.exploreOnMap', { defaultValue: 'Keşfet sayfasına git' })}
          </button>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
