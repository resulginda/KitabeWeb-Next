import { API_BASE_URL } from '../config/api';
import type { NotificationType, MultilingualText } from '../contexts/NotificationContext';
import { getLocalizedText } from '../utils/multilang';

type GetToken = () => Promise<string | null>;

export async function getAdminAndEditorUsers(
  getToken: GetToken
): Promise<Array<{ id: string; email: string; rol: string }>> {
  try {
    const token = await getToken();
    if (!token) return [];
    const res = await fetch(`${API_BASE_URL}/api/users/admins-and-editors`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (data.success && Array.isArray(data.data)) {
      return data.data.map((u: { id: string; email?: string; rol?: string }) => ({
        id: u.id,
        email: u.email ?? '',
        rol: u.rol ?? 'user',
      }));
    }
    return [];
  } catch (err) {
    console.error('Admin/editör kullanıcıları bulunamadı:', err);
    return [];
  }
}

export async function getAdminUsers(
  getToken: GetToken
): Promise<Array<{ id: string; email: string }>> {
  try {
    const token = await getToken();
    if (!token) return [];
    const res = await fetch(`${API_BASE_URL}/api/users/admins`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (data.success && Array.isArray(data.data)) {
      return data.data.map((u: { id: string; email?: string }) => ({
        id: u.id,
        email: u.email ?? '',
      }));
    }
    return [];
  } catch (err) {
    console.error('Admin kullanıcıları bulunamadı:', err);
    return [];
  }
}

export async function sendNotification(
  getToken: GetToken,
  userId: string,
  type: NotificationType,
  title: MultilingualText,
  message: MultilingualText,
  data: Record<string, unknown> = {},
  priority: 'high' | 'medium' | 'low' = 'medium'
): Promise<void> {
  try {
    const token = await getToken();
    if (!token) return;
    await fetch(`${API_BASE_URL}/api/notifications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ userId, type, title, message, data, priority }),
    });
  } catch (err) {
    console.error('Bildirim gönderme hatası:', err);
  }
}

export async function sendNotificationToMultipleUsers(
  getToken: GetToken,
  userIds: string[],
  type: NotificationType,
  title: MultilingualText,
  message: MultilingualText,
  data: Record<string, unknown> = {},
  priority: 'high' | 'medium' | 'low' = 'medium'
): Promise<void> {
  const token = await getToken();
  if (!token) return;
  try {
    await fetch(`${API_BASE_URL}/api/notifications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ userIds, type, title, message, data, priority }),
    });
  } catch (err) {
    console.error('Bildirim gönderme hatası:', err);
  }
}

export async function notifyAdminsAndEditorsAboutNewPhoto(
  getToken: GetToken,
  photoId: string,
  placeId: string,
  placeName: MultilingualText,
  userId: string,
  userName: string,
  photoUrl: string
): Promise<void> {
  const adminsAndEditors = await getAdminAndEditorUsers(getToken);
  if (adminsAndEditors.length === 0) return;
  const title: MultilingualText = {
    tr: 'Yeni Fotoğraf Bekliyor',
    en: 'New Photo Pending',
    ru: 'Новое фото ожидает',
    ar: 'صورة جديدة في الانتظار',
  };
  const message: MultilingualText = {
    tr: `${userName} ${getLocalizedText(placeName, 'tr')} için yeni bir fotoğraf yükledi`,
    en: `${userName} uploaded a new photo for ${getLocalizedText(placeName, 'en')}`,
    ru: `${userName} загрузил новое фото для ${getLocalizedText(placeName, 'ru') || getLocalizedText(placeName, 'en')}`,
    ar: `${userName} رفع صورة جديدة لـ ${getLocalizedText(placeName, 'ar') || getLocalizedText(placeName, 'en')}`,
  };
  await sendNotificationToMultipleUsers(
    getToken,
    adminsAndEditors.map((u) => u.id),
    'new_photo_for_review',
    title,
    message,
    { photoId, placeId, placeName, userId, userName, photoUrl },
    'medium'
  );
}

export async function notifyAdminsAndEditorsAboutNewRating(
  getToken: GetToken,
  ratingId: string,
  placeId: string,
  placeName: MultilingualText,
  userId: string,
  userName: string,
  rating: number,
  comment: string
): Promise<void> {
  const adminsAndEditors = await getAdminAndEditorUsers(getToken);
  if (adminsAndEditors.length === 0) return;
  const commentPreview = comment.length > 100 ? comment.slice(0, 100) + '...' : comment;
  const title: MultilingualText = {
    tr: 'Yeni Yorum Bekliyor',
    en: 'New Comment Pending',
    ru: 'Новый комментарий ожидает',
    ar: 'تعليق جديد في الانتظار',
  };
  const message: MultilingualText = {
    tr: `${userName} ${getLocalizedText(placeName, 'tr')} için yeni bir yorum yazdı`,
    en: `${userName} wrote a new comment for ${getLocalizedText(placeName, 'en')}`,
    ru: `${userName} написал новый комментарий для ${getLocalizedText(placeName, 'ru') || getLocalizedText(placeName, 'en')}`,
    ar: `${userName} كتب تعليقاً جديداً لـ ${getLocalizedText(placeName, 'ar') || getLocalizedText(placeName, 'en')}`,
  };
  await sendNotificationToMultipleUsers(
    getToken,
    adminsAndEditors.map((u) => u.id),
    'new_rating_for_review',
    title,
    message,
    { ratingId, placeId, placeName, userId, userName, rating, comment: commentPreview },
    'medium'
  );
}

