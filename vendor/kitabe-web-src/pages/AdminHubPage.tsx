import { useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PageShell, PageTileGrid } from '../components/PageShell';
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

  const tiles = useMemo(
    () => [
      { to: '/stats', icon: 'bar_chart', label: t('account.statistics') },
      { to: '/user-management', icon: 'group', label: t('account.userManagement') },
      {
        to: '/admin-contact-forms',
        icon: 'mail',
        label: t('account.contactForms'),
        badge: contactFormsCount,
      },
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
      { to: '/admin-panel', icon: 'library_books', label: t('account.editKitabes'), accent: true },
      { to: '/editor-panel', icon: 'edit_note', label: t('account.editorPanel') },
      { to: '/admin-push', icon: 'campaign', label: t('account.sendBroadcast') },
      { to: '/admin-push-logs', icon: 'history', label: t('account.pushLogs') },
    ],
    [t, contactFormsCount, pendingRatings.length, pendingSubmissions.length]
  );

  if (!kullanici || kullanici.rol !== 'admin') return <Navigate to="/account" replace />;

  return (
    <PageShell
      title={t('account.adminDashboard', 'Admin Paneli')}
      subtitle={kullanici.email}
      backTo="/account"
    >
      <PageTileGrid tiles={tiles} />
    </PageShell>
  );
}
