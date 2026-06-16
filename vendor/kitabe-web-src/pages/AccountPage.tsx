import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useNotifications } from '../contexts/NotificationContext';
import { useRatings } from '../contexts/RatingContext';
import { usePhotoSubmissions } from '../contexts/PhotoSubmissionContext';
import { apiFetch } from '../utils/apiClient';
import './AccountPage.css';

function normalizeTimestamp(ts: number | string | undefined): number | null {
  if (ts === undefined || ts === null || ts === '') return null;
  if (typeof ts === 'string') {
    const parsed = new Date(ts).getTime();
    return Number.isNaN(parsed) ? null : parsed;
  }
  return ts < 1e12 ? ts * 1000 : ts;
}

function formatMembershipDuration(ts: number | string | undefined): string {
  const normalized = normalizeTimestamp(ts);
  if (!normalized) return '-';
  const diff = Math.max(0, Date.now() - normalized);
  const year = Math.floor(diff / 31536000000);
  const month = Math.floor((diff % 31536000000) / 2629800000);
  const day = Math.floor((diff % 2629800000) / 86400000);
  const parts: string[] = [];
  if (year) parts.push(`${year} yıl`);
  if (month) parts.push(`${month} ay`);
  if (day || parts.length === 0) parts.push(`${day} gün`);
  return parts.join(' ');
}

type MenuTile = {
  to: string;
  icon: string;
  label: string;
  badge?: number;
  accent?: boolean;
};

const AccountPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { kullanici, cikisYap, yukleniyor } = useAuth();
  const { currentLanguage, setLanguage } = useLanguage();
  const { unreadCount } = useNotifications();
  const { pendingRatings } = useRatings();
  const { pendingSubmissions } = usePhotoSubmissions();
  const [contactFormsCount, setContactFormsCount] = useState(0);
  const [languageDropdownVisible, setLanguageDropdownVisible] = useState(false);

  useEffect(() => {
    if (kullanici?.rol !== 'admin') {
      setContactFormsCount(0);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await apiFetch('/api/contact-forms/count');
        const data = await res.json();
        if (!cancelled && data.success && data.data) {
          setContactFormsCount(Number(data.data.unread) || 0);
        }
      } catch (err) {
        console.error('AccountPage contactForms error:', err);
        if (!cancelled) setContactFormsCount(0);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [kullanici?.rol]);

  const languages = [
    { code: 'tr' as const, name: 'Türkçe', flag: '🇹🇷' },
    { code: 'en' as const, name: 'English', flag: '🇬🇧' },
    { code: 'ru' as const, name: 'Русский', flag: '🇷🇺' },
    { code: 'ar' as const, name: 'العربية', flag: '🇸🇦' },
  ];

  const handleLanguageSelect = (langCode: (typeof languages)[0]['code']) => {
    setLanguage(langCode);
    setLanguageDropdownVisible(false);
  };

  const handleLogout = () => {
    cikisYap();
    navigate('/');
  };

  const registrationDate = useMemo(() => {
    const ts = normalizeTimestamp(kullanici?.kayitTarihi);
    return ts ? new Date(ts).toLocaleDateString() : '-';
  }, [kullanici?.kayitTarihi]);

  const membershipDuration = useMemo(
    () => formatMembershipDuration(kullanici?.kayitTarihi),
    [kullanici?.kayitTarihi]
  );

  const personalTiles: MenuTile[] = useMemo(
    () => [
      { to: '/account-settings', icon: 'manage_accounts', label: t('account.editAccount'), accent: true },
      { to: '/profile', icon: 'bar_chart', label: t('profile.title', 'Profilim & İstatistiklerim') },
      { to: '/notifications', icon: 'notifications', label: t('notifications.title', 'Bildirimler'), badge: unreadCount },
      { to: '/favorites', icon: 'favorite', label: t('account.myFavorites') },
      { to: '/suggestion', icon: 'add_location_alt', label: t('account.suggestPlace') },
      { to: '/my-suggestions', icon: 'list_alt', label: t('account.mySuggestions') },
    ],
    [t, unreadCount]
  );

  const adminTiles: MenuTile[] = useMemo(() => {
    if (kullanici?.rol !== 'admin') return [];
    return [
      { to: '/admin-hub', icon: 'admin_panel_settings', label: t('account.adminDashboard', 'Admin Paneli'), accent: true },
      {
        to: '/admin-contact-forms',
        icon: 'mail',
        label: t('account.contactForms', 'İletişim Formları'),
        badge: contactFormsCount,
      },
    ];
  }, [kullanici?.rol, t, contactFormsCount]);

  const editorTiles: MenuTile[] = useMemo(() => {
    if (kullanici?.rol !== 'editor') return [];
    return [
      { to: '/editor-panel', icon: 'edit_note', label: t('account.editorPanel') },
      {
        to: '/rating-approval',
        icon: 'star_rate',
        label: t('account.ratings.title', 'Değerlendirmeler'),
        badge: pendingRatings.length,
      },
      {
        to: '/photo-approval',
        icon: 'photo_camera',
        label: t('account.photoApproval.title', 'Fotoğraf İstekleri'),
        badge: pendingSubmissions.length,
      },
    ];
  }, [kullanici?.rol, t, pendingRatings.length, pendingSubmissions.length]);

  const renderTiles = (tiles: MenuTile[]) => (
    <div className="kb-account-grid">
      {tiles.map((tile) => (
        <Link key={tile.to} to={tile.to} className={`kb-account-tile ${tile.accent ? 'is-accent' : ''}`}>
          <span className="kb-account-tile-icon" aria-hidden>
            <span className="material-icons">{tile.icon}</span>
          </span>
          <span className="kb-account-tile-label">{tile.label}</span>
          {tile.badge !== undefined && tile.badge > 0 && (
            <span className="account-badge">{tile.badge > 99 ? '99+' : tile.badge}</span>
          )}
        </Link>
      ))}
    </div>
  );

  if (yukleniyor) {
    return <div className="account-page loading">{t('common.loading')}</div>;
  }

  if (!kullanici) {
    return (
      <div className="account-page">
        <div className="account-shell account-guest-card animate-fade-in">
          <p className="kb-meta">{t('account.myAccount')}</p>
          <h1>{t('account.welcomeToKitabe')}</h1>
          <p className="kb-lead">{t('account.guestHint', { defaultValue: 'Favoriler, rota ve yakınımdakiler için giriş yapın.' })}</p>
          <div className="auth-buttons">
            <Link to="/login" className="btn btn-primary">
              {t('common.login')}
            </Link>
            <Link to="/register" className="btn btn-secondary">
              {t('common.register')}
            </Link>
          </div>
          <div className="language-selector">
            <label>{t('common.language')}</label>
            <select value={currentLanguage} onChange={(e) => setLanguage(e.target.value as typeof currentLanguage)}>
              <option value="tr">{t('language.turkish')}</option>
              <option value="en">{t('language.english')}</option>
              <option value="ru">{t('language.russian')}</option>
              <option value="ar">{t('language.arabic')}</option>
            </select>
          </div>
        </div>
      </div>
    );
  }

  const initials = `${kullanici.isim?.charAt(0) ?? ''}${kullanici.soyad?.charAt(0) ?? ''}`.toUpperCase() || 'K';

  return (
    <div className="account-page">
      <div className="account-shell">
        <header className="kb-account-hero">
          <div className="kb-account-hero-main">
            <div className="kb-account-avatar" aria-hidden>
              {initials}
            </div>
            <div className="kb-account-hero-text">
              <p className="kb-account-eyebrow">{t('account.myAccount')}</p>
              <h1>
                {kullanici.isim} {kullanici.soyad}
              </h1>
              <p className="account-email">{kullanici.email}</p>
            </div>
          </div>
          <button
            type="button"
            className="account-language-button"
            aria-label={t('common.language')}
            onClick={() => setLanguageDropdownVisible(!languageDropdownVisible)}
          >
            <span className="material-icons">language</span>
          </button>
        </header>

        {languageDropdownVisible && (
          <>
            <div className="account-language-overlay" onClick={() => setLanguageDropdownVisible(false)} />
            <div className="account-language-dropdown">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  className={`account-language-dropdown-item ${currentLanguage === lang.code ? 'selected' : ''}`}
                  onClick={() => handleLanguageSelect(lang.code)}
                >
                  <span className="account-language-flag">{lang.flag}</span>
                  <span>{lang.name}</span>
                </button>
              ))}
            </div>
          </>
        )}

        <div className="kb-account-stats">
          <div className="kb-account-stat">
            <span className="material-icons">badge</span>
            <div>
              <strong>{kullanici.rol || 'user'}</strong>
              <span>{t('account.role')}</span>
            </div>
          </div>
          <div className="kb-account-stat">
            <span className="material-icons">event</span>
            <div>
              <strong>{registrationDate}</strong>
              <span>{t('account.registrationDate')}</span>
            </div>
          </div>
          <div className="kb-account-stat">
            <span className="material-icons">schedule</span>
            <div>
              <strong>{membershipDuration}</strong>
              <span>{t('account.membershipDuration')}</span>
            </div>
          </div>
        </div>

        <section className="kb-account-section">
          <h2>{t('account.sectionPersonal', 'Hesabım')}</h2>
          {renderTiles(personalTiles)}
        </section>

        {editorTiles.length > 0 && (
          <section className="kb-account-section">
            <h2>{t('account.sectionEditor', 'Editör')}</h2>
            {renderTiles(editorTiles)}
          </section>
        )}

        {adminTiles.length > 0 && (
          <section className="kb-account-section">
            <h2>{t('account.sectionAdmin', 'Yönetim')}</h2>
            {renderTiles(adminTiles)}
          </section>
        )}

        <section className="kb-account-section">
          <h2>{t('account.sectionSupport', 'Destek')}</h2>
          <div className="kb-account-grid">
            <Link to="/iletisim" className="kb-account-tile">
              <span className="kb-account-tile-icon" aria-hidden>
                <span className="material-icons">support_agent</span>
              </span>
              <span className="kb-account-tile-label">{t('contact.title')}</span>
            </Link>
          </div>
        </section>

        <footer className="kb-account-footer">
          <button type="button" className="btn btn-logout" onClick={handleLogout}>
            <span className="material-icons">logout</span>
            {t('common.logout')}
          </button>
        </footer>
      </div>
    </div>
  );
};

export default AccountPage;
