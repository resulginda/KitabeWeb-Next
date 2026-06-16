import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './Footer.css';

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div className="footer-brand">
          <img src="/logo-160.webp" alt="KitabeApp" className="footer-logo" width={80} height={80} />
          <h2>KitabeApp</h2>
        </div>
        <div className="footer-content">
          <div className="footer-section">
            <h3>{t('footer.about') || 'Hakkımızda'}</h3>
            <ul>
              <li><Link to="/hakkimizda">{t('footer.aboutUs') || 'Hakkımızda'}</Link></li>
              <li><Link to="/blog">{t('footer.blog') || 'Blog'}</Link></li>
              <li><Link to="/iletisim">{t('footer.contact') || 'İletişim'}</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h3>{t('footer.legal') || 'Yasal'}</h3>
            <ul>
              <li><Link to="/gizlilik-politikasi">{t('footer.privacy') || 'Gizlilik Politikası'}</Link></li>
              <li><Link to="/kullanim-sartlari">{t('footer.terms') || 'Kullanım Şartları'}</Link></li>
              <li><Link to="/legal">{t('footer.legalDocuments') || 'Yasal Belgeler'}</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h3>{t('footer.follow') || 'Takip Edin'}</h3>
            <p className="footer-description">
              {t('footer.description') || 'Türkiye\'nin kültürel mirasını keşfedin'}
            </p>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Kitabe. {t('footer.allRightsReserved') || 'Tüm hakları saklıdır.'}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

