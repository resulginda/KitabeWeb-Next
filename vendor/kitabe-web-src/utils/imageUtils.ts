import type { Place } from '../types/place';
import { API_BASE_URL } from '../config/api';

/**
 * URL'in Google Places kaynaklı olup olmadığını tespit eder.
 * Google Places API ToS gereği bu görsellerin yanında "Powered by Google"
 * atıfı gösterilmelidir.
 */
export const isGooglePhotoUrl = (url?: string | null): boolean => {
  if (!url || typeof url !== 'string') return false;
  const u = url.toLowerCase();
  return (
    // Backend'e indirilip yeniden barındirilan Google Places fotograflari:
    // .../uploads/places_google/{id}_{n}.jpg
    u.includes('/places_google/') ||
    u.includes('googleusercontent.com') ||
    u.includes('maps.googleapis.com') ||
    u.includes('googleapis.com/maps') ||
    u.includes('/api/google/photo') ||
    u.includes('/maps/api/place/photo') ||
    /lh[3-6]\.google/.test(u)
  );
};

const isValidImageUrl = (url: string): boolean => {
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return false;
  }
  if (url.includes('commons.wikimedia.org/wiki/')) {
    return false;
  }
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return false;
  }
  return true;
};

/**
 * Google foto listesinden galeri URL'leri (kalıcı url veya API proxy)
 */
export const getGooglePhotoGalleryUrls = (place: Place | null | undefined): string[] => {
  if (!place?.googlePhotos?.length) return [];
  const urls: string[] = [];
  for (const g of place.googlePhotos) {
    if (g?.url && isValidImageUrl(g.url)) {
      urls.push(g.url);
      continue;
    }
    if (g?.photo_reference && typeof g.photo_reference === 'string') {
      urls.push(
        `${API_BASE_URL}/api/google/photo?reference=${encodeURIComponent(g.photo_reference)}`
      );
    }
  }
  return urls;
};

/**
 * Place'in görsel URL'ini döndürür (RN ile aynı öncelik: photos → imageUrl → googlePhotos)
 */
export const getPlaceImageUri = (place: Place | null | undefined): string | null => {
  if (!place) return null;

  if (Array.isArray(place.photos) && place.photos.length > 0) {
    for (const photo of place.photos) {
      let photoUrl = '';
      if (typeof photo === 'string' && photo.trim() !== '') {
        photoUrl = photo;
      } else if (typeof photo === 'object' && photo != null) {
        const o = photo as { uri?: string; url?: string };
        if (o.uri?.trim()) photoUrl = o.uri;
        else if (o.url?.trim()) photoUrl = o.url;
      }
      if (isValidImageUrl(photoUrl)) return photoUrl;
    }
  }

  if (place.imageUrl && typeof place.imageUrl === 'string' && isValidImageUrl(place.imageUrl)) {
    return place.imageUrl;
  }

  if (Array.isArray(place.googlePhotos) && place.googlePhotos.length > 0) {
    const first = place.googlePhotos[0];
    if (first?.url && isValidImageUrl(first.url)) return first.url;
    if (first?.photo_reference && typeof first.photo_reference === 'string') {
      return `${API_BASE_URL}/api/google/photo?reference=${encodeURIComponent(first.photo_reference)}`;
    }
  }

  return null;
};

/**
 * Place'in görsel source'unu döndürür (fallback ile)
 */
export const getPlaceImageSource = (place: Place | null | undefined): { uri: string } | null => {
  const uri = getPlaceImageUri(place);
  return uri ? { uri } : null;
};

/** Liste kartı: önce listGalleryThumbs / imageUrl, sonra thumbnail. */
export const getPlaceListImageUri = (place: Place | null | undefined): string | null => {
  if (!place) return null;
  const list = place.listGalleryThumbs;
  if (Array.isArray(list)) {
    for (const u of list) {
      if (typeof u === 'string' && isValidImageUrl(u)) return u.trim();
    }
  }
  if (place.imageUrl && isValidImageUrl(place.imageUrl)) return place.imageUrl;
  if (place.thumbnailUrl && isValidImageUrl(place.thumbnailUrl)) return place.thumbnailUrl;
  if (Array.isArray(place.googlePhotos) && place.googlePhotos.length > 0) {
    const g = place.googlePhotos[0];
    if (g?.url && isValidImageUrl(g.url)) return g.url;
    if (g?.thumbUrl && isValidImageUrl(g.thumbUrl)) return g.thumbUrl;
  }
  return getPlaceImageUri(place);
};

export const resolveListImageFallbackUri = (
  failedUri: string,
  place: Place | null | undefined
): string | null => {
  if (!failedUri || !place) return null;
  const failed = failedUri.trim();
  if (/_thumb\.(jpg|jpeg|png|webp|gif)$/i.test(failed)) {
    const full = failed.replace(/_thumb\.(jpg|jpeg|png|webp|gif)$/i, '.$1');
    if (full !== failed && isValidImageUrl(full)) return full;
  }
  if (place.imageUrl && isValidImageUrl(place.imageUrl) && place.imageUrl !== failed) return place.imageUrl;
  const g = place.googlePhotos?.[0];
  if (g?.url && isValidImageUrl(g.url) && g.url !== failed) return g.url;
  return null;
};
