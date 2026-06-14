import type { Locale } from '@/lib/places';

export const DETAIL_LABELS: Record<
  Locale,
  {
    description: string;
    story: string;
    visitTips: string;
    photos: string;
    noPhotosYet: string;
  }
> = {
  tr: {
    description: 'Açıklama',
    story: 'Hikaye',
    visitTips: 'Ziyaret İpuçları',
    photos: 'Fotoğraflar',
    noPhotosYet: 'Henüz fotoğraf eklenmemiş.',
  },
  en: {
    description: 'Description',
    story: 'Story',
    visitTips: 'Visit Tips',
    photos: 'Photos',
    noPhotosYet: 'No photos added yet.',
  },
  ru: {
    description: 'Описание',
    story: 'История',
    visitTips: 'Советы по посещению',
    photos: 'Фотографии',
    noPhotosYet: 'Фотографии пока не добавлены.',
  },
  ar: {
    description: 'الوصف',
    story: 'القصة',
    visitTips: 'نصائح الزيارة',
    photos: 'الصور',
    noPhotosYet: 'لم تتم إضافة صور بعد.',
  },
};
