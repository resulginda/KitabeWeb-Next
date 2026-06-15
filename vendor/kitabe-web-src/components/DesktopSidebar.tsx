import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { NAV_ITEMS, isNavItemActive } from '../config/navItems';
import { NavIcon } from './NavIcons';
import './DesktopSidebar.css';

const DesktopSidebar = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const { kullanici } = useAuth();

  return (
    <aside className="desktop-sidebar" aria-label={t('navigation.mainNav', { defaultValue: 'Ana menü' })}>
      <div className="desktop-sidebar-inner">
        <Link to="/home" className="desktop-sidebar-brand" title="Kitabe">
          <img src="/icon.png" alt="" className="desktop-sidebar-logo" />
          <span className="desktop-sidebar-brand-text">Kitabe</span>
        </Link>

        <nav className="desktop-sidebar-nav">
          {NAV_ITEMS.map((item) => {
            const active = isNavItemActive(location.pathname, item);
            const label =
              item.id === 'account' && kullanici
                ? t(item.accountLabelKey || item.labelKey)
                : t(item.labelKey);

            return (
              <Link
                key={item.id}
                to={item.path}
                className={`desktop-sidebar-link ${active ? 'active' : ''}`}
                title={label}
              >
                <span className="desktop-sidebar-icon">
                  <NavIcon id={item.id} />
                </span>
                <span className="desktop-sidebar-label">{label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};

export default DesktopSidebar;
