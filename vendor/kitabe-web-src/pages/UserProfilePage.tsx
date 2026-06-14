import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../contexts/AuthContext';
import { usePhotoSubmissions } from '../contexts/PhotoSubmissionContext';
import { useRatings } from '../contexts/RatingContext';
import './UserProfilePage.css';

const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className="user-profile-star-rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`user-profile-star ${star <= rating ? 'filled' : ''}`}
        >
          ★
        </span>
      ))}
    </div>
  );
};

const UserProfilePage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { kullanici, users } = useAuth();
  const { allSubmissions } = usePhotoSubmissions();
  const { allRatings } = useRatings();
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(kullanici?.id || null);
  const [userDropdownVisible, setUserDropdownVisible] = useState(false);

  useEffect(() => {
    if (kullanici) {
      setSelectedUserId(kullanici.id);
    }
  }, [kullanici]);

  const selectedUser = useMemo(() => {
    if (!selectedUserId) return kullanici;
    return users.find(u => u.id === selectedUserId) || kullanici;
  }, [selectedUserId, users, kullanici]);

  const sortedUsers = useMemo(() => {
    return [...users].sort((a, b) => {
      const dateA = a.kayitTarihi || 0;
      const dateB = b.kayitTarihi || 0;
      return dateB - dateA;
    });
  }, [users]);

  const stats = useMemo(() => {
    if (!selectedUser) {
      return {
        totalPhotos: 0,
        approvedPhotos: 0,
        pendingPhotos: 0,
        totalRatings: 0,
        approvedRatings: 0,
        pendingRatings: 0,
        averageRating: 0,
        totalPlacesRated: 0,
        lastActivity: null,
      };
    }

    const userId = selectedUser.id;
    const userPhotos = allSubmissions.filter(s => s.userId === userId);
    const approvedPhotos = userPhotos.filter(s => s.status === 'approved');
    const pendingPhotos = userPhotos.filter(s => s.status === 'pending');
    const userRatings = allRatings.filter(r => r.userId === userId);
    const approvedRatings = userRatings.filter(r => r.status === 'approved');
    const pendingRatings = userRatings.filter(r => r.status === 'pending');
    const approvedRatingValues = approvedRatings.map(r => r.rating);
    const averageRating = approvedRatingValues.length > 0
      ? approvedRatingValues.reduce((sum, val) => sum + val, 0) / approvedRatingValues.length
      : 0;

    const allActivities = [
      ...userPhotos.map(p => ({ date: p.createdAt, type: 'photo' })),
      ...userRatings.map(r => ({ date: r.createdAt, type: 'rating' })),
    ].filter(a => a.date);

    const lastActivity = allActivities.length > 0
      ? allActivities.sort((a, b) => {
          const dateA = a.date?.toDate ? a.date.toDate().getTime() : 0;
          const dateB = b.date?.toDate ? b.date.toDate().getTime() : 0;
          return dateB - dateA;
        })[0]
      : null;

    return {
      totalPhotos: userPhotos.length,
      approvedPhotos: approvedPhotos.length,
      pendingPhotos: pendingPhotos.length,
      totalRatings: userRatings.length,
      approvedRatings: approvedRatings.length,
      pendingRatings: pendingRatings.length,
      averageRating,
      totalPlacesRated: new Set(approvedRatings.map(r => r.placeId)).size,
      lastActivity,
    };
  }, [selectedUser, allSubmissions, allRatings]);

  useEffect(() => {
    setLoading(false);
  }, [allSubmissions, allRatings]);

  if (!kullanici) {
    return (
      <>
        <Helmet>
          <title>{t('profile.title', 'Profilim & İstatistiklerim')} | Kitabe</title>
        </Helmet>
        <div className="user-profile-page">
          <div className="user-profile-error">
            {t('profile.loginRequired', 'Giriş yapmanız gerekiyor')}
          </div>
        </div>
      </>
    );
  }

  if (loading) {
    return (
      <>
        <Helmet>
          <title>{t('profile.title', 'Profilim & İstatistiklerim')} | Kitabe</title>
        </Helmet>
        <div className="user-profile-page">
          <div className="user-profile-loading">
            <div className="spinner"></div>
            <p>{t('common.loading')}</p>
          </div>
        </div>
      </>
    );
  }

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '-';
    try {
      let date: Date;
      if (timestamp.toDate) {
        date = timestamp.toDate();
      } else if (typeof timestamp === 'number') {
        date = new Date(timestamp);
      } else {
        date = new Date(timestamp);
      }
      return date.toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return '-';
    }
  };

  const formatRelativeTime = (timestamp: any) => {
    if (!timestamp) return t('profile.noActivity', 'Aktivite yok');
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return t('profile.justNow', 'Az önce');
      if (diffMins < 60) return `${diffMins} ${t('profile.minutesAgo', 'dakika önce')}`;
      if (diffHours < 24) return `${diffHours} ${t('profile.hoursAgo', 'saat önce')}`;
      if (diffDays < 7) return `${diffDays} ${t('profile.daysAgo', 'gün önce')}`;
      return formatDate(timestamp);
    } catch {
      return '-';
    }
  };

  const isAdmin = kullanici?.rol === 'admin';

  return (
    <>
      <Helmet>
        <title>{t('profile.title', 'Profilim & İstatistiklerim')} | Kitabe</title>
      </Helmet>
      <div className="user-profile-page">
        {isAdmin && (
          <div className="user-profile-admin-selector">
            <button
              className="user-profile-user-selector-button"
              onClick={() => setUserDropdownVisible(true)}
            >
              <span className="material-icons">people</span>
              <span>
                {selectedUser ? `${selectedUser.isim} ${selectedUser.soyad}` : t('profile.selectUser', 'Kullanıcı Seç')}
              </span>
              <span className="material-icons">arrow_drop_down</span>
            </button>
          </div>
        )}

        {selectedUser && (
          <div className="user-profile-card">
            <div className="user-profile-avatar-container">
              <span className="material-icons user-profile-avatar-icon">person</span>
            </div>
            <h2 className="user-profile-name">
              {selectedUser.isim} {selectedUser.soyad}
            </h2>
            <p className="user-profile-email">{selectedUser.email}</p>
            <div className="user-profile-role-badge">
              <span>
                {selectedUser.rol === 'admin' ? t('profile.role.admin', 'Admin') :
                 selectedUser.rol === 'editor' ? t('profile.role.editor', 'Editör') :
                 t('profile.role.user', 'Kullanıcı')}
              </span>
            </div>
            <p className="user-profile-registration-date">
              {t('profile.memberSince', 'Üyelik')}: {formatDate(selectedUser.kayitTarihi)}
            </p>
          </div>
        )}

        {isAdmin && userDropdownVisible && (
          <>
            <div className="user-profile-modal-overlay" onClick={() => setUserDropdownVisible(false)} />
            <div className="user-profile-modal-content">
              <div className="user-profile-modal-header">
                <h3>{t('profile.selectUser', 'Kullanıcı Seç')}</h3>
                <button onClick={() => setUserDropdownVisible(false)}>
                  <span className="material-icons">close</span>
                </button>
              </div>
              <div className="user-profile-user-list">
                {sortedUsers.map((item) => (
                  <button
                    key={item.id}
                    className={`user-profile-user-item ${selectedUserId === item.id ? 'selected' : ''}`}
                    onClick={() => {
                      setSelectedUserId(item.id);
                      setUserDropdownVisible(false);
                    }}
                  >
                    <div className="user-profile-user-item-content">
                      <p className="user-profile-user-item-name">
                        {item.isim} {item.soyad}
                      </p>
                      <p className="user-profile-user-item-email">{item.email}</p>
                      <div className="user-profile-user-item-role">
                        {item.rol === 'admin' ? t('profile.role.admin', 'Admin') :
                         item.rol === 'editor' ? t('profile.role.editor', 'Editör') :
                         t('profile.role.user', 'Kullanıcı')}
                      </div>
                    </div>
                    {selectedUserId === item.id && (
                      <span className="material-icons user-profile-user-item-check">check</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        <div className="user-profile-stats-container">
          <div className="user-profile-stat-card">
            <div className="user-profile-stat-icon-container">
              <span className="material-icons">photo_library</span>
            </div>
            <div className="user-profile-stat-value">{stats.approvedPhotos}</div>
            <div className="user-profile-stat-label">{t('profile.approvedPhotos', 'Onaylanan Fotoğraf')}</div>
            {stats.pendingPhotos > 0 && (
              <div className="user-profile-stat-subtext">
                {stats.pendingPhotos} {t('profile.pending', 'beklemede')}
              </div>
            )}
          </div>

          <div className="user-profile-stat-card">
            <div className="user-profile-stat-icon-container">
              <span className="material-icons">comment</span>
            </div>
            <div className="user-profile-stat-value">{stats.approvedRatings}</div>
            <div className="user-profile-stat-label">{t('profile.approvedRatings', 'Onaylanan Yorum')}</div>
            {stats.pendingRatings > 0 && (
              <div className="user-profile-stat-subtext">
                {stats.pendingRatings} {t('profile.pending', 'beklemede')}
              </div>
            )}
          </div>

          <div className="user-profile-stat-card">
            <div className="user-profile-stat-icon-container">
              <span className="material-icons">star</span>
            </div>
            <div className="user-profile-rating-container">
              <div className="user-profile-stat-value">{stats.averageRating.toFixed(1)}</div>
              <StarRating rating={stats.averageRating} />
            </div>
            <div className="user-profile-stat-label">{t('profile.averageRating', 'Ortalama Puan')}</div>
            <div className="user-profile-stat-subtext">
              {stats.totalPlacesRated} {t('profile.placesRated', 'yer değerlendirdi')}
            </div>
          </div>
        </div>

        <div className="user-profile-details-card">
          <h3 className="user-profile-section-title">{t('profile.detailedStats', 'Detaylı İstatistikler')}</h3>
          
          <div className="user-profile-detail-row">
            <span className="material-icons">photo_library</span>
            <span className="user-profile-detail-label">{t('profile.totalPhotos', 'Toplam Fotoğraf')}:</span>
            <span className="user-profile-detail-value">{stats.totalPhotos}</span>
          </div>

          <div className="user-profile-detail-row">
            <span className="material-icons">comment</span>
            <span className="user-profile-detail-label">{t('profile.totalRatings', 'Toplam Yorum')}:</span>
            <span className="user-profile-detail-value">{stats.totalRatings}</span>
          </div>

          <div className="user-profile-detail-row">
            <span className="material-icons">place</span>
            <span className="user-profile-detail-label">{t('profile.placesRated', 'Değerlendirilen Yer')}:</span>
            <span className="user-profile-detail-value">{stats.totalPlacesRated}</span>
          </div>

          {stats.lastActivity && (
            <div className="user-profile-detail-row">
              <span className="material-icons">schedule</span>
              <span className="user-profile-detail-label">{t('profile.lastActivity', 'Son Aktivite')}:</span>
              <span className="user-profile-detail-value">
                {formatRelativeTime(stats.lastActivity.date)}
              </span>
            </div>
          )}
        </div>

        <div className="user-profile-actions-container">
          <button 
            className="user-profile-action-button"
            onClick={() => navigate('/my-suggestions')}
          >
            <span className="material-icons">lightbulb_outline</span>
            {t('account.mySuggestions')}
          </button>

          <button 
            className="user-profile-action-button"
            onClick={() => navigate('/favorites')}
          >
            <span className="material-icons">favorite</span>
            {t('account.myFavorites')}
          </button>
        </div>
      </div>
    </>
  );
};

export default UserProfilePage;
