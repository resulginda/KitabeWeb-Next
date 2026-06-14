import { Outlet, useLocation } from 'react-router-dom';
import Navigation from './Navigation';
import Footer from './Footer';
import { PageAdLayout } from './PageAdLayout';
import { shouldShowPageAds } from '../lib/adsense';

const NO_FOOTER = new Set(['/', '/login', '/register', '/reset-password']);

export function MainLayout() {
  const { pathname } = useLocation();
  const showAds = shouldShowPageAds(pathname);
  const showFooter = !NO_FOOTER.has(pathname);
  const isLanding = pathname === '/';

  return (
    <>
      {showAds ? (
        <PageAdLayout key={pathname}>
          <Outlet />
        </PageAdLayout>
      ) : (
        <Outlet />
      )}
      {!isLanding && <Navigation />}
      {showFooter && <Footer />}
    </>
  );
}
