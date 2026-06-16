import type { Metadata } from 'next';
import './globals.css';
import { GoogleAnalytics } from '@/components/GoogleAnalytics';
import { MetaPixel } from '@/components/MetaPixel';
import { KitabePageShell } from '@/components/KitabePageShell';
import { getPreferredLocale } from '@/lib/preferredLocale';
import { DEFAULT_OG, SITE_URL } from '@/lib/og';
import { siteFontClassName } from '@/lib/siteFonts';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: 'Kitabe — Kültürel Miras Rehberi', template: '%s' },
  description: 'Türkiye\'nin tarihi ve kültürel yerlerini keşfedin.',
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

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getPreferredLocale();

  return (
    <html lang={locale} className={siteFontClassName}>
      <head>
        <style
          dangerouslySetInnerHTML={{
            __html: `@font-face{font-family:'Material Icons';font-style:normal;font-weight:400;font-display:swap;src:url(/fonts/material-icons.woff2) format('woff2');}`,
          }}
        />
        <link rel="apple-touch-icon" href="/icon-180.png" />
        <link rel="preload" href="/fonts/material-icons.woff2" as="font" type="font/woff2" crossOrigin="anonymous" fetchPriority="low" />
      </head>
      <body>
        <GoogleAnalytics />
        <MetaPixel />
        <KitabePageShell>
          <div className="page-container">{children}</div>
        </KitabePageShell>
      </body>
    </html>
  );
}
