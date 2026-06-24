import '../../seo-pages.css';
import { KitabePageShell } from '@/components/KitabePageShell';

/**
 * Şehir / detay SEO sayfaları — tam SPA header (i18n + auth).
 * Reklam script/hint'leri üst `[locale]` layout'tan gelir; burada tekrar edilmez.
 * NOT: Hub sayfası (`/[locale]`) bu layout'a girmez, kendi hafif chrome'unu kullanır.
 */
export default function CitySeoLayout({ children }: { children: React.ReactNode }) {
  return (
    <KitabePageShell>
      <div className="page-container">{children}</div>
    </KitabePageShell>
  );
}
