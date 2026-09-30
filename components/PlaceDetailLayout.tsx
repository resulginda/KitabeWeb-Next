import { AdSlot } from '@/components/AdSlot';
import { SiteFooter } from '@/components/SiteFooter';
import { PlaceDetailStatic } from '@/components/PlaceDetailStatic';
import { PlaceDetailClient } from '@/components/PlaceDetailClient';
import { ListingBreadcrumbs } from '@/components/ListingPage';
import { PlaceRelatedLinks } from '@/components/PlaceRelatedLinks';
import { pickText, type Locale, type SeoPlace } from '@/lib/places';
import type { PlaceRelated } from '@/lib/placeRelated';
import '@kitabe/pages/DetailPage.css';

/** Detay — ortada içerik, geniş ekranda yan boşluklarda reklam */
export function PlaceDetailLayout({
  place,
  locale,
  related,
}: {
  place: SeoPlace;
  locale: Locale;
  related?: PlaceRelated | null;
}) {
  return (
    <div className="place-detail-shell place-detail-with-ads">
      <aside className="place-ad-margin place-ad-margin-left" aria-label="Reklam">
        <AdSlot position="left-sidebar" />
      </aside>

      <div className="place-main-column place-main-column--full">
        {related && related.breadcrumb.length > 0 && (
          <div className="place-detail-breadcrumb">
            <ListingBreadcrumbs
              items={[...related.breadcrumb, { label: pickText(place.name, locale), href: '' }]}
            />
          </div>
        )}
        <PlaceDetailStatic place={place} locale={locale} />
        <PlaceDetailClient
          place={place as unknown as Record<string, unknown>}
          locale={locale}
        />
        {related && <PlaceRelatedLinks related={related} locale={locale} />}
      </div>

      <aside className="place-ad-margin place-ad-margin-right" aria-label="Reklam">
        <AdSlot position="sidebar" />
      </aside>

      <div className="place-ad-below">
        <AdSlot position="below-content" />
      </div>
      <SiteFooter locale={locale} />
    </div>
  );
}
