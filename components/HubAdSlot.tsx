'use client';

import dynamic from 'next/dynamic';
import type { AdPosition } from '@/lib/adsense';

const AdSlot = dynamic(
  () => import('@/components/AdSlot').then((m) => ({ default: m.AdSlot })),
  { ssr: false }
);

export function HubAdSlot({ position }: { position: AdPosition }) {
  return <AdSlot position={position} />;
}
