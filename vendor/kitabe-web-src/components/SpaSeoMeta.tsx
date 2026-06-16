import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { spaSeoForPath } from '../lib/spaSeo';

/** SPA rotalarında noindex + canonical (SEO sayfaları /tr/... ayrı) */
export function SpaSeoMeta() {
  const { pathname } = useLocation();
  const { currentLanguage } = useLanguage();
  const { noindex, canonical } = spaSeoForPath(pathname, currentLanguage);

  if (!noindex && !canonical) return null;

  return (
    <Helmet>
      {noindex ? <meta name="robots" content="noindex, follow" /> : null}
      {canonical ? <link rel="canonical" href={canonical} /> : null}
    </Helmet>
  );
}
