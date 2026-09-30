import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { MOBILE_NAV_ITEMS, isNavItemActive, navItemHref } from '../config/navItems';
import { NavIcon } from './NavIcons';
import './Navigation.css';

const Navigation = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const { kullanici } = useAuth();
  const { currentLanguage } = useLanguage();

  return (
    <nav className="bottom-nav" aria-label={t('navigation.mainNav', { defaultValue: 'Ana menü' })}>
      {MOBILE_NAV_ITEMS.map((item) => {
        const active = isNavItemActive(location.pathname, item);
        const label =
          item.id === 'account'
            ? kullanici
              ? t(item.accountLabelKey || item.labelKey)
              : t('navigation.account', { defaultValue: 'Hesap' })
            : t(item.labelKey);

        const needsAuth = (item.id === 'nearby' || item.id === 'route') && !kullanici;
        const to =
          item.id === 'account' && !kullanici ? '/login' : needsAuth ? '/login' : item.path;
        const className = `nav-item ${active ? 'active' : ''}`;
        const content = (
          <>
            <span className="nav-icon">
              <NavIcon id={item.id} size={22} />
            </span>
            <span className="nav-label">{label}</span>
          </>
        );

        if (item.id === 'home') {
          return (
            <a key={item.id} href={navItemHref(item, currentLanguage)} className={className}>
              {content}
            </a>
          );
        }

        return (
          <Link
            key={item.id}
            to={to}
            state={needsAuth ? { from: item.path } : undefined}
            className={className}
          >
            {content}
          </Link>
        );
      })}
    </nav>
  );
};

export default Navigation;
