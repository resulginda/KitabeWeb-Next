import { useEffect } from 'react';
import { readEnv } from '../utils/env';
import { readViteEnv } from '../utils/env.vite';

interface AdBannerProps {
  slot: string;
}

const AdBanner = ({ slot }: AdBannerProps) => {
  useEffect(() => {
    if (window.adsbygoogle) {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    }
  }, []);

  const adClient =
    readEnv('NEXT_PUBLIC_ADMOB_APP_ID') || readViteEnv('VITE_ADMOB_APP_ID') || '';

  return (
    <ins
      className="adsbygoogle"
      style={{ display: 'block' }}
      data-ad-client={adClient}
      data-ad-slot={slot}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
};

export default AdBanner;

