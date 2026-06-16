'use client';

import { useAuth } from '@kitabe/contexts/AuthContext';
import { MOBILE_NAV_ITEMS, isNavItemActive } from '@kitabe/config/navItems';
import { NavIcon } from '@kitabe/components/NavIcons';
import type { Locale } from '@/lib/places';
import { HUB_HEADER_COPY } from '@/lib/hubHeaderCopy';

type Props = {
  locale: Locale;
  pathname: string;
};

const BOTTOM_LABEL: Record<string, keyof (typeof HUB_HEADER_COPY)['tr']> = {
  home: 'bottomHome',
  list: 'bottomList',
  nearby: 'bottomNearby',
  route: 'bottomRoute',
  account: 'bottomAccount',
};

/** Mobil alt navigasyon — URL locale statik etiketler */
export function KitabeNavigation({ locale, pathname }: Props) {
  const { kullanici } = useAuth();
  const copy = HUB_HEADER_COPY[locale];

  return (
    <nav className="bottom-nav" aria-label={copy.mainNav}>
      {MOBILE_NAV_ITEMS.map((item) => {
        const active = isNavItemActive(pathname, item);
        const labelKey = BOTTOM_LABEL[item.id];
        const label = labelKey ? copy[labelKey] : item.id;

        const needsAuth = (item.id === 'nearby' || item.id === 'route') && !kullanici;
        const href =
          item.id === 'account' && !kullanici ? '/login' : needsAuth ? '/login' : item.path;

        return (
          <a key={item.id} href={href} className={`nav-item ${active ? 'active' : ''}`}>
            <span className="nav-icon">
              <NavIcon id={item.id} size={22} />
            </span>
            <span className="nav-label">{label}</span>
          </a>
        );
      })}
    </nav>
  );
}
