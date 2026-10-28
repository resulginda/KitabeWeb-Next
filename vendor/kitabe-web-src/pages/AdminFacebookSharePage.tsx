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
  places: Array<{
    id: string;
    nameTr?: string;
    cityTr?: string | null;
    slotHour?: number | null;
  }>;
};

type Summary = {
  byStatus: Array<{ status: string; count: number }>;
};

const LANG_FILTERS = [
  { value: '', label: 'Tümü' },
  { value: 'tr', label: 'TR' },
  { value: 'en', label: 'EN' },
  { value: 'ru', label: 'RU' },
  { value: 'ar', label: 'AR' },
] as const;

const STATUS_FILTERS = [
  { value: '', label: 'Hepsi' },
  { value: 'success', label: 'Başarılı' },
  { value: 'failed', label: 'Hata' },
  { value: 'dry_run', label: 'Dry-run' },
] as const;

function statusMeta(status?: string) {
  const s = String(status || '').toLowerCase();
  if (s === 'success' || s === 'posted') {
    return { label: 'Başarılı', color: '#166534', bg: 'rgba(22, 101, 52, 0.1)' };
  }
  if (s === 'failed') {
    return { label: 'Hata', color: '#991b1b', bg: 'rgba(153, 27, 27, 0.1)' };
  }
  if (s === 'dry_run') {
    return { label: 'Dry-run', color: '#1d4ed8', bg: 'rgba(29, 78, 216, 0.1)' };
  }
  if (s === 'pending') {
    return { label: 'Bekliyor', color: '#9a3412', bg: 'rgba(154, 52, 18, 0.1)' };
  }
  return { label: s || '—', color: 'var(--text-secondary)', bg: 'rgba(0,0,0,0.04)' };
}

function formatDate(value?: string | null) {
  if (!value) return '—';
  return new Date(value).toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' });
}

function readableError(message?: string) {
  if (!message || /[\u2500-\u259FÃÂÅ]/.test(message)) {
    return 'Paylaşım kayıtları yüklenemedi.';
  }
  return message;
}

