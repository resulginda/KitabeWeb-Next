import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { apiFetch } from '../utils/apiClient';
import { getLocalizedText } from '../utils/multilang';
import './EditorPanelPage.css';

interface PlaceSuggestion {
  id: string;
  type: 'NEW' | 'EDIT';
  placeId?: string;
  status: string;
  changes: any;
  userId: string;
  createdAt: any;
}

function mergeSuggestionsByDate(a: PlaceSuggestion[], b: PlaceSuggestion[]): PlaceSuggestion[] {
  const seen = new Set<string>();
  const out: PlaceSuggestion[] = [];
  for (const x of [...a, ...b]) {
    if (seen.has(x.id)) continue;
    seen.add(x.id);
    out.push(x);
  }
  return out.sort((p, q) => {
    const ta = new Date(p.createdAt || 0).getTime();
    const tb = new Date(q.createdAt || 0).getTime();
    return tb - ta;
  });
}

const EditorPanelPage = () => {
  const { t } = useTranslation();
  const { kullanici } = useAuth();
  const { currentLanguage } = useLanguage();
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'pending' | 'waiting' | 'approved'>('pending');
  const [selectedSuggestion, setSelectedSuggestion] = useState<PlaceSuggestion | null>(null);
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    if (!kullanici || (kullanici.rol !== 'editor' && kullanici.rol !== 'admin')) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const isAdmin = kullanici.rol === 'admin';
        let list: PlaceSuggestion[] = [];
        if (tab === 'pending') {
          const res = await apiFetch('/api/place-suggestions?status=pending_editor');
          const json = await res.json();
          if (json.success && Array.isArray(json.data)) {
            list = json.data.map((row: Record<string, unknown>) => ({
              id: String(row.id),
              ...row,
            })) as PlaceSuggestion[];
          }
        } else if (tab === 'waiting') {
          const res = await apiFetch('/api/place-suggestions?status=editor_approved');
          const json = await res.json();
          if (json.success && Array.isArray(json.data)) {
            list = json.data.map((row: Record<string, unknown>) => ({
              id: String(row.id),
              ...row,
            })) as PlaceSuggestion[];
          }
        } else {
          if (isAdmin) {
            const [r1, r2] = await Promise.all([
              apiFetch('/api/place-suggestions?status=admin_approved'),
              apiFetch('/api/place-suggestions?status=rejected'),
            ]);
            const [j1, j2] = await Promise.all([r1.json(), r2.json()]);
            const a: PlaceSuggestion[] =
              j1.success && Array.isArray(j1.data)
                ? j1.data.map((row: Record<string, unknown>) => ({ id: String(row.id), ...row } as PlaceSuggestion))
                : [];
            const b: PlaceSuggestion[] =
              j2.success && Array.isArray(j2.data)
                ? j2.data.map((row: Record<string, unknown>) => ({ id: String(row.id), ...row } as PlaceSuggestion))
                : [];
            list = mergeSuggestionsByDate(a, b);
          } else {
            const res = await apiFetch('/api/place-suggestions?status=admin_approved');
            const json = await res.json();
            if (json.success && Array.isArray(json.data)) {
              list = json.data.map((row: Record<string, unknown>) => ({
                id: String(row.id),
                ...row,
              })) as PlaceSuggestion[];
            }
          }
        }
        if (!cancelled) setSuggestions(list);
      } catch (e) {
        console.error('EditorPanel query error:', e);
        if (!cancelled) setSuggestions([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [kullanici, tab, refreshTick]);

  const handleApprove = async (suggestion: PlaceSuggestion) => {
    const message = t('editorPanel.approveConfirm') || 'Bu öneriyi onaylamak istediğinizden emin misiniz?';
    if (!window.confirm(message)) return;
    try {
      const res = await apiFetch(`/api/place-suggestions/${suggestion.id}/editor-approve`, {
        method: 'PATCH',
        body: JSON.stringify({}),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err.message || 'İşlem başarısız');
        return;
      }
      setSelectedSuggestion(null);
      setRefreshTick((x) => x + 1);
    } catch {
      alert('İşlem başarısız');
    }
  };

  const handleReject = async (suggestion: PlaceSuggestion) => {
    const message = t('editorPanel.rejectConfirm') || 'Bu öneriyi reddetmek istediğinizden emin misiniz?';
    if (!window.confirm(message)) return;
    try {
      const res = await apiFetch(`/api/place-suggestions/${suggestion.id}/reject`, {
        method: 'PATCH',
        body: JSON.stringify({}),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err.message || 'İşlem başarısız');
        return;
      }
      setSelectedSuggestion(null);
      setRefreshTick((x) => x + 1);
    } catch {
      alert('İşlem başarısız');
    }
  };

  if (!kullanici || (kullanici.rol !== 'editor' && kullanici.rol !== 'admin')) {
    return (
      <div className="editor-panel-page">
        <div className="access-denied">
          <p>{t('editorPanel.accessDenied') || 'Bu sayfaya erişim yetkiniz yok'}</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="editor-panel-page loading">{t('common.loading')}</div>;
  }

  return (
    <div className="editor-panel-page">
      <header className="panel-header">
        <h1>{t('account.editorPanel') || 'Editör Paneli'}</h1>
        <div className="tabs">
          <button
            className={tab === 'pending' ? 'active' : ''}
            onClick={() => setTab('pending')}
          >
            {t('editorPanel.tabs.pending') || 'Bekleyenler'}
          </button>
          <button
            className={tab === 'waiting' ? 'active' : ''}
            onClick={() => setTab('waiting')}
          >
            {t('editorPanel.tabs.waiting') || 'Admin Onayı Bekleyenler'}
          </button>
          <button
            className={tab === 'approved' ? 'active' : ''}
            onClick={() => setTab('approved')}
          >
            {t('editorPanel.tabs.approved') || 'Onaylananlar'}
          </button>
        </div>
      </header>

      <div className="suggestions-list">
        {suggestions.length === 0 ? (
          <div className="no-suggestions">
            <p>{t('editorPanel.noSuggestions') || 'Öneri bulunamadı'}</p>
          </div>
        ) : (
          suggestions.map(suggestion => {
            // Çok dilli alanları doğru şekilde parse et
            const name = suggestion.changes?.name 
              ? (typeof suggestion.changes.name === 'string' 
                  ? suggestion.changes.name 
                  : getLocalizedText(suggestion.changes.name, currentLanguage))
              : (t('suggestion.unnamedPlace') || 'İsimsiz');
            const city = suggestion.changes?.city 
              ? (typeof suggestion.changes.city === 'string' 
                  ? suggestion.changes.city 
                  : getLocalizedText(suggestion.changes.city, currentLanguage))
              : '';
            const type = suggestion.type === 'EDIT' 
              ? (t('suggestion.type.edit') || t('suggestion.editSuggestion') || 'Düzenleme Önerisi')
              : (t('suggestion.type.new') || t('suggestion.newPlace') || 'Yeni Yer Önerisi');

            return (
              <div key={suggestion.id} className="suggestion-item">
                <div className="suggestion-info">
                  <h3>{name}</h3>
                  <p>{city}</p>
                  <p className="suggestion-type">{type}</p>
                </div>
                <div className="suggestion-actions">
                  <button onClick={() => setSelectedSuggestion(suggestion)}>
                    {t('common.details') || 'Detaylar'}
                  </button>
                  {tab === 'pending' && (
                    <>
                      <button className="approve-btn" onClick={() => handleApprove(suggestion)}>
                        {t('editorPanel.approve') || 'Onayla'}
                      </button>
                      <button className="reject-btn" onClick={() => handleReject(suggestion)}>
                        {t('editorPanel.reject') || 'Reddet'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {selectedSuggestion && (
        <div className="modal-overlay" onClick={() => setSelectedSuggestion(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>
              {selectedSuggestion.changes?.name 
                ? (typeof selectedSuggestion.changes.name === 'string' 
                    ? selectedSuggestion.changes.name 
                    : getLocalizedText(selectedSuggestion.changes.name, currentLanguage))
                : (t('suggestion.unnamedPlace') || 'İsimsiz')}
            </h2>
            <div className="modal-details">
              <p>
                <strong>{t('suggestion.city') || 'İl'}:</strong>{' '}
                {selectedSuggestion.changes?.city 
                  ? (typeof selectedSuggestion.changes.city === 'string' 
                      ? selectedSuggestion.changes.city 
                      : getLocalizedText(selectedSuggestion.changes.city, currentLanguage))
                  : '-'}
              </p>
              <p>
                <strong>{t('suggestion.district') || 'İlçe'}:</strong>{' '}
                {selectedSuggestion.changes?.district 
                  ? (typeof selectedSuggestion.changes.district === 'string' 
                      ? selectedSuggestion.changes.district 
                      : getLocalizedText(selectedSuggestion.changes.district, currentLanguage))
                  : '-'}
              </p>
              <p>
                <strong>{t('suggestion.description') || 'Açıklama'}:</strong>{' '}
                {selectedSuggestion.changes?.description 
                  ? (typeof selectedSuggestion.changes.description === 'string' 
                      ? selectedSuggestion.changes.description 
                      : getLocalizedText(selectedSuggestion.changes.description, currentLanguage))
                  : '-'}
              </p>
              {selectedSuggestion.changes?.story && (
                <p>
                  <strong>{t('suggestion.story') || 'Hikâye'}:</strong>{' '}
                  {typeof selectedSuggestion.changes.story === 'string' 
                    ? selectedSuggestion.changes.story 
                    : getLocalizedText(selectedSuggestion.changes.story, currentLanguage)}
                </p>
              )}
              {selectedSuggestion.changes?.period && (
                <p>
                  <strong>{t('suggestion.period') || 'Dönem'}:</strong>{' '}
                  {typeof selectedSuggestion.changes.period === 'string' 
                    ? selectedSuggestion.changes.period 
                    : getLocalizedText(selectedSuggestion.changes.period, currentLanguage)}
                </p>
              )}
              {selectedSuggestion.changes?.category && (
                <p>
                  <strong>{t('suggestion.categories') || 'Kategoriler'}:</strong>{' '}
                  {Array.isArray(selectedSuggestion.changes.category) 
                    ? selectedSuggestion.changes.category.join(', ')
                    : (typeof selectedSuggestion.changes.category === 'string'
                        ? selectedSuggestion.changes.category
                        : '-')}
                </p>
              )}
              {selectedSuggestion.changes?.visitTips && Array.isArray(selectedSuggestion.changes.visitTips) && selectedSuggestion.changes.visitTips.length > 0 && (
                <div>
                  <strong>{t('suggestion.visitTips') || 'Ziyaret İpuçları'}:</strong>
                  <ul>
                    {selectedSuggestion.changes.visitTips.map((tip: string, idx: number) => (
                      <li key={idx}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className="modal-actions">
              <button className="close-btn" onClick={() => setSelectedSuggestion(null)}>
                {t('common.close') || 'Kapat'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditorPanelPage;

