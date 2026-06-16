const SITE = 'https://kitabe.org';

/** SPA uygulama rotaları — indexlenmemeli */
const NOINDEX_EXACT = new Set([
  '/home',
  '/list',
  '/nearby',
  '/route',
  '/account',
  '/account-settings',
  '/favorites',
  '/notifications',
  '/notification-settings',
  '/login',
  '/register',
  '/profile',
  '/suggestion',
  '/my-suggestions',
  '/language-selection',
  '/stats',
  '/delete-account',
  '/hesap-silme',
  '/reset-password',
  '/app',
]);

const NOINDEX_PREFIXES = [
  '/detail/',
  '/admin',
  '/editor-panel',
  '/user-management',
  '/photo-approval',
  '/rating-approval',
  '/edit-suggestion/',
];

/** SEO hub sayfasına canonical verilecek SPA girişleri */
const CANONICAL_HUB: Record<string, true> = {
  '/home': true,
  '/list': true,
};

export function spaSeoForPath(pathname: string, locale: string): {
  noindex: boolean;
  canonical?: string;
} {
  if (NOINDEX_EXACT.has(pathname)) {
    const loc = locale === 'tr' || locale === 'en' || locale === 'ru' || locale === 'ar' ? locale : 'tr';
    return {
      noindex: true,
      canonical: CANONICAL_HUB[pathname] ? `${SITE}/${loc}` : undefined,
    };
  }

  if (NOINDEX_PREFIXES.some((p) => pathname.startsWith(p))) {
    return { noindex: true };
  }

  return { noindex: false };
}
