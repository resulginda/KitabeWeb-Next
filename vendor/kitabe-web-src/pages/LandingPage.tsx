import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './LandingPage.css';

const LandingPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleAppStore = (e: React.MouseEvent) => {
    e.preventDefault();
    window.open('https://apps.apple.com/tr/app/kitabe-turkey-travel-guide/id6759072943', '_blank');
  };

  const handleGooglePlay = (e: React.MouseEvent) => {
    e.preventDefault();
    window.open('https://play.google.com/store/apps/details?id=com.kitabeapp', '_blank');
  };

  const handleContinueWeb = () => {
    navigate('/home', { replace: true });
  };

  return (
    <div className="landing-page">
      <div className="landing-content">
        <div className="landing-logo">
          <img src="/icon.png" alt="KitabeApp" className="landing-icon" />
          <h1>KitabeApp</h1>
          <p>{t('landing.welcomeMessage') || 'Türkiye\'nin kültürel mirasını keşfedin'}</p>
        </div>

        <div className="landing-actions">
          <h2>{t('landing.downloadApp') || 'Uygulamayı İndirin'}</h2>
          
          <a 
            href="https://apps.apple.com/tr/app/kitabe-turkey-travel-guide/id6759072943" 
            target="_blank" 
            rel="noopener noreferrer"
            className="app-store-btn"
            onClick={handleAppStore}
          >
            <img 
              src="https://tools.applemediaservices.com/api/badges/download-on-the-app-store/black/en-us?releaseDate=2019-01-01&size=250x83&version=1" 
              alt="Download on the App Store" 
              style={{ height: '60px', width: 'auto' }}
              onError={(e) => {
                // Fallback if image doesn't load
                (e.target as HTMLImageElement).style.display = 'none';
                const parent = (e.target as HTMLElement).parentElement;
                if (parent) {
                  parent.innerHTML = '<span style="color: white;">Download on the App Store</span>';
                }
              }}
            />
          </a>

          <a 
            href="https://play.google.com/store/apps/details?id=com.kitabeapp" 
            target="_blank" 
            rel="noopener noreferrer"
            className="google-play-btn"
            onClick={handleGooglePlay}
          >
            <img 
              src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png" 
              alt="Get it on Google Play" 
              style={{ height: '60px', width: 'auto' }}
              onError={(e) => {
                // Fallback if image doesn't load
                (e.target as HTMLImageElement).style.display = 'none';
                const parent = (e.target as HTMLElement).parentElement;
                if (parent) {
                  parent.innerHTML = '<span style="color: white;">Get it on Google Play</span>';
                }
              }}
            />
          </a>

          <div className="web-continue">
            <button className="web-continue-btn" onClick={handleContinueWeb}>
              {t('landing.continueWeb') || 'Web\'e Devam Et'}
            </button>
            <p className="web-continue-note">
              {t('landing.webNote') || 'Web sürümünü kullanmaya devam edin'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;

