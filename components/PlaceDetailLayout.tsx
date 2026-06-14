import { AdSlot } from '@/components/AdSlot';
import { PlaceDetailStatic } from '@/components/PlaceDetailStatic';
import { PlaceDetailClient } from '@/components/PlaceDetailClient';
import type { Locale, SeoPlace } from '@/lib/places';

/** Detay sayfası: sol/sağ kenar + içerik + alt reklam alanları */
export function PlaceDetailLayout({
  place,
  locale,
}: {
  place: SeoPlace;
  locale: Locale;
}) {
  return (
    <div className="place-detail-shell">
      <div className="place-page-layout">
        <aside className="place-ad-left" aria-hidden={false}>
          <AdSlot position="left-sidebar" />
        </aside>

        <div className="place-main-column">
          <PlaceDetailStatic place={place} locale={locale} />
          <PlaceDetailClient
            place={place as unknown as Record<string, unknown>}
            locale={locale}
          />
        </div>

        <aside className="place-ad-right">
          <AdSlot position="sidebar" />
        </aside>
      </div>

      <div className="place-ad-below">
        <AdSlot position="below-content" />
      </div>
    </div>
  );
}
