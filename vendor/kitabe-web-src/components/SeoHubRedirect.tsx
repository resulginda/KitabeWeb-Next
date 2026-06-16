import { useEffect } from 'react';
import { getInitialAppLanguage } from '../utils/detectLocale';

/** SPA / rotası — SEO locale hub'a yönlendir (/tr, /en, …) */
export function SeoHubRedirect() {
  useEffect(() => {
    const locale = getInitialAppLanguage();
    window.location.replace(`/${locale}`);
  }, []);

  return null;
}
