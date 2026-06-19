import { AdSenseScript } from '@/components/AdSenseScript';
import { AdResourceHints } from '@/components/AdResourceHints';

/** Tüm locale rotaları için paylaşılan layout: /tr, /en, /ru, /ar */
export default function LocaleLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AdResourceHints />
      <AdSenseScript />
      {children}
    </>
  );
}
