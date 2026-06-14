import { useState, useEffect, useCallback } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE_URL } from '../config/api';
import './AdminPanelPage.css';

const DRAFT_KEY = 'kitabe_admin_push_draft_v1';

type Counts = { all: number; users: number; editors: number; admins: number };
type TargetMode = 'all' | 'roles' | 'users';
type UserRole = 'user' | 'editor' | 'admin';
type PushUser = {
  id: string;
  email: string;
  isim?: string;
  soyad?: string;
  rol: UserRole;
};

/** Tarayıcı datetime-local için `YYYY-MM-DDTHH:mm` (yerel saat) */
function toDatetimeLocalValue(d: Date) {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function defaultScheduleDatetimeLocal() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(9, 0, 0, 0);
  return toDatetimeLocalValue(d);
}

const AdminPushBroadcastPage = () => {
  const { kullanici, getToken } = useAuth();
  const [targetMode, setTargetMode] = useState<TargetMode>('all');
  const [roleUser, setRoleUser] = useState(false);
  const [roleEditor, setRoleEditor] = useState(false);
  const [roleAdmin, setRoleAdmin] = useState(false);
  const [usersModalOpen, setUsersModalOpen] = useState(false);
  const [allUsers, setAllUsers] = useState<PushUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersLoaded, setUsersLoaded] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [deepLink, setDeepLink] = useState<'notifications' | 'place'>('notifications');
  const [placeId, setPlaceId] = useState('');
  /** Boş = sadece “dakika sonra”; dolu = tam tarih/saat (öncelikli) */
  const [scheduleAtLocal, setScheduleAtLocal] = useState('');
  const [scheduleMinutes, setScheduleMinutes] = useState('');
  const [loading, setLoading] = useState(false);
  const [countsLoading, setCountsLoading] = useState(false);
  const [counts, setCounts] = useState<Counts | null>(null);
  const [unionCount, setUnionCount] = useState<number | null>(null);
  const [logs, setLogs] = useState<Record<string, unknown>[]>([]);
  const [pendingJobs, setPendingJobs] = useState<Record<string, unknown>[]>([]);
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const selectedRoles: string[] = [
    roleUser && 'user',
    roleEditor && 'editor',
    roleAdmin && 'admin',
  ].filter(Boolean) as string[];

  const effectiveRoleFilter: UserRole[] =
    selectedRoles.length > 0
      ? (selectedRoles as UserRole[])
      : ['admin', 'editor', 'user'];

  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const d = JSON.parse(raw);
      if (d.targetMode === 'all' || d.targetMode === 'roles' || d.targetMode === 'users') {
        setTargetMode(d.targetMode);
      } else if (typeof d.targetAll === 'boolean') {
        // backward compatibility with old draft shape
        setTargetMode(d.targetAll ? 'all' : 'roles');
      }
      if (d.roleUser != null) setRoleUser(!!d.roleUser);
      if (d.roleEditor != null) setRoleEditor(!!d.roleEditor);
      if (d.roleAdmin != null) setRoleAdmin(!!d.roleAdmin);
      if (Array.isArray(d.selectedUserIds)) {
        setSelectedUserIds(
          d.selectedUserIds
            .map((id: unknown) => String(id || '').trim())
            .filter(Boolean)
        );
      }
      if (typeof d.title === 'string') setTitle(d.title);
      if (typeof d.body === 'string') setBody(d.body);
      if (d.deepLink === 'place' || d.deepLink === 'notifications') setDeepLink(d.deepLink);
      if (typeof d.placeId === 'string') setPlaceId(d.placeId);
      if (typeof d.scheduleAtLocal === 'string' && d.scheduleAtLocal) setScheduleAtLocal(d.scheduleAtLocal);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      try {
        localStorage.setItem(
          DRAFT_KEY,
          JSON.stringify({
            targetMode,
            roleUser,
            roleEditor,
            roleAdmin,
            selectedUserIds,
            title,
            body,
            deepLink,
            placeId,
            scheduleAtLocal,
          })
        );
      } catch {
        /* ignore */
      }
    }, 300);
    return () => clearTimeout(t);
  }, [
    targetMode,
    roleUser,
    roleEditor,
    roleAdmin,
    selectedUserIds,
    title,
    body,
    deepLink,
    placeId,
    scheduleAtLocal,
  ]);

  const loadRecipientCounts = useCallback(async () => {
    setCountsLoading(true);
    try {
      const token = await getToken();
      if (!token) return;
      let url = `${API_BASE_URL}/api/admin/push-broadcast/recipients`;
      if (targetMode === 'roles' && selectedRoles.length > 0) {
        url += `?roles=${encodeURIComponent(selectedRoles.join(','))}`;
      } else if (targetMode === 'users' && selectedUserIds.length > 0) {
        url += `?userIds=${encodeURIComponent(selectedUserIds.join(','))}`;
      }
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success && data.counts) setCounts(data.counts);
      setUnionCount(typeof data.unionCount === 'number' ? data.unionCount : null);
    } catch {
      setCounts(null);
    } finally {
      setCountsLoading(false);
    }
  }, [getToken, targetMode, roleUser, roleEditor, roleAdmin, selectedUserIds]);

  const loadLogs = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) return;
      const [lr, jr] = await Promise.all([
        fetch(`${API_BASE_URL}/api/admin/push-broadcast/logs?limit=20`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/api/admin/push-scheduled`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      const lj = await lr.json();
      const jj = await jr.json();
      if (lj.success && Array.isArray(lj.data)) setLogs(lj.data);
      if (jj.success && Array.isArray(jj.data)) setPendingJobs(jj.data);
    } catch {
      setLogs([]);
    }
  }, [getToken]);

  const loadUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const token = await getToken();
      if (!token) return;
      const res = await fetch(`${API_BASE_URL}/api/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success || !Array.isArray(data.data)) {
        throw new Error(data.message || `Kullanıcılar alınamadı (${res.status})`);
      }
      const mapped = data.data
        .map((u: Record<string, unknown>) => ({
          id: String(u.id || ''),
          email: String(u.email || ''),
          isim: u.isim ? String(u.isim) : '',
          soyad: u.soyad ? String(u.soyad) : '',
          rol:
            u.rol === 'admin' || u.rol === 'editor' || u.rol === 'user'
              ? (u.rol as UserRole)
              : 'user',
        }))
        .filter((u: PushUser) => u.id);
      setAllUsers(mapped);
      setUsersLoaded(true);
    } catch (err) {
      setResult({
        ok: false,
        text: err instanceof Error ? err.message : 'Kullanıcı listesi alınamadı',
      });
    } finally {
      setUsersLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    if (kullanici?.rol === 'admin') {
      loadRecipientCounts();
      loadLogs();
    }
  }, [kullanici?.rol, loadRecipientCounts, loadLogs]);

  useEffect(() => {
    if (usersModalOpen && !usersLoaded && !usersLoading) {
      loadUsers();
    }
  }, [usersModalOpen, usersLoaded, usersLoading, loadUsers]);

  useEffect(() => {
    if (!allUsers.length) return;
    const validIds = new Set(allUsers.map((u) => u.id));
    setSelectedUserIds((prev) => prev.filter((id) => validIds.has(id)));
  }, [allUsers]);

  if (!kullanici || kullanici.rol !== 'admin') {
    return <Navigate to="/account" replace />;
  }

  const filteredUsers = allUsers.filter((u) => {
    if (!effectiveRoleFilter.includes(u.rol)) return false;
    const q = userSearch.trim().toLowerCase();
    if (!q) return true;
    const fullName = `${u.isim || ''} ${u.soyad || ''}`.trim().toLowerCase();
    return (
      u.email.toLowerCase().includes(q) ||
      fullName.includes(q) ||
      u.rol.toLowerCase().includes(q) ||
      u.id.toLowerCase().includes(q)
    );
  });

  const filteredUserIds = filteredUsers.map((u) => u.id);
  const selectedSet = new Set(selectedUserIds);
  const filteredSelectedCount = filteredUsers.filter((u) => selectedSet.has(u.id)).length;

  const toggleUser = (id: string, checked: boolean) => {
    setSelectedUserIds((prev) => {
      if (checked) return [...new Set([...prev, id])];
      return prev.filter((x) => x !== id);
    });
  };

  const selectAllFiltered = () => {
    setSelectedUserIds((prev) => [...new Set([...prev, ...filteredUserIds])]);
  };

  const clearFilteredSelection = () => {
    const filteredSet = new Set(filteredUserIds);
    setSelectedUserIds((prev) => prev.filter((id) => !filteredSet.has(id)));
  };

  const buildPayload = (): Record<string, unknown> | null => {
    const trimmed = body.trim();
    if (!trimmed) {
      setResult({ ok: false, text: 'Bildirim metnini yazın.' });
      return null;
    }
    if (deepLink === 'place' && !placeId.trim()) {
      setResult({ ok: false, text: 'Yer detayı için placeId girin.' });
      return null;
    }
    const payload: Record<string, unknown> = {
      body: trimmed,
      title: title.trim() || undefined,
      deepLink,
      placeId: deepLink === 'place' ? placeId.trim() : undefined,
    };
    if (targetMode === 'all') {
      payload.audience = 'all';
    } else if (targetMode === 'roles') {
      if (selectedRoles.length === 0) {
        setResult({ ok: false, text: 'Rol tabanlı gönderimde en az bir rol seçin.' });
        return null;
      }
      payload.roles = selectedRoles;
    } else {
      if (selectedUserIds.length === 0) {
        setResult({ ok: false, text: 'Kullanıcı tabanlı gönderimde en az bir kullanıcı seçin.' });
        return null;
      }
      payload.userIds = selectedUserIds;
    }
    return payload;
  };

  const displayCount = targetMode === 'all' ? counts?.all : unionCount;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setResult(null);
    const payload = buildPayload();
    if (!payload) return;

    const ok = window.confirm(
      [
        'Push bildirimi gönderilsin mi?',
        '',
        targetMode === 'all'
          ? 'Kitle: Tüm cihazlar'
          : targetMode === 'roles'
            ? `Kitle: roller — ${selectedRoles.join(', ')}`
            : `Kitle: kullanıcılar — ${selectedUserIds.length} kişi`,
        `Kayıtlı alıcı: ${displayCount ?? '—'}`,
        '',
        `${title.trim() || 'Kitabe'} — ${body.trim().slice(0, 100)}${body.trim().length > 100 ? '…' : ''}`,
      ].join('\n')
    );
    if (!ok) return;

    const token = await getToken();
    if (!token) {
      setResult({ ok: false, text: 'Oturum bulunamadı.' });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/push-broadcast`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        setResult({ ok: false, text: data.message || data.error || `Hata ${res.status}` });
        return;
      }
      setResult({
        ok: true,
        text: `${data.message} · Alıcı: ${data.recipientCount ?? 0} · Expo hata: ${data.errors ?? 0}`,
      });
      loadRecipientCounts();
      loadLogs();
    } catch (err) {
      setResult({ ok: false, text: err instanceof Error ? err.message : 'Ağ hatası' });
    } finally {
      setLoading(false);
    }
  };

  const handleSchedule = async () => {
    setResult(null);
    const payload = buildPayload();
    if (!payload) return;

    let scheduleBody: Record<string, unknown> = { ...payload };

    if (scheduleAtLocal.trim()) {
      const when = new Date(scheduleAtLocal);
      if (Number.isNaN(when.getTime())) {
        setResult({ ok: false, text: 'Tarih/saat geçersiz.' });
        return;
      }
      if (when.getTime() < Date.now() + 5000) {
        setResult({ ok: false, text: 'Gönderim zamanı birkaç saniye sonrası olmalı (geçmiş seçilemez).' });
        return;
      }
      scheduleBody.scheduledAt = when.toISOString();
    } else {
      const mins = parseInt(scheduleMinutes.trim(), 10);
      if (!Number.isFinite(mins) || mins < 1) {
        setResult({
          ok: false,
          text: 'Takvimden tarih/saat seçin veya alttan “dakika sonra” girin.',
        });
        return;
      }
      scheduleBody.sendAfterMinutes = mins;
    }

    const token = await getToken();
    if (!token) {
      setResult({ ok: false, text: 'Oturum bulunamadı.' });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/push-scheduled`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(scheduleBody),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        setResult({ ok: false, text: data.message || data.error || `Hata ${res.status}` });
        return;
      }
      const whenLabel =
        data.scheduledAt != null
          ? new Date(String(data.scheduledAt)).toLocaleString('tr-TR', {
              dateStyle: 'short',
              timeStyle: 'short',
            })
          : '';
      setResult({
        ok: true,
        text: whenLabel
          ? `Zamanlandı: ${whenLabel} (yerel görünüm; sunucu UTC saklar) · id: ${data.id}`
          : `Zamanlandı (id: ${data.id})`,
      });
      setScheduleMinutes('');
      loadLogs();
    } catch (err) {
      setResult({ ok: false, text: err instanceof Error ? err.message : 'Ağ hatası' });
    } finally {
      setLoading(false);
    }
  };

  const cancelJob = async (id: string) => {
    const token = await getToken();
    if (!token) return;
    await fetch(`${API_BASE_URL}/api/admin/push-scheduled/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    loadLogs();
  };

  return (
    <div className="admin-panel-page">
      <div className="panel-header">
        <h1>Push bildirim gönder</h1>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', maxWidth: 720, margin: '0 auto 1rem' }}>
          Mobil uygulamaya (Expo) bildirim. Taslak tarayıcıda kaydedilir. Zamanlama: seçtiğin yerel tarih/saat
          UTC olarak saklanır; sunucu her dakika “vadesi gelen” işleri gönderir (en fazla ~1 dk sapma olabilir).
        </p>
        <div style={{ textAlign: 'center' }}>
          <Link to="/admin-panel" style={{ color: 'var(--primary)' }}>
            ← Admin paneline dön
          </Link>
        </div>
      </div>

      <div style={{ maxWidth: 640, margin: '2rem auto', padding: '0 1.25rem' }}>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Hedef türü</div>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="radio" checked={targetMode === 'all'} onChange={() => setTargetMode('all')} />
              Tüm cihazlar
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="radio" checked={targetMode === 'roles'} onChange={() => setTargetMode('roles')} />
              Role göre
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="radio" checked={targetMode === 'users'} onChange={() => setTargetMode('users')} />
              Kullanıcı seçerek
            </label>
          </div>
          <div style={{ marginTop: 8, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {targetMode === 'all'
              ? 'Giriş şartı olmadan kayıtlı tüm tokenlara gönderir.'
              : targetMode === 'roles'
                ? 'Seçtiğin rollerdeki kullanıcılara ait kayıtlı cihazlara gönderir.'
                : `Seçili kullanıcı sayısı: ${selectedUserIds.length}`}
          </div>
        </div>

        {targetMode !== 'all' && (
          <div style={{ marginBottom: 20, paddingLeft: 8 }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Rol filtreleri (birden fazla seçilebilir)</div>
            {[
              ['roleUser', 'Kullanıcılar', roleUser, setRoleUser],
              ['roleEditor', 'Editörler', roleEditor, setRoleEditor],
              ['roleAdmin', 'Adminler', roleAdmin, setRoleAdmin],
            ].map(([key, label, val, setVal]) => (
              <label key={key as string} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <input
                  type="checkbox"
                  checked={val as boolean}
                  onChange={(e) => (setVal as (v: boolean) => void)(e.target.checked)}
                />
                {label as string}
              </label>
            ))}
            {targetMode === 'users' && (
              <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                <button type="button" onClick={() => setUsersModalOpen(true)}>
                  Hedef seç
                </button>
                <button type="button" onClick={() => setSelectedUserIds([])}>
                  Seçimi temizle
                </button>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  {selectedUserIds.length} kullanıcı seçili
                </span>
              </div>
            )}
          </div>
        )}

        {counts && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 8,
              marginBottom: 16,
              fontSize: '0.88rem',
            }}
          >
            {(['all', 'users', 'editors', 'admins'] as const).map((key) => (
              <div
                key={key}
                style={{
                  padding: '0.5rem 0.75rem',
                  borderRadius: 10,
                  border: `1px solid var(--border-light)`,
                  opacity: targetMode === 'all' && key !== 'all' ? 0.7 : 1,
                }}
              >
                <strong>
                  {key === 'all'
                    ? 'Herkes'
                    : key === 'users'
                      ? 'Kullanıcı'
                      : key === 'editors'
                        ? 'Editör'
                        : 'Admin'}
                </strong>
                <div style={{ color: 'var(--text-secondary)' }}>{counts[key]} cihaz</div>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => loadRecipientCounts()}
            disabled={countsLoading}
            style={{
              padding: '0.45rem 0.9rem',
              borderRadius: 999,
              border: '1px solid var(--border-light)',
              cursor: countsLoading ? 'wait' : 'pointer',
            }}
          >
            {countsLoading ? 'Sayılıyor…' : 'Alıcı sayılarını yenile'}
          </button>
          <span style={{ color: 'var(--text-secondary)' }}>
            Seçili kitle: <strong>{displayCount ?? '—'}</strong> cihaz
          </span>
          <button type="button" onClick={() => setPreviewOpen(true)} style={{ marginLeft: 'auto' }}>
            Önizleme
          </button>
        </div>

        <form onSubmit={handleSend}>
          <label style={{ display: 'block', marginBottom: 6, fontWeight: 600 }}>
            Başlık (isteğe bağlı) ({title.length}/100)
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              borderRadius: 12,
              border: '1px solid var(--border-light)',
              marginBottom: 16,
            }}
          />

          <label style={{ display: 'block', marginBottom: 6, fontWeight: 600 }}>
            Metin ({body.length}/200)
          </label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            maxLength={200}
            rows={4}
            required
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              borderRadius: 12,
              border: '1px solid var(--border-light)',
              marginBottom: 12,
              resize: 'vertical',
            }}
          />

          <div style={{ marginBottom: 12 }}>
            <span style={{ fontWeight: 600, marginRight: 12 }}>Tıklanınca:</span>
            <label style={{ marginRight: 16 }}>
              <input
                type="radio"
                name="dl"
                checked={deepLink === 'notifications'}
                onChange={() => setDeepLink('notifications')}
              />{' '}
              Bildirimler listesi
            </label>
            <label>
              <input
                type="radio"
                name="dl"
                checked={deepLink === 'place'}
                onChange={() => setDeepLink('place')}
              />{' '}
              Yer detayı
            </label>
          </div>
          {deepLink === 'place' && (
            <input
              type="text"
              value={placeId}
              onChange={(e) => setPlaceId(e.target.value)}
              placeholder="placeId"
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: 12,
                border: '1px solid var(--border-light)',
                marginBottom: 16,
              }}
            />
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.9rem',
              borderRadius: 999,
              border: 'none',
              background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
              color: '#fff',
              fontWeight: 700,
              cursor: loading ? 'wait' : 'pointer',
              marginBottom: 12,
            }}
          >
            {loading ? '…' : 'Şimdi gönder'}
          </button>
        </form>

        <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border-light)' }}>
          <label style={{ fontWeight: 600, display: 'block', marginBottom: 8 }}>
            Zamanla — tarih ve saat (takvim)
          </label>
          <input
            type="datetime-local"
            step={60}
            value={scheduleAtLocal}
            onChange={(e) => setScheduleAtLocal(e.target.value)}
            style={{
              width: '100%',
              maxWidth: 360,
              padding: '0.65rem 1rem',
              borderRadius: 12,
              border: '1px solid var(--border-light)',
              marginBottom: 8,
            }}
          />
          <button
            type="button"
            onClick={() => setScheduleAtLocal(defaultScheduleDatetimeLocal())}
            style={{ fontSize: '0.85rem', marginBottom: 12, padding: '0.35rem 0.75rem' }}
          >
            Yarın 09:00’ı doldur
          </button>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 12 }}>
            Örnek: 29.03.2026’da planlayıp 30.03.2026 09:00 gönderim — takvimden seç. Sadece dakika ile göndermek
            istiyorsan bu alanı boş bırak.
          </p>
          <label style={{ fontWeight: 600, display: 'block', marginBottom: 6, fontSize: '0.9rem' }}>
            Veya dakika sonra (takvimi boş bırakırsan)
          </label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <input
              type="number"
              min={1}
              value={scheduleMinutes}
              onChange={(e) => setScheduleMinutes(e.target.value)}
              placeholder="örn. 90"
              style={{ flex: 1, minWidth: 120, padding: '0.65rem 1rem', borderRadius: 12, border: '1px solid var(--border-light)' }}
            />
            <button type="button" onClick={handleSchedule} disabled={loading} style={{ padding: '0.65rem 1.2rem', borderRadius: 12 }}>
              Zamanlanmış gönder
            </button>
          </div>
        </div>

        {pendingJobs.filter((j) => j.status === 'pending').length > 0 && (
          <div style={{ marginTop: 24 }}>
            <h3 style={{ fontSize: '1.05rem', marginBottom: 8 }}>Bekleyen zamanlamalar</h3>
            {pendingJobs
              .filter((j) => j.status === 'pending')
              .map((j) => (
                <div
                  key={String(j.id)}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: 10,
                    border: '1px solid var(--border-light)',
                    borderRadius: 10,
                    marginBottom: 8,
                    fontSize: '0.9rem',
                  }}
                >
                  <span>
                    {j.scheduled_at ? new Date(String(j.scheduled_at)).toLocaleString('tr-TR') : ''} — {String(j.id).slice(0, 8)}…
                  </span>
                  <button type="button" onClick={() => cancelJob(String(j.id))}>
                    İptal
                  </button>
                </div>
              ))}
          </div>
        )}

        {result && (
          <p
            role="status"
            style={{
              marginTop: '1rem',
              padding: '1rem',
              borderRadius: 12,
              background: result.ok ? 'rgba(34, 197, 94, 0.12)' : 'rgba(239, 68, 68, 0.12)',
              color: result.ok ? 'rgb(22, 101, 52)' : 'rgb(127, 29, 29)',
            }}
          >
            {result.text}
          </p>
        )}

        <h3 style={{ marginTop: 32, fontSize: '1.1rem' }}>Son gönderimler</h3>
        <p style={{ marginTop: 8 }}>
          <Link to="/admin-push-logs" style={{ color: 'var(--primary)' }}>
            Push günlüğünü tam ekranda aç
          </Link>
        </p>
        {logs.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Kayıt yok veya log tablosu henüz oluşturulmadı.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {logs.map((log) => (
              <li
                key={String(log.id)}
                style={{
                  border: '1px solid var(--border-light)',
                  borderRadius: 10,
                  padding: 12,
                  marginBottom: 8,
                  fontSize: '0.88rem',
                }}
              >
                <div style={{ color: '#888' }}>
                  {log.created_at ? new Date(String(log.created_at)).toLocaleString('tr-TR') : ''}
                </div>
                <div>
                  {String(log.target_label)} · {String(log.recipient_count)} alıcı · hata {String(log.error_count)}
                </div>
                <div style={{ marginTop: 4 }}>{String(log.body).slice(0, 120)}</div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {usersModalOpen && (
        <div
          role="dialog"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9998,
            padding: 20,
          }}
          onClick={() => setUsersModalOpen(false)}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 16,
              padding: 20,
              maxWidth: 860,
              width: '100%',
              maxHeight: '85vh',
              overflow: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginTop: 0 }}>Hedef kullanıcıları seç</h3>
            <p style={{ color: 'var(--text-secondary)', marginTop: 0 }}>
              Rol filtrelerini burada da kullanabilirsin. Sadece listelenenlerde toplu seçim yapılır.
            </p>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
              <input
                type="text"
                placeholder="Email, isim, id ara..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                style={{
                  flex: 1,
                  minWidth: 220,
                  padding: '0.65rem 0.9rem',
                  border: '1px solid var(--border-light)',
                  borderRadius: 10,
                }}
              />
              <button type="button" onClick={selectAllFiltered} disabled={filteredUsers.length === 0}>
                Listelenenleri seç
              </button>
              <button type="button" onClick={clearFilteredSelection} disabled={filteredUsers.length === 0}>
                Listelenenleri kaldır
              </button>
              <button type="button" onClick={() => loadUsers()} disabled={usersLoading}>
                {usersLoading ? 'Yükleniyor…' : 'Yenile'}
              </button>
            </div>

            <div style={{ color: 'var(--text-secondary)', marginBottom: 10, fontSize: '0.9rem' }}>
              Listelenen: {filteredUsers.length} kullanıcı · Listeden seçili: {filteredSelectedCount} · Toplam seçili:{' '}
              {selectedUserIds.length}
            </div>

            {usersLoading && !usersLoaded ? (
              <p>Yükleniyor...</p>
            ) : filteredUsers.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)' }}>Filtreye uyan kullanıcı yok.</p>
            ) : (
              <div style={{ border: '1px solid var(--border-light)', borderRadius: 12 }}>
                {filteredUsers.map((u) => {
                  const fullName = `${u.isim || ''} ${u.soyad || ''}`.trim();
                  const checked = selectedSet.has(u.id);
                  return (
                    <label
                      key={u.id}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '24px 1fr auto',
                        gap: 10,
                        alignItems: 'center',
                        padding: '0.6rem 0.75rem',
                        borderBottom: '1px solid var(--border-light)',
                        cursor: 'pointer',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => toggleUser(u.id, e.target.checked)}
                      />
                      <div>
                        <div style={{ fontWeight: 600 }}>{fullName || u.email || u.id}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                          {u.email} · {u.rol} · {u.id}
                        </div>
                      </div>
                      <span
                        style={{
                          fontSize: '0.78rem',
                          textTransform: 'uppercase',
                          color: 'var(--text-secondary)',
                        }}
                      >
                        {u.rol}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}

            <div style={{ marginTop: 14, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button type="button" onClick={() => setUsersModalOpen(false)}>
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {previewOpen && (
        <div
          role="dialog"
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
          onClick={() => setPreviewOpen(false)}
        >
          <div
            style={{ background: '#fff', borderRadius: 16, padding: 24, maxWidth: 400, width: '100%' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginTop: 0 }}>Önizleme</h3>
            <p style={{ fontWeight: 700 }}>{title.trim() || 'Kitabe'}</p>
            <p style={{ whiteSpace: 'pre-wrap' }}>{body.trim() || '—'}</p>
            <button type="button" onClick={() => setPreviewOpen(false)} style={{ marginTop: 16 }}>
              Kapat
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPushBroadcastPage;
