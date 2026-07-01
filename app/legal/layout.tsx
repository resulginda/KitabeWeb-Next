import '../../seo-pages.css';
import { KitabePageShell } from '@/components/KitabePageShell';

/** Yasal sayfalar — şehir/liste sayfalarıyla aynı üst menü + alt navigasyon */
export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <KitabePageShell>
      <div className="page-container legal-page-container">{children}</div>
    </KitabePageShell>
  );
}
