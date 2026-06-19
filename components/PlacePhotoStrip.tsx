import Image from 'next/image';
import { collectGalleryUrls, pickText, type Locale, type SeoPlace } from '@/lib/places';
import { isGooglePhotoUrl } from '@kitabe/utils/imageUtils';

/** Sunucu tarafında crawl edilebilir fotoğraf şeridi (botlar + hızlı LCP) */
export function PlacePhotoStrip({ place, locale }: { place: SeoPlace; locale: Locale }) {
  const name = pickText(place.name as never, locale);
  const photos = collectGalleryUrls(place);
  if (photos.length === 0) return null;
  const hasGoogle = photos.slice(0, 12).some(isGooglePhotoUrl);

  return (
    <section aria-label={`${name} fotoğrafları`} style={{ marginBottom: '0.5rem' }}>
      <div className="seo-static-gallery" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))' }}>
        {photos.slice(0, 12).map((url, i) => (
          <Image
            key={`${url}-${i}`}
            src={url}
            alt={`${name} — fotoğraf ${i + 1}`}
            width={320}
            height={220}
            priority={i === 0}
            loading={i === 0 ? 'eager' : 'lazy'}
            style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 8 }}
          />
        ))}
      </div>
      {hasGoogle ? (
        <span className="kb-google-attribution kb-google-attribution-inline">Powered by Google</span>
      ) : null}
    </section>
  );
}
