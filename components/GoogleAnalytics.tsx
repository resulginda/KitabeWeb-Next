import Script from 'next/script';

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? 'G-N89V8B16M4';

/**
 * Google Analytics 4.
 * Bot / headless / webdriver'da gtag hiç yüklenmez — GA4 benzersiz kullanıcı şişmesin.
 */
export function GoogleAnalytics() {
  if (!GA_ID) return null;

  return (
    <Script id="google-analytics" strategy="lazyOnload">
      {`
        (function () {
          try {
            if (/^\\/(reset-password|verify-email)/.test(location.pathname)) return;
            try {
              if (localStorage.getItem('kitabe_ga_optout') === '1') {
                window['ga-disable-${GA_ID}'] = true;
                return;
              }
            } catch (e) {}
            if (window['ga-disable-${GA_ID}']) return;
            var ua = navigator.userAgent || '';
            if (navigator.webdriver) return;
            if (/bot|crawler|spider|slurp|Keenable|ExaSearch|HeadlessChrome|PhantomJS|Puppeteer|Playwright|Scrapy|python-requests|Bytespider|GPTBot|ClaudeBot|CCBot|OAI-SearchBot|Amzn-SearchBot|AhrefsBot|SemrushBot|DataForSeo|BLEXBot|PetalBot|MJ12bot|DotBot/i.test(ua)) return;
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            window.gtag = gtag;
            gtag('js', new Date());
            gtag('config', '${GA_ID}', { page_location: location.origin + location.pathname });
            var s = document.createElement('script');
            s.async = true;
            s.src = 'https://www.googletagmanager.com/gtag/js?id=${GA_ID}';
            document.head.appendChild(s);
          } catch (e) {}
        })();
      `}
    </Script>
  );
}
