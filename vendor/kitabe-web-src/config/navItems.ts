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
  { id: 'home', path: '/home', labelKey: 'navigation.home', matchPaths: ['/', '/home'] },
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

export function isNavItemActive(pathname: string, item: NavItemConfig): boolean {
  if (item.matchPaths?.includes(pathname)) return true;
  if (item.id === 'account') {
    return pathname === '/account' || pathname.startsWith('/account-');
  }
  return pathname === item.path;
}
