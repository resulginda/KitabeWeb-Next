import { useCallback, useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE_URL } from '../config/api';
import './AdminPanelPage.css';

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
    <div className="admin-panel-page">
      <div className="panel-header">
        <h1>{t('adminPanel.contactForms', 'İletişim Formları')}</h1>
        <p>{rows.length}</p>
      </div>
      <div style={{ maxWidth: 980, margin: '1.5rem auto', padding: '0 1rem' }}>
        <button onClick={() => fetchRows()} style={{ marginBottom: 12 }}>Yenile</button>
        {loading ? <p>{t('common.loading')}</p> : null}
        {!loading && rows.length === 0 ? <p>{t('adminPanel.noContactForms', 'Henüz iletişim formu gönderilmemiş.')}</p> : null}
        {rows.map((item) => {
          const createdAt = item.createdAt ? new Date(item.createdAt) : null;
          const formattedDate = createdAt ? createdAt.toLocaleString('tr-TR') : '-';
          return (
            <div key={item.id} style={{ border: '1px solid #e8e0d6', background: item.read ? '#f0f0f0' : '#fff8f1', borderRadius: 12, padding: 12, marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                <strong>{item.isim} {item.soyisim}</strong>
                {!item.read ? <span style={{ color: '#b91c1c', fontSize: 12 }}>Yeni</span> : null}
              </div>
              <div style={{ fontSize: 14, marginTop: 6 }}>{item.mail}</div>
              <div style={{ fontSize: 13, color: '#666', marginTop: 4 }}>
                {(konuLabels as Record<string, string>)[item.konu] || item.konu} • {formattedDate}
              </div>
              <div style={{ marginTop: 10, whiteSpace: 'pre-wrap' }}>{item.mesaj}</div>
              {!item.read && (
                <button
                  style={{ marginTop: 10 }}
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
                  Okundu işaretle
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

