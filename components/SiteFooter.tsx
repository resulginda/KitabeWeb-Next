import Link from 'next/link';
import type { Locale } from '@/lib/places';
import { legalPath } from '@/lib/legal/types';

const COPY: Record<
  Locale,
  { about: string; privacy: string; terms: string; contact: string; tagline: string }
> = {
  tr: {
    about: 'Hakkımızda',
    privacy: 'Gizlilik',
    terms: 'Kullanım Koşulları',
    contact: 'İletişim',
    tagline: 'Türkiye kültür mirası rehberi',
  },
  en: {
    about: 'About',
    privacy: 'Privacy',
    terms: 'Terms',
    contact: 'Contact',
    tagline: 'Turkey cultural heritage guide',
  },
  ru: {
    about: 'О нас',
    privacy: 'Конфиденциальность',
    terms: 'Условия',
    contact: 'Контакты',
    tagline: 'Путеводитель по культурному наследию Турции',
  },
  ar: {
    about: 'من نحن',
    privacy: 'الخصوصية',
    terms: 'الشروط',
    contact: 'اتصل بنا',
    tagline: 'دليل التراث الثقافي التركي',
  },
};

/** SSR SEO sayfalarında ortak footer — AdSense güven sinyali */
export function SiteFooter({ locale }: { locale: Locale }) {
  const t = COPY[locale] || COPY.en;
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer site-footer-ssr">
      <div className="site-footer-inner">
        <p className="site-footer-tagline">
          <strong>Kitabe</strong> — {t.tagline}
        </p>
        <nav className="site-footer-nav" aria-label="Legal">
          <Link href={legalPath(locale, 'about')}>{t.about}</Link>
          <Link href={legalPath(locale, 'privacy')}>{t.privacy}</Link>
          <Link href={legalPath(locale, 'terms')}>{t.terms}</Link>
          <Link href={legalPath(locale, 'contact')}>{t.contact}</Link>
        </nav>
        <p className="site-footer-copy">© {year} Kitabe · info@kitabe.org</p>
      </div>
    </footer>
  );
}
