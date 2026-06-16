import { Outlet, useLocation } from 'react-router-dom';
import Navigation from './Navigation';
import Footer from './Footer';
import { PageAdLayout } from './PageAdLayout';
import { AppShell } from './AppShell';
import { shouldShowPageAds } from '../lib/adsense';

const NO_CHROME = new Set(['/login', '/register', '/reset-password']);
const NO_FOOTER = new Set(['/', '/login', '/register', '/reset-password', '/list', '/nearby', '/route']);
/** Tam genislik — ust reklam yok, sadece alt reklam */
const FULL_WIDTH_EXACT = new Set([
  '/home',
  '/list',
  '/nearby',
  '/route',
  '/account',
  '/account-settings',
  '/profile',
  '/favorites',
  '/notifications',
  '/notification-settings',
  '/suggestion',
  '/my-suggestions',
]);

function isFullWidthAds(pathname: string): boolean {
  if (FULL_WIDTH_EXACT.has(pathname)) return true;
  if (pathname.startsWith('/edit-suggestion')) return true;
  if (pathname.startsWith('/admin')) return true;
  if (
    pathname.startsWith('/editor-panel') ||
    pathname.startsWith('/user-management') ||
    pathname.startsWith('/photo-approval') ||
    pathname.startsWith('/rating-approval') ||
    pathname.startsWith('/stats')
  ) {
    return true;
  }
  return false;
}

export function MainLayout() {
  const { pathname } = useLocation();
  const showAds = shouldShowPageAds(pathname);
  const showChrome = !NO_CHROME.has(pathname);
  const showFooter = !NO_FOOTER.has(pathname);
  const showBottomNav = showChrome;
  const fullWidthAds = isFullWidthAds(pathname);

  const page = showAds ? (
    <PageAdLayout key={pathname} fullWidth={fullWidthAds}>
      <Outlet />
    </PageAdLayout>
  ) : (
    <Outlet />
  );

  return (
    <>
      <AppShell showChrome={showChrome} footer={showFooter ? <Footer /> : undefined}>
        {page}
      </AppShell>
      {showBottomNav && <Navigation />}
    </>
  );
}
