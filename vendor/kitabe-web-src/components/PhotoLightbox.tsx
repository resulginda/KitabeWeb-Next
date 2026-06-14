import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

type PhotoLightboxProps = {
  photos: string[];
  altPrefix: string;
};

export function PhotoLightbox({ photos, altPrefix }: PhotoLightboxProps) {
  const { t } = useTranslation();
  const [index, setIndex] = useState<number | null>(null);

  const close = useCallback(() => setIndex(null), []);
  const showPrev = useCallback(() => {
    setIndex((i) => (i === null ? null : (i - 1 + photos.length) % photos.length));
  }, [photos.length]);
  const showNext = useCallback(() => {
    setIndex((i) => (i === null ? null : (i + 1) % photos.length));
  }, [photos.length]);

  useEffect(() => {
    if (index === null) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') showPrev();
      if (e.key === 'ArrowRight') showNext();
    };

    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [index, close, showPrev, showNext]);

  if (photos.length === 0) return null;

  return (
    <>
      <div className="photo-gallery">
        {photos.map((url, idx) => (
          <img
            key={`${url}-${idx}`}
            src={url}
            alt={`${altPrefix} - ${idx + 1}`}
            onClick={() => setIndex(idx)}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ))}
      </div>

      {index !== null && (
        <div
          className="photo-lightbox-overlay"
          role="dialog"
          aria-modal="true"
          aria-label={`${altPrefix} — ${index + 1}`}
          onClick={close}
        >
          <button
            type="button"
            className="photo-lightbox-close"
            aria-label={t('detail.lightboxClose')}
            onClick={close}
          >
            ×
          </button>

          {photos.length > 1 && (
            <button
              type="button"
              className="photo-lightbox-nav photo-lightbox-prev"
              aria-label={t('detail.lightboxPrev')}
              onClick={(e) => {
                e.stopPropagation();
                showPrev();
              }}
            >
              ‹
            </button>
          )}

          {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions */}
          <img
            className="photo-lightbox-image"
            src={photos[index]}
            alt={`${altPrefix} - ${index + 1}`}
            onClick={(e) => e.stopPropagation()}
          />

          {photos.length > 1 && (
            <button
              type="button"
              className="photo-lightbox-nav photo-lightbox-next"
              aria-label={t('detail.lightboxNext')}
              onClick={(e) => {
                e.stopPropagation();
                showNext();
              }}
            >
              ›
            </button>
          )}

          {photos.length > 1 && (
            <span className="photo-lightbox-counter">
              {index + 1} / {photos.length}
            </span>
          )}
        </div>
      )}
    </>
  );
}
