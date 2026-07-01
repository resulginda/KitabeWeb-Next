import Link from 'next/link';
import { LOCALES, type Locale } from '@/lib/places';
import { legalPath } from '@/lib/legal/types';
import { siteLogoHeader } from '@/lib/siteLogo';
import { HUB_HEADER_COPY } from '@/lib/hubHeaderCopy';

/** Hub (/tr …) — istemci JS yok; PageSpeed için statik header + alt nav */
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
          <a href="/home" className="site-header-logo" title="Kitabe">
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
            <a href="/home" className="site-header-nav-link">
              <span className="site-header-nav-label">{t.home}</span>
            </a>
            <a href="/list" className="site-header-nav-link">
              <span className="site-header-nav-label">{t.list}</span>
            </a>
            <a href="/login" className="site-header-nav-link">
              <span className="site-header-nav-label">{t.nearby}</span>
            </a>
            <a href="/login" className="site-header-nav-link">
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
                {locale.toUpperCase()} <span aria-hidden>▾</span>
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
            <a href="/login" className="btn btn-secondary btn-sm site-header-login">
              {t.login}
            </a>
            <a href="/register" className="btn btn-primary btn-sm site-header-register">
              {t.register}
            </a>
          </div>
        </div>
      </header>

      <div className="app-shell-main">
        <div className="app-shell-content">{children}</div>
      </div>

      <nav className="bottom-nav hub-static-bottom" aria-label={t.mainNav}>
        <a href="/home" className="bottom-nav-link">
          <span className="bottom-nav-label">{t.bottomHome}</span>
        </a>
        <a href="/list" className="bottom-nav-link">
          <span className="bottom-nav-label">{t.bottomList}</span>
        </a>
        <a href="/login" className="bottom-nav-link">
          <span className="bottom-nav-label">{t.bottomNearby}</span>
        </a>
        <a href="/login" className="bottom-nav-link">
          <span className="bottom-nav-label">{t.bottomRoute}</span>
        </a>
        <a href="/account" className="bottom-nav-link">
          <span className="bottom-nav-label">{t.bottomAccount}</span>
        </a>
      </nav>
    </div>
  );
}
