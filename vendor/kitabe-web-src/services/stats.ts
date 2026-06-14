import type { CityStats, PlaceStats } from '../types/analytics';
import { API_BASE_URL } from '../config/api';

async function getJson<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE_URL}${path}`);
    const data = await res.json();
    if (data.success && data.data) return data.data as T;
    return null;
  } catch (e) {
    console.error('[Stats]', path, e);
    return null;
  }
}

/** En çok tıklanan şehirler */
export const getTopCitiesByOpens = async (limitCount = 10): Promise<CityStats[]> => {
  const rows = await getJson<Array<Record<string, unknown>>>(
    `/api/stats/cities?sort=placeOpens&limit=${limitCount}`
  );
  if (!rows) return [];
  return rows.map((r) => ({
    city: String(r.city ?? ''),
    totalPlaceOpens: Number(r.totalPlaceOpens) || 0,
    totalRouteOpens: Number(r.totalRouteOpens) || 0,
    totalFavorites: Number(r.totalFavorites) || 0,
    updatedAt: r.updatedAt as string | undefined,
  }));
};

export const getTopCitiesByRoutes = async (limitCount = 10): Promise<CityStats[]> => {
  const rows = await getJson<Array<Record<string, unknown>>>(
    `/api/stats/cities?sort=routeOpens&limit=${limitCount}`
  );
  if (!rows) return [];
  return rows.map((r) => ({
    city: String(r.city ?? ''),
    totalPlaceOpens: Number(r.totalPlaceOpens) || 0,
    totalRouteOpens: Number(r.totalRouteOpens) || 0,
    totalFavorites: Number(r.totalFavorites) || 0,
    updatedAt: r.updatedAt as string | undefined,
  }));
};

export const getTopCitiesByFavorites = async (limitCount = 10): Promise<CityStats[]> => {
  const rows = await getJson<Array<Record<string, unknown>>>(
    `/api/stats/cities?sort=favorites&limit=${limitCount}`
  );
  if (!rows) return [];
  return rows.map((r) => ({
    city: String(r.city ?? ''),
    totalPlaceOpens: Number(r.totalPlaceOpens) || 0,
    totalRouteOpens: Number(r.totalRouteOpens) || 0,
    totalFavorites: Number(r.totalFavorites) || 0,
    updatedAt: r.updatedAt as string | undefined,
  }));
};

export const getTopPlacesByOpens = async (limitCount = 20): Promise<PlaceStats[]> => {
  const rows = await getJson<Array<Record<string, unknown>>>(
    `/api/stats/places?sort=opens&limit=${limitCount}`
  );
  if (!rows) return [];
  return rows.map((r) => ({
    placeId: String(r.placeId ?? ''),
    city: String(r.city ?? ''),
    totalOpens: Number(r.totalOpens) || 0,
    totalRoutes: Number(r.totalRoutes) || 0,
    totalFavorites: Number(r.totalFavorites) || 0,
    updatedAt: r.updatedAt as string | undefined,
  }));
};

export const getTopPlacesByRoutes = async (limitCount = 20): Promise<PlaceStats[]> => {
  const rows = await getJson<Array<Record<string, unknown>>>(
    `/api/stats/places?sort=routes&limit=${limitCount}`
  );
  if (!rows) return [];
  return rows.map((r) => ({
    placeId: String(r.placeId ?? ''),
    city: String(r.city ?? ''),
    totalOpens: Number(r.totalOpens) || 0,
    totalRoutes: Number(r.totalRoutes) || 0,
    totalFavorites: Number(r.totalFavorites) || 0,
    updatedAt: r.updatedAt as string | undefined,
  }));
};

export const getTopPlacesByFavorites = async (limitCount = 20): Promise<PlaceStats[]> => {
  const rows = await getJson<Array<Record<string, unknown>>>(
    `/api/stats/places?sort=favorites&limit=${limitCount}`
  );
  if (!rows) return [];
  return rows.map((r) => ({
    placeId: String(r.placeId ?? ''),
    city: String(r.city ?? ''),
    totalOpens: Number(r.totalOpens) || 0,
    totalRoutes: Number(r.totalRoutes) || 0,
    totalFavorites: Number(r.totalFavorites) || 0,
    updatedAt: r.updatedAt as string | undefined,
  }));
};
