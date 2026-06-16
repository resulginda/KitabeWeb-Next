'use client';

import { useTranslation } from 'react-i18next';
import { useAuth } from '@kitabe/contexts/AuthContext';
import { MOBILE_NAV_ITEMS, isNavItemActive } from '@kitabe/config/navItems';
import { NavIcon } from '@kitabe/components/NavIcons';
import type { Locale } from '@/lib/places';

type Props = {
  locale: Locale;
  pathname: string;
};

/** Mobil alt navigasyon — KitabeWeb Navigation ile aynı */
export function KitabeNavigation({ locale, pathname }: Props) {
  const { t } = useTranslation();
  const { kullanici } = useAuth();

  return (
    <nav className="bottom-nav" aria-label={t('navigation.mainNav', { defaultValue: 'Ana menü' })}>
      {MOBILE_NAV_ITEMS.map((item) => {
        const active = isNavItemActive(pathname, item);
        const label =
          item.id === 'account'
            ? kullanici
              ? t(item.accountLabelKey || item.labelKey)
              : t('navigation.account', { defaultValue: 'Hesap' })
            : t(item.labelKey);

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
