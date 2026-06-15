import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { HEADER_LINKS } from '../config/headerLinks';
import type { ExploreCityLocale } from '../data/featuredExploreCities';
import './DesktopHeader.css';

const DesktopHeader = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const { kullanici } = useAuth();
  const { currentLanguage } = useLanguage();

  const locale = (['tr', 'en', 'ru', 'ar'].includes(currentLanguage)
    ? currentLanguage
    : 'tr') as ExploreCityLocale;
  const langLabel = currentLanguage.toUpperCase();

  return (
    <header className="desktop-header">
      <nav className="desktop-header-nav" aria-label={t('header.secondaryNav', { defaultValue: 'Site menüsü' })}>
        {HEADER_LINKS.map((item) => {
          const active = item.isActive(location.pathname, locale);
          const label = t(item.labelKey);
          const className = `desktop-header-link ${active ? 'active' : ''}`;

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

      <div className="desktop-header-actions">
        <Link to="/language-selection" className="desktop-header-chip" title={t('common.language')}>
          {langLabel}
        </Link>
        <Link to="/account" className="desktop-header-account">
          <span className="desktop-header-account-avatar" aria-hidden>
            {kullanici?.isim?.charAt(0)?.toUpperCase() || 'K'}
          </span>
          <span className="desktop-header-account-label">
            {kullanici ? t('account.myAccount') : t('navigation.loginRegister')}
          </span>
        </Link>
      </div>
    </header>
  );
};

export default DesktopHeader;
