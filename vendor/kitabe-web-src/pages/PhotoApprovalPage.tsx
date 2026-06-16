import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../contexts/AuthContext';
import { usePhotoSubmissions } from '../contexts/PhotoSubmissionContext';
import { usePlaces } from '../contexts/PlacesContext';
import type { PhotoSubmission } from '../types/photoSubmission';
import { API_BASE_URL } from '../config/api';
import { notifyUserAboutPhotoApproval, notifyUserAboutPhotoRejection } from '../services/notificationService';
import { getLocalizedText } from '../utils/multilang';
import { PageShell } from '../components/PageShell';

const getInitials = (name: string | undefined | null): string => {
  if (!name) return '?';
  const initials = name.split(' ').map(x => x?.charAt(0)?.toUpperCase()).join('').slice(0, 2);
  return initials || '?';
};

const formatDate = (val: unknown): string => {
  if (!val) return 'Tarih yok';
  const d = typeof val === 'string' ? new Date(val) : (val as { toDate?: () => Date })?.toDate?.() ?? new Date(val as string);
  return d.toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const PhotoApprovalPage = () => {
  const { t } = useTranslation();
  const { kullanici, getToken } = useAuth();
  const { pendingSubmissions, loading, refresh } = usePhotoSubmissions();
  const { places } = usePlaces();

  const handleApprovePhoto = async (submission: PhotoSubmission) => {
    if (!kullanici) return;
    const token = await getToken();
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/photo-submissions/${submission.id}/approve`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Onaylama başarısız');

      const place = places.find(p => p.id === submission.placeId);
      if (place) {
        const placeName = {
          tr: getLocalizedText(place.name, 'tr'),
          en: getLocalizedText(place.name, 'en'),
          ru: getLocalizedText(place.name, 'ru'),
          ar: getLocalizedText(place.name, 'ar'),
        };
        await notifyUserAboutPhotoApproval(
          getToken,
          submission.userId,
          submission.placeId,
          placeName,
          submission.id,
          submission.photoUrl
        ).catch((err) => console.error('Bildirim gönderme hatası:', err));
      }
      await refresh();
      alert(t('photoApproval.photoApproved', 'Fotoğraf onaylandı ve yayınlandı.'));
    } catch (err: unknown) {
      console.error('Photo approval error:', err);
      alert(err instanceof Error ? err.message : t('photoApproval.photoApprovalErrorMessage', 'Fotoğraf onaylanırken bir hata oluştu.'));
    }
  };

  const handleRejectPhoto = async (submission: PhotoSubmission) => {
    if (!kullanici) return;
    if (!confirm(t('photoApproval.rejectPhotoMessage', 'Bu fotoğrafı reddetmek istediğinizden emin misiniz?'))) return;
    const token = await getToken();
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/photo-submissions/${submission.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Reddetme başarısız');

      const place = places.find(p => p.id === submission.placeId);
      if (place) {
        const placeName = {
          tr: getLocalizedText(place.name, 'tr'),
          en: getLocalizedText(place.name, 'en'),
          ru: getLocalizedText(place.name, 'ru'),
          ar: getLocalizedText(place.name, 'ar'),
        };
        await notifyUserAboutPhotoRejection(
          getToken,
          submission.userId,
          submission.placeId,
          placeName,
          submission.id
        ).catch((err) => console.error('Bildirim gönderme hatası:', err));
      }
      await refresh();
      alert(t('photoApproval.photoRejected', 'Fotoğraf reddedildi.'));
    } catch (err: unknown) {
      console.error('Photo rejection error:', err);
      alert(err instanceof Error ? err.message : t('photoApproval.photoRejectionErrorMessage', 'Fotoğraf reddedilirken bir hata oluştu.'));
    }
  };

  if (loading) {
    return (
      <>
        <Helmet>
          <title>{t('photoApproval.header', 'Fotoğraf İstekleri')} | Kitabe</title>
        </Helmet>
        <PageShell title={t('account.photoApproval.title', 'Fotoğraf İstekleri')} backTo="/account" className="photo-approval-page">
          <div className="photo-approval-loading">
            <div className="spinner"></div>
          </div>
        </PageShell>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{t('photoApproval.header', 'Fotoğraf İstekleri')} | Kitabe</title>
      </Helmet>
      <PageShell
        title={t('account.photoApproval.title', 'Fotoğraf İstekleri')}
        subtitle={String(pendingSubmissions.length)}
        backTo="/account"
        className="photo-approval-page"
      >
        {pendingSubmissions.length === 0 ? (
          <div className="photo-approval-empty">
            <span className="material-icons photo-approval-empty-icon">photo_library</span>
            <p className="photo-approval-empty-text">
              {t('photoApproval.noPhotoSubmissions', 'Henüz bekleyen fotoğraf isteği yok.')}
            </p>
          </div>
        ) : (
          <div className="photo-approval-list">
            {pendingSubmissions.map((item) => {
              const place = places.find(p => p.id === item.placeId);
              const placeName = place
                ? (typeof place.name === 'string' ? place.name : getLocalizedText(place.name, 'tr'))
                : 'Yer bulunamadı';
              const formattedDate = formatDate(item.createdAt);

              return (
                <div key={item.id} className="photo-approval-card">
                  <div className="photo-approval-card-content">
                    <img
                      src={item.photoUrl}
                      alt={placeName}
                      className="photo-approval-thumb"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder-image.png';
                      }}
                    />
                    <div className="photo-approval-info">
                      <h3 className="photo-approval-place-name">{placeName}</h3>
                      <div className="photo-approval-user-info">
                        <div className="photo-approval-avatar">
                          {getInitials(item.userName)}
                        </div>
                        <div className="photo-approval-user-details">
                          <p className="photo-approval-user-name">{item.userName}</p>
                          <p className="photo-approval-user-email">{item.userEmail}</p>
                        </div>
                      </div>
                      <p className="photo-approval-date">{formattedDate}</p>
                    </div>
                  </div>
                  <div className="photo-approval-actions">
                    <button
                      className="photo-approval-btn photo-approval-btn-approve"
                      onClick={() => handleApprovePhoto(item)}
                    >
                      <span className="material-icons">check_circle</span>
                      {t('photoApproval.approvePhoto', 'Onayla')}
                    </button>
                    <button
                      className="photo-approval-btn photo-approval-btn-reject"
                      onClick={() => handleRejectPhoto(item)}
                    >
                      <span className="material-icons">cancel</span>
                      {t('photoApproval.rejectPhoto', 'Reddet')}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </PageShell>
    </>
  );
};

export default PhotoApprovalPage;
