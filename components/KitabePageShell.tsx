'use client';

import { usePathname } from 'next/navigation';
import { LOCALES, type Locale } from '@/lib/places';
import { IconFontLoader } from '@kitabe/components/IconFontLoader';
import { DesktopSidebarNext } from './DesktopSidebarNext';
import { DesktopHeaderNext } from './DesktopHeaderNext';
import { KitabeNavigation } from './KitabeNavigation';

function localeFromPath(pathname: string): Locale {
  const first = pathname.split('/').filter(Boolean)[0];
  return (LOCALES as readonly string[]).includes(first) ? (first as Locale) : 'tr';
}

/** Tüm Next.js SEO sayfaları: masaüstü sidebar + header, mobil alt nav */
export function KitabePageShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const locale = localeFromPath(pathname);

  return (
    <div className="app-shell">
      <IconFontLoader />
      <DesktopSidebarNext locale={locale} pathname={pathname} />
      <div className="app-shell-main">
        <DesktopHeaderNext locale={locale} pathname={pathname} />
        <div className="app-shell-content">{children}</div>
      </div>
      <KitabeNavigation locale={locale} />
    </div>
  );
}
