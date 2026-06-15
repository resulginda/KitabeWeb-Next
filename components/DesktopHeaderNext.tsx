'use client';

import Link from 'next/link';
import { HEADER_LINKS } from '@kitabe/config/headerLinks';
import type { Locale } from '@/lib/places';

const LABELS: Record<
  Locale,
  {
    cities: string;
    blog: string;
    about: string;
    contact: string;
    suggest: string;
    account: string;
    login: string;
  }
> = {
  tr: {
    cities: 'Şehirler',
    blog: 'Blog',
    about: 'Hakkımızda',
    contact: 'İletişim',
    suggest: 'Yer Öner',
    account: 'Hesabım',
    login: 'Giriş / Kayıt Ol',
  },
  en: {
    cities: 'Cities',
    blog: 'Blog',
    about: 'About',
    contact: 'Contact',
    suggest: 'Suggest a Place',
    account: 'Account',
    login: 'Login / Register',
  },
  ru: {
    cities: 'Города',
    blog: 'Блог',
    about: 'О нас',
    contact: 'Контакты',
    suggest: 'Предложить место',
    account: 'Аккаунт',
    login: 'Вход / Регистрация',
  },
  ar: {
    cities: 'المدن',
    blog: 'المدونة',
    about: 'من نحن',
    contact: 'اتصل بنا',
    suggest: 'اقترح مكانًا',
    account: 'حسابي',
    login: 'تسجيل الدخول',
  },
};

type Props = {
  locale: Locale;
  pathname: string;
};

export function DesktopHeaderNext({ locale, pathname }: Props) {
  const t = LABELS[locale];

  return (
    <header className="desktop-header">
      <nav className="desktop-header-nav" aria-label="Site menu">
        {HEADER_LINKS.map((item) => {
          const active = item.isActive(pathname, locale);
          const label = t[item.id as keyof typeof t] || item.id;
          const className = `desktop-header-link ${active ? 'active' : ''}`;

          if (item.id === 'cities') {
            return (
              <Link key={item.id} href={`/${locale}`} className={className}>
                {label}
              </Link>
            );
          }

          if (item.path) {
            return (
              <a key={item.id} href={item.path} className={className}>
                {label}
              </a>
            );
          }

          return null;
        })}
      </nav>

      <div className="desktop-header-actions">
        <a href="/language-selection" className="desktop-header-chip" title="Language">
          {locale.toUpperCase()}
        </a>
        <a href="/account" className="desktop-header-account">
          <span className="desktop-header-account-avatar" aria-hidden>
            K
          </span>
          <span className="desktop-header-account-label">{t.login}</span>
        </a>
      </div>
    </header>
  );
}
