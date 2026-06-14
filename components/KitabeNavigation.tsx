'use client';

import type { Locale } from '@/lib/places';

const LABELS: Record<Locale, { home: string; list: string; nearby: string; route: string; account: string }> = {
  tr: { home: 'Ana Sayfa', list: 'Liste', nearby: 'Yakındakiler', route: 'Rota', account: 'Hesabım' },
  en: { home: 'Home', list: 'List', nearby: 'Nearby', route: 'Route', account: 'Account' },
  ru: { home: 'Главная', list: 'Список', nearby: 'Рядом', route: 'Маршрут', account: 'Аккаунт' },
  ar: { home: 'الرئيسية', list: 'القائمة', nearby: 'بالقرب', route: 'المسار', account: 'حسابي' },
};

/** KitabeWeb alt navigasyon — diğer sayfalar henüz kitabe.org SPA'da */
export function KitabeNavigation({ locale }: { locale: Locale }) {
  const t = LABELS[locale];
  const spa = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'https://kitabe.org';

  const items = [
    { href: `${spa}/home`, label: t.home, icon: '🏠', external: true },
    { href: `${spa}/list`, label: t.list, icon: '📋', external: true },
    { href: `${spa}/nearby`, label: t.nearby, icon: '📍', external: true },
    { href: `${spa}/route`, label: t.route, icon: '🗺️', external: true },
    { href: `${spa}/account`, label: t.account, icon: '👤', external: true },
  ];

  return (
    <nav className="bottom-nav" aria-label="Main navigation">
      {items.map((item) => (
          <a key={item.href} href={item.href} className="nav-item">
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </a>
      ))}
    </nav>
  );
}
