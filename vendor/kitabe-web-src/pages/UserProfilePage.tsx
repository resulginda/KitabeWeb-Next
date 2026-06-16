import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../contexts/AuthContext';
import { usePhotoSubmissions } from '../contexts/PhotoSubmissionContext';
import { useRatings } from '../contexts/RatingContext';
import { PageShell, PageSection, PageLoginRequired } from '../components/PageShell';
import './UserProfilePage.css';

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="kb-profile-stars" aria-label={`${rating.toFixed(1)} / 5`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} className={star <= Math.round(rating) ? '' : 'empty'}>
          ★
        </span>
      ))}
    </div>
  );
}

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
    if (kullanici) setSelectedUserId(kullanici.id);
  }, [kullanici]);

  const selectedUser = useMemo(() => {
    if (!selectedUserId) return kullanici;
    return users.find((u) => u.id === selectedUserId) || kullanici;
  }, [selectedUserId, users, kullanici]);

  const sortedUsers = useMemo(
    () => [...users].sort((a, b) => (b.kayitTarihi || 0) - (a.kayitTarihi || 0)),
    [users]
  );

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
        lastActivity: null as { date: unknown; type: string } | null,
      };
    }

    const userId = selectedUser.id;
    const userPhotos = allSubmissions.filter((s) => s.userId === userId);
    const approvedPhotos = userPhotos.filter((s) => s.status === 'approved');
    const pendingPhotos = userPhotos.filter((s) => s.status === 'pending');
    const userRatings = allRatings.filter((r) => r.userId === userId);
    const approvedRatings = userRatings.filter((r) => r.status === 'approved');
    const pendingRatings = userRatings.filter((r) => r.status === 'pending');
    const approvedRatingValues = approvedRatings.map((r) => r.rating);
    const averageRating =
      approvedRatingValues.length > 0
        ? approvedRatingValues.reduce((sum, val) => sum + val, 0) / approvedRatingValues.length
        : 0;

    const allActivities = [
      ...userPhotos.map((p) => ({ date: p.createdAt, type: 'photo' })),
      ...userRatings.map((r) => ({ date: r.createdAt, type: 'rating' })),
    ].filter((a) => a.date);

    const lastActivity =
      allActivities.length > 0
        ? allActivities.sort((a, b) => {
            const dateA = (a.date as { toDate?: () => Date })?.toDate?.()?.getTime() ?? 0;
            const dateB = (b.date as { toDate?: () => Date })?.toDate?.()?.getTime() ?? 0;
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
      totalPlacesRated: new Set(approvedRatings.map((r) => r.placeId)).size,
      lastActivity,
    };
  }, [selectedUser, allSubmissions, allRatings]);

  useEffect(() => {
    setLoading(false);
  }, [allSubmissions, allRatings]);

  const formatDate = (timestamp: unknown) => {
    if (!timestamp) return '-';
    try {
      let date: Date;
      if (typeof timestamp === 'object' && timestamp !== null && 'toDate' in timestamp) {
        date = (timestamp as { toDate: () => Date }).toDate();
      } else if (typeof timestamp === 'number') {
        date = new Date(timestamp < 1e12 ? timestamp * 1000 : timestamp);
      } else {
        date = new Date(timestamp as string);
      }
      return date.toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return '-';
    }
  };

  const formatRelativeTime = (timestamp: unknown) => {
    if (!timestamp) return t('profile.noActivity', 'Aktivite yok');
    try {
      const date =
        typeof timestamp === 'object' && timestamp !== null && 'toDate' in timestamp
          ? (timestamp as { toDate: () => Date }).toDate()
          : new Date(timestamp as string | number);
      const diffMs = Date.now() - date.getTime();
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

  const roleLabel =
    selectedUser?.rol === 'admin'
      ? t('profile.role.admin', 'Admin')
      : selectedUser?.rol === 'editor'
        ? t('profile.role.editor', 'Editör')
        : t('profile.role.user', 'Kullanıcı');

  const initials = selectedUser
    ? `${selectedUser.isim?.charAt(0) ?? ''}${selectedUser.soyad?.charAt(0) ?? ''}`.toUpperCase() || 'K'
    : 'K';

  const isAdmin = kullanici?.rol === 'admin';

  if (!kullanici) {
    return (
      <>
        <Helmet>
          <title>{t('profile.title', 'Profilim & İstatistiklerim')} | Kitabe</title>
        </Helmet>
        <PageLoginRequired message={t('profile.loginRequired', 'Giriş yapmanız gerekiyor')} />
      </>
    );
  }

  if (loading) {
    return (
      <>
        <Helmet>
          <title>{t('profile.title', 'Profilim & İstatistiklerim')} | Kitabe</title>
        </Helmet>
        <PageShell
          title={t('profile.title', 'Profilim & İstatistiklerim')}
          backTo="/account"
          shellClassName="kb-page-wide"
        >
          <div className="spinner" />
        </PageShell>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{t('profile.title', 'Profilim & İstatistiklerim')} | Kitabe</title>
      </Helmet>
      <PageShell
        title={t('profile.title', 'Profilim & İstatistiklerim')}
        subtitle={t('profile.subtitle', 'Katkılarınız ve aktivite özeti')}
        backTo="/account"
        shellClassName="kb-page-wide"
      >
        {isAdmin && (
          <button type="button" className="kb-user-picker" onClick={() => setUserDropdownVisible(true)}>
            <span className="material-icons">people</span>
            <span>
              {selectedUser ? `${selectedUser.isim} ${selectedUser.soyad}` : t('profile.selectUser', 'Kullanıcı Seç')}
            </span>
            <span className="material-icons">expand_more</span>
          </button>
        )}

        {selectedUser && (
          <header className="kb-member-hero">
            <div className="kb-member-hero-main">
              <div className="kb-member-avatar">{initials}</div>
              <div className="kb-member-hero-text">
                <h2>
                  {selectedUser.isim} {selectedUser.soyad}
                </h2>
                <p>{selectedUser.email}</p>
                <span className="kb-member-role">{roleLabel}</span>
              </div>
            </div>
          </header>
        )}

        <div className="kb-metric-grid">
          <div className="kb-metric-card">
            <div className="kb-metric-icon">
              <span className="material-icons">photo_library</span>
            </div>
            <div className="kb-metric-value">{stats.approvedPhotos}</div>
            <div className="kb-metric-label">{t('profile.approvedPhotos', 'Onaylanan Fotoğraf')}</div>
            {stats.pendingPhotos > 0 && (
              <span className="kb-metric-sub">
                {stats.pendingPhotos} {t('profile.pending', 'beklemede')}
              </span>
            )}
          </div>
          <div className="kb-metric-card">
            <div className="kb-metric-icon">
              <span className="material-icons">rate_review</span>
            </div>
            <div className="kb-metric-value">{stats.approvedRatings}</div>
            <div className="kb-metric-label">{t('profile.approvedRatings', 'Onaylanan Yorum')}</div>
            {stats.pendingRatings > 0 && (
              <span className="kb-metric-sub">
                {stats.pendingRatings} {t('profile.pending', 'beklemede')}
              </span>
            )}
          </div>
          <div className="kb-metric-card">
            <div className="kb-metric-icon">
              <span className="material-icons">star</span>
            </div>
            <div className="kb-metric-value">{stats.averageRating.toFixed(1)}</div>
            <StarRating rating={stats.averageRating} />
            <div className="kb-metric-label">{t('profile.averageRating', 'Ortalama Puan')}</div>
            <span className="kb-metric-sub">
              {stats.totalPlacesRated} {t('profile.placesRated', 'yer')}
            </span>
          </div>
        </div>

        <div className="kb-member-split">
          <PageSection title={t('profile.detailedStats', 'Detaylı İstatistikler')}>
            <div className="user-profile-detail-row">
              <span className="material-icons">photo_library</span>
              <span className="user-profile-detail-label">{t('profile.totalPhotos', 'Toplam Fotoğraf')}</span>
              <span className="user-profile-detail-value">{stats.totalPhotos}</span>
            </div>
            <div className="user-profile-detail-row">
              <span className="material-icons">comment</span>
              <span className="user-profile-detail-label">{t('profile.totalRatings', 'Toplam Yorum')}</span>
              <span className="user-profile-detail-value">{stats.totalRatings}</span>
            </div>
            <div className="user-profile-detail-row">
              <span className="material-icons">event</span>
              <span className="user-profile-detail-label">{t('profile.memberSince', 'Üyelik')}</span>
              <span className="user-profile-detail-value">{formatDate(selectedUser?.kayitTarihi)}</span>
            </div>
            {stats.lastActivity && (
              <div className="user-profile-detail-row">
                <span className="material-icons">schedule</span>
                <span className="user-profile-detail-label">{t('profile.lastActivity', 'Son Aktivite')}</span>
                <span className="user-profile-detail-value">{formatRelativeTime(stats.lastActivity.date)}</span>
              </div>
            )}
          </PageSection>

          <aside className="kb-quick-links">
            <button type="button" className="kb-quick-link" onClick={() => navigate('/my-suggestions')}>
              <span className="material-icons">lightbulb_outline</span>
              {t('account.mySuggestions')}
            </button>
            <button type="button" className="kb-quick-link" onClick={() => navigate('/favorites')}>
              <span className="material-icons">favorite</span>
              {t('account.myFavorites')}
            </button>
            <Link to="/account-settings" className="kb-quick-link">
              <span className="material-icons">manage_accounts</span>
              {t('account.editAccount')}
            </Link>
          </aside>
        </div>

        {isAdmin && userDropdownVisible && (
          <>
            <div className="user-profile-modal-overlay" onClick={() => setUserDropdownVisible(false)} />
            <div className="user-profile-modal-content">
              <div className="user-profile-modal-header">
                <h3>{t('profile.selectUser', 'Kullanıcı Seç')}</h3>
                <button type="button" onClick={() => setUserDropdownVisible(false)}>
                  <span className="material-icons">close</span>
                </button>
              </div>
              <div className="user-profile-user-list">
                {sortedUsers.map((item) => (
                  <button
                    key={item.id}
                    type="button"
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
      </PageShell>
    </>
  );
};

export default UserProfilePage;
