import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useRatings } from '../contexts/RatingContext';
import { usePhotoSubmissions } from '../contexts/PhotoSubmissionContext';
import { apiFetch } from '../utils/apiClient';

export default function AdminHubPage() {
  const { t } = useTranslation();
  const { kullanici } = useAuth();
  const { pendingRatings } = useRatings();
  const { pendingSubmissions } = usePhotoSubmissions();
  const [contactFormsCount, setContactFormsCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    if (kullanici?.rol !== 'admin') return;
    (async () => {
      try {
        const res = await apiFetch('/api/contact-forms/count');
        const data = await res.json();
        if (!cancelled && data.success) {
          setContactFormsCount(Number(data.data?.unread || 0));
        }
      } catch {
        if (!cancelled) setContactFormsCount(0);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [kullanici?.rol]);

  if (!kullanici || kullanici.rol !== 'admin') return <Navigate to="/account" replace />;

  return (
    <div className="account-page">
      <div className="account-container">
        <h1>{t('account.adminDashboard', 'Admin paneli')}</h1>
        <p className="account-email">{kullanici.email}</p>
        <div className="account-menu">
          <Link to="/stats" className="menu-item"><span className="menu-icon">📊</span><span>{t('account.statistics')}</span></Link>
          <Link to="/user-management" className="menu-item"><span className="menu-icon">👥</span><span>{t('account.userManagement')}</span></Link>
          <Link to="/admin-contact-forms" className="menu-item"><span className="menu-icon">📧</span><span>{t('account.contactForms')}{contactFormsCount > 0 ? ` (${contactFormsCount})` : ''}</span></Link>
          <Link to="/rating-approval" className="menu-item"><span className="menu-icon">⭐</span><span>{t('account.ratings.title', 'Değerlendirmeler')}{pendingRatings.length > 0 ? ` (${pendingRatings.length})` : ''}</span></Link>
          <Link to="/photo-approval" className="menu-item"><span className="menu-icon">📷</span><span>{t('account.photoApproval.title', 'Fotoğraf İstekleri')}{pendingSubmissions.length > 0 ? ` (${pendingSubmissions.length})` : ''}</span></Link>
          <Link to="/admin-panel" className="menu-item"><span className="menu-icon">⚙️</span><span>{t('account.editKitabes', 'Kitabeleri düzenle')}</span></Link>
          <Link to="/editor-panel" className="menu-item"><span className="menu-icon">✏️</span><span>{t('account.editorPanel')}</span></Link>
          <Link to="/admin-push" className="menu-item"><span className="menu-icon">📣</span><span>{t('account.sendBroadcast', 'Bildirim gönder')}</span></Link>
          <Link to="/admin-push-logs" className="menu-item"><span className="menu-icon">🕘</span><span>{t('account.pushLogs', 'Push günlüğü')}</span></Link>
        </div>
      </div>
    </div>
  );
}

