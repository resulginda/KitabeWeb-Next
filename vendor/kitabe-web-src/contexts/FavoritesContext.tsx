import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { API_BASE_URL } from '../config/api';
import { useAuth } from './AuthContext';
import type { Place } from '../types/place';

interface FavoritesContextType {
  favorites: Place[];
  loading: boolean;
  isFavorite: (placeId: string) => boolean;
  toggleFavorite: (place: Place) => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
  const { kullanici, getToken } = useAuth();
  const [favorites, setFavorites] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFavorites = useCallback(async () => {
    if (!kullanici) {
      setFavorites([]);
      setLoading(false);
      return;
    }
    const token = await getToken();
    if (!token) {
      setFavorites([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/favorites`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setFavorites(data.data);
      } else {
        setFavorites([]);
      }
    } catch {
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  }, [kullanici, getToken]);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const isFavorite = (placeId: string) => favorites.some((fav) => fav.id === placeId);

  const toggleFavorite = useCallback(
    async (place: Place) => {
      if (!kullanici) {
        alert('Favori eklemek için giriş yapmanız gerekiyor.');
        return;
      }
      const token = await getToken();
      if (!token) return;
      const currentlyFavorite = isFavorite(place.id);
      try {
        if (currentlyFavorite) {
          const res = await fetch(`${API_BASE_URL}/api/favorites/${place.id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();
          if (data.success) {
            setFavorites((prev) => prev.filter((p) => p.id !== place.id));
          } else {
            throw new Error(data.message || 'Favoriden çıkarılamadı');
          }
        } else {
          const res = await fetch(`${API_BASE_URL}/api/favorites/add`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(place),
          });
          const data = await res.json();
          if (data.success && Array.isArray(data.data)) {
            setFavorites(data.data);
          } else if (data.success) {
            setFavorites((prev) => [...prev, place]);
          } else {
            throw new Error(data.message || 'Favori eklenemedi');
          }
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Bilinmeyen hata';
        alert(`Favori işlemi başarısız: ${msg}`);
      }
    },
    [kullanici, getToken, favorites]
  );

  return (
    <FavoritesContext.Provider value={{ favorites, loading, isFavorite, toggleFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) throw new Error('useFavorites must be used within FavoritesProvider');
  return context;
};
