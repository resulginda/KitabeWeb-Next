import Link from 'next/link';
import { LOCALES, type Locale } from '@/lib/places';
import { legalPath } from '@/lib/legal/types';
import { siteLogoHeader } from '@/lib/siteLogo';
import { HUB_HEADER_COPY } from '@/lib/hubHeaderCopy';
import { HubAuthActions } from '@/components/home/HubAuthActions';
import { NavIcon } from '@kitabe/components/NavIcons';
import type { NavItemId } from '@kitabe/config/navItems';
import '@kitabe/components/Navigation.css';

const BOTTOM_ITEMS: { id: NavItemId; href: string; label: keyof (typeof HUB_HEADER_COPY)['tr'] }[] = [
  { id: 'home', href: '/', label: 'bottomHome' },
  { id: 'list', href: '/list', label: 'bottomList' },
  { id: 'nearby', href: '/nearby', label: 'bottomNearby' },
  { id: 'route', href: '/route', label: 'bottomRoute' },
  { id: 'account', href: '/account', label: 'bottomAccount' },
];

/** Hub (/tr â€¦) â€” istemci JS yok; PageSpeed iÃ§in statik header + alt nav */
export function HubStaticChrome({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  const t = HUB_HEADER_COPY[locale];

  return (
    <div className="app-shell hub-static-shell">
      <header className="site-header" data-od-id="header">
        <div className="site-header-inner">
          <a href={`/${locale}`} className="site-header-logo" title="Kitabe">
            <img
              src={siteLogoHeader.src}
              alt=""
              className="site-header-logo-img"
              width={siteLogoHeader.width}
              height={siteLogoHeader.height}
            />
            <span>Kitabe</span>
          </a>

          <nav className="site-header-main" aria-label={t.mainNav}>
            <a href={`/${locale}`} className="site-header-nav-link is-active" aria-current="page">
              <span className="site-header-nav-label">{t.home}</span>
            </a>
            <a href="/list" className="site-header-nav-link">
              <span className="site-header-nav-label">{t.list}</span>
            </a>
            <a href="/nearby" className="site-header-nav-link">
              <span className="site-header-nav-label">{t.nearby}</span>
            </a>
            <a href="/route" className="site-header-nav-link">
              <span className="site-header-nav-label">{t.route}</span>
            </a>
          </nav>

          <nav className="site-header-secondary" aria-label={t.secondaryNav}>
            <Link href={`/${locale}`} className="site-header-secondary-link is-active">
              {t.cities}
            </Link>
            <a href="/blog" className="site-header-secondary-link">
              {t.blog}
            </a>
            <Link href={legalPath(locale, 'about')} className="site-header-secondary-link">
              {t.about}
            </Link>
            <Link href={legalPath(locale, 'contact')} className="site-header-secondary-link">
              {t.contact}
            </Link>
            <a href="/suggestion" className="site-header-secondary-link">
              {t.suggest}
            </a>
          </nav>

          <div className="site-header-actions hub-static-lang">
            <details className="hub-lang-dropdown">
              <summary className="hub-lang-trigger">
                {locale.toUpperCase()} <span aria-hidden>â–¾</span>
              </summary>
              <ul className="hub-lang-menu">
                {LOCALES.map((code) => (
                  <li key={code}>
                    <Link
                      href={`/${code}`}
                      className={`hub-lang-item${code === locale ? ' is-active' : ''}`}
                      aria-current={code === locale ? 'page' : undefined}
                    >
                      {code.toUpperCase()}
                    </Link>
                  </li>
                ))}
              </ul>
            </details>
            <HubAuthActions locale={locale} login={t.login} register={t.register} myAccount={t.myAccount} />
          </div>
        </div>
      </header>

      <div className="app-shell-main">
        <div className="app-shell-content">{children}</div>
      </div>

      <nav className="bottom-nav hub-static-bottom" aria-label={t.mainNav}>
        {BOTTOM_ITEMS.map((item) => (
          <a
            key={item.id}
            href={item.id === 'home' ? `/${locale}` : item.href}
            className={`nav-item${item.id === 'home' ? ' active' : ''}`}
            aria-current={item.id === 'home' ? 'page' : undefined}
          >
            <span className="nav-icon">
              <NavIcon id={item.id} size={22} />
            </span>
            <span className="nav-label">{t[item.label]}</span>
          </a>
        ))}
      </nav>
    </div>
  );
}
