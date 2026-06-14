import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { API_BASE_URL } from '../config/api';
import type { Place, GooglePlacePhoto } from '../types/place';
import { useLanguage } from './LanguageContext';
import { getLocalizedText, getLocalizedArray } from '../utils/multilang';

interface PlacesContextType {
  places: Place[];
  loading: boolean;
  error: string | null;
  addPlace: (place: Place) => void;
  updatePlace: (id: string, place: Partial<Place>) => void;
  removePlace: (id: string) => void;
  getPlaceById: (id: string) => Place | undefined;
  fetchPlaceById: (id: string) => Promise<Place | null>;
}

const PlacesContext = createContext<PlacesContextType | undefined>(undefined);

function mapApiGooglePhotos(raw: unknown): GooglePlacePhoto[] | undefined {
  if (!Array.isArray(raw) || raw.length === 0) return undefined;
  const out: GooglePlacePhoto[] = [];
  for (const item of raw) {
    if (item && typeof item === 'object') {
      const o = item as Record<string, unknown>;
      const url = typeof o.url === 'string' ? o.url : undefined;
      const photo_reference =
        typeof o.photo_reference === 'string' ? o.photo_reference : undefined;
      if (url || photo_reference) out.push({ url, photo_reference });
    }
  }
  return out.length ? out : undefined;
}

function mapApiPlaceToPlace(apiPlace: Record<string, unknown>, lang: string): Place {
  const name = apiPlace.name;
  const city = apiPlace.city;
  const district = apiPlace.district;
  const category = apiPlace.category;
  const description = apiPlace.description;
  const story = apiPlace.story;
  const visitTips = apiPlace.visitTips;
  const period = apiPlace.period;
  return {
    id: String(apiPlace.id),
    name: typeof name === 'string' ? name : getLocalizedText(name as Record<string, string>, lang as 'tr' | 'en' | 'ru' | 'ar'),
    city: typeof city === 'string' ? city : getLocalizedText(city as Record<string, string>, lang as 'tr' | 'en' | 'ru' | 'ar'),
    district: typeof district === 'string' ? district : getLocalizedText(district as Record<string, string>, lang as 'tr' | 'en' | 'ru' | 'ar'),
    category: (category as Place['category']) ?? [],
    description: typeof description === 'string' ? description : getLocalizedText(description as Record<string, string>, lang as 'tr' | 'en' | 'ru' | 'ar'),
    latitude: Number(apiPlace.latitude) || 0,
    longitude: Number(apiPlace.longitude) || 0,
    story: story != null ? (typeof story === 'string' ? story : getLocalizedText(story as Record<string, string>, lang as 'tr' | 'en' | 'ru' | 'ar')) : undefined,
    visitTips: visitTips != null ? getLocalizedArray(visitTips as string[] | Record<string, string[]>, lang as 'tr' | 'en' | 'ru' | 'ar') : undefined,
    period: period != null ? (typeof period === 'string' ? period : getLocalizedText(period as Record<string, string>, lang as 'tr' | 'en' | 'ru' | 'ar')) : undefined,
    isUnesco: Boolean(apiPlace.isUnesco),
    imageUrl: typeof apiPlace.imageUrl === 'string' ? apiPlace.imageUrl : undefined,
    photos: Array.isArray(apiPlace.photos) ? (apiPlace.photos as string[]) : undefined,
    googlePhotos:
      mapApiGooglePhotos(apiPlace.googlePhotos) ??
      mapApiGooglePhotos(apiPlace.google_photos),
    status: typeof apiPlace.status === 'string' ? apiPlace.status : 'published',
    createdBy: apiPlace.createdBy as string | undefined,
    createdAt: apiPlace.createdAt,
    updatedAt: apiPlace.updatedAt,
  };
}

export const PlacesProvider = ({ children }: { children: ReactNode }) => {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentLanguage } = useLanguage();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    const lang = currentLanguage || 'tr';
    fetch(
      `${API_BASE_URL}/api/places?minimal=1&limit=3000&status=published&lang=${lang}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (data.success && Array.isArray(data.data)) {
          const list: Place[] = data.data.map((row: Record<string, unknown>) =>
            mapApiPlaceToPlace(row, lang)
          );
          setPlaces(list);
          setError(null);
        } else {
          setError(data.message || 'Yerler yüklenemedi');
          setPlaces([]);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message || 'Yerler yüklenemedi');
          setPlaces([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [currentLanguage]);

  const fetchPlaceById = useCallback(
    async (id: string): Promise<Place | null> => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/places/${id}`);
        const data = await res.json();
        if (data.success && data.data) {
          return mapApiPlaceToPlace(data.data as Record<string, unknown>, currentLanguage || 'tr');
        }
        return null;
      } catch {
        return null;
      }
    },
    [currentLanguage]
  );

  const addPlace = (p: Place) => setPlaces((prev) => [p, ...prev]);
  const updatePlace = (id: string, newP: Partial<Place>) =>
    setPlaces((prev) => prev.map((p) => (p.id === id ? { ...p, ...newP } : p)));
  const removePlace = (id: string) =>
    setPlaces((prev) => prev.filter((p) => p.id !== id));
  const getPlaceById = (id: string) => places.find((p) => p.id === id);

  return (
    <PlacesContext.Provider
      value={{
        places,
        loading,
        error,
        addPlace,
        updatePlace,
        removePlace,
        getPlaceById,
        fetchPlaceById,
      }}
    >
      {children}
    </PlacesContext.Provider>
  );
};

export const usePlaces = () => {
  const ctx = useContext(PlacesContext);
  if (!ctx) throw new Error('usePlaces sadece PlacesProvider içinde kullanılabilir!');
  return ctx;
};
