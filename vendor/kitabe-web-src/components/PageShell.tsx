import { forwardRef, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export type PageShellProps = {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  backTo?: string;
  backLabel?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  shellClassName?: string;
  /** Geri butonu gizle */
  hideBack?: boolean;
};

export function PageShell({
  title,
  subtitle,
  eyebrow,
  backTo = '/account',
  backLabel,
  actions,
  children,
  className = '',
  shellClassName = '',
  hideBack = false,
}: PageShellProps) {
  const { t } = useTranslation();
  const tokens = className.split(/\s+/).filter(Boolean);
  const shellTokens = shellClassName.split(/\s+/).filter(Boolean);
  const isWide = tokens.includes('kb-page-wide') || shellTokens.includes('kb-page-wide');
  const isFull = tokens.includes('kb-page-full') || shellTokens.includes('kb-page-full');
  const pageClassName = tokens.filter((c) => c !== 'kb-page-wide' && c !== 'kb-page-full').join(' ');
  const extraShellClass = shellTokens.filter((c) => c !== 'kb-page-wide' && c !== 'kb-page-full').join(' ');

  return (
    <div className={`kb-page ${pageClassName}`.trim()}>
      <div
        className={`kb-page-shell ${isWide ? 'kb-page-wide' : ''} ${isFull ? 'kb-page-full' : ''} ${extraShellClass}`.trim()}
      >
        <header className="kb-page-header">
          <div className="kb-page-topbar">
            {!hideBack && backTo && (
              <Link to={backTo} className="kb-page-back">
                <span className="material-icons" aria-hidden>
                  arrow_back
                </span>
                {backLabel ?? t('common.back', 'Geri')}
              </Link>
            )}
            <div className="kb-page-header-text">
              {eyebrow && <p className="kb-page-eyebrow">{eyebrow}</p>}
              <h1>{title}</h1>
              {subtitle && <p className="kb-page-subtitle">{subtitle}</p>}
            </div>
            {actions && <div className="kb-page-actions">{actions}</div>}
          </div>
        </header>
        <div className="kb-page-body">{children}</div>
      </div>
    </div>
  );
}

export type PageSectionProps = {
  title?: string;
  children: ReactNode;
  className?: string;
  danger?: boolean;
};

export const PageSection = forwardRef<
  HTMLElement,
  PageSectionProps
>(function PageSection({ title, children, className = '', danger }, ref) {
  return (
    <section
      ref={ref}
      className={`kb-page-section ${danger ? 'is-danger' : ''} ${className}`.trim()}
    >
      {title && <h2 className="kb-page-section-title">{title}</h2>}
      {children}
    </section>
  );
});

export type PageTile = {
  to: string;
  icon: string;
  label: string;
  badge?: number;
  accent?: boolean;
};

export function PageTileGrid({ tiles }: { tiles: PageTile[] }) {
  return (
    <div className="kb-account-grid">
      {tiles.map((tile) => (
        <Link key={tile.to} to={tile.to} className={`kb-account-tile ${tile.accent ? 'is-accent' : ''}`}>
          <span className="kb-account-tile-icon" aria-hidden>
            <span className="material-icons">{tile.icon}</span>
          </span>
          <span className="kb-account-tile-label">{tile.label}</span>
          {tile.badge !== undefined && tile.badge > 0 && (
            <span className="account-badge">{tile.badge > 99 ? '99+' : tile.badge}</span>
          )}
        </Link>
      ))}
    </div>
  );
}

export function PageEmpty({
  icon = 'inbox',
  title,
  subtitle,
}: {
  icon?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="kb-page-empty">
      <span className="material-icons kb-page-empty-icon" aria-hidden>
        {icon}
      </span>
      <p className="kb-page-empty-title">{title}</p>
      {subtitle && <p className="kb-page-empty-sub">{subtitle}</p>}
    </div>
  );
}

export function PageLoginRequired({ message, loginPath = '/login' }: { message: string; loginPath?: string }) {
  const { t } = useTranslation();
  return (
    <PageShell title={t('account.myAccount')} hideBack>
      <div className="kb-page-login-required">
        <span className="material-icons" aria-hidden>
          lock
        </span>
        <p>{message}</p>
        <Link to={loginPath} className="btn btn-primary">
          {t('common.login')}
        </Link>
      </div>
    </PageShell>
  );
}
