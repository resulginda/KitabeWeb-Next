'use client';

import { PhotoLightbox } from '@kitabe/components/PhotoLightbox';

export function PhotoGalleryClient({
  photos,
  altPrefix,
  emptyText,
}: {
  photos: string[];
  altPrefix: string;
  emptyText: string;
}) {
  if (photos.length === 0) {
    return (
      <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>{emptyText}</p>
    );
  }

  return <PhotoLightbox photos={photos} altPrefix={altPrefix} />;
}
