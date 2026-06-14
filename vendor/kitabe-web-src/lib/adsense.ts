import { readViteEnv } from '../utils/env.vite';

export type AdPosition = 'left-sidebar' | 'sidebar' | 'in-content' | 'below-content';

const DEFAULT_CLIENT = 'ca-pub-2826589713246354';

const DEFAULT_SLOTS: Record<AdPosition, string> = {
  'left-sidebar': '4618768403',
  sidebar: '2116769788',
  'in-content': '4343436234',
  'below-content': '1518003907',
};

export function getAdClientId(): string {
  return readViteEnv('VITE_ADSENSE_CLIENT_ID') || DEFAULT_CLIENT;
}

export function getAdSlotId(position: AdPosition): string | null {
  const envMap: Record<AdPosition, string> = {
    'left-sidebar': 'VITE_ADSENSE_SLOT_LEFT',
    sidebar: 'VITE_ADSENSE_SLOT_SIDEBAR',
    'in-content': 'VITE_ADSENSE_SLOT_IN_CONTENT',
    'below-content': 'VITE_ADSENSE_SLOT_BELOW',
  };
  const fromEnv = readViteEnv(envMap[position])?.trim();
  return fromEnv || DEFAULT_SLOTS[position] || null;
}

/** Reklam gösterilmeyecek sayfalar */
const NO_AD_EXACT = new Set([
  '/',
  '/login',
  '/register',
  '/reset-password',
  '/language-selection',
  '/delete-account',
  '/hesap-silme',
]);

const NO_AD_PREFIXES = [
  '/admin',
  '/editor-panel',
  '/user-management',
  '/photo-approval',
  '/rating-approval',
];

export function shouldShowPageAds(pathname: string): boolean {
  if (NO_AD_EXACT.has(pathname)) return false;
  return !NO_AD_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}
