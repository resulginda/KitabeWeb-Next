import type { ExploreCityLocale } from '../data/featuredExploreCities';
import { buildLocaleHubUrl } from '../data/featuredExploreCities';

export type HeaderLinkId = 'cities' | 'blog' | 'about' | 'contact' | 'suggest';

export interface HeaderLinkConfig {
  id: HeaderLinkId;
  labelKey: string;
  /** SPA içi route; yoksa getHref kullanılır */
  path?: string;
  getHref?: (locale: ExploreCityLocale) => string;
  isActive: (pathname: string, locale: ExploreCityLocale) => boolean;
}

export const HEADER_LINKS: HeaderLinkConfig[] = [
  {
    id: 'cities',
    labelKey: 'header.cities',
    getHref: (locale) => buildLocaleHubUrl(locale),
    isActive: (pathname) => /^\/(tr|en|ru|ar)(\/|$)/.test(pathname),
  },
  {
    id: 'blog',
    labelKey: 'header.blog',
    path: '/blog',
    isActive: (pathname) => pathname === '/blog' || pathname.startsWith('/blog/'),
  },
  {
    id: 'about',
    labelKey: 'header.about',
    path: '/hakkimizda',
    isActive: (pathname) => pathname === '/hakkimizda',
  },
  {
    id: 'contact',
    labelKey: 'header.contact',
    path: '/iletisim',
    isActive: (pathname) => pathname === '/iletisim',
  },
  {
    id: 'suggest',
    labelKey: 'header.suggest',
    path: '/suggestion',
    isActive: (pathname) => pathname === '/suggestion' || pathname.startsWith('/edit-suggestion'),
  },
];
