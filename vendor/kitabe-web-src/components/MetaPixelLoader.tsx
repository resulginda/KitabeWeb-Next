import { useEffect } from 'react';

const PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID ?? '1693954058304683';

/** Meta (Facebook) Pixel — SPA sayfaları (/home, /list, /app…) */
export function MetaPixelLoader() {
  useEffect(() => {
    if (!PIXEL_ID || document.getElementById('meta-pixel')) return;

    const inject = () => {
      if (document.getElementById('meta-pixel')) return;
      const script = document.createElement('script');
      script.id = 'meta-pixel';
      script.innerHTML = `
      !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window,document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', '${PIXEL_ID}');
      fbq('track', 'PageView');
    `;
      document.head.appendChild(script);
    };

    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(inject, { timeout: 3500 });
      return () => window.cancelIdleCallback(id);
    }

    const onLoad = () => window.setTimeout(inject, 1);
    window.addEventListener('load', onLoad, { once: true });
    return () => window.removeEventListener('load', onLoad);
  }, []);

  if (!PIXEL_ID) return null;

  return (
    <noscript>
      <img
        height="1"
        width="1"
        style={{ display: 'none' }}
        src={`https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`}
        alt=""
      />
    </noscript>
  );
}
