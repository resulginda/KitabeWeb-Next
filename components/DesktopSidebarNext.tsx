'use client';

import { NavIcon } from '@kitabe/components/NavIcons';
import { NAV_ITEMS, isNavItemActive } from '@kitabe/config/navItems';
import type { Locale } from '@/lib/places';

const LABELS: Record<
  Locale,
  { home: string; list: string; nearby: string; route: string; account: string; login: string }
> = {
  tr: {
    home: 'Ana Sayfa',
    list: 'Liste',
    nearby: 'Yakınımdakiler',
    route: 'Rota',
    account: 'Hesabım',
    login: 'Giriş / Kayıt Ol',
  },
  en: {
    home: 'Home',
    list: 'List',
    nearby: 'Nearby',
    route: 'Route',
    account: 'Account',
    login: 'Login / Register',
  },
  ru: {
    home: 'Главная',
    list: 'Список',
    nearby: 'Рядом',
    route: 'Маршрут',
    account: 'Аккаунт',
    login: 'Вход / Регистрация',
  },
  ar: {
    home: 'الرئيسية',
    list: 'القائمة',
    nearby: 'بالقرب',
    route: 'المسار',
    account: 'حسابي',
    login: 'تسجيل الدخول',
  },
};

type Props = {
  locale: Locale;
  pathname: string;
};

/** SPA rotalarına giden sol sidebar (KitabeWeb ile aynı görünüm) */
export function DesktopSidebarNext({ locale, pathname }: Props) {
  const t = LABELS[locale];

  return (
    <aside className="desktop-sidebar" aria-label="Main menu">
      <div className="desktop-sidebar-inner">
        <a href="/home" className="desktop-sidebar-brand" title="Kitabe">
          <img src="/icon.png" alt="" className="desktop-sidebar-logo" />
          <span className="desktop-sidebar-brand-text">Kitabe</span>
        </a>

        <nav className="desktop-sidebar-nav">
          {NAV_ITEMS.map((item) => {
            const active = isNavItemActive(pathname, item);
            const label =
              item.id === 'account' ? t.login : t[item.id as keyof typeof t] || item.id;

            return (
              <a
                key={item.id}
                href={item.path}
                className={`desktop-sidebar-link ${active ? 'active' : ''}`}
                title={label}
              >
                <span className="desktop-sidebar-icon">
                  <NavIcon id={item.id} />
                </span>
                <span className="desktop-sidebar-label">{label}</span>
              </a>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
