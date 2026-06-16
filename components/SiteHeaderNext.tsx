'use client';

import { useTranslation } from 'react-i18next';
import { useAuth } from '@kitabe/contexts/AuthContext';
import { HEADER_NAV_ITEMS, isNavItemActive } from '@kitabe/config/navItems';
import { HEADER_LINKS } from '@kitabe/config/headerLinks';
import type { ExploreCityLocale } from '@kitabe/data/featuredExploreCities';
import { NavIcon } from '@kitabe/components/NavIcons';
import { HeaderLanguageMenu } from '@kitabe/components/HeaderLanguageMenu';
import type { Locale } from '@/lib/places';

type Props = {
  locale: Locale;
  pathname: string;
};

/** KitabeWeb SiteHeader ile aynı görünüm — Next.js SEO sayfaları (SPA rotalarına <a href>) */
export function SiteHeaderNext({ locale, pathname }: Props) {
  const { t } = useTranslation();
  const { kullanici } = useAuth();
  const hubLocale = locale as ExploreCityLocale;

  return (
    <header className="site-header" data-od-id="header">
      <div className="site-header-inner">
        <a href="/home" className="site-header-logo" title="Kitabe">
          <img src="/icon.png" alt="" className="site-header-logo-img" />
          <span>Kitabe</span>
        </a>

        <nav className="site-header-main" aria-label={t('navigation.mainNav', { defaultValue: 'Ana menü' })}>
          {HEADER_NAV_ITEMS.map((item) => {
            const active = isNavItemActive(pathname, item);
            const label = t(item.labelKey);
            const needsAuth = (item.id === 'nearby' || item.id === 'route') && !kullanici;
            const href = needsAuth ? '/login' : item.path;

            return (
              <a
                key={item.id}
                href={href}
                className={`site-header-nav-link ${active ? 'is-active' : ''}`}
              >
                <span className="site-header-nav-icon" aria-hidden>
                  <NavIcon id={item.id} size={18} />
                </span>
                <span className="site-header-nav-label">{label}</span>
              </a>
            );
          })}
        </nav>

        <nav
          className="site-header-secondary"
          aria-label={t('header.secondaryNav', { defaultValue: 'Site menüsü' })}
        >
          {HEADER_LINKS.map((item) => {
            const active = item.isActive(pathname, hubLocale);
            const label = t(item.labelKey);
            const className = `site-header-secondary-link ${active ? 'is-active' : ''}`;

            if (item.path) {
              return (
                <a key={item.id} href={item.path} className={className}>
                  {label}
                </a>
              );
            }

            const href = item.getHref?.(hubLocale) ?? '#';
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
            <a href="/account" className="site-header-account-pill">
              <span className="site-header-account-avatar" aria-hidden>
                {kullanici.isim?.charAt(0)?.toUpperCase() || 'K'}
              </span>
              <span className="site-header-account-label">{t('account.myAccount')}</span>
            </a>
          ) : (
            <>
              <a href="/login" className="btn btn-secondary btn-sm site-header-login">
                {t('common.login')}
              </a>
              <a href="/register" className="btn btn-primary btn-sm site-header-register">
                {t('common.register', { defaultValue: 'Kayıt ol' })}
              </a>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
