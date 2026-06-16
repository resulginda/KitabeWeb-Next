import { collectGalleryUrls, pickText, type Locale, type SeoPlace } from '@/lib/places';
import { pickArray } from '@/lib/placeText';
import { DETAIL_LABELS } from '@/lib/detailLabels';
import { PhotoGalleryClient } from '@/components/PhotoGalleryClient';
import { AdSlot } from '@/components/AdSlot';

/** SSR — DetailPage ile aynı kb-detail-layout (flash önleme) */
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
  const galleryPhotos = heroUrl ? photos.slice(1) : photos;

  const appCopy: Record<Locale, { title: string; subtitle: string; cta: string }> = {
    tr: { title: 'Kitabe Mobil Uygulaması', subtitle: 'Haritada gez, hikâyeleri oku', cta: 'Uygulamayı İndir' },
    en: { title: 'Kitabe Mobile App', subtitle: 'Explore on the map, read stories', cta: 'Get the App' },
    ru: { title: 'Мобильное приложение Kitabe', subtitle: 'Карта и истории в кармане', cta: 'Скачать' },
    ar: { title: 'تطبيق Kitabe', subtitle: 'استكشف على الخريطة', cta: 'حمّل التطبيق' },
  };
  const app = appCopy[locale] || appCopy.en;

  return (
    <div className="detail-page kb-detail-page" id="place-detail-static">
      <div className="kb-detail-layout">
        <aside className="kb-detail-sidebar">
          <h1 className="kb-detail-title">{name}</h1>
          <ul className="kb-kunye-list">
            {(city || district) && (
              <li>
                <span className="label">{locale === 'tr' ? 'Konum' : locale === 'en' ? 'Location' : locale === 'ru' ? 'Место' : 'الموقع'}</span>
                <span className="value">
                  {city}
                  {district ? `, ${district}` : ''}
                </span>
              </li>
            )}
            {period && (
              <li>
                <span className="label">{locale === 'tr' ? 'Dönem' : locale === 'en' ? 'Period' : locale === 'ru' ? 'Период' : 'الفترة'}</span>
                <span className="value">{period}</span>
              </li>
            )}
            {place.isUnesco && (
              <li>
                <span className="label">UNESCO</span>
                <span className="value">✓</span>
              </li>
            )}
          </ul>
          {categories.length > 0 && (
            <div className="kb-detail-chips">
              {categories.map((cat) => (
                <span key={cat} className="kb-detail-chip">
                  {cat}
                </span>
              ))}
            </div>
          )}
          <a href="/app" className="kb-detail-app-promo">
            <div className="kb-detail-app-promo-head">
              <span className="kb-detail-app-promo-icon" aria-hidden>
                <img src="/app-icon.png" alt="" width={40} height={40} decoding="async" />
              </span>
              <strong className="kb-detail-app-promo-title">{app.title}</strong>
            </div>
            <p className="kb-detail-app-promo-desc">{app.subtitle}</p>
            <span className="kb-detail-app-promo-cta">{app.cta} →</span>
          </a>
        </aside>

        <main className="kb-detail-main">
          {heroUrl ? (
            <div className="kb-detail-hero kb-detail-hero-main">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={heroUrl} alt={name} fetchPriority="high" />
            </div>
          ) : null}

          {description && (
            <div className="kb-detail-section">
              <h2>
                <span className="material-icons">description</span>
                {labels.description}
              </h2>
              <p>{description}</p>
            </div>
          )}

          {story && (
            <div className="kb-detail-section">
              <h2>
                <span className="material-icons">auto_stories</span>
                {labels.story}
              </h2>
              <p>{story}</p>
            </div>
          )}

          {visitTips.length > 0 && (
            <div className="kb-detail-section">
              <h2>
                <span className="material-icons">tips_and_updates</span>
                {labels.visitTips}
              </h2>
              <ul>
                {visitTips.map((tip) => (
                  <li key={tip}>{tip}</li>
                ))}
              </ul>
            </div>
          )}

          <AdSlot position="in-content" />
        </main>

        <aside className="kb-detail-gallery">
          <div className="kb-detail-section" style={{ padding: 'var(--gap-md)' }}>
            <h2 style={{ margin: '0 0 var(--gap-sm)', fontSize: '0.9375rem' }}>
              <span className="material-icons">photo_library</span>
              {labels.photos}
            </h2>
            <PhotoGalleryClient
              photos={galleryPhotos}
              altPrefix={name}
              emptyText={labels.noPhotosYet}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
