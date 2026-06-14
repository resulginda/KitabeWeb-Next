import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../contexts/AuthContext';
import { apiFetch } from '../utils/apiClient';
import './NotificationSettingsPage.css';

interface NotificationSettings {
  photoApprovals: boolean;
  photoRejections: boolean;
  ratingApprovals: boolean;
  ratingRejections: boolean;
  suggestionUpdates: boolean;
  newPlaces: boolean;
  nearbyPlaces: boolean;
  favoritePlaceUpdates: boolean;
  securityAlerts: boolean;
  moderator?: {
    newSuggestions: boolean;
    newRatings: boolean;
    newPhotos: boolean;
    newContactForms: boolean;
  };
  admin?: {
    editorApprovals: boolean;
  };
}

interface SettingRowProps {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  icon: string;
  disabled?: boolean;
}

const SettingRow = ({ label, value, onValueChange, icon, disabled = false }: SettingRowProps) => {
  return (
    <div className={`notification-setting-row ${disabled ? 'disabled' : ''}`}>
      <div className="notification-setting-left">
        <span className="material-icons notification-setting-icon">{icon}</span>
        <span className={`notification-setting-label ${disabled ? 'disabled' : ''}`}>{label}</span>
      </div>
      <label className="notification-switch">
        <input
          type="checkbox"
          checked={value}
          onChange={(e) => onValueChange(e.target.checked)}
          disabled={disabled}
        />
        <span className="notification-slider"></span>
      </label>
    </div>
  );
};

const NotificationSettingsPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { kullanici } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<NotificationSettings>({
    photoApprovals: true,
    photoRejections: true,
    ratingApprovals: true,
    ratingRejections: true,
    suggestionUpdates: true,
    newPlaces: true,
    nearbyPlaces: true,
    favoritePlaceUpdates: true,
    securityAlerts: true,
    moderator: {
      newSuggestions: true,
      newRatings: true,
      newPhotos: true,
      newContactForms: true,
    },
    admin: {
      editorApprovals: true,
    },
  });

  useEffect(() => {
    loadSettings();
  }, [kullanici]);

  const loadSettings = async () => {
    if (!kullanici) {
      setLoading(false);
      return;
    }

    try {
      const res = await apiFetch('/api/users/notification-settings');
      const json = await res.json();
      if (json.success && json.data && typeof json.data === 'object') {
        const data = json.data as Record<string, unknown>;
        setSettings({
          photoApprovals: (data.photoApprovals as boolean) ?? true,
          photoRejections: (data.photoRejections as boolean) ?? true,
          ratingApprovals: (data.ratingApprovals as boolean) ?? true,
          ratingRejections: (data.ratingRejections as boolean) ?? true,
          suggestionUpdates: (data.suggestionUpdates as boolean) ?? true,
          newPlaces: (data.newPlaces as boolean) ?? true,
          nearbyPlaces: (data.nearbyPlaces as boolean) ?? true,
          favoritePlaceUpdates: (data.favoritePlaceUpdates as boolean) ?? true,
          securityAlerts: true,
          moderator: (data.moderator as NotificationSettings['moderator']) || {
            newSuggestions: true,
            newRatings: true,
            newPhotos: true,
            newContactForms: true,
          },
          admin: (data.admin as NotificationSettings['admin']) || {
            editorApprovals: true,
          },
        });
      }
    } catch (error) {
      console.error('Bildirim ayarları yükleme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!kullanici) return;

    setSaving(true);
    try {
      const res = await apiFetch('/api/users/notification-settings', {
        method: 'PUT',
        body: JSON.stringify({ ...settings, securityAlerts: true }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || res.statusText);
      }
      
      setTimeout(() => {
        navigate(-1);
      }, 300);
    } catch (error) {
      console.error('Bildirim ayarları kaydetme hatası:', error);
      alert(t('common.error', 'Bir hata oluştu'));
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: keyof NotificationSettings, value: boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const updateModeratorSetting = (key: string, value: boolean) => {
    setSettings((prev) => ({
      ...prev,
      moderator: {
        newSuggestions: prev.moderator?.newSuggestions ?? false,
        newRatings: prev.moderator?.newRatings ?? false,
        newPhotos: prev.moderator?.newPhotos ?? false,
        newContactForms: prev.moderator?.newContactForms ?? false,
        [key]: value,
      },
    }));
  };

  const updateAdminSetting = (key: string, value: boolean) => {
    setSettings((prev) => ({
      ...prev,
      admin: {
        editorApprovals: prev.admin?.editorApprovals ?? false,
        [key]: value,
      },
    }));
  };

  const isAdmin = kullanici?.rol === 'admin';
  const isEditor = kullanici?.rol === 'editor';
  const isModerator = isAdmin || isEditor;

  if (loading) {
    return (
      <>
        <Helmet>
          <title>{t('notifications.settings.title', 'Bildirim Ayarları')} | Kitabe</title>
        </Helmet>
        <div className="notification-settings-page">
          <div className="notification-settings-loading">
            <div className="spinner"></div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{t('notifications.settings.title', 'Bildirim Ayarları')} | Kitabe</title>
      </Helmet>
      <div className="notification-settings-page">
        <div className="notification-settings-header">
          <button className="notification-settings-back-btn" onClick={() => navigate(-1)}>
            <span className="material-icons">arrow_back</span>
          </button>
          <h1 className="notification-settings-title">
            {t('notifications.settings.title', 'Bildirim Ayarları')}
          </h1>
          <button
            className="notification-settings-save-btn"
            onClick={saveSettings}
            disabled={saving}
          >
            {saving ? (
              <div className="spinner-small"></div>
            ) : (
              t('common.save', 'Kaydet')
            )}
          </button>
        </div>

        <div className="notification-settings-content">
          {/* İçerik Onayları */}
          <div className="notification-settings-section">
            <h2 className="notification-settings-section-title">
              {t('notifications.settings.contentApprovals', 'İçerik Onayları')}
            </h2>
            
            <SettingRow
              label={t('notifications.settings.photoApprovals', 'Fotoğraf Onayları')}
              value={settings.photoApprovals}
              onValueChange={(value) => updateSetting('photoApprovals', value)}
              icon="photo_camera"
            />
            
            <SettingRow
              label={t('notifications.settings.photoRejections', 'Fotoğraf Redleri')}
              value={settings.photoRejections}
              onValueChange={(value) => updateSetting('photoRejections', value)}
              icon="photo_camera"
            />
            
            <SettingRow
              label={t('notifications.settings.ratingApprovals', 'Yorum Onayları')}
              value={settings.ratingApprovals}
              onValueChange={(value) => updateSetting('ratingApprovals', value)}
              icon="comment"
            />
            
            <SettingRow
              label={t('notifications.settings.ratingRejections', 'Yorum Redleri')}
              value={settings.ratingRejections}
              onValueChange={(value) => updateSetting('ratingRejections', value)}
              icon="comment"
            />
            
            <SettingRow
              label={t('notifications.settings.suggestionUpdates', 'Öneri Güncellemeleri')}
              value={settings.suggestionUpdates}
              onValueChange={(value) => updateSetting('suggestionUpdates', value)}
              icon="place"
            />
          </div>

          {/* Yeni İçerik */}
          <div className="notification-settings-section">
            <h2 className="notification-settings-section-title">
              {t('notifications.settings.newContent', 'Yeni İçerik')}
            </h2>
            
            <SettingRow
              label={t('notifications.settings.newPlaces', 'Yeni Yerler')}
              value={settings.newPlaces}
              onValueChange={(value) => updateSetting('newPlaces', value)}
              icon="place"
            />
            
            <SettingRow
              label={t('notifications.settings.nearbyPlaces', 'Yakınımdaki Yeni Yerler')}
              value={settings.nearbyPlaces}
              onValueChange={(value) => updateSetting('nearbyPlaces', value)}
              icon="location_on"
            />
            
            <SettingRow
              label={t('notifications.settings.favoritePlaceUpdates', 'Favori Yere Fotoğraf Eklendi')}
              value={settings.favoritePlaceUpdates}
              onValueChange={(value) => updateSetting('favoritePlaceUpdates', value)}
              icon="favorite"
            />
          </div>

          {/* Moderasyon Bildirimleri */}
          {isModerator && (
            <div className="notification-settings-section">
              <h2 className="notification-settings-section-title">
                {t('notifications.settings.moderatorNotifications', 'Moderasyon Bildirimleri')}
              </h2>
              
              <SettingRow
                label={t('notifications.settings.newSuggestions', 'Yeni Öneriler')}
                value={settings.moderator?.newSuggestions ?? true}
                onValueChange={(value) => updateModeratorSetting('newSuggestions', value)}
                icon="place"
              />
              
              <SettingRow
                label={t('notifications.settings.newRatings', 'Yeni Yorumlar')}
                value={settings.moderator?.newRatings ?? true}
                onValueChange={(value) => updateModeratorSetting('newRatings', value)}
                icon="comment"
              />
              
              <SettingRow
                label={t('notifications.settings.newPhotos', 'Yeni Fotoğraflar')}
                value={settings.moderator?.newPhotos ?? true}
                onValueChange={(value) => updateModeratorSetting('newPhotos', value)}
                icon="photo_camera"
              />
              
              <SettingRow
                label={t('notifications.settings.newContactForms', 'Yeni İletişim Formları')}
                value={settings.moderator?.newContactForms ?? true}
                onValueChange={(value) => updateModeratorSetting('newContactForms', value)}
                icon="mail"
              />
            </div>
          )}

          {/* Admin Özel Bildirimleri */}
          {isAdmin && (
            <div className="notification-settings-section">
              <h2 className="notification-settings-section-title">
                {t('notifications.settings.adminNotifications', 'Admin Bildirimleri')}
              </h2>
              
              <SettingRow
                label={t('notifications.settings.editorApprovals', 'Editör Onayları')}
                value={settings.admin?.editorApprovals ?? true}
                onValueChange={(value) => updateAdminSetting('editorApprovals', value)}
                icon="check_circle"
              />
            </div>
          )}

          {/* Güvenlik Bildirimleri */}
          <div className="notification-settings-section">
            <h2 className="notification-settings-section-title">
              {t('notifications.settings.security', 'Güvenlik')}
            </h2>
            
            <SettingRow
              label={t('notifications.settings.securityAlerts', 'Güvenlik Uyarıları')}
              value={true}
              onValueChange={() => {}}
              icon="security"
              disabled={true}
            />
            <p className="notification-settings-disabled-note">
              {t('notifications.settings.securityAlertsNote', 'Güvenlik bildirimleri kapatılamaz')}
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotificationSettingsPage;
