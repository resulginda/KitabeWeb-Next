'use client';

import { NavIcon } from '@kitabe/components/NavIcons';
import { NAV_ITEMS } from '@kitabe/config/navItems';
import type { Locale } from '@/lib/places';

const LABELS: Record<Locale, Record<string, string>> = {
  tr: {
    home: 'Ana Sayfa',
    list: 'Liste',
    nearby: 'Yakınımdakiler',
    route: 'Rota',
    account: 'Hesabım',
  },
  en: {
    home: 'Home',
    list: 'List',
    nearby: 'Nearby',
    route: 'Route',
    account: 'Account',
  },
  ru: {
    home: 'Главная',
    list: 'Список',
    nearby: 'Рядом',
    route: 'Маршрут',
    account: 'Аккаунт',
  },
  ar: {
    home: 'الرئيسية',
    list: 'القائمة',
    nearby: 'بالقرب',
    route: 'المسار',
    account: 'حسابي',
  },
};

/** Mobil alt navigasyon — masaüstünde CSS ile gizlenir */
export function KitabeNavigation({ locale }: { locale: Locale }) {
  const t = LABELS[locale];

  return (
    <nav className="bottom-nav" aria-label="Main navigation">
      {NAV_ITEMS.map((item) => (
        <a key={item.id} href={item.path} className="nav-item">
          <span className="nav-icon">
            <NavIcon id={item.id} size={22} />
          </span>
          <span className="nav-label">{t[item.id]}</span>
        </a>
      ))}
    </nav>
  );
}