function FilterChip({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button type="button" className={`kb-fb-chip${active ? ' is-active' : ''}`} onClick={onClick}>
      {label}
    </button>
  );
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
  const [selected, setSelected] = useState<ShareLogRow | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  const queryString = useMemo(() => {
    const q = new URLSearchParams({ limit: '100' });
    if (lang) q.set('lang', lang);
    if (status) q.set('status', status);
    return q.toString();
  }, [lang, status]);

  const load = useCallback(async () => {
    if (kullanici?.rol !== 'admin') return;
    setError(null);
    const token = await getToken();
    if (!token) {
      setError('Oturum bulunamadı.');
      setLogs([]);
      return;
    }
    const headers = { Authorization: `Bearer ${token}` };
    const [logsRes, picksRes, summaryRes] = await Promise.all([
      fetch(`${API_BASE_URL}/api/admin/facebook-share/logs?${queryString}`, { headers }),
      fetch(`${API_BASE_URL}/api/admin/facebook-share/daily-picks?limit=5`, { headers }),
      fetch(`${API_BASE_URL}/api/admin/facebook-share/summary?days=7`, { headers }),
    ]);
    const logsData = await logsRes.json().catch(() => ({}));
    const picksData = await picksRes.json().catch(() => ({}));
    const summaryData = await summaryRes.json().catch(() => ({}));

    if (!logsRes.ok || !logsData.success) {
      const detail = logsData.detail ? ` (${logsData.detail})` : '';
      setError(`${readableError(logsData.message)}${detail}`);
      setLogs([]);
      setTotal(0);
    } else {
      setLogs(Array.isArray(logsData.data) ? logsData.data : []);
      setTotal(Number(logsData.total || 0));
    }
    setPicks(picksRes.ok && picksData.success && Array.isArray(picksData.data) ? picksData.data : []);
    setSummary(summaryRes.ok && summaryData.success ? (summaryData.data as Summary) : null);
  }, [getToken, kullanici?.rol, queryString]);

  useEffect(() => {
    setLoading(true);
    load().finally(() => setLoading(false));
  }, [load]);

  const openDetail = useCallback(
    async (id: number) => {
      const token = await getToken();
      if (!token) {
        setDetailError('Oturum bulunamadı.');
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
          setDetailError(data.message || `Detay alınamadı (${res.status})`);
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

  const statusRows = (summary?.byStatus || []).filter((r) => r.status && Number(r.count) > 0);
  const latestPick = picks.find((p) => Array.isArray(p.places) && p.places.length > 0) || null;
  const showEmpty = !loading && !error && logs.length === 0;

  return (
    <PageShell
      title={t('account.facebookShareLogs', 'Facebook Paylaşımları')}
      backTo="/admin-hub"
      className="kb-page-wide"
    >
      <div className="kb-fb-bar">
        <div className="kb-fb-chips">
          {LANG_FILTERS.map((item) => (
            <FilterChip
              key={item.value || 'all-lang'}
              active={lang === item.value}
              label={item.label}
              onClick={() => setLang(item.value)}
            />
          ))}
        </div>
        <div className="kb-fb-chips">
          {STATUS_FILTERS.map((item) => (
            <FilterChip
              key={item.value || 'all-status'}
              active={status === item.value}
              label={item.label}
              onClick={() => setStatus(item.value)}
            />
          ))}
        </div>
        <span className="kb-fb-count">{total} kayıt</span>
        <div className="kb-admin-toolbar" style={{ marginBottom: 0 }}>
          <button type="button" onClick={load}>
            <span className="material-icons" style={{ fontSize: 18 }}>
              refresh
            </span>
            Yenile
          </button>
        </div>
      </div>

      {statusRows.length > 0 ? (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8,
            marginBottom: 'var(--gap-md)',
          }}
        >
          {statusRows.map((row) => {
            const meta = statusMeta(row.status);
            return (
              <div
                key={row.status}
                style={{
                  background: meta.bg,
                  color: meta.color,
                  borderRadius: 10,
                  padding: '8px 12px',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  minWidth: 88,
                }}
              >
                <div style={{ opacity: 0.85, fontWeight: 500 }}>{meta.label}</div>
                <div style={{ fontSize: '1.125rem', marginTop: 2 }}>{row.count}</div>
              </div>
            );
          })}
        </div>
      ) : null}

      {latestPick ? (
        <div
          style={{
            border: '1px solid var(--border, #e8e0d4)',
            borderRadius: 14,
            padding: '14px 16px',
            marginBottom: 'var(--gap-md)',
            background: 'var(--surface, #fff)',
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>
            Bugünün seçimi · {latestPick.contentDate}
          </div>
          <div style={{ display: 'grid', gap: 6 }}>
            {latestPick.places.map((p) => (
              <div
                key={`${p.id}-${p.slotHour}`}
                style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}
              >
                <strong style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                  {p.slotHour ?? '—'}:00
                </strong>
                {' — '}
                {p.nameTr || p.id}
                {p.cityTr ? ` · ${p.cityTr}` : ''}
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
      {error ? <p className="kb-fb-error">{error}</p> : null}
      {showEmpty ? (
        <PageEmpty
          icon="share"
          title="Henüz Facebook paylaşımı yok."
          subtitle="n8n Daily Share ilk canlı slotları atınca kayıtlar burada listelenir."
        />
      ) : null}

      <div className="kb-log-list">
        {logs.map((log) => {
          const meta = statusMeta(log.status);
          return (
            <button
              key={log.id}
              type="button"
              className="kb-log-card"
              onClick={() => openDetail(log.id)}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 12,
                  alignItems: 'center',
                }}
              >
                <div className="kb-log-card-date">{formatDate(log.attempted_at)}</div>
                <span
                  style={{
                    background: meta.bg,
                    color: meta.color,
                    borderRadius: 999,
                    padding: '3px 10px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {meta.label}
                </span>
              </div>
              <div className="kb-log-card-meta">
                {(log.lang || '?').toUpperCase()} · {log.slot_hour ?? '—'}:00 ·{' '}
                {log.content_date || '—'}
              </div>
              <div className="kb-log-card-title">
                {log.place_name_tr || log.place_id || '—'}
                {log.city_tr ? ` · ${log.city_tr}` : ''}
              </div>
              {log.place_url ? <div className="kb-log-card-meta">{log.place_url}</div> : null}
              {log.facebook_post_id ? (
                <div className="kb-log-card-meta">Post ID: {log.facebook_post_id}</div>
              ) : null}
              {log.error ? (
                <div className="kb-log-card-body" style={{ color: '#991b1b' }}>
                  {String(log.error).slice(0, 180)}
                </div>
              ) : log.message_preview ? (
                <div className="kb-log-card-body">{String(log.message_preview).slice(0, 160)}</div>
              ) : null}
              <div className="kb-log-card-footer">Detay için tıkla →</div>
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
            style={{ maxWidth: 720, maxHeight: '85vh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2>Paylaşım detayı</h2>
            {detailLoading ? <p>Yükleniyor…</p> : null}
            {detailError ? <p style={{ color: '#b91c1c' }}>{detailError}</p> : null}
            {selected ? (
              <div style={{ display: 'grid', gap: 10, fontSize: '0.9375rem' }}>
                <p style={{ margin: 0 }}>
                  <strong>Durum:</strong> {statusMeta(selected.status).label}
                  {' · '}
                  <strong>Dil:</strong> {(selected.lang || '').toUpperCase()}
                  {' · '}
                  <strong>Slot:</strong> {selected.slot_hour ?? '—'}:00
                </p>
                <p style={{ margin: 0 }}>
                  <strong>Yer:</strong> {selected.place_name_tr || selected.place_id}
                </p>
                <p style={{ margin: 0 }}>
                  <strong>URL:</strong>{' '}
                  {selected.place_url ? (
                    <a href={selected.place_url} target="_blank" rel="noreferrer">
                      {selected.place_url}
                    </a>
                  ) : (
                    '—'
                  )}
                </p>
                <p style={{ margin: 0 }}>
                  <strong>Deneme:</strong> {formatDate(selected.attempted_at)}
                  {' · '}
                  <strong>Yayın:</strong> {formatDate(selected.posted_at)}
                </p>
                <p style={{ margin: 0 }}>
                  <strong>Page ID:</strong> {selected.facebook_page_id || '—'}
                </p>
                <p style={{ margin: 0 }}>
                  <strong>Post ID:</strong> {selected.facebook_post_id || '—'}
                </p>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
                  content_date: {selected.content_date || '—'} · run_id: {selected.run_id || '—'}
                </p>
                {selected.message_preview ? (
                  <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{selected.message_preview}</p>
                ) : null}
                {selected.error ? (
                  <p style={{ margin: 0, whiteSpace: 'pre-wrap', color: '#991b1b' }}>
                    {selected.error}
                  </p>
                ) : null}
              </div>
            ) : null}
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
