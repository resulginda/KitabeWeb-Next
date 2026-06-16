import Script from 'next/script';
import { getAdClientId } from '@/lib/adsense';

/** AdSense Auto Ads + manuel birimler için global script */
export function AdSenseScript() {
  const clientId = getAdClientId();
  if (!clientId) return null;

  return (
    <Script
      id="adsense-init"
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`}
      crossOrigin="anonymous"
      strategy="lazyOnload"
    />
  );
}
