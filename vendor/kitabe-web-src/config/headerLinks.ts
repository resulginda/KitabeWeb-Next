export type ExploreCityLocale = 'tr' | 'en' | 'ru' | 'ar';

export type HeaderLinkId = 'cities' | 'blog' | 'about' | 'contact' | 'suggest';

export interface HeaderLinkConfig {
  id: HeaderLinkId;
  labelKey: string;
  /** SPA içi route; yoksa getHref kullanılır */
  path?: string;
  getHref?: (locale: ExploreCityLocale) => string;
  isActive: (pathname: string, locale: ExploreCityLocale) => boolean;
}

function buildLocaleHubUrl(locale: ExploreCityLocale): string {
  const origin =
    typeof window !== 'undefined' ? window.location.origin : 'https://kitabe.org';
  return `${origin}/${locale}`;
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
    getHref: (locale) => `/legal/${locale}/about`,
    isActive: (pathname) =>
      pathname === '/hakkimizda' || /^\/legal\/[^/]+\/about$/.test(pathname),
  },
  {
    id: 'contact',
    labelKey: 'header.contact',
    getHref: (locale) => `/legal/${locale}/contact`,
    isActive: (pathname) =>
      pathname === '/iletisim' || /^\/legal\/[^/]+\/contact$/.test(pathname),
  },
  {
    id: 'suggest',
    labelKey: 'header.suggest',
    path: '/suggestion',
    isActive: (pathname) =>
      pathname === '/suggestion' || pathname.startsWith('/edit-suggestion'),
  },
];