export async function notifyUserAboutPhotoApproval(
  getToken: GetToken,
  userId: string,
  placeId: string,
  placeName: MultilingualText,
  photoId: string,
  photoUrl: string
): Promise<void> {
  const title: MultilingualText = {
    tr: 'Fotoğrafınız Onaylandı',
    en: 'Your Photo Was Approved',
    ru: 'Ваше фото одобрено',
    ar: 'تمت الموافقة على صورتك',
  };
  const message: MultilingualText = {
    tr: `${getLocalizedText(placeName, 'tr')} için eklediğiniz fotoğraf onaylandı ve yayınlandı.`,
    en: `Your photo for ${getLocalizedText(placeName, 'en')} has been approved and published.`,
    ru: `Ваше фото для ${getLocalizedText(placeName, 'ru') || getLocalizedText(placeName, 'en')} было одобрено и опубликовано.`,
    ar: `تمت الموافقة على صورتك لـ ${getLocalizedText(placeName, 'ar') || getLocalizedText(placeName, 'en')} ونشرها.`,
  };
  await sendNotification(
    getToken,
    userId,
    'photo_approved',
    title,
    message,
    { photoId, placeId, placeName, photoUrl },
    'high'
  );
}

export async function notifyUserAboutPhotoRejection(
  getToken: GetToken,
  userId: string,
  placeId: string,
  placeName: MultilingualText,
  photoId: string,
  rejectionReason?: string
): Promise<void> {
  const title: MultilingualText = {
    tr: 'Fotoğrafınız Reddedildi',
    en: 'Your Photo Was Rejected',
    ru: 'Ваше фото отклонено',
    ar: 'تم رفض صورتك',
  };
  const reasonText = rejectionReason
    ? {
        tr: ` Red nedeni: ${rejectionReason}`,
        en: ` Reason: ${rejectionReason}`,
        ru: ` Причина: ${rejectionReason}`,
        ar: ` السبب: ${rejectionReason}`,
      }
    : { tr: '', en: '', ru: '', ar: '' };
  const message: MultilingualText = {
    tr: `${getLocalizedText(placeName, 'tr')} için eklediğiniz fotoğraf reddedildi.${reasonText.tr}`,
    en: `Your photo for ${getLocalizedText(placeName, 'en')} has been rejected.${reasonText.en}`,
    ru: `Ваше фото для ${getLocalizedText(placeName, 'ru') || getLocalizedText(placeName, 'en')} было отклонено.${reasonText.ru}`,
    ar: `تم رفض صورتك لـ ${getLocalizedText(placeName, 'ar') || getLocalizedText(placeName, 'en')}.${reasonText.ar}`,
  };
  await sendNotification(
    getToken,
    userId,
    'photo_rejected',
    title,
    message,
    { photoId, placeId, placeName, rejectionReason: rejectionReason ?? null },
    'medium'
  );
}

export async function notifyUserAboutRatingApproval(
  getToken: GetToken,
  userId: string,
  placeId: string,
  placeName: MultilingualText,
  ratingId: string,
  rating: number
): Promise<void> {
  const title: MultilingualText = {
    tr: 'Yorumunuz Onaylandı',
    en: 'Your Comment Was Approved',
    ru: 'Ваш комментарий одобрен',
    ar: 'تمت الموافقة على تعليقك',
  };
  const message: MultilingualText = {
    tr: `${getLocalizedText(placeName, 'tr')} için yazdığınız yorum onaylandı ve yayınlandı.`,
    en: `Your comment for ${getLocalizedText(placeName, 'en')} has been approved and published.`,
    ru: `Ваш комментарий для ${getLocalizedText(placeName, 'ru') || getLocalizedText(placeName, 'en')} был одобрен и опубликован.`,
    ar: `تمت الموافقة على تعليقك لـ ${getLocalizedText(placeName, 'ar') || getLocalizedText(placeName, 'en')} ونشره.`,
  };
  await sendNotification(
    getToken,
    userId,
    'rating_approved',
    title,
    message,
    { ratingId, placeId, placeName, rating },
    'high'
  );
}

export async function notifyUserAboutRatingRejection(
  getToken: GetToken,
  userId: string,
  placeId: string,
  placeName: MultilingualText,
  ratingId: string,
  rejectionReason?: string
): Promise<void> {
  const title: MultilingualText = {
    tr: 'Yorumunuz Reddedildi',
    en: 'Your Comment Was Rejected',
    ru: 'Ваш комментарий отклонен',
    ar: 'تم رفض تعليقك',
  };
  const reasonText = rejectionReason
    ? {
        tr: ` Red nedeni: ${rejectionReason}`,
        en: ` Reason: ${rejectionReason}`,
        ru: ` Причина: ${rejectionReason}`,
        ar: ` السبب: ${rejectionReason}`,
      }
    : { tr: '', en: '', ru: '', ar: '' };
  const message: MultilingualText = {
    tr: `${getLocalizedText(placeName, 'tr')} için yazdığınız yorum reddedildi.${reasonText.tr}`,
    en: `Your comment for ${getLocalizedText(placeName, 'en')} has been rejected.${reasonText.en}`,
    ru: `Ваш комментарий для ${getLocalizedText(placeName, 'ru') || getLocalizedText(placeName, 'en')} был отклонен.${reasonText.ru}`,
    ar: `تم رفض تعليقك لـ ${getLocalizedText(placeName, 'ar') || getLocalizedText(placeName, 'en')}.${reasonText.ar}`,
  };
  await sendNotification(
    getToken,
    userId,
    'rating_rejected',
    title,
    message,
    { ratingId, placeId, placeName, rejectionReason: rejectionReason ?? null },
    'medium'
  );
}
