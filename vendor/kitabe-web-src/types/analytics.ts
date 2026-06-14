/**
 * Şehir bazlı toplam istatistikler (PostgreSQL /api/stats)
 */
export interface CityStats {
  city: string;
  totalPlaceOpens: number;
  totalRouteOpens: number;
  totalFavorites: number;
  updatedAt?: string | Date | null;
}

/**
 * Yer bazlı toplam istatistikler
 */
export interface PlaceStats {
  placeId: string;
  city: string;
  totalOpens: number;
  totalRoutes: number;
  totalFavorites: number;
  updatedAt?: string | Date | null;
}

