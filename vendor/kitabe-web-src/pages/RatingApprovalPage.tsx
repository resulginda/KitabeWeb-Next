import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { useRatings } from '../contexts/RatingContext';
import { usePlaces } from '../contexts/PlacesContext';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { getLocalizedText } from '../utils/multilang';
import { API_BASE_URL } from '../config/api';
import { notifyUserAboutRatingApproval, notifyUserAboutRatingRejection } from '../services/notificationService';
import { PageShell } from '../components/PageShell';

const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`material-icons ${star <= rating ? '' : 'empty'}`}
        >
          {star <= rating ? 'star' : 'star_border'}
        </span>
      ))}
    </div>
  );
};

const formatDate = (val: unknown): string => {
  if (!val) return '-';
  const d = typeof val === 'string' ? new Date(val) : (val as { toDate?: () => Date })?.toDate?.() ?? new Date(val as string);
  return d.toLocaleString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const RatingApprovalPage = () => {
  const { t } = useTranslation();
  const { getToken } = useAuth();
  const { currentLanguage } = useLanguage();
  const { pendingRatings, refresh } = useRatings();
  const { places } = usePlaces();

  const handleApprove = async (ratingId: string) => {
    const token = await getToken();
    if (!token) return;
    const item = pendingRatings.find((r) => r.id === ratingId);
    if (!item) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/ratings/${ratingId}/approve`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Onaylama başarısız');

      const place = places.find(p => p.id === item.placeId);
      if (place && item.userId) {
        const placeName = {
          tr: getLocalizedText(place.name, 'tr'),
          en: getLocalizedText(place.name, 'en'),
          ru: getLocalizedText(place.name, 'ru'),
          ar: getLocalizedText(place.name, 'ar'),
        };
        await notifyUserAboutRatingApproval(
          getToken,
          item.userId,
          item.placeId,
          placeName,
          ratingId,
          item.rating ?? 0
        ).catch((err) => console.error('Bildirim gönderme hatası:', err));
      }
      await refresh();
      alert(t('account.ratings.approveSuccess', 'Değerlendirme onaylandı'));
    } catch (err: unknown) {
      console.error('Approve rating error:', err);
      alert(err instanceof Error ? err.message : t('account.ratings.errorMessage', 'İşlem başarısız oldu'));
    }
  };

  const handleReject = async (ratingId: string) => {
    if (!confirm(t('account.ratings.rejectConfirm', 'Bu değerlendirmeyi reddetmek istediğinizden emin misiniz?'))) return;
    const token = await getToken();
    if (!token) return;
    const item = pendingRatings.find((r) => r.id === ratingId);
    if (!item) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/ratings/${ratingId}/reject`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ rejectedReason: '' }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Reddetme başarısız');

      const place = places.find(p => p.id === item.placeId);
      if (place && item.userId) {
        const placeName = {
          tr: getLocalizedText(place.name, 'tr'),
          en: getLocalizedText(place.name, 'en'),
          ru: getLocalizedText(place.name, 'ru'),
          ar: getLocalizedText(place.name, 'ar'),
        };
        await notifyUserAboutRatingRejection(
          getToken,
          item.userId,
          item.placeId,
          placeName,
          ratingId
        ).catch((err) => console.error('Bildirim gönderme hatası:', err));
      }
      await refresh();
      alert(t('account.ratings.rejectSuccess', 'Değerlendirme reddedildi'));
    } catch (err: unknown) {
      console.error('Reject rating error:', err);
      alert(err instanceof Error ? err.message : t('account.ratings.errorMessage', 'İşlem başarısız oldu'));
    }
  };

  return (
    <>
      <Helmet>
        <title>{t('account.ratings.title', 'Değerlendirmeler')} | Kitabe</title>
      </Helmet>
      <PageShell
        title={t('account.ratings.title', 'Değerlendirmeler')}
        subtitle={`${pendingRatings.length} ${t('account.ratings.pending', 'bekleyen değerlendirme')}`}
        backTo="/account"
        className="rating-approval-page"
      >
        {pendingRatings.length === 0 ? (
          <div className="rating-approval-empty">
            <span className="material-icons rating-approval-empty-icon">star_outline</span>
            <p className="rating-approval-empty-text">
              {t('account.ratings.noRatings', 'Henüz bekleyen değerlendirme yok.')}
            </p>
          </div>
        ) : (
          <div className="rating-approval-list">
            {pendingRatings.map((item) => {
              const place = places.find(p => p.id === item.placeId);
              const placeName = place
                ? (typeof place.name === 'string' ? place.name : getLocalizedText(place.name, currentLanguage))
                : item.placeId;
              const formattedDate = formatDate(item.createdAt);

              return (
                <div key={item.id} className="rating-approval-card">
                  <div className="rating-approval-card-content">
                    <div className="rating-approval-place-header">
                      <h3 className="rating-approval-place-title">{placeName}</h3>
                      <div className="rating-approval-rating-display">
                        <StarRating rating={item.rating} />
                        <span className="rating-approval-rating-value">{item.rating}/5</span>
                      </div>
                    </div>
                    <p className="rating-approval-user-info">
                      {t('account.ratings.user', 'Kullanıcı')}: {item.userName} ({item.userEmail})
                    </p>
                    <p className="rating-approval-date-info">
                      {t('account.ratings.date', 'Tarih')}: {formattedDate}
                    </p>
                    {item.comment && (
                      <div className="rating-approval-comment">
                        <p className="rating-approval-comment-label">
                          {t('account.ratings.comment', 'Yorum')}:
                        </p>
                        <p className="rating-approval-comment-text">{item.comment}</p>
                      </div>
                    )}
                  </div>
                  <div className="rating-approval-actions">
                    <button
                      className="rating-approval-btn rating-approval-btn-approve"
                      onClick={() => handleApprove(item.id)}
                    >
                      <span className="material-icons">check</span>
                      {t('account.ratings.approve', 'Onayla')}
                    </button>
                    <button
                      className="rating-approval-btn rating-approval-btn-reject"
                      onClick={() => handleReject(item.id)}
                    >
                      <span className="material-icons">close</span>
                      {t('account.ratings.reject', 'Reddet')}
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

export default RatingApprovalPage;
