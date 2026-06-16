import { AdSlot } from '@/components/AdSlot';
import { PlaceDetailStatic } from '@/components/PlaceDetailStatic';
import { PlaceDetailClient } from '@/components/PlaceDetailClient';
import type { Locale, SeoPlace } from '@/lib/places';
import '@kitabe/pages/DetailPage.css';

/** Detay — ortada içerik, geniş ekranda yan boşluklarda reklam */
export function PlaceDetailLayout({
  place,
  locale,
}: {
  place: SeoPlace;
  locale: Locale;
}) {
  return (
    <div className="place-detail-shell place-detail-with-ads">
      <aside className="place-ad-margin place-ad-margin-left" aria-label="Reklam">
        <AdSlot position="left-sidebar" />
      </aside>

      <div className="place-main-column place-main-column--full">
        <PlaceDetailStatic place={place} locale={locale} />
        <PlaceDetailClient
          place={place as unknown as Record<string, unknown>}
          locale={locale}
        />
      </div>

      <aside className="place-ad-margin place-ad-margin-right" aria-label="Reklam">
        <AdSlot position="sidebar" />
      </aside>

      <div className="place-ad-below">
        <AdSlot position="below-content" />
      </div>
    </div>
  );
}
