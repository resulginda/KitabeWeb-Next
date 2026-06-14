export type AdPosition = 'left-sidebar' | 'sidebar' | 'in-content' | 'below-content';

const DEFAULT_CLIENT = 'ca-pub-2826589713246354';

export function getAdClientId(): string {
  return process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID?.trim() || DEFAULT_CLIENT;
}

/** Manuel reklam birimi — boşsa yalnızca Auto Ads (head script) çalışır */
export function getAdSlotId(position: AdPosition): string | null {
  const map: Record<AdPosition, string | undefined> = {
    'left-sidebar': process.env.NEXT_PUBLIC_ADSENSE_SLOT_LEFT,
    sidebar: process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR,
    'in-content': process.env.NEXT_PUBLIC_ADSENSE_SLOT_IN_CONTENT,
    'below-content': process.env.NEXT_PUBLIC_ADSENSE_SLOT_BELOW,
  };
  const id = map[position]?.trim();
  return id || null;
}

export function hasManualAdSlots(): boolean {
  const positions: AdPosition[] = [
    'left-sidebar',
    'sidebar',
    'in-content',
    'below-content',
  ];
  return positions.some((p) => Boolean(getAdSlotId(p)));
}
