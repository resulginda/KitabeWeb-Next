import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getAdClientId, shouldShowPageAds } from '../lib/adsense';

/** AdSense Auto Ads + manuel birimler — yalnızca reklamlı sayfalarda */
export function AdSenseLoader() {
  const { pathname } = useLocation();

  useEffect(() => {
    if (!shouldShowPageAds(pathname)) return;

    const clientId = getAdClientId();
    if (!clientId) return;

    const src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`;
    if (document.querySelector(`script[src="${src}"]`)) return;

    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.crossOrigin = 'anonymous';
    document.head.appendChild(script);
  }, [pathname]);

  return null;
}
