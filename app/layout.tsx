import type { Metadata } from 'next';
import './globals.css';
import { AdSenseScript } from '@/components/AdSenseScript';
import { getPreferredLocale } from '@/lib/preferredLocale';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://kitabe.org'),
  title: { default: 'Kitabe — Kültürel Miras Rehberi', template: '%s' },
  description: 'Türkiye\'nin tarihi ve kültürel yerlerini keşfedin.',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getPreferredLocale();

  return (
    <html lang={locale}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/icon?family=Material+Icons"
          rel="stylesheet"
        />
      </head>
      <body>
        <AdSenseScript />
        <div className="page-container">{children}</div>
      </body>
    </html>
  );
}
