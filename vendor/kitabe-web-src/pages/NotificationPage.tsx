import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { useNotifications } from '../contexts/NotificationContext';
import type { Notification } from '../contexts/NotificationContext';
import { useLanguage } from '../contexts/LanguageContext';
import { getLocalizedText } from '../utils/multilang';
import { colors } from '../theme/colors';
import './NotificationPage.css';

const NotificationPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
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
        if (data?.placeId) {
          navigate(`/detail/${data.placeId}`);
        }
        break;
      case 'new_rating_for_review':
        navigate('/rating-approval');
        break;
      case 'rating_approved':
      case 'rating_rejected':
        if (data?.placeId) {
          navigate(`/detail/${data.placeId}`);
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

  if (loading) {
    return (
      <>
        <Helmet>
          <title>{t('notifications.title', 'Bildirimler')} | Kitabe</title>
        </Helmet>
        <div className="notification-page">
          <div className="notification-loading">
            <div className="spinner"></div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{t('notifications.title', 'Bildirimler')} | Kitabe</title>
      </Helmet>
      <div className="notification-page">
        <div className="notification-header">
          <button className="notification-back-btn" onClick={() => navigate(-1)}>
            <span className="material-icons">arrow_back</span>
          </button>
          <h1 className="notification-title">{t('notifications.title', 'Bildirimler')}</h1>
          <div className="notification-header-right">
            {unreadCount > 0 && (
              <button className="notification-mark-all-btn" onClick={markAllAsRead}>
                {t('notifications.markAllRead', 'Tümünü okundu işaretle')}
              </button>
            )}
            <button className="notification-settings-btn" onClick={() => navigate('/notification-settings')}>
              <span className="material-icons">settings</span>
            </button>
          </div>
        </div>

        {notifications.length === 0 ? (
          <div className="notification-empty">
            <span className="material-icons notification-empty-icon">notifications_none</span>
            <p className="notification-empty-text">{t('notifications.empty', 'Henüz bildiriminiz yok')}</p>
            <p className="notification-empty-subtext">{t('notifications.emptySubtext', 'Yeni bildirimler burada görünecek')}</p>
          </div>
        ) : (
          <div className="notification-list">
            {notifications.map((notification) => {
              const iconName = getNotificationIcon(notification.type);
              const iconColor = getNotificationColor(notification.type);
              const title = getLocalizedText(notification.title, currentLanguage || 'tr');
              const message = getLocalizedText(notification.message, currentLanguage || 'tr');

              return (
                <div
                  key={notification.id}
                  className={`notification-item ${!notification.read ? 'notification-item-unread' : ''}`}
                  onClick={() => handleNotificationPress(notification)}
                >
                  <div className="notification-icon-container" style={{ backgroundColor: iconColor + '20' }}>
                    <span className="material-icons" style={{ color: iconColor }}>
                      {iconName}
                    </span>
                  </div>
                  <div className="notification-content">
                    <div className="notification-item-header">
                      <h3 className="notification-item-title">{title}</h3>
                      {!notification.read && <span className="notification-unread-dot"></span>}
                    </div>
                    <p className="notification-item-message">{message}</p>
                    <span className="notification-item-time">{formatDate(notification.createdAt)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

export default NotificationPage;
