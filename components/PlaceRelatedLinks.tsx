import { FilterChipGroup, PlaceListingCard } from '@/components/ListingPage';
import type { Locale } from '@/lib/places';
import type { PlaceRelated } from '@/lib/placeRelated';

const COPY: Record<Locale, { nearby: string; explore: string }> = {
  tr: { nearby: 'Yakındaki yerler', explore: 'Daha fazlasını keşfet' },
  en: { nearby: 'Nearby places', explore: 'Explore more' },
  ru: { nearby: 'Места поблизости', explore: 'Смотреть ещё' },
  ar: { nearby: 'أماكن قريبة', explore: 'اكتشف المزيد' },
};

export function PlaceRelatedLinks({ related, locale }: { related: PlaceRelated; locale: Locale }) {
  const t = COPY[locale] ?? COPY.en;
  if (related.related.length === 0 && related.exploreLinks.length === 0) return null;

  return (
    <section className="place-related" aria-labelledby="place-related-title">
      {related.related.length > 0 && (
        <>
          <h2 id="place-related-title" className="place-related-title">
            {t.nearby}
          </h2>
          <div className="listing-grid place-related-grid">
            {related.related.map((p) => (
              <PlaceListingCard key={p.id} place={p} locale={locale} />
            ))}
          </div>
        </>
      )}
      <FilterChipGroup title={t.explore} chips={related.exploreLinks} />
    </section>
  );
}
