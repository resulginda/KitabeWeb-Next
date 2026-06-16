'use client';

import { useAuth } from '@kitabe/contexts/AuthContext';
import { HEADER_NAV_ITEMS, isNavItemActive } from '@kitabe/config/navItems';
import { HEADER_LINKS } from '@kitabe/config/headerLinks';
import type { ExploreCityLocale } from '@kitabe/data/featuredExploreCities';
import { NavIcon } from '@kitabe/components/NavIcons';
import { SeoHeaderLanguageMenu } from '@/components/SeoHeaderLanguageMenu';
import type { Locale } from '@/lib/places';
import { HUB_HEADER_COPY } from '@/lib/hubHeaderCopy';

type Props = {
  locale: Locale;
  pathname: string;
};

const NAV_LABEL: Record<string, keyof (typeof HUB_HEADER_COPY)['tr']> = {
  home: 'home',
  list: 'list',
  nearby: 'nearby',
  route: 'route',
};

const LINK_LABEL: Record<string, keyof (typeof HUB_HEADER_COPY)['tr']> = {
  cities: 'cities',
  blog: 'blog',
  about: 'about',
  contact: 'contact',
  suggest: 'suggest',
};

/** SEO içerik sayfaları — URL locale ile statik etiketler (i18n async beklemez) */
export function SiteHeaderNext({ locale, pathname }: Props) {
  const { kullanici } = useAuth();
  const hubLocale = locale as ExploreCityLocale;
  const copy = HUB_HEADER_COPY[locale];

  return (
    <header className="site-header" data-od-id="header">
      <div className="site-header-inner">
        <a href="/home" className="site-header-logo" title="Kitabe">
          <img
            src="/logo-header.webp"
            alt=""
            className="site-header-logo-img"
            width={36}
            height={36}
          />
          <span>Kitabe</span>
        </a>

        <nav className="site-header-main" aria-label={copy.mainNav}>
          {HEADER_NAV_ITEMS.map((item) => {
            const active = isNavItemActive(pathname, item);
            const labelKey = NAV_LABEL[item.id];
            const label = labelKey ? copy[labelKey] : item.id;
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

        <nav className="site-header-secondary" aria-label={copy.secondaryNav}>
          {HEADER_LINKS.map((item) => {
            const active = item.isActive(pathname, hubLocale);
            const labelKey = LINK_LABEL[item.id];
            const label = labelKey ? copy[labelKey] : item.id;
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
          <SeoHeaderLanguageMenu locale={locale} pathname={pathname} />
          {kullanici ? (
            <a href="/account" className="site-header-account-pill">
              <span className="site-header-account-avatar" aria-hidden>
                {kullanici.isim?.charAt(0)?.toUpperCase() || 'K'}
              </span>
              <span className="site-header-account-label">{copy.myAccount}</span>
            </a>
          ) : (
            <>
              <a href="/login" className="btn btn-secondary btn-sm site-header-login">
                {copy.login}
              </a>
              <a href="/register" className="btn btn-primary btn-sm site-header-register">
                {copy.register}
              </a>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
