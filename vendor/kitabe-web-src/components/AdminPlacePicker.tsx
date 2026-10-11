import { useEffect, useRef, useState } from 'react';
import { API_BASE_URL } from '../config/api';

type PlaceHit = { id: string; name: string; city: string; thumb: string | null };

type Props = {
  placeId: string;
  placeName: string;
  onSelect: (place: { id: string; name: string }) => void;
  onClear: () => void;
};

const SEARCH_DELAY_MS = 300;

function toText(v: unknown): string {
  if (v == null) return '';
  if (typeof v === 'string') return v;
  if (typeof v === 'object') {
    const o = v as Record<string, unknown>;
    return String(o.tr ?? o.en ?? '');
  }
  return String(v);
}

/** Admin bildirimi için yer seçimi: adla ara → listeden seç (placeId arkada dolar) */
export default function AdminPlacePicker({ placeId, placeName, onSelect, onClear }: Props) {
  const [q, setQ] = useState('');
  const [hits, setHits] = useState<PlaceHit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const reqId = useRef(0);

  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) {
      setHits([]);
      setError('');
      return;
    }
    const id = ++reqId.current;
    const timer = setTimeout(async () => {
      setLoading(true);
      setError('');
      try {
        const url = `${API_BASE_URL}/api/places?minimal=1&lang=tr&page=1&limit=12&search=${encodeURIComponent(term)}`;
        const res = await fetch(url);
        const data = await res.json().catch(() => ({}));
        if (id !== reqId.current) return;
        if (!res.ok || !data.success) throw new Error(data.message || `Hata ${res.status}`);
        const list: PlaceHit[] = (Array.isArray(data.data) ? data.data : []).map((p: Record<string, unknown>) => ({
          id: String(p.id || ''),
          name: toText(p.name),
          city: toText(p.city),
          thumb: (p.thumbnailUrl as string) || (p.imageUrl as string) || null,
        }));
        const lower = term.toLocaleLowerCase('tr');
        list.sort(
          (a, b) =>
            Number(b.name.toLocaleLowerCase('tr').includes(lower)) -
            Number(a.name.toLocaleLowerCase('tr').includes(lower))
        );
        setHits(list.filter((p) => p.id).slice(0, 8));
      } catch (err) {
        if (id === reqId.current) {
          setHits([]);
          setError(err instanceof Error ? err.message : 'Arama başarısız');
        }
      } finally {
        if (id === reqId.current) setLoading(false);
      }
    }, SEARCH_DELAY_MS);
    return () => clearTimeout(timer);
  }, [q]);

  if (placeId) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '0.7rem 1rem',
          borderRadius: 12,
          border: '1px solid var(--border-light)',
          marginBottom: 16,
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Seçilen yer</div>
          <div style={{ fontWeight: 600 }}>{placeName || placeId}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>id: {placeId}</div>
        </div>
        <button
          type="button"
          onClick={() => {
            onClear();
            setQ('');
          }}
        >
          Değiştir
        </button>
      </div>
    );
  }

  return (
    <div style={{ marginBottom: 16 }}>
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Yer ara (ör. Ortaköy Camii)"
        style={{
          width: '100%',
          padding: '0.75rem 1rem',
          borderRadius: 12,
          border: '1px solid var(--border-light)',
        }}
      />
      {loading && <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 6 }}>Aranıyor…</div>}
      {error && <div style={{ fontSize: '0.85rem', color: 'rgb(127, 29, 29)', marginTop: 6 }}>{error}</div>}
      {!loading && !error && q.trim().length >= 2 && hits.length === 0 && (
        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 6 }}>Sonuç yok</div>
      )}
      {hits.length > 0 && (
        <div style={{ border: '1px solid var(--border-light)', borderRadius: 12, marginTop: 6, overflow: 'hidden' }}>
          {hits.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => onSelect({ id: p.id, name: p.city ? `${p.name} — ${p.city}` : p.name })}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                width: '100%',
                padding: '0.5rem 0.75rem',
                border: 'none',
                borderBottom: '1px solid var(--border-light)',
                background: 'transparent',
                textAlign: 'left',
                cursor: 'pointer',
              }}
            >
              {p.thumb ? (
                <img src={p.thumb} alt="" width={40} height={40} style={{ borderRadius: 8, objectFit: 'cover' }} />
              ) : (
                <div style={{ width: 40, height: 40, borderRadius: 8, background: 'var(--border-light)' }} />
              )}
              <span style={{ minWidth: 0 }}>
                <span style={{ display: 'block', fontWeight: 600 }}>{p.name}</span>
                <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{p.city}</span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
