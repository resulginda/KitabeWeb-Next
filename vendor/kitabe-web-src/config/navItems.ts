export type NavItemId = 'home' | 'list' | 'nearby' | 'route' | 'account';

export interface NavItemConfig {
  id: NavItemId;
  path: string;
  labelKey: string;
  accountLabelKey?: string;
  matchPaths?: string[];
}

/** Ust header — giris/kayit burada yok (sagdaki buton yeterli) */
export const HEADER_NAV_ITEMS: NavItemConfig[] = [
  { id: 'home', path: '/tr', labelKey: 'navigation.home', matchPaths: ['/', '/tr', '/en', '/ru', '/ar'] },
  { id: 'list', path: '/list', labelKey: 'navigation.list' },
  { id: 'nearby', path: '/nearby', labelKey: 'navigation.nearby' },
  { id: 'route', path: '/route', labelKey: 'navigation.route' },
];

/** Mobil alt menu — hesap erisimi */
export const MOBILE_NAV_ITEMS: NavItemConfig[] = [
  ...HEADER_NAV_ITEMS,
  {
    id: 'account',
    path: '/account',
    labelKey: 'navigation.account',
    accountLabelKey: 'account.myAccount',
  },
];

/** Geriye uyumluluk */
export const NAV_ITEMS = MOBILE_NAV_ITEMS;

const HOME_LOCALES = ['tr', 'en', 'ru', 'ar'];

/** Ana sayfa SSR dil sayfasıdır (Next.js); SPA router'ı dışında, tam sayfa geçişle açılır. */
export function localeHomePath(language?: string | null): string {
  const lang = (language || '').slice(0, 2).toLowerCase();
  return `/${HOME_LOCALES.includes(lang) ? lang : 'tr'}`;
}

export function navItemHref(item: NavItemConfig, language?: string | null): string {
  return item.id === 'home' ? localeHomePath(language) : item.path;
}

export function isNavItemActive(pathname: string, item: NavItemConfig): boolean {
  if (item.matchPaths?.includes(pathname)) return true;
  if (item.id === 'account') {
    return pathname === '/account' || pathname.startsWith('/account-');
  }
  return pathname === item.path;
}
