import { AdSenseScript } from '@/components/AdSenseScript';
import { AdResourceHints } from '@/components/AdResourceHints';
import { KitabePageShell } from '@/components/KitabePageShell';

/** Şehir / detay SEO sayfaları — tam SPA header (i18n + auth) */
export default function ContentLocaleLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AdResourceHints />
      <AdSenseScript />
      <KitabePageShell>
        <div className="page-container">{children}</div>
      </KitabePageShell>
    </>
  );
}
