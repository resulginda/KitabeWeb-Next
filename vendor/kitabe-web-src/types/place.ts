// Çok dilli metin tipi
export type MultilingualText = {
  tr?: string;
  en?: string;
  ru?: string;
  ar?: string;
};

// Yeni hiyerarşik kategori yapısı
export type CategoryStructure = {
  main: MultilingualText[];  // Ana kategoriler (çoklu olabilir)
  sub: {
    [categoryId: string]: MultilingualText[];  // Her ana kategori için alt kategoriler
  };
};

// Eski kategori yapısı (Firebase'den gelen veriler için)
export type LegacyCategoryStructure = {
  tr?: string[];
  en?: string[];
  ru?: string[];
  ar?: string[];
};

/** Google Places foto öğesi (kalıcı url veya proxy için photo_reference) */
export type GooglePlacePhoto = {
  url?: string;
  thumbUrl?: string;
  photo_reference?: string;
};

export type Place = {
  id: string;
  name: string | MultilingualText;
  city: string | MultilingualText;
  district: string | MultilingualText;
  category: CategoryStructure | LegacyCategoryStructure | string[];  // Yeni hiyerarşik yapı, eski yapı veya basit array
  description: string | MultilingualText;
  latitude: number;
  longitude: number;
  story?: string | MultilingualText;
  visitTips?: string[] | MultilingualText;
  period?: string | MultilingualText;
  isUnesco?: boolean;
  imageUrl?: string;
  thumbnailUrl?: string;
  photos?: string[];
  googlePlaceId?: string | null;
  googlePhotos?: GooglePlacePhoto[];
  /** Google Place Details ile koordinat senkronu yapıldıysa ISO tarih */
  googleCoordsSyncedAt?: string | null;
  listGalleryThumbs?: string[];
  status?: string;
  createdBy?: string;
  createdAt?: any;
  updatedAt?: any;
};

export const CATEGORY_OPTIONS = [
  { value: 'Doğal Alan', icon: 'landscape', color: '#5ab596' },
  { value: 'Antik Çağ', icon: 'history-edu', color: '#d1a34e' },
  { value: 'Müze', icon: 'museum', color: '#c98546' },
  { value: 'Anıt', icon: 'park', color: '#8d63c9' },
  { value: 'Cami', icon: 'mosque', color: '#82acd9' },
  { value: 'Kale', icon: 'fort', color: '#7e6e4a' },
  { value: 'Saray', icon: 'account-balance', color: '#c0907b' },
  { value: 'Modern', icon: 'apartment', color: '#ba79b0' },
  { value: 'UNESCO', icon: 'public', color: '#50b557' },
];

