import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { HEADER_NAV_ITEMS, isNavItemActive } from '../config/navItems';
import { HEADER_LINKS } from '../config/headerLinks';
import type { ExploreCityLocale } from '../data/featuredExploreCities';
import { NavIcon } from './NavIcons';
import { HeaderLanguageMenu } from './HeaderLanguageMenu';
import './SiteHeader.css';

export function SiteHeader() {
  const { t } = useTranslation();
  const location = useLocation();
  const { kullanici } = useAuth();
  const { currentLanguage } = useLanguage();

  const locale = (['tr', 'en', 'ru', 'ar'].includes(currentLanguage)
    ? currentLanguage
    : 'tr') as ExploreCityLocale;

  return (
    <header className="site-header" data-od-id="header">
      <div className="site-header-inner">
        <Link to="/home" className="site-header-logo" title="Kitabe">
          <img src="/logo-header.webp" alt="" className="site-header-logo-img" width={36} height={36} />
          <span>Kitabe</span>
        </Link>

        <nav className="site-header-main" aria-label={t('navigation.mainNav', { defaultValue: 'Ana menü' })}>
          {HEADER_NAV_ITEMS.map((item) => {
            const active = isNavItemActive(location.pathname, item);
            const label = t(item.labelKey);
            const needsAuth = (item.id === 'nearby' || item.id === 'route') && !kullanici;
            const to = needsAuth ? '/login' : item.path;

            return (
              <Link
                key={item.id}
                to={to}
                state={needsAuth ? { from: item.path } : undefined}
                className={`site-header-nav-link ${active ? 'is-active' : ''}`}
              >
                <span className="site-header-nav-icon" aria-hidden>
                  <NavIcon id={item.id} size={18} />
                </span>
                <span className="site-header-nav-label">{label}</span>
              </Link>
            );
          })}
        </nav>

        <nav className="site-header-secondary" aria-label={t('header.secondaryNav', { defaultValue: 'Site menüsü' })}>
          {HEADER_LINKS.map((item) => {
            const active = item.isActive(location.pathname, locale);
            const label = t(item.labelKey);
            const className = `site-header-secondary-link ${active ? 'is-active' : ''}`;

            if (item.path) {
              return (
                <Link key={item.id} to={item.path} className={className}>
                  {label}
                </Link>
              );
            }

            const href = item.getHref?.(locale) ?? '#';
            return (
              <a key={item.id} href={href} className={className}>
                {label}
              </a>
            );
          })}
        </nav>

        <div className="site-header-actions">
          <HeaderLanguageMenu />
          {kullanici ? (
            <Link to="/account" className="site-header-account-pill">
              <span className="site-header-account-avatar" aria-hidden>
                {kullanici.isim?.charAt(0)?.toUpperCase() || 'K'}
              </span>
              <span className="site-header-account-label">{t('account.myAccount')}</span>
            </Link>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary btn-sm site-header-login">
                {t('common.login')}
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm site-header-register">
                {t('common.register', { defaultValue: 'Kayıt ol' })}
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
