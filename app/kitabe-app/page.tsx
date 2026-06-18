import SpaHost from '@/components/SpaHost';

/**
 * SPA barındırma rotası. Doğrudan ziyaret edilmez; middleware app path'lerini
 * (örn. /login, /home, /account) URL'i koruyarak buraya rewrite eder.
 */
export const dynamic = 'force-static';

export default function KitabeSpaRoute() {
  return <SpaHost />;
}
