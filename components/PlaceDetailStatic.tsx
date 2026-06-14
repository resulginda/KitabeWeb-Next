import { collectGalleryUrls, pickText, type Locale, type SeoPlace } from '@/lib/places';
import { pickArray } from '@/lib/placeText';
import { DETAIL_LABELS } from '@/lib/detailLabels';
import { PhotoGalleryClient } from '@/components/PhotoGalleryClient';
import { AdSlot } from '@/components/AdSlot';

/** KitabeWeb DetailPage ile aynı görünüm — sunucuda anında render (SEO + LCP) */
export function PlaceDetailStatic({ place, locale }: { place: SeoPlace; locale: Locale }) {
  const labels = DETAIL_LABELS[locale];
  const name = pickText(place.name as never, locale);
  const city = pickText(place.city as never, locale);
  const district = pickText(place.district as never, locale);
  const description = pickText(place.description as never, locale);
  const story = place.story ? pickText(place.story as never, locale) : '';
  const period = place.period ? pickText(place.period as never, locale) : '';
  const visitTips = pickArray(place.visitTips, locale);
  const categories = pickArray(place.category, locale);
  const photos = collectGalleryUrls(place);
  const heroUrl = photos[0] ?? null;
  const initial = name.trim().charAt(0).toUpperCase() || 'K';

  return (
    <div className="detail-page" id="place-detail-static">
      {heroUrl ? (
        <div className="detail-header">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={heroUrl} alt={name} />
        </div>
      ) : (
        <div className="detail-no-photo-hero">
          <span className="detail-no-photo-icon" aria-hidden>🏛️</span>
          <span className="detail-no-photo-initial" aria-hidden>{initial}</span>
        </div>
      )}

      <div className={`detail-content ${heroUrl ? '' : 'no-header'}`.trim()}>
        <h1>{name}</h1>
        <div className="detail-meta">
          <span className="location">📍 {city}{district ? `, ${district}` : ''}</span>
          {period && <span className="period">📅 {period}</span>}
          {place.isUnesco && <span className="unesco-badge">UNESCO</span>}
        </div>

        {categories.length > 0 && (
          <div className="categories">
            {categories.map((cat) => (
              <span key={cat} className="category-tag">{cat}</span>
            ))}
          </div>
        )}

        {description && (
          <div className="section">
            <h2>{labels.description}</h2>
            <p>{description}</p>
          </div>
        )}

        {story && (
          <div className="section">
            <h2>{labels.story}</h2>
            <p>{story}</p>
          </div>
        )}

        {visitTips.length > 0 && (
          <div className="section">
            <h2>{labels.visitTips}</h2>
            <ul>
              {visitTips.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
          </div>
        )}

        <AdSlot position="in-content" />

        <div className="section">
          <h2>{labels.photos}</h2>
          <PhotoGalleryClient
            photos={photos}
            altPrefix={name}
            emptyText={labels.noPhotosYet}
          />
        </div>
      </div>
    </div>
  );
}
