import type { Metadata } from 'next';
import './globals.css';
import { GoogleAnalytics } from '@/components/GoogleAnalytics';
import { MetaPixel } from '@/components/MetaPixel';
import AppBanner from '@/components/AppBanner';
import { DEFAULT_OG, SITE_URL } from '@/lib/og';
import { siteFontClassName } from '@/lib/siteFonts';
import { HUB_CRITICAL_CSS } from '@/lib/hubCriticalCss';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: 'Kitabe — Kültürel Miras Rehberi', template: '%s' },
  description: 'Türkiye\'nin tarihi ve kültürel yerlerini keşfedin.',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.png', type: 'image/png', sizes: '32x32' },
    ],
    apple: '/icon-180.png',
    shortcut: '/favicon.ico',
  },
  openGraph: {
    ...DEFAULT_OG,
    title: 'Kitabe — Türkiye Kültürel Miras Rehberi',
    description:
      'Türkiye\'nin tarihi yerleri, müzeleri, antik kentleri ve doğal güzellikleri. Harita, hikâye ve gezi önerileri.',
    url: SITE_URL,
    locale: 'tr_TR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kitabe — Türkiye Kültürel Miras Rehberi',
    description: 'Türkiye\'nin kültürel mirasını keşfedin.',
    images: [DEFAULT_OG.images[0].url],
  },
};

/**
 * Kök layout BİLEREK statiktir: cookies()/headers() gibi dinamik API kullanmaz.
 * Aksi halde tüm alt rotalar (statik SEO hub/detay sayfaları ve force-static
 * SPA host'u) dinamiğe zorlanır ve `DYNAMIC_SERVER_USAGE` ile patlardı.
 * `lang`/`dir` istemcide URL'in ilk segmentinden düzeltilir; içerik dili zaten
 * `[locale]` rotasından ve sayfa metadata'sından doğru şekilde gelir.
 */
const LANG_DIR_SCRIPT = `(function(){try{var s=location.pathname.split('/')[1];if(['tr','en','ru','ar'].indexOf(s)>-1){var d=document.documentElement;d.lang=s;d.dir=s==='ar'?'rtl':'ltr';}}catch(e){}})();`;

// Eski Vite PWA'nın bıraktığı service worker'ları iptal et.
// Vite'tan Next.js'e geçişte kalan SW'lar CSS chunk'larını yanlış cache'leyip
// ChunkLoadError'a yol açıyordu.
const SW_KILL_SCRIPT = `(function(){if('serviceWorker' in navigator){navigator.serviceWorker.getRegistrations().then(function(r){r.forEach(function(sw){sw.unregister();});});}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={siteFontClassName}>
      <head>
        <style
          dangerouslySetInnerHTML={{
            __html: HUB_CRITICAL_CSS,
          }}
        />
        <script dangerouslySetInnerHTML={{ __html: LANG_DIR_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: SW_KILL_SCRIPT }} />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.png" type="image/png" sizes="32x32" />
        <link rel="apple-touch-icon" href="/icon-180.png" />
        <link rel="stylesheet" href="/fonts/kitabe-fonts.css" />
      </head>
      <body>
        <GoogleAnalytics />
        <MetaPixel />
        {children}
        <AppBanner />
      </body>
    </html>
  );
}
