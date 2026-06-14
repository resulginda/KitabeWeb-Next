import { useCallback, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE_URL } from '../config/api';
import './AdminPanelPage.css';

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
    <div className="admin-panel-page">
      <div className="panel-header">
        <h1>Push Günlüğü</h1>
      </div>
      <div style={{ maxWidth: 980, margin: '1.5rem auto', padding: '0 1rem' }}>
        <button onClick={load}>Yenile</button>
        {loading ? <p>Yükleniyor...</p> : null}
        {error ? <p style={{ color: '#b91c1c' }}>{error}</p> : null}
        {!loading && !error && logs.length === 0 ? <p>Henüz kayıt yok.</p> : null}
        {logs.map((log) => (
          <button
            key={log.id}
            onClick={() => openDetail(log.id)}
            style={{
              width: '100%',
              textAlign: 'left',
              background: '#fff',
              border: '1px solid #e8e0d6',
              borderRadius: 12,
              padding: 14,
              marginTop: 10,
              cursor: 'pointer',
            }}
          >
            <div style={{ color: '#666', fontSize: 13 }}>
              {log.created_at ? new Date(log.created_at).toLocaleString('tr-TR') : '—'}
            </div>
            <div style={{ marginTop: 4, color: '#8b5e34' }}>
              {log.target_label ?? '—'} · {log.recipient_count ?? 0} alıcı · Expo hata: {log.error_count ?? 0}
            </div>
            {log.title ? <div style={{ marginTop: 8 }}>Başlık: {log.title}</div> : null}
            <div style={{ marginTop: 6, whiteSpace: 'pre-wrap' }}>{log.body ?? ''}</div>
            {(log.deep_link_type || log.place_id) ? (
              <div style={{ marginTop: 8, fontSize: 13, color: '#666' }}>
                Link: {log.deep_link_type ?? '—'}{log.place_id ? ` · yer: ${log.place_id}` : ''}
              </div>
            ) : null}
            {log.scheduled_job_id ? <div style={{ marginTop: 8, fontSize: 13, color: '#666' }}>Zamanlı iş: {log.scheduled_job_id.slice(0, 12)}...</div> : null}
            <div style={{ marginTop: 10, color: '#8b5e34', fontSize: 13 }}>Detay için tıkla →</div>
          </button>
        ))}
      </div>

      {(selectedLog || detailLoading || detailError) && (
        <div
          role="dialog"
          onClick={() => {
            setSelectedLog(null);
            setDetailError(null);
          }}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: 20,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff',
              borderRadius: 14,
              width: '100%',
              maxWidth: 900,
              maxHeight: '85vh',
              overflow: 'auto',
              padding: 16,
            }}
          >
            <h3 style={{ marginTop: 0 }}>Push Log Detayı</h3>
            {detailLoading ? <p>Detay yükleniyor...</p> : null}
            {detailError ? <p style={{ color: '#b91c1c' }}>{detailError}</p> : null}
            {selectedLog && (
              <>
                <p style={{ color: '#666' }}>
                  {selectedLog.created_at ? new Date(selectedLog.created_at).toLocaleString('tr-TR') : '—'}
                </p>
                <p>
                  <strong>Hedef:</strong> {selectedLog.target_label || '—'}
                </p>
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
                  <p>
                    <strong>Başlık:</strong> {selectedLog.title}
                  </p>
                ) : null}
                <p style={{ whiteSpace: 'pre-wrap' }}>
                  <strong>Metin:</strong> {selectedLog.body || ''}
                </p>
                <p style={{ fontSize: 12, color: '#666' }}>{selectedLog.recipientNote}</p>

                <button
                  type="button"
                  onClick={() => setRecipientListOpen((v) => !v)}
                  style={{
                    marginTop: 8,
                    border: '1px solid #e5dccf',
                    borderRadius: 10,
                    padding: '8px 10px',
                    background: '#fffaf6',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {recipientListOpen ? '▼' : '▶'} Kime gitti listesi ({selectedLog.recipients?.length ?? 0}) ·{' '}
                  {selectedLog.recipientSource === 'snapshot' ? 'Kesin Snapshot' : 'Anlık Çözümleme'}
                </button>
                {recipientListOpen &&
                  (!selectedLog.recipients || selectedLog.recipients.length === 0 ? (
                    <p>Hedefte kayıtlı kullanıcı/token bulunamadı.</p>
                  ) : (
                    <div style={{ border: '1px solid #eee', borderRadius: 10, marginTop: 8 }}>
                      {selectedLog.recipients.map((r, idx) => (
                        <div
                          key={`${r.userId || 'anon'}-${idx}`}
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '1.2fr 1fr 80px 90px',
                            gap: 8,
                            padding: '8px 10px',
                            borderBottom: '1px solid #f0f0f0',
                            fontSize: 13,
                          }}
                        >
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
            <div style={{ marginTop: 12, textAlign: 'right' }}>
              <button
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
    </div>
  );
}

