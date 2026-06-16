import { AdSlot } from '@/components/AdSlot';
import { PlaceDetailStatic } from '@/components/PlaceDetailStatic';
import { PlaceDetailClient } from '@/components/PlaceDetailClient';
import type { Locale, SeoPlace } from '@/lib/places';

/** Detay sayfası — tam genişlik içerik; reklamlar altta ve içerikte */
export function PlaceDetailLayout({
  place,
  locale,
}: {
  place: SeoPlace;
  locale: Locale;
}) {
  return (
    <div className="place-detail-shell">
      <div className="place-main-column place-main-column--full">
        <PlaceDetailStatic place={place} locale={locale} />
        <PlaceDetailClient
          place={place as unknown as Record<string, unknown>}
          locale={locale}
        />
      </div>

      <div className="place-ad-below">
        <AdSlot position="below-content" />
      </div>
    </div>
  );
}
