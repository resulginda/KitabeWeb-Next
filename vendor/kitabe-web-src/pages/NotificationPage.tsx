import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { useNotifications } from '../contexts/NotificationContext';
import type { Notification } from '../contexts/NotificationContext';
import { useLanguage } from '../contexts/LanguageContext';
import { usePlaces } from '../contexts/PlacesContext';
import { getLocalizedText } from '../utils/multilang';
import { openPlaceDetailById } from '../utils/placeDetailUrl';
import { colors } from '../theme/colors';
import { PageShell, PageEmpty } from '../components/PageShell';
import './NotificationPage.css';

const NotificationPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const { getPlaceById } = usePlaces();
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useNotifications();

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return t('notifications.justNow', 'Az önce');
    if (minutes < 60) return `${minutes} ${t('notifications.minutesAgo', 'dakika önce')}`;
    if (hours < 24) return `${hours} ${t('notifications.hoursAgo', 'saat önce')}`;
    if (days < 7) return `${days} ${t('notifications.daysAgo', 'gün önce')}`;
    return date.toLocaleDateString(currentLanguage || 'tr');
  };

  const getNotificationIcon = (type: Notification['type']): string => {
    switch (type) {
      case 'photo_approved':
      case 'photo_rejected':
      case 'new_photo_for_review':
        return 'photo_camera';
      case 'rating_approved':
      case 'rating_rejected':
      case 'new_rating_for_review':
        return 'comment';
      case 'suggestion_editor_approved':
      case 'suggestion_admin_approved':
      case 'suggestion_rejected':
      case 'new_suggestion_for_review':
      case 'suggestion_editor_approved_for_admin':
        return 'place';
      case 'new_contact_form':
        return 'mail';
      case 'security_alert':
        return 'security';
      default:
        return 'notifications';
    }
  };

  const getNotificationColor = (type: Notification['type']): string => {
    switch (type) {
      case 'photo_approved':
      case 'rating_approved':
      case 'suggestion_admin_approved':
        return '#4CAF50';
      case 'photo_rejected':
      case 'rating_rejected':
      case 'suggestion_rejected':
        return '#F44336';
      case 'new_photo_for_review':
      case 'new_rating_for_review':
      case 'new_suggestion_for_review':
      case 'new_contact_form':
      case 'suggestion_editor_approved_for_admin':
        return colors.primary || '#8B4513';
      case 'security_alert':
        return '#FF9800';
      default:
        return colors.accent || '#D4A574';
    }
  };

  const handleNotificationPress = async (notification: Notification) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }

    const { data } = notification;
    switch (notification.type) {
      case 'new_photo_for_review':
        navigate('/photo-approval');
        break;
      case 'photo_approved':
      case 'photo_rejected':
        if (typeof data?.placeId === 'string') {
          void openPlaceDetailById(data.placeId, currentLanguage, getPlaceById);
        }
        break;
      case 'new_rating_for_review':
        navigate('/rating-approval');
        break;
      case 'rating_approved':
      case 'rating_rejected':
        if (typeof data?.placeId === 'string') {
          void openPlaceDetailById(data.placeId, currentLanguage, getPlaceById);
        }
        break;
      case 'new_suggestion_for_review':
        navigate('/editor-panel');
        break;
      case 'suggestion_editor_approved_for_admin':
        navigate('/admin-panel?initialTab=pending');
        break;
      case 'suggestion_editor_approved':
      case 'suggestion_admin_approved':
      case 'suggestion_rejected':
        navigate('/my-suggestions');
        break;
      case 'new_contact_form':
        navigate('/admin-contact-forms');
        break;
      default:
        break;
    }
  };

  const pageActions = (
    <div className="kb-notif-actions">
      {unreadCount > 0 && (
        <button className="kb-notif-mark-all" type="button" onClick={markAllAsRead}>
          {t('notifications.markAllRead', 'Tümünü okundu işaretle')}
        </button>
      )}
      <button
        type="button"
        onClick={() => navigate('/notification-settings')}
        aria-label={t('notifications.settings.title', 'Bildirim Ayarları')}
      >
        <span className="material-icons">settings</span>
      </button>
    </div>
  );

  if (loading) {
    return (
      <>
        <Helmet>
          <title>{t('notifications.title', 'Bildirimler')} | Kitabe</title>
        </Helmet>
        <PageShell title={t('notifications.title', 'Bildirimler')} backTo="/account" actions={pageActions}>
          <div className="notification-loading">
            <div className="spinner"></div>
          </div>
        </PageShell>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{t('notifications.title', 'Bildirimler')} | Kitabe</title>
      </Helmet>
      <PageShell
        title={t('notifications.title', 'Bildirimler')}
        subtitle={unreadCount > 0 ? `${unreadCount} ${t('notifications.unread', 'okunmamış')}` : undefined}
        backTo="/account"
        actions={pageActions}
      >
        {notifications.length === 0 ? (
          <PageEmpty
            icon="notifications_none"
            title={t('notifications.empty', 'Henüz bildiriminiz yok')}
            subtitle={t('notifications.emptySubtext', 'Yeni bildirimler burada görünecek')}
          />
        ) : (
          <div className="kb-notif-list">
            {notifications.map((notification) => {
              const iconName = getNotificationIcon(notification.type);
              const iconColor = getNotificationColor(notification.type);
              const title = getLocalizedText(notification.title, currentLanguage || 'tr');
              const message = getLocalizedText(notification.message, currentLanguage || 'tr');

              return (
                <div
                  key={notification.id}
                  className={`kb-notif-item ${!notification.read ? 'is-unread' : ''}`}
                  onClick={() => handleNotificationPress(notification)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') void handleNotificationPress(notification);
                  }}
                >
                  <div className="kb-notif-icon" style={{ backgroundColor: `${iconColor}18`, color: iconColor }}>
                    <span className="material-icons">{iconName}</span>
                  </div>
                  <div className="kb-notif-body">
                    <h3>{title}</h3>
                    <p>{message}</p>
                    <span className="kb-notif-time">{formatDate(notification.createdAt)}</span>
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

export default NotificationPage;
