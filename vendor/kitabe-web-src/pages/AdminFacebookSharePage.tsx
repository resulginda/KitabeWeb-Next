import { useCallback, useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE_URL } from '../config/api';
import { PageShell, PageEmpty } from '../components/PageShell';

type ShareLogRow = {
  id: number;
  place_id?: string;
  lang?: string;
  facebook_page_id?: string;
  status?: string;
  attempted_at?: string;
  posted_at?: string | null;
  facebook_post_id?: string | null;
  error?: string | null;
  place_url?: string | null;
  message_preview?: string | null;
  run_id?: string | null;
  content_date?: string | null;
  slot_hour?: number | null;
  place_name_tr?: string | null;
  city_tr?: string | null;
};

type DailyPick = {
  contentDate: string;
  createdAt?: string;
  placeIds: string[];
  places: Array<{
    id: string;
    nameTr?: string;
    cityTr?: string | null;
    slotHour?: number | null;
    placeIndex?: number;
  }>;
};

type Summary = {
  days: number;
  byStatus: Array<{ status: string; count: number }>;
  byLang: Array<{ lang: string; status: string; count: number }>;
  todaySlots: ShareLogRow[];
  latestPick: { content_date?: string; place_ids?: string[]; created_at?: string } | null;
};

const LANGS = ['', 'tr', 'en', 'ru', 'ar'] as const;
const STATUSES = ['', 'success', 'failed', 'dry_run', 'pending', 'posted'] as const;

function statusTone(status?: string) {
  const s = String(status || '').toLowerCase();
  if (s === 'success' || s === 'posted') return { bg: '#ecfdf3', fg: '#166534', label: s || 'ÔÇö' };
  if (s === 'dry_run') return { bg: '#eff6ff', fg: '#1d4ed8', label: 'dry_run' };
  if (s === 'failed') return { bg: '#fef2f2', fg: '#991b1b', label: 'failed' };
  if (s === 'pending') return { bg: '#fff7ed', fg: '#9a3412', label: 'pending' };
  return { bg: '#f3f4f6', fg: '#374151', label: s || 'ÔÇö' };
}

function formatDate(value?: string | null) {
  if (!value) return 'ÔÇö';
  return new Date(value).toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' });
}

