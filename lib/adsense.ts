export type AdPosition = 'left-sidebar' | 'sidebar' | 'in-content' | 'below-content';

const DEFAULT_CLIENT = 'ca-pub-2826589713246354';

export function getAdClientId(): string {
  return process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID?.trim() || DEFAULT_CLIENT;
}

// NEXT_PUBLIC_* build sırasında gömülür; Docker build'e verilmezse istemcide boş kalır ve
// sunucu HTML'i ile uyuşmaz. Varsayılanlar iki tarafta da aynı kimliği garanti eder.
const DEFAULT_SLOTS: Record<AdPosition, string> = {
  'left-sidebar': '4618768403',
  sidebar: '2116769788',
  'in-content': '4343436234',
  'below-content': '1518003907',
};

/** Manuel reklam birimi */
export function getAdSlotId(position: AdPosition): string | null {
  const map: Record<AdPosition, string | undefined> = {
    'left-sidebar': process.env.NEXT_PUBLIC_ADSENSE_SLOT_LEFT,
    sidebar: process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR,
    'in-content': process.env.NEXT_PUBLIC_ADSENSE_SLOT_IN_CONTENT,
    'below-content': process.env.NEXT_PUBLIC_ADSENSE_SLOT_BELOW,
  };
  return map[position]?.trim() || DEFAULT_SLOTS[position];
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
