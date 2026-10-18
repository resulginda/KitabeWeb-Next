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

/**
 * Yan reklamlar dar ekranda display:none iken push → availableWidth=0 hatası.
 * Genişlik ölçülebilir olana kadar bekler; gizli kalırsa hiç push etmez.
 */
export function AdSlot({ position }: { position: AdPosition }) {
  const pushed = useRef(false);
  const hostRef = useRef<HTMLElement | null>(null);
  const slotId = getAdSlotId(position);
  const clientId = getAdClientId();

  useEffect(() => {
    if (!slotId || pushed.current) return;
    const host = hostRef.current;
    if (!host) return;

    const tryPush = () => {
      if (pushed.current) return;
      if (host.offsetWidth < 2 || host.offsetHeight < 2) return;
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        pushed.current = true;
      } catch {
        /* script henüz yüklenmemiş olabilir */
      }
    };

    tryPush();
    if (pushed.current) return undefined;

    const ro =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(() => tryPush())
        : null;
    ro?.observe(host);

    const onResize = () => tryPush();
    window.addEventListener('resize', onResize);

    let cancelIdle: (() => void) | undefined;
    const w = window as Window &
      typeof globalThis & {
        requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
        cancelIdleCallback?: (id: number) => void;
      };
    if (typeof w.requestIdleCallback === 'function') {
      const id = w.requestIdleCallback(() => tryPush(), { timeout: 2500 });
      cancelIdle = () => w.cancelIdleCallback?.(id);
    } else {
      const id = globalThis.setTimeout(() => tryPush(), 1);
      cancelIdle = () => globalThis.clearTimeout(id);
    }

    return () => {
      ro?.disconnect();
      window.removeEventListener('resize', onResize);
      cancelIdle?.();
    };
  }, [slotId]);

  if (!clientId || !slotId) return null;

  const isInArticle = position === 'in-content';

  return (
    <aside
      ref={hostRef}
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