export default function AdminFacebookSharePage() {
  const { t } = useTranslation();
  const { kullanici, getToken } = useAuth();
  const [logs, setLogs] = useState<ShareLogRow[]>([]);
  const [total, setTotal] = useState(0);
  const [picks, setPicks] = useState<DailyPick[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lang, setLang] = useState('');
  const [status, setStatus] = useState('');
  const [contentDate, setContentDate] = useState('');
  const [selected, setSelected] = useState<ShareLogRow | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  const queryString = useMemo(() => {
    const q = new URLSearchParams({ limit: '100' });
    if (lang) q.set('lang', lang);
    if (status) q.set('status', status);
    if (contentDate) q.set('content_date', contentDate);
    return q.toString();
  }, [lang, status, contentDate]);

  const load = useCallback(async () => {
    if (kullanici?.rol !== 'admin') return;
    setError(null);
    const token = await getToken();
    if (!token) {
      setError('Oturum bulunamad─▒.');
      setLogs([]);
      return;
    }
    const headers = { Authorization: `Bearer ${token}` };
    const [logsRes, picksRes, summaryRes] = await Promise.all([
      fetch(`${API_BASE_URL}/api/admin/facebook-share/logs?${queryString}`, { headers }),
      fetch(`${API_BASE_URL}/api/admin/facebook-share/daily-picks?limit=10`, { headers }),
      fetch(`${API_BASE_URL}/api/admin/facebook-share/summary?days=7`, { headers }),
    ]);
    const logsData = await logsRes.json().catch(() => ({}));
    const picksData = await picksRes.json().catch(() => ({}));
    const summaryData = await summaryRes.json().catch(() => ({}));

    if (!logsRes.ok || !logsData.success) {
      setError(logsData.message || `Log iste─şi ba┼şar─▒s─▒z (${logsRes.status})`);
      setLogs([]);
    } else {
      setLogs(Array.isArray(logsData.data) ? logsData.data : []);
      setTotal(Number(logsData.total || 0));
    }
    if (picksRes.ok && picksData.success) {
      setPicks(Array.isArray(picksData.data) ? picksData.data : []);
    }
    if (summaryRes.ok && summaryData.success) {
      setSummary(summaryData.data as Summary);
    }
  }, [getToken, kullanici?.rol, queryString]);

  useEffect(() => {
    setLoading(true);
    load().finally(() => setLoading(false));
  }, [load]);

  const openDetail = useCallback(
    async (id: number) => {
      const token = await getToken();
      if (!token) {
        setDetailError('Oturum bulunamad─▒.');
        return;
      }
      setDetailLoading(true);
      setDetailError(null);
      setSelected(null);
      try {
        const res = await fetch(`${API_BASE_URL}/api/admin/facebook-share/logs/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.success || !data.data) {
          setDetailError(data.message || `Detay al─▒namad─▒ (${res.status})`);
          return;
        }
        setSelected(data.data as ShareLogRow);
      } finally {
        setDetailLoading(false);
      }
    },
    [getToken]
  );

  if (kullanici?.rol !== 'admin') return <Navigate to="/account" replace />;

  return (
    <PageShell
      title={t('account.facebookShareLogs', 'Facebook Payla┼ş─▒mlar─▒')}
      backTo="/admin-hub"
      className="kb-page-wide"
    >
      <div className="kb-admin-toolbar" style={{ flexWrap: 'wrap', gap: 8 }}>
        <select value={lang} onChange={(e) => setLang(e.target.value)} aria-label="Dil">
          {LANGS.map((l) => (
            <option key={l || 'all'} value={l}>
              {l ? l.toUpperCase() : 'T├╝m diller'}
            </option>
          ))}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Durum">
          {STATUSES.map((s) => (
            <option key={s || 'all'} value={s}>
              {s || 'T├╝m durumlar'}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={contentDate}
          onChange={(e) => setContentDate(e.target.value)}
          aria-label="─░├ğerik tarihi"
        />
        <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          {total} kay─▒t
        </span>
        <button type="button" onClick={load}>
          <span className="material-icons" style={{ fontSize: 18 }}>
            refresh
          </span>
          Yenile
        </button>
      </div>

      {summary ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: 10,
            marginBottom: 'var(--gap-md)',
          }}
        >
          {(summary.byStatus || []).map((row) => {
            const tone = statusTone(row.status);
            return (
              <div
                key={row.status}
                style={{
                  background: tone.bg,
                  color: tone.fg,
                  borderRadius: 12,
                  padding: '10px 12px',
                  fontSize: '0.875rem',
                }}
              >
                <div style={{ fontWeight: 700 }}>{tone.label}</div>
                <div>{row.count}</div>
              </div>
            );
          })}
        </div>
      ) : null}

      {picks[0] ? (
        <div
          style={{
            background: 'var(--surface, #fff)',
            border: '1px solid var(--border, #e5e7eb)',
            borderRadius: 14,
            padding: 14,
            marginBottom: 'var(--gap-md)',
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: 8 }}>
            G├╝nl├╝k se├ğim ┬À {picks[0].contentDate}
          </div>
          <div style={{ display: 'grid', gap: 6 }}>
            {picks[0].places.map((p) => (
              <div key={`${p.id}-${p.slotHour}`} style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                @{p.slotHour}:00 ÔÇö {p.nameTr || p.id}
                {p.cityTr ? ` ┬À ${p.cityTr}` : ''}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {loading ? (
        <div className="kb-settings-loading">
          <div className="spinner" />
        </div>
      ) : null}
      {error ? <p style={{ color: '#b91c1c', marginBottom: 'var(--gap-md)' }}>{error}</p> : null}
      {!loading && !error && logs.length === 0 ? (
        <PageEmpty icon="share" title="Hen├╝z Facebook payla┼ş─▒m kayd─▒ yok." />
      ) : null}

      <div className="kb-log-list">
        {logs.map((log) => {
          const tone = statusTone(log.status);
          return (
            <button
              key={log.id}
              type="button"
              className="kb-log-card"
              onClick={() => openDetail(log.id)}
            >
              <div className="kb-log-card-date">{formatDate(log.attempted_at)}</div>
              <div className="kb-log-card-meta">
                {(log.lang || '?').toUpperCase()} ┬À slot {log.slot_hour ?? 'ÔÇö'} ┬À {log.content_date || 'ÔÇö'}
                <span
                  style={{
                    marginLeft: 8,
                    background: tone.bg,
                    color: tone.fg,
                    borderRadius: 999,
                    padding: '2px 8px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                  }}
                >
                  {tone.label}
                </span>
              </div>
              <div className="kb-log-card-title">
                {log.place_name_tr || log.place_id || 'ÔÇö'}
                {log.city_tr ? ` ┬À ${log.city_tr}` : ''}
              </div>
              {log.place_url ? <div className="kb-log-card-meta">{log.place_url}</div> : null}
              {log.facebook_post_id ? (
                <div className="kb-log-card-meta">Post: {log.facebook_post_id}</div>
              ) : null}
              {log.error ? (
                <div className="kb-log-card-body" style={{ color: '#991b1b' }}>
                  {String(log.error).slice(0, 180)}
                </div>
              ) : log.message_preview ? (
                <div className="kb-log-card-body">{String(log.message_preview).slice(0, 160)}</div>
              ) : null}
              <div className="kb-log-card-footer">Detay i├ğin t─▒kla ÔåÆ</div>
            </button>
          );
        })}
      </div>

      {(selected || detailLoading || detailError) && (
        <div
          role="dialog"
          className="kb-settings-modal-overlay"
          onClick={() => {
            setSelected(null);
            setDetailError(null);
          }}
        >
          <div
            className="kb-settings-modal"
            style={{ maxWidth: 900, maxHeight: '85vh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2>Facebook Payla┼ş─▒m Detay─▒</h2>
            {detailLoading ? <p>Detay y├╝kleniyor...</p> : null}
            {detailError ? <p style={{ color: '#b91c1c' }}>{detailError}</p> : null}
            {selected && (
              <>
                <p>
                  <strong>Durum:</strong> {selected.status} ┬À{' '}
                  <strong>Dil:</strong> {(selected.lang || '').toUpperCase()} ┬À{' '}
                  <strong>Slot:</strong> {selected.slot_hour ?? 'ÔÇö'}
                </p>
                <p>
                  <strong>Yer:</strong> {selected.place_name_tr || selected.place_id}
                </p>
                <p>
                  <strong>URL:</strong>{' '}
                  {selected.place_url ? (
                    <a href={selected.place_url} target="_blank" rel="noreferrer">
                      {selected.place_url}
                    </a>
                  ) : (
                    'ÔÇö'
                  )}
                </p>
                <p>
                  <strong>Deneme:</strong> {formatDate(selected.attempted_at)} ┬À{' '}
                  <strong>Posted:</strong> {formatDate(selected.posted_at)}
                </p>
                <p>
                  <strong>Page ID:</strong> {selected.facebook_page_id || 'ÔÇö'}
                </p>
                <p>
                  <strong>Post ID:</strong> {selected.facebook_post_id || 'ÔÇö'}
                </p>
                <p>
                  <strong>content_date:</strong> {selected.content_date || 'ÔÇö'} ┬À{' '}
                  <strong>run_id:</strong> {selected.run_id || 'ÔÇö'}
                </p>
                {selected.message_preview ? (
                  <p style={{ whiteSpace: 'pre-wrap' }}>
                    <strong>Mesaj:</strong> {selected.message_preview}
                  </p>
                ) : null}
                {selected.error ? (
                  <p style={{ whiteSpace: 'pre-wrap', color: '#991b1b' }}>
                    <strong>Hata:</strong> {selected.error}
                  </p>
                ) : null}
              </>
            )}
            <div className="kb-settings-modal-actions">
              <button
                type="button"
                className="kb-btn-save"
                onClick={() => {
                  setSelected(null);
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
