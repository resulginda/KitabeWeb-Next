import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useNotifications } from '../contexts/NotificationContext';
import { useRatings } from '../contexts/RatingContext';
import { usePhotoSubmissions } from '../contexts/PhotoSubmissionContext';
import { apiFetch } from '../utils/apiClient';
import './AccountPage.css';

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

  const getUyeSuresi = (kayitTarihi: number | undefined) => {
    if (!kayitTarihi) return '-';
    const diff = Date.now() - kayitTarihi;
    const year = Math.floor(diff / 31536000000);
    const month = Math.floor((diff % 31536000000) / 2629800000);
    const day = Math.floor((diff % 2629800000) / 86400000);
    const parts = [];
    if (year) parts.push(`${year} yıl`);
    if (month) parts.push(`${month} ay`);
    if (day) parts.push(`${day} gün`);
    return parts.length > 0 ? parts.join(' ') : '0 gün';
  };

  const languages = [
    { code: 'tr' as const, name: 'Türkçe', flag: '🇹🇷' },
    { code: 'en' as const, name: 'English', flag: '🇬🇧' },
    { code: 'ru' as const, name: 'Русский', flag: '🇷🇺' },
    { code: 'ar' as const, name: 'العربية', flag: '🇸🇦' },
  ];

  const handleLanguageSelect = (langCode: typeof languages[0]['code']) => {
    setLanguage(langCode);
    setLanguageDropdownVisible(false);
  };

  const handleLogout = () => {
    cikisYap();
    navigate('/');
  };

  if (yukleniyor) {
    return <div className="account-page loading">{t('common.loading')}</div>;
  }

  if (!kullanici) {
    return (
      <div className="account-page">
        <div className="account-container">
          <h1>{t('account.myAccount')}</h1>
          <p>{t('account.welcomeToKitabe')}</p>
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
            <select value={currentLanguage} onChange={(e) => setLanguage(e.target.value as any)}>
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

  return (
    <div className="account-page">
      <div className="account-container">
        {/* Dil Seçme Header */}
        <div className="account-language-header">
          <div style={{ flex: 1 }} />
          <button
            className="account-language-button"
            onClick={() => setLanguageDropdownVisible(!languageDropdownVisible)}
          >
            <span className="material-icons">language</span>
            <span>{t('common.selectLanguage', 'Dil Seç')}</span>
            <span className="material-icons">
              {languageDropdownVisible ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
            </span>
          </button>
        </div>
        
        {/* Dil Dropdown Menü */}
        {languageDropdownVisible && (
          <>
            <div className="account-language-overlay" onClick={() => setLanguageDropdownVisible(false)} />
            <div className="account-language-dropdown">
              {languages.map((lang, index) => (
                <button
                  key={lang.code}
                  className={`account-language-dropdown-item ${currentLanguage === lang.code ? 'selected' : ''} ${index === languages.length - 1 ? 'last' : ''}`}
                  onClick={() => handleLanguageSelect(lang.code)}
                >
                  <span className="account-language-flag">{lang.flag}</span>
                  <span className={`account-language-text ${currentLanguage === lang.code ? 'selected' : ''}`}>
                    {lang.name}
                  </span>
                  {currentLanguage === lang.code && (
                    <span className="material-icons account-language-check">check</span>
                  )}
                </button>
              ))}
            </div>
          </>
        )}

        <h1>{kullanici.isim} {kullanici.soyad}</h1>
        <p className="account-email">{kullanici.email}</p>
        <p className="account-role">{t('account.role')}: {kullanici.rol || 'user'}</p>
        <p className="account-registration">
          {t('account.registrationDate')}: {kullanici.kayitTarihi ? new Date(kullanici.kayitTarihi).toLocaleDateString() : '-'}
        </p>
        <p className="account-membership">
          {t('account.membershipDuration')}: {getUyeSuresi(kullanici.kayitTarihi)}
        </p>

        <div className="account-menu">
          <Link to="/account-settings" className="menu-item menu-item-primary">
            <span className="menu-icon">⚙️</span>
            <span>{t('account.editAccount')}</span>
          </Link>
          <Link to="/profile" className="menu-item">
            <span className="menu-icon">📊</span>
            <span>{t('profile.title', 'Profilim & İstatistiklerim')}</span>
          </Link>
          <Link to="/notifications" className="menu-item">
            <span className="menu-icon">🔔</span>
            <span>{t('notifications.title', 'Bildirimler')}</span>
            {unreadCount > 0 && (
              <span className="account-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
            )}
          </Link>
          <Link to="/favorites" className="menu-item">
            <span className="menu-icon">❤️</span>
            <span>{t('account.myFavorites')}</span>
          </Link>
          <Link to="/suggestion" className="menu-item">
            <span className="menu-icon">➕</span>
            <span>{t('account.suggestPlace')}</span>
          </Link>
          <Link to="/my-suggestions" className="menu-item">
            <span className="menu-icon">📋</span>
            <span>{t('account.mySuggestions')}</span>
          </Link>
          {kullanici.rol === 'editor' && (
            <Link to="/editor-panel" className="menu-item">
              <span className="menu-icon">✏️</span>
              <span>{t('account.editorPanel')}</span>
            </Link>
          )}
          {kullanici.rol === 'admin' && (
            <>
              <Link to="/admin-hub" className="menu-item menu-item-primary">
                <span className="menu-icon">🛡️</span>
                <span>{t('account.adminDashboard', 'Admin paneli')}</span>
              </Link>
              <Link to="/admin-contact-forms" className="menu-item">
                <span className="menu-icon">📧</span>
                <span>
                  {t('account.contactForms')}{contactFormsCount > 0 ? ` (${contactFormsCount})` : ''}
                </span>
              </Link>
            </>
          )}
          {kullanici.rol === 'editor' && (
            <>
              <Link to="/rating-approval" className="menu-item">
                <span className="menu-icon">⭐</span>
                <span>
                  {t('account.ratings.title', 'Değerlendirmeler')}{pendingRatings.length > 0 ? ` (${pendingRatings.length})` : ''}
                </span>
              </Link>
              <Link to="/photo-approval" className="menu-item">
                <span className="menu-icon">📷</span>
                <span>
                  {t('account.photoApproval.title', 'Fotoğraf İstekleri')}{pendingSubmissions.length > 0 ? ` (${pendingSubmissions.length})` : ''}
                </span>
              </Link>
            </>
          )}
          <Link to="/iletisim" className="menu-item">
            <span className="menu-icon">📧</span>
            <span>{t('contact.title')}</span>
          </Link>
        </div>

        <button className="btn btn-danger" onClick={handleLogout}>
          {t('common.logout')}
        </button>
      </div>
    </div>
  );
};

export default AccountPage;

