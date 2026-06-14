import { useEffect, useRef } from 'react';
import { readEnv } from '../utils/env';
import { readViteEnv } from '../utils/env.vite';

const DEFAULT_AD_CLIENT = 'ca-pub-2826589713246354';
function adClientId() {
  return (
    readEnv('NEXT_PUBLIC_ADSENSE_CLIENT_ID') ||
    readViteEnv('VITE_ADSENSE_CLIENT_ID') ||
    DEFAULT_AD_CLIENT
  );
}

interface AdSenseBannerProps {
  slot: string;
  format?: 'auto' | 'horizontal' | 'rectangle' | 'vertical';
  style?: React.CSSProperties;
}

const AdSenseBanner = ({ slot, format = 'auto', style }: AdSenseBannerProps) => {
  const adRef = useRef<HTMLDivElement>(null);
  const scriptLoadedRef = useRef(false);

  useEffect(() => {
    // AdSense script'ini dinamik olarak yükle - sadece bu component render edildiğinde
    if (typeof window === 'undefined' || !adRef.current) return;

    const loadAdSenseScript = () => {
      const adClient = adClientId();
      
      // Script'in zaten yüklenip yüklenmediğini kontrol et
      const existingScript = document.querySelector(`script[src*="adsbygoogle.js"]`);
      
      const triggerAd = () => {
        // Reklamı tetikle - ins elementi DOM'da olmalı
        try {
          if (window.adsbygoogle && adRef.current) {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
          }
        } catch (error) {
          console.error('AdSense push error:', error);
        }
      };

      if (!existingScript && !scriptLoadedRef.current) {
        // Script yüklenmemişse yükle
        const script = document.createElement('script');
        script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adClient}`;
        script.async = true;
        script.crossOrigin = 'anonymous';
        script.onload = () => {
          scriptLoadedRef.current = true;
          // Script yüklendikten sonra kısa bir gecikme ile reklamı tetikle
          setTimeout(triggerAd, 100);
        };
        document.head.appendChild(script);
      } else {
        // Script zaten yüklenmiş veya yükleniyor
        scriptLoadedRef.current = true;
        // Kısa bir gecikme ile reklamı tetikle (DOM'un hazır olması için)
        setTimeout(triggerAd, 100);
      }
    };

    // Component mount olduktan sonra script'i yükle
    loadAdSenseScript();
  }, []);

  // AdSense client ID
  const adClient = adClientId();

  return (
    <div ref={adRef}>
      <ins
        className="adsbygoogle"
        style={{ 
          display: 'block',
          ...style
        }}
        data-ad-client={adClient}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
};

export default AdSenseBanner;

