import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { API_BASE_URL } from '../config/api';
import { useAuth } from './AuthContext';
import { usePlaces } from './PlacesContext';
import { notifyAdminsAndEditorsAboutNewRating } from '../services/notificationService';
import { getLocalizedText } from '../utils/multilang';
import type { Rating, PlaceRatingSummary } from '../types/rating';

interface RatingContextType {
  addRating: (placeId: string, rating: number, comment?: string) => Promise<boolean>;
  getRatingsByPlace: (placeId: string) => Rating[];
  getApprovedRatingsByPlace: (placeId: string) => Rating[];
  getUserRatingForPlace: (placeId: string, userId: string) => Rating | null;
  getPlaceRatingSummary: (placeId: string) => PlaceRatingSummary | null;
  allRatings: Rating[];
  pendingRatings: Rating[];
  loading: boolean;
  updateRating: (ratingId: string, rating: number, comment?: string) => Promise<boolean>;
  deleteRating: (ratingId: string) => Promise<boolean>;
  refresh: () => Promise<void>;
}

const RatingContext = createContext<RatingContextType | undefined>(undefined);

function mapRow(r: {
  id: string;
  placeId?: string;
  place_id?: string;
  userId?: string;
  user_id?: string;
  userName?: string;
  user_name?: string;
  userEmail?: string;
  user_email?: string;
  rating: number;
  comment?: string;
  status: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}): Rating {
  return {
    id: r.id,
    placeId: r.placeId ?? r.place_id ?? '',
    userId: r.userId ?? r.user_id ?? '',
    userName: r.userName ?? r.user_name ?? '',
    userEmail: r.userEmail ?? r.user_email ?? '',
    rating: r.rating,
    comment: r.comment,
    status: (r.status as Rating['status']) ?? 'pending',
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  };
}

export const RatingProvider = ({ children }: { children: ReactNode }) => {
  const { kullanici, getToken } = useAuth();
  const { getPlaceById } = usePlaces();
  const [allRatings, setAllRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!kullanici) {
      setAllRatings([]);
      setLoading(false);
      return;
    }
    const token = await getToken();
    if (!token) {
      setAllRatings([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/ratings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setAllRatings(data.data.map(mapRow));
      } else {
        setAllRatings([]);
      }
    } catch {
      setAllRatings([]);
    } finally {
      setLoading(false);
    }
  }, [kullanici, getToken]);

  useEffect(() => {
    load();
  }, [load]);

  const getRatingsByPlace = (placeId: string) => allRatings.filter((r) => r.placeId === placeId);
  const getApprovedRatingsByPlace = (placeId: string) =>
    allRatings.filter((r) => r.placeId === placeId && r.status === 'approved');
  const getUserRatingForPlace = (placeId: string, userId: string) =>
    allRatings.find((r) => r.placeId === placeId && r.userId === userId) ?? null;

  const getPlaceRatingSummary = (placeId: string): PlaceRatingSummary | null => {
    const approved = getApprovedRatingsByPlace(placeId);
    if (approved.length === 0) return null;
    const total = approved.reduce((sum, r) => sum + r.rating, 0);
    const distribution: { [rating: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    approved.forEach((r) => {
      distribution[r.rating] = (distribution[r.rating] ?? 0) + 1;
    });
    return {
      placeId,
      averageRating: Math.round((total / approved.length) * 10) / 10,
      totalRatings: approved.length,
      ratingDistribution: distribution,
    };
  };

  const addRating = async (placeId: string, rating: number, comment?: string): Promise<boolean> => {
    const token = await getToken();
    if (!token || !kullanici) throw new Error('Giriş yapmanız gerekiyor');
    const existing = getUserRatingForPlace(placeId, kullanici.id);
    if (existing?.status === 'approved') throw new Error('Bu yere zaten puan verdiniz');
    if (existing?.status === 'pending') {
      return updateRating(existing.id, rating, comment);
    }
    const res = await fetch(`${API_BASE_URL}/api/ratings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ placeId, rating, comment: comment ?? '' }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message ?? 'Puan eklenemedi');
    const place = getPlaceById(placeId);
    if (place && kullanici) {
      const placeName =
        typeof place.name === 'object' && place.name !== null
          ? {
              tr: getLocalizedText(place.name, 'tr'),
              en: getLocalizedText(place.name, 'en'),
              ru: getLocalizedText(place.name, 'ru'),
              ar: getLocalizedText(place.name, 'ar'),
            }
          : { tr: String(place.name), en: String(place.name) };
      const fullName =
        [kullanici.isim, kullanici.soyad].filter(Boolean).join(' ').trim() || 'Anonim';
      notifyAdminsAndEditorsAboutNewRating(
        getToken,
        data.data?.id ?? '',
        placeId,
        placeName,
        kullanici.id,
        fullName,
        rating,
        comment ?? ''
      ).catch((err) => console.error('Bildirim gönderme hatası:', err));
    }
    await load();
    return true;
  };

  const updateRating = async (ratingId: string, rating: number, comment?: string): Promise<boolean> => {
    const token = await getToken();
    if (!token) throw new Error('Oturum bulunamadı');
    const res = await fetch(`${API_BASE_URL}/api/ratings/${ratingId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ rating, comment: comment ?? '' }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message ?? 'Puan güncellenemedi');
    await load();
    return true;
  };

  const deleteRating = async (ratingId: string): Promise<boolean> => {
    const token = await getToken();
    if (!token) throw new Error('Oturum bulunamadı');
    const res = await fetch(`${API_BASE_URL}/api/ratings/${ratingId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message ?? 'Puan silinemedi');
    await load();
    return true;
  };

  const pendingRatings = allRatings.filter((r) => r.status === 'pending');

  return (
    <RatingContext.Provider
      value={{
        addRating,
        getRatingsByPlace,
        getApprovedRatingsByPlace,
        getUserRatingForPlace,
        getPlaceRatingSummary,
        allRatings,
        pendingRatings,
        loading,
        updateRating,
        deleteRating,
        refresh: load,
      }}
    >
      {children}
    </RatingContext.Provider>
  );
};

export const useRatings = () => {
  const ctx = useContext(RatingContext);
  if (!ctx) throw new Error('useRatings must be used within RatingProvider');
  return ctx;
};
