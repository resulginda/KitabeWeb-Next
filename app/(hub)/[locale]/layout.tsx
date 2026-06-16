import { AdSenseScript } from '@/components/AdSenseScript';
import { AdResourceHints } from '@/components/AdResourceHints';
import { HubStaticChrome } from '@/components/HubStaticChrome';
import { LOCALES, type Locale } from '@/lib/places';

export default async function HubLocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const loc = LOCALES.includes(locale as Locale) ? (locale as Locale) : 'tr';

  return (
    <>
      <AdResourceHints />
      <AdSenseScript />
      <HubStaticChrome locale={loc}>
        <div className="page-container">{children}</div>
      </HubStaticChrome>
    </>
  );
}
