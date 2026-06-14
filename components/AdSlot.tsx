'use client';

import { useEffect, useRef } from 'react';
import {
  getAdClientId,
  getAdSlotId,
  type AdPosition,
} from '@/lib/adsense';

const LABELS: Record<AdPosition, string> = {
  'left-sidebar': 'Reklam',
  sidebar: 'Reklam',
  'in-content': 'Reklam',
  'below-content': 'Reklam',
};

export function AdSlot({ position }: { position: AdPosition }) {
  const pushed = useRef(false);
  const slotId = getAdSlotId(position);
  const clientId = getAdClientId();

  useEffect(() => {
    if (!slotId || pushed.current) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      /* script henüz yüklenmemiş olabilir */
    }
  }, [slotId]);

  if (!clientId || !slotId) return null;

  const isInArticle = position === 'in-content';

  return (
    <aside
      className={`ad-slot ad-${position}`}
      aria-label="Advertisement"
      data-ad-position={position}
    >
      <ins
        className="adsbygoogle"
        style={isInArticle ? { display: 'block', textAlign: 'center' } : { display: 'block' }}
        data-ad-client={clientId}
        data-ad-slot={slotId}
        {...(isInArticle
          ? { 'data-ad-layout': 'in-article', 'data-ad-format': 'fluid' }
          : { 'data-ad-format': 'auto', 'data-full-width-responsive': 'true' })}
      />
      <span className="ad-slot-label">{LABELS[position]}</span>
    </aside>
  );
}
