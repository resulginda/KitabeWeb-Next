'use client';

import { usePathname } from 'next/navigation';
import { AuthProvider } from '@kitabe/contexts/AuthContext';
import { LanguageProvider } from '@kitabe/contexts/LanguageContext';
import { IconFontLoader } from '@kitabe/components/IconFontLoader';
import { LOCALES, type Locale } from '@/lib/places';
import { SiteHeaderNext } from './SiteHeaderNext';
import { KitabeNavigation } from './KitabeNavigation';
import '@/lib/i18n-client';

function localeFromPath(pathname: string): Locale {
  const first = pathname.split('/').filter(Boolean)[0];
  return (LOCALES as readonly string[]).includes(first) ? (first as Locale) : 'tr';
}

/** KitabeWeb AppShell + SiteHeader — SEO sayfalarında aynı üst menü */
export function KitabePageShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const locale = localeFromPath(pathname);

  return (
    <AuthProvider>
      <LanguageProvider defaultLanguage={locale} localeFromUrl={locale}>
        <IconFontLoader />
        <div className="app-shell">
          <SiteHeaderNext locale={locale} pathname={pathname} />
          <div className="app-shell-main">
            <div className="app-shell-content">{children}</div>
          </div>
        </div>
        <KitabeNavigation locale={locale} pathname={pathname} />
      </LanguageProvider>
    </AuthProvider>
  );
}
