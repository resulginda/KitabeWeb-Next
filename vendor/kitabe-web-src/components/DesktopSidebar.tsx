import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { NAV_ITEMS, isNavItemActive, localeHomePath, navItemHref } from '../config/navItems';
import { NavIcon } from './NavIcons';
import './DesktopSidebar.css';

const DesktopSidebar = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const { kullanici } = useAuth();
  const { currentLanguage } = useLanguage();

  return (
    <aside className="desktop-sidebar" aria-label={t('navigation.mainNav', { defaultValue: 'Ana menü' })}>
      <div className="desktop-sidebar-inner">
        <a href={localeHomePath(currentLanguage)} className="desktop-sidebar-brand" title="Kitabe">
          <img src="/logo-header.webp" alt="" className="desktop-sidebar-logo" width={36} height={36} />
          <span className="desktop-sidebar-brand-text">Kitabe</span>
        </a>

        <nav className="desktop-sidebar-nav">
          {NAV_ITEMS.map((item) => {
            const active = isNavItemActive(location.pathname, item);
            const label =
              item.id === 'account' && kullanici
                ? t(item.accountLabelKey || item.labelKey)
                : t(item.labelKey);
            const className = `desktop-sidebar-link ${active ? 'active' : ''}`;
            const content = (
              <>
                <span className="desktop-sidebar-icon">
                  <NavIcon id={item.id} />
                </span>
                <span className="desktop-sidebar-label">{label}</span>
              </>
            );

            if (item.id === 'home') {
              return (
                <a key={item.id} href={navItemHref(item, currentLanguage)} className={className} title={label}>
                  {content}
                </a>
              );
            }

            return (
              <Link key={item.id} to={item.path} className={className} title={label}>
                {content}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};

export default DesktopSidebar;
