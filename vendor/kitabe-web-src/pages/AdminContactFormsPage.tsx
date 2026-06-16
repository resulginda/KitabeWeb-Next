import { useCallback, useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE_URL } from '../config/api';
import { PageShell, PageEmpty } from '../components/PageShell';

type ContactFormRow = {
  id: string;
  isim: string;
  soyisim: string;
  mail: string;
  konu: string;
  mesaj: string;
  read?: boolean;
  createdAt?: string;
};

export default function AdminContactFormsPage() {
  const { t } = useTranslation();
  const { kullanici, getToken } = useAuth();
  const [rows, setRows] = useState<ContactFormRow[]>([]);
  const [loading, setLoading] = useState(true);
  const role = String(kullanici?.rol || '').toLowerCase();
  const canAccess = role === 'admin' || role === 'editor';

  const fetchRows = useCallback(async () => {
    const token = await getToken();
    if (!token) return;
    const res = await fetch(`${API_BASE_URL}/api/contact-forms`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (data.success && Array.isArray(data.data)) setRows(data.data);
  }, [getToken]);

  useEffect(() => {
    if (!canAccess) {
      setLoading(false);
      return;
    }
    setLoading(true);
    fetchRows().finally(() => setLoading(false));
  }, [canAccess, fetchRows]);

  const konuLabels = useMemo(
    () => ({
      öneri: t('contact.subjectOptions.suggestion'),
      şikayet: t('contact.subjectOptions.complaint'),
      soru: t('contact.subjectOptions.question'),
      diğer: t('contact.subjectOptions.other'),
    }),
    [t]
  );

  if (!kullanici || !canAccess) return <Navigate to="/account" replace />;

  return (
    <PageShell title={t('adminPanel.contactForms', 'İletişim Formları')} subtitle={String(rows.length)} backTo="/admin-hub" className="kb-page-wide">
      <div className="kb-admin-toolbar">
        <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          {rows.length} mesaj
        </span>
        <button type="button" onClick={() => fetchRows()}>
          <span className="material-icons" style={{ fontSize: 18 }}>refresh</span>
          Yenile
        </button>
      </div>
      {loading ? (
        <div className="kb-settings-loading">
          <div className="spinner" />
        </div>
      ) : null}
      {!loading && rows.length === 0 ? (
        <PageEmpty icon="mail_outline" title={t('adminPanel.noContactForms', 'Henüz iletişim formu gönderilmemiş.')} />
      ) : null}
      {rows.map((item) => {
        const createdAt = item.createdAt ? new Date(item.createdAt) : null;
        const formattedDate = createdAt ? createdAt.toLocaleString('tr-TR') : '-';
        return (
          <div key={item.id} className={`kb-admin-card ${!item.read ? 'is-unread' : ''}`}>
            <div className="kb-admin-card-header">
              <strong>{item.isim} {item.soyisim}</strong>
              {!item.read ? <span className="kb-admin-badge kb-admin-badge--new">Yeni</span> : null}
            </div>
            <div className="kb-admin-card-meta">{item.mail}</div>
            <div className="kb-admin-card-meta">
              {(konuLabels as Record<string, string>)[item.konu] || item.konu} • {formattedDate}
            </div>
            <div className="kb-admin-card-body">{item.mesaj}</div>
            {!item.read && (
              <div className="kb-admin-card-actions">
                <button
                  type="button"
                  className="kb-suggest-link"
                  onClick={async () => {
                    try {
                      const token = await getToken();
                      if (!token) return;
                      await fetch(`${API_BASE_URL}/api/contact-forms/${item.id}/read`, {
                        method: 'PATCH',
                        headers: { Authorization: `Bearer ${token}` },
                      });
                      setRows((prev) => prev.map((r) => (r.id === item.id ? { ...r, read: true } : r)));
                    } catch {
                      // no-op
                    }
                  }}
                >
                  <span className="material-icons" style={{ fontSize: 16 }}>done</span>
                  Okundu işaretle
                </button>
              </div>
            )}
          </div>
        );
      })}
    </PageShell>
  );
}

