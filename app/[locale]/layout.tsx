import { AdSenseScript } from '@/components/AdSenseScript';

/** Tüm SEO locale rotaları: /tr, /en, /ru, /ar ve şehir/detay alt sayfaları */
export default function LocaleLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AdSenseScript />
      {children}
    </>
  );
}
