'use client';

import { useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { AuthProvider } from '@kitabe/contexts/AuthContext';
import {
  LanguageProvider,
  type Language,
  type SeoLocaleSwitchResolver,
} from '@kitabe/contexts/LanguageContext';
import { IconFontLoader } from '@kitabe/components/IconFontLoader';
import { LOCALES, type Locale } from '@/lib/places';
import { mapSeoPathToLocaleQuick } from '@/lib/seoLocaleSwitch';
import { SiteHeaderNext } from './SiteHeaderNext';
import { KitabeNavigation } from './KitabeNavigation';

function localeFromPath(pathname: string): Locale {
  const segments = pathname.split('/').filter(Boolean);
  if (segments[0] === 'legal' && segments[1] && (LOCALES as readonly string[]).includes(segments[1])) {
    return segments[1] as Locale;
  }
  const first = segments[0];
  return (LOCALES as readonly string[]).includes(first) ? (first as Locale) : 'tr';
}

function isSeoLocalePath(pathname: string): boolean {
  const segments = pathname.split('/').filter(Boolean);
  if (segments[0] === 'legal') return true;
  return (LOCALES as readonly string[]).includes(segments[0]);
}

/** KitabeWeb AppShell + SiteHeader — SEO sayfalarında aynı üst menü */
export function KitabePageShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const locale = localeFromPath(pathname);

  const resolveSeoLocaleSwitch = useCallback<SeoLocaleSwitchResolver>(
    async (target: Language, path: string) => {
      if (!isSeoLocalePath(path)) return null;
      try {
        const res = await fetch(
          `/api/locale-path?locale=${encodeURIComponent(target)}&path=${encodeURIComponent(path)}`
        );
        if (res.ok) {
          const data = (await res.json()) as { path?: string };
          if (data.path) return data.path;
        }
      } catch {
        /* ağ hatası — istemci yedeği */
      }
      return mapSeoPathToLocaleQuick(path, target as Locale);
    },
    []
  );

  return (
    <AuthProvider>
      <LanguageProvider
        defaultLanguage={locale}
        localeFromUrl={isSeoLocalePath(pathname) ? locale : undefined}
        resolveSeoLocaleSwitch={resolveSeoLocaleSwitch}
      >
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
