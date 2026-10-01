import Script from 'next/script';

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? 'G-N89V8B16M4';

/** Google Analytics 4 — detay ve liste sayfaları */
export function GoogleAnalytics() {
  if (!GA_ID) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="lazyOnload"
      />
      <Script id="google-analytics" strategy="lazyOnload">
        {`
          if (!/^\\/(reset-password|verify-email)/.test(location.pathname)) {
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}', { page_location: location.origin + location.pathname });
          }
        `}
      </Script>
    </>
  );
}
