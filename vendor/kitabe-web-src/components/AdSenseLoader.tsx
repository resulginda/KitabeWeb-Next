import { useEffect } from 'react';
import { getAdClientId } from '../lib/adsense';

/** AdSense Auto Ads + manuel birimler — tek seferlik script */
export function AdSenseLoader() {
  useEffect(() => {
    const clientId = getAdClientId();
    if (!clientId) return;

    const src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`;
    if (document.querySelector(`script[src="${src}"]`)) return;

    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.crossOrigin = 'anonymous';
    document.head.appendChild(script);
  }, []);

  return null;
}
