import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { usePlaces } from '../contexts/PlacesContext';
import { apiFetch } from '../utils/apiClient';
import { getLocalizedText } from '../utils/multilang';
import { openPlaceDetailById } from '../utils/placeDetailUrl';
import { PageShell, PageEmpty, PageLoginRequired } from '../components/PageShell';

interface PlaceSuggestion {
  id: string;
  type: 'NEW' | 'EDIT';
  placeId?: string;
  targetPlaceId?: string;
  status: string;
  changes: Record<string, unknown>;
  createdAt?: string;
}

const getStatusInfo = (t: (key: string) => string, status: string) => {
  const ns = 'mySuggestions.status';
  switch (status) {
    case 'pending_editor':
      return { label: t(`${ns}.pending_editor_label`), description: t(`${ns}.pending_editor_desc`) };
    case 'editor_approved':
      return { label: t(`${ns}.editor_approved_label`), description: t(`${ns}.editor_approved_desc`) };
    case 'admin_approved':
      return { label: t(`${ns}.admin_approved_label`), description: t(`${ns}.admin_approved_desc`) };
    case 'rejected':
      return { label: t(`${ns}.rejected_label`), description: t(`${ns}.rejected_desc`) };
    default:
      return { label: t(`${ns}.unknown_label`), description: t(`${ns}.unknown_desc`) };
  }
};

const MySuggestionsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { kullanici } = useAuth();
  const { currentLanguage } = useLanguage();
  const { getPlaceById } = usePlaces();
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!kullanici) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await apiFetch('/api/place-suggestions');
        const json = await res.json();
        if (cancelled) return;
        if (json.success && Array.isArray(json.data)) {
          const list: PlaceSuggestion[] = json.data.map((row: Record<string, unknown>) => ({
            id: String(row.id),
            type: row.type as 'NEW' | 'EDIT',
            placeId: (row.targetPlaceId as string) || undefined,
            targetPlaceId: row.targetPlaceId as string | undefined,
            status: String(row.status),
            changes: (row.changes as Record<string, unknown>) || {},
            createdAt: row.createdAt as string | undefined,
          }));
          list.sort((a, b) => {
            const at = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const bt = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return bt - at;
          });
          setSuggestions(list);
        } else {
          setSuggestions([]);
        }
      } catch {
        if (!cancelled) setSuggestions([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [kullanici]);

  const handleDelete = async (suggestion: PlaceSuggestion) => {
    if (suggestion.status !== 'pending_editor') return;
    if (!window.confirm(t('mySuggestions.deleteMessage'))) return;
    setDeletingId(suggestion.id);
    try {
      const res = await apiFetch(`/api/place-suggestions/${suggestion.id}`, { method: 'DELETE' });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Öneri silinemedi');
      }
      setSuggestions((prev) => prev.filter((s) => s.id !== suggestion.id));
      alert(t('mySuggestions.deleteSuccess', 'Öneriniz silindi.'));
    } catch (error) {
      const message = error instanceof Error ? error.message : t('mySuggestions.deleteError', 'Öneri silinemedi.');
      alert(message);
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (ts: string | undefined) => {
    if (!ts) return '';
    try {
      const date = new Date(ts);
      const locale =
        currentLanguage === 'tr'
          ? 'tr-TR'
          : currentLanguage === 'en'
            ? 'en-US'
            : currentLanguage === 'ru'
              ? 'ru-RU'
              : 'ar-SA';
      return date.toLocaleDateString(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return '';
    }
  };

  if (!kullanici) {
    return (
      <PageLoginRequired message={t('suggestion.loginRequired') || 'Giriş yapmanız gerekiyor'} />
    );
  }

  if (loading) {
    return (
      <PageShell title={t('account.mySuggestions') || 'Gönderdiğim Öneriler'} backTo="/account" className="kb-page-wide">
        <div className="kb-settings-loading">
          <div className="spinner" />
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell
      title={t('account.mySuggestions') || 'Gönderdiğim Öneriler'}
      subtitle={suggestions.length > 0 ? String(suggestions.length) : undefined}
      backTo="/account"
      className="kb-page-wide"
    >
      {suggestions.length === 0 ? (
        <PageEmpty
          icon="lightbulb_outline"
          title={t('suggestion.noSuggestions') || 'Henüz öneri göndermediniz'}
        />
      ) : (
        <div className="kb-suggest-list">
          {suggestions.map((suggestion) => {
            const statusInfo = getStatusInfo(t, suggestion.status);
            const name = suggestion.changes?.name
              ? typeof suggestion.changes.name === 'string'
                ? suggestion.changes.name
                : getLocalizedText(
                    suggestion.changes.name as Parameters<typeof getLocalizedText>[0],
                    currentLanguage
                  )
              : t('suggestion.unnamedPlace') || 'İsimsiz';
            const pid = suggestion.placeId || suggestion.targetPlaceId;
            return (
              <div key={suggestion.id} className="kb-suggest-card">
                <div className="kb-suggest-card-header">
                  <h3>{name}</h3>
                  <span className="kb-suggest-status" data-status={suggestion.status}>
                    {statusInfo.label}
                  </span>
                </div>
                <p className="kb-suggest-status-desc" data-status={suggestion.status}>
                  {statusInfo.description}
                </p>
                {formatDate(suggestion.createdAt) && (
                  <p className="kb-suggest-date">{formatDate(suggestion.createdAt)}</p>
                )}
                <div className="kb-suggest-actions">
                  {pid && (
                    <button
                      type="button"
                      className="kb-suggest-link"
                      onClick={() => void openPlaceDetailById(pid, currentLanguage, getPlaceById)}
                    >
                      <span className="material-icons" style={{ fontSize: 16 }}>place</span>
                      {t('suggestion.viewPlace') || 'Yeri görüntüle'}
                    </button>
                  )}
                  {suggestion.status === 'pending_editor' && (
                    <>
                      {suggestion.type === 'EDIT' && pid && (
                        <button
                          type="button"
                          className="kb-suggest-link"
                          onClick={() => navigate(`/edit-suggestion/${pid}`)}
                        >
                          <span className="material-icons" style={{ fontSize: 16 }}>edit</span>
                          {t('mySuggestions.edit', 'Düzenle')}
                        </button>
                      )}
                      <button
                        type="button"
                        className="kb-suggest-link kb-suggest-link--danger"
                        onClick={() => handleDelete(suggestion)}
                        disabled={deletingId === suggestion.id}
                      >
                        <span className="material-icons" style={{ fontSize: 16 }}>delete_outline</span>
                        {deletingId === suggestion.id ? t('common.loading', 'Yükleniyor...') : t('mySuggestions.delete', 'Sil')}
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </PageShell>
  );
};

export default MySuggestionsPage;
