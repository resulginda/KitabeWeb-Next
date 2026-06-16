import type { Metadata } from 'next';
import './globals.css';
import { AdSenseScript } from '@/components/AdSenseScript';
import { GoogleAnalytics } from '@/components/GoogleAnalytics';
import { KitabePageShell } from '@/components/KitabePageShell';
import { getPreferredLocale } from '@/lib/preferredLocale';
import { DEFAULT_OG, SITE_URL } from '@/lib/og';

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
    <html lang={locale}>
      <head>
        <link rel="apple-touch-icon" href="/icon.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="preload"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
          href="https://fonts.gstatic.com/s/materialicons/v143/flUhRq6tzZclQEJ-Vdg-IuiaDsNc.woff2"
        />
        <link
          href="https://fonts.googleapis.com/icon?family=Material+Icons"
          rel="stylesheet"
        />
      </head>
      <body>
        <GoogleAnalytics />
        <AdSenseScript />
        <KitabePageShell>
          <div className="page-container">{children}</div>
        </KitabePageShell>
      </body>
    </html>
  );
}
