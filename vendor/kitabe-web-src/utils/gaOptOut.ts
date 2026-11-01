/** Next GoogleAnalytics ile aynı ölçüm kimliği */
const GA_ID = 'G-N89V8B16M4';
const STORAGE_KEY = 'kitabe_ga_optout';

/** Admin oturumunda GA4'ü kapat / çıkışta tekrar aç. */
export function syncWebGaOptOut(role?: string | null): void {
  if (typeof window === 'undefined') return;
  const optOut = String(role || '').toLowerCase() === 'admin';
  try {
    if (optOut) {
      window.localStorage.setItem(STORAGE_KEY, '1');
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // ignore
  }
  const w = window as unknown as Window & Record<string, boolean> & { gtag?: (...args: unknown[]) => void };
  w[`ga-disable-${GA_ID}`] = optOut;
  if (typeof w.gtag === 'function') {
    try {
      w.gtag('consent', 'update', {
        analytics_storage: optOut ? 'denied' : 'granted',
      });
    } catch {
      // ignore
    }
  }
}
