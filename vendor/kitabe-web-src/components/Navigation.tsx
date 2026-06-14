import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import './Navigation.css';

const Navigation = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const { kullanici } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bottom-nav">
      <Link to="/home" className={`nav-item ${isActive('/home') || isActive('/') ? 'active' : ''}`}>
        <span className="nav-icon">🏠</span>
        <span className="nav-label">{t('navigation.home')}</span>
      </Link>
      <Link to="/list" className={`nav-item ${isActive('/list') ? 'active' : ''}`}>
        <span className="nav-icon">📋</span>
        <span className="nav-label">{t('navigation.list')}</span>
      </Link>
      <Link to="/nearby" className={`nav-item ${isActive('/nearby') ? 'active' : ''}`}>
        <span className="nav-icon">📍</span>
        <span className="nav-label">{t('navigation.nearby')}</span>
      </Link>
      <Link to="/route" className={`nav-item ${isActive('/route') ? 'active' : ''}`}>
        <span className="nav-icon">🗺️</span>
        <span className="nav-label">{t('navigation.route')}</span>
      </Link>
      <Link to="/account" className={`nav-item ${isActive('/account') ? 'active' : ''}`}>
        <span className="nav-icon">👤</span>
        <span className="nav-label">{kullanici ? t('account.myAccount') : t('navigation.loginRegister')}</span>
      </Link>
    </nav>
  );
};

export default Navigation;

