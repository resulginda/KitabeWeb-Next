import { useCallback, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE_URL } from '../config/api';
import { PageShell, PageEmpty } from '../components/PageShell';

type PushLogRow = {
  id: string;
  created_at?: string;
  target_label?: string;
  title?: string | null;
  body?: string;
  recipient_count?: number;
  error_count?: number;
  deep_link_type?: string | null;
  place_id?: string | null;
  scheduled_job_id?: string | null;
};

type PushLogDetail = PushLogRow & {
  recipientNote?: string;
  recipientSource?: 'snapshot' | 'resolved_now';
  recipientSummary?: {
    totalTokensNow?: number;
    usersNow?: number;
    byRoleNow?: Record<string, number>;
  };
  recipients?: Array<{
    userId?: string | null;
    email?: string | null;
    isim?: string | null;
    soyad?: string | null;
    rol?: string | null;
    tokenTail?: string | null;
  }>;
};

export default function AdminPushLogsPage() {
  const { t } = useTranslation();
  const { kullanici, getToken } = useAuth();
  const [logs, setLogs] = useState<PushLogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [selectedLog, setSelectedLog] = useState<PushLogDetail | null>(null);
  const [recipientListOpen, setRecipientListOpen] = useState(true);

  const load = useCallback(async () => {
    if (kullanici?.rol !== 'admin') return;
    setError(null);
    const token = await getToken();
    if (!token) {
      setError('Oturum bulunamadı.');
      setLogs([]);
      return;
    }
    const res = await fetch(`${API_BASE_URL}/api/admin/push-broadcast/logs?limit=100`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.success) {
      setError(data.message || `İstek başarısız (${res.status})`);
      setLogs([]);
      return;
    }
    setLogs(Array.isArray(data.data) ? data.data : []);
  }, [getToken, kullanici?.rol]);

  useEffect(() => {
    setLoading(true);
    load().finally(() => setLoading(false));
  }, [load]);

  const openDetail = useCallback(
    async (logId: string) => {
      const token = await getToken();
      if (!token) {
        setDetailError('Oturum bulunamadı.');
        return;
      }
      setDetailLoading(true);
      setDetailError(null);
      setSelectedLog(null);
      setRecipientListOpen(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/admin/push-broadcast/logs/${logId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.success || !data.data) {
          setDetailError(data.message || `Detay alınamadı (${res.status})`);
          return;
        }
        setSelectedLog(data.data as PushLogDetail);
      } finally {
        setDetailLoading(false);
      }
    },
    [getToken]
  );

  if (kullanici?.rol !== 'admin') return <Navigate to="/account" replace />;

  return (
    <PageShell title={t('account.pushLogs', 'Push Günlüğü')} backTo="/admin-hub" className="kb-page-wide">
      <div className="kb-admin-toolbar">
        <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          {logs.length} kayıt
        </span>
        <button type="button" onClick={load}>
          <span className="material-icons" style={{ fontSize: 18 }}>refresh</span>
          Yenile
        </button>
      </div>
      {loading ? (
        <div className="kb-settings-loading">
          <div className="spinner" />
        </div>
      ) : null}
      {error ? <p style={{ color: '#b91c1c', marginBottom: 'var(--gap-md)' }}>{error}</p> : null}
      {!loading && !error && logs.length === 0 ? (
        <PageEmpty icon="notifications_none" title="Henüz kayıt yok." />
      ) : null}
      <div className="kb-log-list">
        {logs.map((log) => (
          <button
            key={log.id}
            type="button"
            className="kb-log-card"
            onClick={() => openDetail(log.id)}
          >
            <div className="kb-log-card-date">
              {log.created_at ? new Date(log.created_at).toLocaleString('tr-TR') : '—'}
            </div>
            <div className="kb-log-card-meta">
              {log.target_label ?? '—'} · {log.recipient_count ?? 0} alıcı · Expo hata: {log.error_count ?? 0}
            </div>
            {log.title ? <div className="kb-log-card-title">Başlık: {log.title}</div> : null}
            <div className="kb-log-card-body">{log.body ?? ''}</div>
            {(log.deep_link_type || log.place_id) ? (
              <div className="kb-log-card-meta">
                Link: {log.deep_link_type ?? '—'}{log.place_id ? ` · yer: ${log.place_id}` : ''}
              </div>
            ) : null}
            {log.scheduled_job_id ? (
              <div className="kb-log-card-meta">Zamanlı iş: {log.scheduled_job_id.slice(0, 12)}...</div>
            ) : null}
            <div className="kb-log-card-footer">Detay için tıkla →</div>
          </button>
        ))}
      </div>

      {(selectedLog || detailLoading || detailError) && (
        <div
          role="dialog"
          className="kb-settings-modal-overlay"
          onClick={() => {
            setSelectedLog(null);
            setDetailError(null);
          }}
        >
          <div
            className="kb-settings-modal"
            style={{ maxWidth: 900, maxHeight: '85vh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2>Push Log Detayı</h2>
            {detailLoading ? <p>Detay yükleniyor...</p> : null}
            {detailError ? <p style={{ color: '#b91c1c' }}>{detailError}</p> : null}
            {selectedLog && (
              <>
                <p style={{ color: 'var(--text-secondary)', margin: '0 0 var(--gap-sm)' }}>
                  {selectedLog.created_at ? new Date(selectedLog.created_at).toLocaleString('tr-TR') : '—'}
                </p>
                <p><strong>Hedef:</strong> {selectedLog.target_label || '—'}</p>
                <p>
                  <strong>Gönderim özeti:</strong> log alıcı {selectedLog.recipient_count ?? 0} · Expo hata{' '}
                  {selectedLog.error_count ?? 0}
                </p>
                {selectedLog.recipientSummary ? (
                  <p>
                    <strong>Anlık hedef özeti:</strong> token {selectedLog.recipientSummary.totalTokensNow ?? 0} · kullanıcı{' '}
                    {selectedLog.recipientSummary.usersNow ?? 0}
                  </p>
                ) : null}
                {selectedLog.title ? (
                  <p><strong>Başlık:</strong> {selectedLog.title}</p>
                ) : null}
                <p style={{ whiteSpace: 'pre-wrap' }}>
                  <strong>Metin:</strong> {selectedLog.body || ''}
                </p>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{selectedLog.recipientNote}</p>

                <button
                  type="button"
                  className="kb-suggest-link"
                  onClick={() => setRecipientListOpen((v) => !v)}
                  style={{ marginTop: 'var(--gap-sm)' }}
                >
                  <span className="material-icons" style={{ fontSize: 16 }}>
                    {recipientListOpen ? 'expand_more' : 'chevron_right'}
                  </span>
                  Kime gitti listesi ({selectedLog.recipients?.length ?? 0}) ·{' '}
                  {selectedLog.recipientSource === 'snapshot' ? 'Kesin Snapshot' : 'Anlık Çözümleme'}
                </button>
                {recipientListOpen &&
                  (!selectedLog.recipients || selectedLog.recipients.length === 0 ? (
                    <p>Hedefte kayıtlı kullanıcı/token bulunamadı.</p>
                  ) : (
                    <div className="kb-log-detail-grid">
                      {selectedLog.recipients.map((r, idx) => (
                        <div key={`${r.userId || 'anon'}-${idx}`} className="kb-log-detail-row">
                          <div>{r.email || `${r.isim || ''} ${r.soyad || ''}`.trim() || r.userId || 'Anonim token'}</div>
                          <div>{r.userId || '-'}</div>
                          <div>{r.rol || '-'}</div>
                          <div>{r.tokenTail || '-'}</div>
                        </div>
                      ))}
                    </div>
                  ))}
              </>
            )}
            <div className="kb-settings-modal-actions">
              <button
                type="button"
                className="kb-btn-save"
                onClick={() => {
                  setSelectedLog(null);
                  setDetailError(null);
                }}
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}

