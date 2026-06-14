import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { API_BASE_URL } from '../config/api';
import { useAuth } from './AuthContext';
import { usePhotoSubmissions } from './PhotoSubmissionContext';
import type { Place } from '../types/place';

interface VisitedPlace {
  id: string;
  placeId: string;
  userId: string;
  visitedAt: string;
  place?: Place;
}

interface VisitedPlacesContextType {
  visitedPlaces: VisitedPlace[];
  visitedPlaceIds: string[];
  isVisited: (placeId: string) => boolean;
  addToVisited: (place: Place) => Promise<{ success: boolean; message: string }>;
  removeFromVisited: (placeId: string) => Promise<void>;
  getVisitedStats: () => {
    totalVisited: number;
    visitedByCity: { [city: string]: number };
    visitedByCategory: { [category: string]: number };
    visitedThisMonth: number;
    visitedThisYear: number;
  };
  checkLocationProximity: (place: Place, radiusMeters?: number) => Promise<boolean>;
  checkPhotoRequirement: (placeId: string) => boolean;
  canMarkAsVisited: (place: Place) => Promise<{ canMark: boolean; reasons: string[] }>;
  refresh: () => Promise<void>;
}

const VisitedPlacesContext = createContext<VisitedPlacesContextType | undefined>(undefined);

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const VisitedPlacesProvider = ({ children }: { children: ReactNode }) => {
  const { kullanici, getToken } = useAuth();
  const { allSubmissions } = usePhotoSubmissions();
  const [visitedPlaces, setVisitedPlaces] = useState<VisitedPlace[]>([]);

  const load = useCallback(async () => {
    if (!kullanici) {
      setVisitedPlaces([]);
      return;
    }
    const token = await getToken();
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/visited`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setVisitedPlaces(
          data.data.map((v: { id: string; place_id: string; placeId?: string; user_id?: string; userId?: string; visited_at?: string; visitedAt?: string }) => ({
            id: v.id,
            placeId: v.placeId ?? v.place_id ?? '',
            userId: v.userId ?? v.user_id ?? '',
            visitedAt: v.visitedAt ?? v.visited_at ?? '',
          }))
        );
      } else {
        setVisitedPlaces([]);
      }
    } catch {
      setVisitedPlaces([]);
    }
  }, [kullanici, getToken]);

  useEffect(() => {
    load();
  }, [load]);

  const removeFromVisited = useCallback(
    async (placeId: string) => {
      if (!kullanici) return;
      const token = await getToken();
      if (!token) return;
      try {
        const res = await fetch(`${API_BASE_URL}/api/visited/${placeId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          setVisitedPlaces((prev) => prev.filter((v) => v.placeId !== placeId));
        }
      } catch (err) {
        console.error('Gezilen yerden çıkarma hatası:', err);
      }
    },
    [kullanici, getToken]
  );

  const visitedPlaceIds = visitedPlaces.map((v) => v.placeId);
  const isVisited = (placeId: string) => visitedPlaceIds.includes(placeId);

  const checkLocationProximity = useCallback(
    async (place: Place, radiusMeters: number = 100): Promise<boolean> => {
      return new Promise((resolve) => {
        if (!navigator.geolocation) {
          resolve(false);
          return;
        }
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const distance = calculateDistance(
              position.coords.latitude,
              position.coords.longitude,
              place.latitude,
              place.longitude
            );
            resolve(distance <= radiusMeters);
          },
          () => resolve(false),
          { timeout: 10000, maximumAge: 60000 }
        );
      });
    },
    []
  );

  const checkPhotoRequirement = useCallback(
    (placeId: string): boolean => {
      if (!kullanici) return false;
      const userPhotos = allSubmissions.filter(
        (sub) => sub.placeId === placeId && sub.userId === kullanici.id
      );
      return userPhotos.some((sub) => sub.status === 'approved' || sub.status === 'pending');
    },
    [kullanici, allSubmissions]
  );

  const canMarkAsVisited = useCallback(
    async (place: Place): Promise<{ canMark: boolean; reasons: string[] }> => {
      const reasons: string[] = [];
      const isNearby = await checkLocationProximity(place, 100);
      if (!isNearby) reasons.push('location');
      if (!checkPhotoRequirement(place.id)) reasons.push('photo');
      const existing = visitedPlaces.find((v) => v.placeId === place.id);
      if (existing) {
        const visitDate = new Date(existing.visitedAt);
        const hoursSince = (Date.now() - visitDate.getTime()) / (1000 * 60 * 60);
        if (hoursSince < 24) reasons.push('cooldown');
      }
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayVisits = visitedPlaces.filter((v) => new Date(v.visitedAt) >= today);
      if (todayVisits.length >= 20) reasons.push('rateLimit');
      return { canMark: reasons.length === 0, reasons };
    },
    [visitedPlaces, checkLocationProximity, checkPhotoRequirement]
  );

  const addToVisited = useCallback(
    async (place: Place): Promise<{ success: boolean; message: string }> => {
      if (!kullanici) return { success: false, message: 'Giriş yapmanız gerekiyor' };
      const check = await canMarkAsVisited(place);
      if (!check.canMark) {
        const messages: string[] = [];
        if (check.reasons.includes('location')) messages.push('100m yakın olmalısınız');
        if (check.reasons.includes('photo')) messages.push('Fotoğraf eklemeniz gerekiyor');
        if (check.reasons.includes('cooldown')) messages.push('24 saat beklemeniz gerekiyor');
        if (check.reasons.includes('rateLimit')) messages.push('Günlük limit aşıldı (20 yer)');
        return { success: false, message: messages.join(', ') };
      }
      const token = await getToken();
      if (!token) return { success: false, message: 'Oturum bulunamadı' };
      try {
        const res = await fetch(`${API_BASE_URL}/api/visited`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ placeId: place.id }),
        });
        const data = await res.json();
        if (data.success && data.data) {
          setVisitedPlaces((prev) => [
            {
              id: data.data.id,
              placeId: data.data.placeId ?? place.id,
              userId: data.data.userId ?? kullanici.id,
              visitedAt: data.data.visitedAt ?? new Date().toISOString(),
            },
            ...prev,
          ]);
          return { success: true, message: 'Başarıyla işaretlendi!' };
        }
        return { success: false, message: data.message ?? 'Eklenemedi' };
      } catch {
        return { success: false, message: 'Bir hata oluştu' };
      }
    },
    [kullanici, getToken, canMarkAsVisited]
  );

  const getVisitedStats = useCallback(() => {
    const stats = {
      totalVisited: visitedPlaces.length,
      visitedByCity: {} as { [city: string]: number },
      visitedByCategory: {} as { [category: string]: number },
      visitedThisMonth: 0,
      visitedThisYear: 0,
    };
    const now = new Date();
    visitedPlaces.forEach((visit) => {
      const d = new Date(visit.visitedAt);
      if (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear())
        stats.visitedThisMonth++;
      if (d.getFullYear() === now.getFullYear()) stats.visitedThisYear++;
    });
    return stats;
  }, [visitedPlaces]);

  return (
    <VisitedPlacesContext.Provider
      value={{
        visitedPlaces,
        visitedPlaceIds,
        isVisited,
        addToVisited,
        removeFromVisited,
        getVisitedStats,
        checkLocationProximity,
        checkPhotoRequirement,
        canMarkAsVisited,
        refresh: load,
      }}
    >
      {children}
    </VisitedPlacesContext.Provider>
  );
};

export const useVisitedPlaces = () => {
  const context = useContext(VisitedPlacesContext);
  if (!context) throw new Error('useVisitedPlaces must be used within VisitedPlacesProvider');
  return context;
};
