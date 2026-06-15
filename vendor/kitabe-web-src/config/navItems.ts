export type NavItemId = 'home' | 'list' | 'nearby' | 'route' | 'account';

export interface NavItemConfig {
  id: NavItemId;
  path: string;
  labelKey: string;
  accountLabelKey?: string;
  matchPaths?: string[];
}

export const NAV_ITEMS: NavItemConfig[] = [
  { id: 'home', path: '/home', labelKey: 'navigation.home', matchPaths: ['/', '/home'] },
  { id: 'list', path: '/list', labelKey: 'navigation.list' },
  { id: 'nearby', path: '/nearby', labelKey: 'navigation.nearby' },
  { id: 'route', path: '/route', labelKey: 'navigation.route' },
  {
    id: 'account',
    path: '/account',
    labelKey: 'navigation.loginRegister',
    accountLabelKey: 'account.myAccount',
  },
];

export function isNavItemActive(pathname: string, item: NavItemConfig): boolean {
  if (item.matchPaths?.includes(pathname)) return true;
  return pathname === item.path;
}
