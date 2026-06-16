import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { API_BASE_URL } from '../config/api';
import { apiFetch } from '../utils/apiClient';
import { getLocalizedText } from '../utils/multilang';
import {
  getTrField,
  collectCityFilterOptions,
  getCityDatalistOptions,
  getDistrictDatalistOptions,
  getLocationDataQuality,
  syncMultilingualLocation,
  citiesMatchFilter,
} from '../utils/adminLocationUtils';
import {
  buildPlaceCategoryPayload,
  getCategoryOptionLabel,
  getSubCategoryLabel,
  parsePlaceMainCategorySlugs,
  parsePlaceSubCategories,
} from '../utils/adminCategoryUtils';
import { PageShell } from '../components/PageShell';
import { useCategories } from '../contexts/CategoriesContext';
import type { Place } from '../types/place';
import './AdminPanelPage.css';

type BulkAction = 'delete' | 'publish' | 'pending' | 'reject';

interface PlaceSuggestion {
  id: string;
  type: 'NEW' | 'EDIT';
  placeId?: string;
  targetPlaceId?: string;
  status: string;
  changes: any;
  userId?: string;
  createdBy?: { id?: string; name?: string; email?: string };
  createdAt?: string;
}

type MultilingualField = { tr?: string; en?: string; ru?: string; ar?: string };
type MultilingualArray = { tr?: string[]; en?: string[]; ru?: string[]; ar?: string[] };
type ThumbCandidate = { key: string; url: string; source: 'place' | 'google' | 'user'; label: string };
const MAX_LIST_THUMBS = 5;

function stripUrlPathForCompare(u: string): string {
  try {
    const x = new URL(u);
    return `${x.origin}${x.pathname}`;
  } catch {
    return String(u || '').split('?')[0];
  }
}

function normalizeThumbList(urls: unknown[], limit = MAX_LIST_THUMBS): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const u of urls) {
    if (out.length >= limit) break;
    if (typeof u !== 'string') continue;
    const t = u.trim();
    if (!t || (!t.startsWith('http://') && !t.startsWith('https://'))) continue;
    const key = stripUrlPathForCompare(t);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(t);
  }
  return out;
}

const AdminPanelPage = () => {
  const { t } = useTranslation();
  const { kullanici, getToken } = useAuth();
  const { currentLanguage } = useLanguage();
  const { categories } = useCategories();
  const [allPlaces, setAllPlaces] = useState<Place[]>([]);
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<'all' | 'pending' | 'published' | 'rejected'>('all');
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState<string>('');
  const [activeEditTab, setActiveEditTab] = useState<'general' | 'multilang' | 'visitTips' | 'photos' | 'location'>('general');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkWorking, setBulkWorking] = useState(false);
  const listScrollRef = useRef<HTMLDivElement>(null);
  const [selectedListThumbs, setSelectedListThumbs] = useState<string[]>([]);
  const [approvedUserPhotos, setApprovedUserPhotos] = useState<string[]>([]);

  // Edit form state - tüm alanları kapsar
  const [editForm, setEditForm] = useState<{
    name: MultilingualField | string;
    city: MultilingualField | string;
    district: MultilingualField | string;
    description: MultilingualField | string;
    story?: MultilingualField | string;
    period?: MultilingualField | string;
    category: string[];
    subCategories: Record<string, string[]>;
    visitTips?: MultilingualArray | string[];
    latitude: number;
    longitude: number;
    status: string;
    photos?: string[];
    imageUrl?: string;
    isUnesco?: boolean;
  } | null>(null);

  const reloadAdminData = useCallback(async (options?: { silent?: boolean }) => {
    if (!kullanici || kullanici.rol !== 'admin') {
      setLoading(false);
      return;
    }
    const token = await getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    if (!options?.silent) {
      setLoading(true);
    }
    try {
      const [pr, sr] = await Promise.all([
        fetch(`${API_BASE_URL}/api/places?status=all&limit=3000&page=1`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/api/place-suggestions?status=editor_approved`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      const pj = await pr.json();
      const sj = await sr.json();
      if (pj.success && Array.isArray(pj.data)) {
        const list = pj.data as Place[];
        setAllPlaces(list);
        setSelectedPlace((prev) => {
          if (!prev) return null;
          const next = list.find((x) => x.id === prev.id);
          return next ?? prev;
        });
      }
      if (sj.success && Array.isArray(sj.data)) {
        setSuggestions(
          sj.data.map((row: Record<string, unknown>) => ({
            id: String(row.id),
            type: row.type,
            placeId: row.targetPlaceId as string | undefined,
            targetPlaceId: row.targetPlaceId as string | undefined,
            status: String(row.status),
            changes: row.changes,
            userId: (row.createdBy as { id?: string })?.id,
            createdBy: row.createdBy as PlaceSuggestion['createdBy'],
            createdAt: row.createdAt as string | undefined,
          }))
        );
      }
    } catch (e) {
      console.error('AdminPanel load error:', e);
    } finally {
      setLoading(false);
    }
  }, [kullanici, getToken]);

  useEffect(() => {
    reloadAdminData();
  }, [reloadAdminData]);

  const removePlacesLocally = useCallback((ids: string[]) => {
    const idSet = new Set(ids);
    setAllPlaces((prev) => prev.filter((p) => !idSet.has(p.id)));
    setSelectedIds((prev) => prev.filter((id) => !idSet.has(id)));
    setSelectedPlace((prev) => {
      if (prev && idSet.has(prev.id)) {
        setEditForm(null);
        return null;
      }
      return prev;
    });
  }, []);

  const updatePlacesStatusLocally = useCallback((ids: string[], status: string) => {
    const idSet = new Set(ids);
    setAllPlaces((prev) => prev.map((p) => (idSet.has(p.id) ? { ...p, status } : p)));
    setSelectedPlace((prev) => {
      if (prev && idSet.has(prev.id)) {
        setEditForm((ef) => (ef ? { ...ef, status } : ef));
        return { ...prev, status };
      }
      return prev;
    });
  }, []);

  // Tab'a göre filtrelenmiş yerler
  const filteredPlaces = useMemo(() => {
    let filtered = allPlaces;

    // Tab'a göre filtrele
    if (tab === 'pending') {
      filtered = filtered.filter(p => p.status === 'pending' || p.status === 'editorReview');
    } else if (tab === 'published') {
      filtered = filtered.filter(p => p.status === 'published' || p.status === 'admin_approved');
    } else if (tab === 'rejected') {
      filtered = filtered.filter(p => p.status === 'rejected');
    }

    // Şehir filtresi (adana / Adana aynı sayılır)
    if (cityFilter) {
      filtered = filtered.filter((p) => citiesMatchFilter(getTrField(p.city), cityFilter));
    }

    // Arama filtresi
    if (search.trim()) {
      const searchLower = search.trim().toLowerCase();
      filtered = filtered.filter((p) => {
        const name =
          typeof p.name === 'string'
            ? p.name
            : getLocalizedText(p.name, currentLanguage) || '';
        const city =
          typeof p.city === 'string'
            ? p.city
            : getLocalizedText(p.city, currentLanguage) || '';
        const district =
          typeof p.district === 'string'
            ? p.district
            : getLocalizedText(p.district, currentLanguage) || '';
        return (
          name.toLowerCase().includes(searchLower) ||
          city.toLowerCase().includes(searchLower) ||
          district.toLowerCase().includes(searchLower) ||
          p.id.toLowerCase().includes(searchLower)
        );
      });
    }

    return filtered;
  }, [allPlaces, tab, search, cityFilter, currentLanguage]);

  const cityFilterOptions = useMemo(() => collectCityFilterOptions(allPlaces), [allPlaces]);

  const editCityTr = editForm
    ? (typeof editForm.city === 'string' ? editForm.city : editForm.city.tr || '')
    : '';
  const editDistrictTr = editForm
    ? (typeof editForm.district === 'string' ? editForm.district : editForm.district.tr || '')
    : '';
  const locationQualityIssues = useMemo(
    () => (editForm ? getLocationDataQuality(editCityTr, editDistrictTr) : []),
    [editForm, editCityTr, editDistrictTr]
  );
  const cityDatalistOptions = useMemo(
    () => getCityDatalistOptions(editCityTr),
    [editCityTr]
  );
  const districtDatalistOptions = useMemo(
    () => getDistrictDatalistOptions(editCityTr, editDistrictTr),
    [editCityTr, editDistrictTr]
  );

  const filteredIds = useMemo(() => filteredPlaces.map((p) => p.id), [filteredPlaces]);
  const allFilteredSelected =
    filteredIds.length > 0 && filteredIds.every((id) => selectedIds.includes(id));

  useEffect(() => {
    setSelectedIds([]);
  }, [tab, cityFilter, search]);

  const toggleSelectPlace = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAllFiltered = () => {
    if (allFilteredSelected) {
      setSelectedIds((prev) => prev.filter((id) => !filteredIds.includes(id)));
    } else {
      setSelectedIds((prev) => [...new Set([...prev, ...filteredIds])]);
    }
  };

  const restoreListScroll = (scrollTop: number) => {
    requestAnimationFrame(() => {
      if (listScrollRef.current) listScrollRef.current.scrollTop = scrollTop;
    });
  };

  const handleBulkAction = async (action: BulkAction) => {
    if (!selectedIds.length || bulkWorking) return;
    const labels: Record<BulkAction, string> = {
      delete: 'sil',
      publish: 'yayınla',
      pending: 'beklemede yap',
      reject: 'reddet',
    };
    if (!window.confirm(`${selectedIds.length} yeri ${labels[action]}mak istediğinize emin misiniz?`)) return;

    setBulkWorking(true);
    const scrollTop = listScrollRef.current?.scrollTop ?? 0;
    try {
      const res = await apiFetch('/api/places/bulk', {
        method: 'POST',
        body: JSON.stringify({ ids: selectedIds, action }),
      });
      const out = await res.json();
      if (!res.ok || !out.success) throw new Error(out.message || 'Toplu işlem başarısız');

      const doneIds: string[] = Array.isArray(out.ids) ? out.ids : selectedIds;
      if (action === 'delete') {
        removePlacesLocally(doneIds);
      } else {
        const status =
          action === 'publish' ? 'published' : action === 'reject' ? 'rejected' : 'pending';
        updatePlacesStatusLocally(doneIds, status);
        setSelectedIds((prev) => prev.filter((id) => !doneIds.includes(id)));
      }
      restoreListScroll(scrollTop);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Toplu işlem başarısız');
    } finally {
      setBulkWorking(false);
    }
  };

  // Place seçildiğinde edit form'u doldur
  const handleSelectPlace = (place: Place) => {
    setSelectedPlace(place);
    setEditForm({
      name: typeof place.name === 'string' 
        ? place.name 
        : { tr: place.name?.tr || '', en: place.name?.en || '', ru: place.name?.ru || '', ar: place.name?.ar || '' },
      city: typeof place.city === 'string' 
        ? place.city 
        : { tr: place.city?.tr || '', en: place.city?.en || '', ru: place.city?.ru || '', ar: place.city?.ar || '' },
      district: typeof place.district === 'string' 
        ? place.district 
        : { tr: place.district?.tr || '', en: place.district?.en || '', ru: place.district?.ru || '', ar: place.district?.ar || '' },
      description: typeof place.description === 'string' 
        ? place.description 
        : { tr: place.description?.tr || '', en: place.description?.en || '', ru: place.description?.ru || '', ar: place.description?.ar || '' },
      story: place.story 
        ? (typeof place.story === 'string' 
            ? place.story 
            : { tr: place.story?.tr || '', en: place.story?.en || '', ru: place.story?.ru || '', ar: place.story?.ar || '' })
        : { tr: '', en: '', ru: '', ar: '' },
      period: place.period 
        ? (typeof place.period === 'string' 
            ? place.period 
            : { tr: place.period?.tr || '', en: place.period?.en || '', ru: place.period?.ru || '', ar: place.period?.ar || '' })
        : { tr: '', en: '', ru: '', ar: '' },
      category: parsePlaceMainCategorySlugs(place.category, categories),
      subCategories: parsePlaceSubCategories(place.category, categories),
      visitTips: place.visitTips
        ? (Array.isArray(place.visitTips)
            ? place.visitTips
            : (() => {
                const tips = place.visitTips as any;
                const result: MultilingualArray = {};
                if (tips.tr && Array.isArray(tips.tr)) result.tr = tips.tr;
                if (tips.en && Array.isArray(tips.en)) result.en = tips.en;
                if (tips.ru && Array.isArray(tips.ru)) result.ru = tips.ru;
                if (tips.ar && Array.isArray(tips.ar)) result.ar = tips.ar;
                return Object.keys(result).length > 0 ? result : [];
              })())
        : [],
      latitude: place.latitude || 0,
      longitude: place.longitude || 0,
      status: place.status || 'pending',
      photos: Array.isArray(place.photos) ? place.photos : (place.photos ? [place.photos] : []),
      imageUrl: place.imageUrl || '',
      isUnesco: place.isUnesco || false,
    });
    setSelectedListThumbs(normalizeThumbList(place.listGalleryThumbs || []));
    setActiveEditTab('general');
  };

  useEffect(() => {
    const loadApprovedPhotos = async () => {
      if (!selectedPlace) {
        setApprovedUserPhotos([]);
        return;
      }
      try {
        const res = await apiFetch(`/api/photo-submissions?placeId=${encodeURIComponent(selectedPlace.id)}&status=approved`);
        const out = await res.json();
        if (!res.ok || !out.success || !Array.isArray(out.data)) {
          setApprovedUserPhotos([]);
          return;
        }
        const urls = out.data
          .map((r: { photoUrl?: unknown }) => (typeof r.photoUrl === 'string' ? r.photoUrl : ''))
          .filter((u: string) => u.trim().startsWith('http'));
        setApprovedUserPhotos(normalizeThumbList(urls, 50));
      } catch {
        setApprovedUserPhotos([]);
      }
    };
    void loadApprovedPhotos();
  }, [selectedPlace?.id]);

  const thumbCandidates = useMemo<ThumbCandidate[]>(() => {
    if (!editForm) return [];
    const out: ThumbCandidate[] = [];
    const seen = new Set<string>();
    const add = (url: unknown, source: ThumbCandidate['source'], label: string) => {
      if (typeof url !== 'string') return;
      const t = url.trim();
      if (!t || (!t.startsWith('http://') && !t.startsWith('https://'))) return;
      const key = stripUrlPathForCompare(t);
      if (!key || seen.has(key)) return;
      seen.add(key);
      out.push({ key, url: t, source, label });
    };
    (editForm.photos || []).forEach((u, i) => add(u, 'place', `Yer foto ${i + 1}`));
    add(editForm.imageUrl, 'place', 'Kapak');
    (selectedPlace?.googlePhotos || []).forEach((g, i) => {
      if (!g || typeof g !== 'object') return;
      add((g as { thumbUrl?: string }).thumbUrl, 'google', `Google ${i + 1}`);
      add((g as { url?: string }).url, 'google', `Google ${i + 1}`);
    });
    approvedUserPhotos.forEach((u, i) => add(u, 'user', `Kullanıcı ${i + 1}`));
    return out;
  }, [editForm, selectedPlace?.googlePhotos, approvedUserPhotos]);

  useEffect(() => {
    if (!selectedPlace) return;
    if (selectedListThumbs.length > 0) return;
    const fallback = normalizeThumbList(thumbCandidates.map((c) => c.url), MAX_LIST_THUMBS);
    setSelectedListThumbs(fallback);
  }, [selectedPlace?.id, thumbCandidates]);

  const addThumbCandidate = (url: string) => {
    setSelectedListThumbs((prev) => normalizeThumbList([...prev, url], MAX_LIST_THUMBS));
  };
  const removeThumbAt = (index: number) => {
    setSelectedListThumbs((prev) => prev.filter((_, i) => i !== index));
  };
  const moveThumb = (index: number, dir: -1 | 1) => {
    setSelectedListThumbs((prev) => {
      const next = index + dir;
      if (index < 0 || next < 0 || index >= prev.length || next >= prev.length) return prev;
      const arr = [...prev];
      const t = arr[index];
      arr[index] = arr[next];
      arr[next] = t;
      return arr;
    });
  };

  const removeCandidatePhoto = (candidate: ThumbCandidate) => {
    if (!editForm) return;
    if (candidate.source === 'place') {
      const nextPhotos = (editForm.photos || []).filter(
        (u) => stripUrlPathForCompare(u || '') !== candidate.key
      );
      const nextImageUrl =
        editForm.imageUrl && stripUrlPathForCompare(editForm.imageUrl) === candidate.key
          ? ''
          : editForm.imageUrl;
      setEditForm({ ...editForm, photos: nextPhotos, imageUrl: nextImageUrl });
      setSelectedListThumbs((prev) => prev.filter((u) => stripUrlPathForCompare(u) !== candidate.key));
      return;
    }
    if (candidate.source === 'google' && selectedPlace) {
      const nextGoogle = (selectedPlace.googlePhotos || []).filter((g) => {
        const u = (g.thumbUrl || g.url || '').trim();
        return stripUrlPathForCompare(u) !== candidate.key;
      });
      setSelectedPlace({ ...selectedPlace, googlePhotos: nextGoogle });
      setSelectedListThumbs((prev) => prev.filter((u) => stripUrlPathForCompare(u) !== candidate.key));
      return;
    }
    setSelectedListThumbs((prev) => prev.filter((u) => stripUrlPathForCompare(u) !== candidate.key));
  };

  // Form alanlarını güncelle
  const applyNormalizedLocation = () => {
    if (!editForm) return;
    const synced = syncMultilingualLocation(editForm.city, editForm.district);
    setEditForm({
      ...editForm,
      city: synced.city,
      district: synced.district,
    });
  };

  const buildSavePayload = (statusOverride?: string) => {
    if (!editForm || !selectedPlace) return null;
    const synced = syncMultilingualLocation(editForm.city, editForm.district);
    const cityValue = synced.city;
    const districtValue = synced.district;

    let visitTipsToSave: any = editForm.visitTips;
    if (editForm.visitTips && typeof editForm.visitTips === 'object' && !Array.isArray(editForm.visitTips)) {
      const cleaned: Record<string, string[]> = {};
      if (editForm.visitTips.tr?.length) cleaned.tr = editForm.visitTips.tr.filter((t: string) => t.trim() !== '');
      if (editForm.visitTips.en?.length) cleaned.en = editForm.visitTips.en.filter((t: string) => t.trim() !== '');
      if (editForm.visitTips.ru?.length) cleaned.ru = editForm.visitTips.ru.filter((t: string) => t.trim() !== '');
      if (editForm.visitTips.ar?.length) cleaned.ar = editForm.visitTips.ar.filter((t: string) => t.trim() !== '');
      visitTipsToSave = Object.keys(cleaned).length > 0 ? cleaned : undefined;
    }

    return {
      name: editForm.name,
      city: cityValue,
      district: districtValue,
      description: editForm.description,
      story: editForm.story || undefined,
      period: editForm.period || undefined,
      category: buildPlaceCategoryPayload(
        editForm.category,
        editForm.subCategories,
        selectedPlace.category,
        categories
      ),
      visitTips: visitTipsToSave,
      latitude: editForm.latitude,
      longitude: editForm.longitude,
      status: statusOverride ?? editForm.status,
      photos: editForm.photos || [],
      imageUrl: editForm.imageUrl || undefined,
      googlePhotos: selectedPlace.googlePhotos || undefined,
      listGalleryThumbs: normalizeThumbList(selectedListThumbs, MAX_LIST_THUMBS),
      thumbnailUrl: normalizeThumbList(selectedListThumbs, MAX_LIST_THUMBS)[0] || undefined,
      isUnesco: editForm.isUnesco || false,
    };
  };

  const applySavedPlaceLocally = useCallback((placeId: string, payload: NonNullable<ReturnType<typeof buildSavePayload>>) => {
    const patch: Partial<Place> = {
      name: payload.name,
      city: payload.city,
      district: payload.district,
      description: payload.description,
      story: payload.story,
      period: payload.period,
      category: payload.category,
      visitTips: payload.visitTips,
      latitude: payload.latitude,
      longitude: payload.longitude,
      status: payload.status,
      photos: payload.photos,
      imageUrl: payload.imageUrl,
      listGalleryThumbs: payload.listGalleryThumbs,
      thumbnailUrl: payload.thumbnailUrl,
      isUnesco: payload.isUnesco,
    };
    setAllPlaces((prev) => prev.map((p) => (p.id === placeId ? { ...p, ...patch } : p)));
    setSelectedPlace((prev) => (prev?.id === placeId ? { ...prev, ...patch } : prev));
  }, []);

  const updateField = (field: string, value: any, lang?: 'tr' | 'en' | 'ru' | 'ar') => {
    if (!editForm) return;
    
    if (lang) {
      // Çok dilli alan
      const currentValue = editForm[field as keyof typeof editForm];
      if (typeof currentValue === 'object' && currentValue !== null && !Array.isArray(currentValue)) {
        setEditForm({
          ...editForm,
          [field]: { ...currentValue, [lang]: value }
        });
      }
    } else {
      // Tek dilli alan
      setEditForm({ ...editForm, [field]: value });
    }
  };

  // visitTips için özel güncelleme
  const updateVisitTips = (lang: 'tr' | 'en' | 'ru' | 'ar', index: number, value: string) => {
    if (!editForm || !editForm.visitTips) return;
    
    const currentTips = editForm.visitTips;
    if (typeof currentTips === 'object' && !Array.isArray(currentTips)) {
      const langTips = [...(currentTips[lang] || [])];
      langTips[index] = value;
      setEditForm({
        ...editForm,
        visitTips: { ...currentTips, [lang]: langTips }
      });
    }
  };

  // visitTips ekle
  const addVisitTip = (lang: 'tr' | 'en' | 'ru' | 'ar') => {
    if (!editForm || !editForm.visitTips) return;
    
    const currentTips = editForm.visitTips;
    if (typeof currentTips === 'object' && !Array.isArray(currentTips)) {
      const langTips = [...(currentTips[lang] || [])];
      langTips.push('');
      setEditForm({
        ...editForm,
        visitTips: { ...currentTips, [lang]: langTips }
      });
    }
  };

  // visitTips sil
  const removeVisitTip = (lang: 'tr' | 'en' | 'ru' | 'ar', index: number) => {
    if (!editForm || !editForm.visitTips) return;
    
    const currentTips = editForm.visitTips;
    if (typeof currentTips === 'object' && !Array.isArray(currentTips)) {
      const langTips = [...(currentTips[lang] || [])];
      langTips.splice(index, 1);
      setEditForm({
        ...editForm,
        visitTips: { ...currentTips, [lang]: langTips }
      });
    }
  };

  // Kaydet
  const handleSave = async () => {
    if (!selectedPlace || !editForm || saving) return;

    const payload = buildSavePayload();
    if (!payload) return;

    setSaving(true);
    try {
      const res = await apiFetch(`/api/places/${selectedPlace.id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      const out = await res.json();
      if (!res.ok || !out.success) throw new Error(out.message || 'Hata');

      applySavedPlaceLocally(selectedPlace.id, payload);
      alert(t('adminPanel.saveSuccess') || 'Yer başarıyla güncellendi.');
    } catch (error) {
      console.error('Yer güncellenirken hata:', error);
      alert(t('adminPanel.saveError') || 'Yer güncellenemedi.');
    } finally {
      setSaving(false);
    }
  };

  // Yayınla
  const handlePublish = async () => {
    if (!selectedPlace || !editForm) return;

    const message = t('adminPanel.publishConfirm') || 'Bu yeri yayınlamak istediğinizden emin misiniz?';
    if (!window.confirm(message)) return;

    try {
      const payload = buildSavePayload('published');
      if (!payload) return;
      const res = await apiFetch(`/api/places/${selectedPlace.id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      const out = await res.json();
      if (!res.ok || !out.success) throw new Error(out.message || 'Hata');
      updatePlacesStatusLocally([selectedPlace.id], 'published');
      setEditForm((prev) => (prev ? { ...prev, status: 'published' } : prev));
      alert(t('adminPanel.publishSuccess') || 'Yer başarıyla yayınlandı.');
    } catch (error) {
      console.error('Yer yayınlanırken hata:', error);
      alert(t('adminPanel.publishError') || 'Yer yayınlanamadı.');
    }
  };

  // Reddet
  const handleReject = async () => {
    if (!selectedPlace) return;
    
    const message = t('adminPanel.rejectConfirm') || 'Bu yeri reddetmek istediğinizden emin misiniz?';
    if (!window.confirm(message)) return;
    
    const scrollTop = listScrollRef.current?.scrollTop ?? 0;
    try {
      const res = await apiFetch(`/api/places/${selectedPlace.id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'rejected' }),
      });
      const out = await res.json();
      if (!res.ok || !out.success) throw new Error(out.message || 'Hata');
      updatePlacesStatusLocally([selectedPlace.id], 'rejected');
      setSelectedPlace(null);
      setEditForm(null);
      restoreListScroll(scrollTop);
    } catch (error) {
      console.error('Yer reddedilirken hata:', error);
      alert(t('adminPanel.rejectError') || 'Yer reddedilemedi.');
    }
  };

  // Sil
  const handleDelete = async () => {
    if (!selectedPlace) return;
    
    const message = t('adminPanel.deleteConfirm') || 'Bu yeri silmek istediğinizden emin misiniz?';
    if (!window.confirm(message)) return;
    
    const scrollTop = listScrollRef.current?.scrollTop ?? 0;
    const id = selectedPlace.id;
    try {
      const res = await apiFetch(`/api/places/${id}`, { method: 'DELETE' });
      const out = await res.json();
      if (!res.ok || !out.success) throw new Error(out.message || 'Hata');
      removePlacesLocally([id]);
      restoreListScroll(scrollTop);
    } catch (error) {
      console.error('Yer silinirken hata:', error);
      alert(t('adminPanel.deleteError') || 'Yer silinemedi.');
    }
  };

  // Öneri onayla
  const handleApproveSuggestion = async (suggestion: PlaceSuggestion) => {
    const message = t('adminPanel.approveConfirm') || 'Bu öneriyi onaylamak istediğinizden emin misiniz?';
    if (!window.confirm(message)) return;
    
    try {
      const res = await apiFetch(`/api/place-suggestions/${suggestion.id}/admin-approve`, {
        method: 'PATCH',
        body: JSON.stringify({}),
      });
      const out = await res.json();
      if (!res.ok || !out.success) {
        alert(out.message || 'Onay başarısız');
        return;
      }
      await reloadAdminData({ silent: true });
    } catch {
      alert('Onay başarısız');
    }
  };

  // Öneri reddet
  const handleRejectSuggestion = async (suggestion: PlaceSuggestion) => {
    const message = t('adminPanel.rejectConfirm') || 'Bu öneriyi reddetmek istediğinizden emin misiniz?';
    if (!window.confirm(message)) return;

    try {
      const res = await apiFetch(`/api/place-suggestions/${suggestion.id}/reject`, {
        method: 'PATCH',
        body: JSON.stringify({}),
      });
      const out = await res.json();
      if (!res.ok || !out.success) {
        alert(out.message || 'Red başarısız');
        return;
      }
      await reloadAdminData({ silent: true });
    } catch {
      alert('Red başarısız');
    }
  };

  if (!kullanici || kullanici.rol !== 'admin') {
    return (
      <div className="admin-panel-page">
        <div className="access-denied">
          <p>{t('adminPanel.accessDenied') || 'Bu sayfaya erişim yetkiniz yok'}</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="admin-panel-page loading">{t('common.loading')}</div>;
  }

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
      case 'pending_editor':
        return { label: t('adminPanel.status.pending') || 'Beklemede', color: '#fbbf24' };
      case 'editorReview':
      case 'editor_approved':
        return { label: t('adminPanel.status.editorReview') || 'Editör Onayı', color: '#60a5fa' };
      case 'published':
      case 'admin_approved':
        return { label: t('adminPanel.status.published') || 'Yayınlandı', color: '#34d399' };
      case 'rejected':
        return { label: t('adminPanel.status.rejected') || 'Reddedildi', color: '#ef4444' };
      default:
        return { label: status || (t('adminPanel.status.unknown') || 'Bilinmiyor'), color: '#6b7280' };
    }
  };

  return (
    <PageShell
      title={t('account.adminPanel') || 'Admin Paneli'}
      backTo="/admin-hub"
      className="admin-panel-page kb-page-full"
    >
      <header className="panel-header">
        <div className="header-controls">
          <div className="search-bar">
            <input
              type="text"
              placeholder={t('adminPanel.searchPlaceholder') || 'Ara...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="city-filter">
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
            >
              <option value="">Tüm Şehirler</option>
              {cityFilterOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.canonical ? opt.label : `⚠ ${opt.label}`}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="tabs">
          <button
            className={tab === 'all' ? 'active' : ''}
            onClick={() => setTab('all')}
          >
            {t('adminPanel.tabs.all') || 'Tümü'} ({allPlaces.length})
          </button>
          <button
            className={tab === 'pending' ? 'active' : ''}
            onClick={() => setTab('pending')}
          >
            {t('adminPanel.tabs.pending') || 'Bekleyenler'} ({allPlaces.filter(p => p.status === 'pending' || p.status === 'editorReview').length})
          </button>
          <button
            className={tab === 'published' ? 'active' : ''}
            onClick={() => setTab('published')}
          >
            {t('adminPanel.tabs.published') || 'Yayınlananlar'} ({allPlaces.filter(p => p.status === 'published' || p.status === 'admin_approved').length})
          </button>
          <button
            className={tab === 'rejected' ? 'active' : ''}
            onClick={() => setTab('rejected')}
          >
            {t('adminPanel.tabs.rejected') || 'Reddedilenler'} ({allPlaces.filter(p => p.status === 'rejected').length})
          </button>
        </div>
      </header>

      <div className="admin-content">
        {/* Sol Panel - Yerler Listesi */}
        <div className="places-list-panel">
          <div className="places-list-header">
            <h2>Yerler ({filteredPlaces.length})</h2>
            <label className="bulk-select-all">
              <input
                type="checkbox"
                checked={allFilteredSelected}
                onChange={toggleSelectAllFiltered}
              />
              <span>Tümünü seç</span>
            </label>
          </div>
          {selectedIds.length > 0 && (
            <div className="bulk-actions-bar">
              <span className="bulk-count">{selectedIds.length} seçili</span>
              <button
                type="button"
                className="bulk-btn publish"
                disabled={bulkWorking}
                onClick={() => void handleBulkAction('publish')}
              >
                Yayınla
              </button>
              <button
                type="button"
                className="bulk-btn pending"
                disabled={bulkWorking}
                onClick={() => void handleBulkAction('pending')}
              >
                Beklemede
              </button>
              <button
                type="button"
                className="bulk-btn reject"
                disabled={bulkWorking}
                onClick={() => void handleBulkAction('reject')}
              >
                Reddet
              </button>
              <button
                type="button"
                className="bulk-btn delete"
                disabled={bulkWorking}
                onClick={() => void handleBulkAction('delete')}
              >
                Sil
              </button>
              <button
                type="button"
                className="bulk-btn clear"
                disabled={bulkWorking}
                onClick={() => setSelectedIds([])}
              >
                Seçimi temizle
              </button>
            </div>
          )}
          <div className="places-list" ref={listScrollRef}>
            {filteredPlaces.length === 0 ? (
              <div className="no-places">
                <p>{t('adminPanel.noPlaces') || 'Yer bulunamadı'}</p>
              </div>
            ) : (
              filteredPlaces.map(place => {
                const name = typeof place.name === 'string' 
                  ? place.name 
                  : getLocalizedText(place.name, currentLanguage) || (t('suggestion.unnamedPlace') || 'İsimsiz');
                const city = getTrField(place.city) || getLocalizedText(place.city, currentLanguage) || '';
                const district = getTrField(place.district) || getLocalizedText(place.district, currentLanguage) || '';
                const statusInfo = getStatusInfo(place.status || 'pending');
                const isChecked = selectedIds.includes(place.id);

                return (
                  <div 
                    key={place.id} 
                    className={`place-item ${selectedPlace?.id === place.id ? 'active' : ''} ${isChecked ? 'checked' : ''}`}
                    onClick={() => handleSelectPlace(place)}
                  >
                    <label
                      className="place-select-cb"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleSelectPlace(place.id)}
                      />
                    </label>
                    <div className="place-info">
                      <h3>{name}</h3>
                      <p className="place-location-line">
                        {city}
                        {district ? ` · ${district}` : ''}
                      </p>
                      <span className="status-badge" style={{ backgroundColor: statusInfo.color }}>
                        {statusInfo.label}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Sağ Panel - Düzenleme Formu */}
        <div className="edit-panel">
          {selectedPlace && editForm ? (
            <div className="edit-form-container">
              <div className="edit-form-header">
                <h2>
                  {typeof editForm.name === 'string' 
                    ? editForm.name 
                    : editForm.name.tr || 'İsimsiz Yer'}
                </h2>
                <button className="close-edit-btn" onClick={() => {
                  setSelectedPlace(null);
                  setEditForm(null);
                }}>
                  ✕
                </button>
              </div>

              {/* Edit Tab'ları */}
              <div className="edit-tabs">
                <button
                  className={activeEditTab === 'general' ? 'active' : ''}
                  onClick={() => setActiveEditTab('general')}
                >
                  Genel Bilgiler
                </button>
                <button
                  className={activeEditTab === 'multilang' ? 'active' : ''}
                  onClick={() => setActiveEditTab('multilang')}
                >
                  Çok Dilli İçerik
                </button>
                <button
                  className={activeEditTab === 'visitTips' ? 'active' : ''}
                  onClick={() => setActiveEditTab('visitTips')}
                >
                  Ziyaret İpuçları
                </button>
                <button
                  className={activeEditTab === 'photos' ? 'active' : ''}
                  onClick={() => setActiveEditTab('photos')}
                >
                  Fotoğraflar
                </button>
                <button
                  className={activeEditTab === 'location' ? 'active' : ''}
                  onClick={() => setActiveEditTab('location')}
                >
                  Konum
                </button>
              </div>

              {/* Tab İçerikleri */}
              <div className="edit-tab-content">
                {activeEditTab === 'general' && (
                  <div className="form-section">
                    <div className="form-group">
                      <label>Yer Adı (TR) *</label>
                      <input
                        type="text"
                        value={typeof editForm.name === 'string' ? editForm.name : editForm.name.tr}
                        onChange={(e) => updateField('name', e.target.value, 'tr')}
                        required
                      />
                    </div>

                    {locationQualityIssues.length > 0 && (
                      <div className="admin-data-quality">
                        <strong>Konum verisi</strong>
                        <ul>
                          {locationQualityIssues.map((issue, idx) => (
                            <li key={idx} className={issue.severity === 'warn' ? 'warn' : 'info'}>
                              {issue.message}
                              {issue.suggestion ? (
                                <button
                                  type="button"
                                  className="quality-apply-btn"
                                  onClick={() => {
                                    if (issue.field === 'city') {
                                      updateField('city', issue.suggestion, 'tr');
                                    } else if (issue.suggestion) {
                                      updateField('district', issue.suggestion, 'tr');
                                    }
                                  }}
                                >
                                  → {issue.suggestion}
                                </button>
                              ) : null}
                            </li>
                          ))}
                        </ul>
                        <button type="button" className="normalize-location-btn" onClick={applyNormalizedLocation}>
                          Konumu otomatik düzelt
                        </button>
                      </div>
                    )}

                    <div className="form-row">
                      <div className="form-group">
                        <label>İl (TR) *</label>
                        <input
                          type="text"
                          list="admin-city-datalist"
                          value={editCityTr}
                          onChange={(e) => updateField('city', e.target.value, 'tr')}
                          placeholder="Adana veya listeden seç"
                          required
                        />
                        <datalist id="admin-city-datalist">
                          {cityDatalistOptions.map((il) => (
                            <option key={il} value={il} />
                          ))}
                        </datalist>
                        <span className="field-hint">81 il listesi — yazmaya başlayınca öneri çıkar</span>
                      </div>

                      <div className="form-group">
                        <label>İlçe (TR)</label>
                        <input
                          type="text"
                          list="admin-district-datalist"
                          value={editDistrictTr}
                          onChange={(e) => updateField('district', e.target.value, 'tr')}
                          placeholder="Seyhan veya 01320 Seyhan/Adana"
                        />
                        <datalist id="admin-district-datalist">
                          {districtDatalistOptions.map((ilce) => (
                            <option key={ilce} value={ilce} />
                          ))}
                        </datalist>
                        <span className="field-hint">İl seçince ilçe listesi gelir — kaydetmede scraper formatı temizlenir</span>
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Açıklama (TR) *</label>
                      <textarea
                        value={typeof editForm.description === 'string' ? editForm.description : editForm.description.tr}
                        onChange={(e) => updateField('description', e.target.value, 'tr')}
                        rows={6}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Hikâye (TR)</label>
                      <textarea
                        value={typeof editForm.story === 'string' ? editForm.story : (editForm.story?.tr || '')}
                        onChange={(e) => updateField('story', e.target.value, 'tr')}
                        rows={6}
                      />
                    </div>

                    <div className="form-group">
                      <label>Dönem (TR)</label>
                      <input
                        type="text"
                        value={typeof editForm.period === 'string' ? editForm.period : (editForm.period?.tr || '')}
                        onChange={(e) => updateField('period', e.target.value, 'tr')}
                      />
                    </div>

                    <div className="form-group">
                      <label>Kategoriler</label>
                      {editForm.category.some((s) => !categories.some((c) => c.value === s)) && (
                        <div className="category-chips category-orphans">
                          {editForm.category
                            .filter((s) => !categories.some((c) => c.value === s))
                            .map((orphan) => (
                              <button
                                key={`orphan-${orphan}`}
                                type="button"
                                className="category-chip orphan active"
                                onClick={() => {
                                  setEditForm({
                                    ...editForm,
                                    category: editForm.category.filter((c) => c !== orphan),
                                    subCategories: Object.fromEntries(
                                      Object.entries(editForm.subCategories).filter(([k]) => k !== orphan)
                                    ),
                                  });
                                }}
                              >
                                ⚠ {orphan} — kaldır
                              </button>
                            ))}
                        </div>
                      )}
                      <div className="category-chips">
                        {categories.map((cat) => (
                          <button
                            key={cat.value}
                            type="button"
                            className={`category-chip ${editForm.category.includes(cat.value) ? 'active' : ''}`}
                            style={{ borderColor: cat.color }}
                            onClick={() => {
                              const active = editForm.category.includes(cat.value);
                              const nextCategory = active
                                ? editForm.category.filter((c) => c !== cat.value)
                                : [...editForm.category, cat.value];
                              const nextSubs = { ...editForm.subCategories };
                              if (active) delete nextSubs[cat.value];
                              setEditForm({
                                ...editForm,
                                category: nextCategory,
                                subCategories: nextSubs,
                              });
                            }}
                          >
                            {getCategoryOptionLabel(cat)}
                          </button>
                        ))}
                      </div>
                      {editForm.category.map((mainId) => {
                        const main = categories.find((c) => c.value === mainId);
                        const subs = main?.subCategories || [];
                        if (!subs.length) return null;
                        const selectedSubs = editForm.subCategories[mainId] || [];
                        return (
                          <div key={`sub-${mainId}`} className="sub-category-group">
                            <span className="field-hint">
                              {getCategoryOptionLabel(main!)} — alt kategori
                            </span>
                            <div className="category-chips">
                              {subs.map((sub) => {
                                const active = selectedSubs.includes(sub.id);
                                const subLabel =
                                  typeof sub.name === 'string'
                                    ? sub.name
                                    : sub.name?.tr || sub.name?.en || sub.id;
                                return (
                                  <button
                                    key={`${mainId}-${sub.id}`}
                                    type="button"
                                    className={`category-chip sub ${active ? 'active' : ''}`}
                                    style={{ borderColor: main?.color }}
                                    onClick={() => {
                                      const next = active
                                        ? selectedSubs.filter((id) => id !== sub.id)
                                        : [...selectedSubs, sub.id];
                                      setEditForm({
                                        ...editForm,
                                        subCategories: {
                                          ...editForm.subCategories,
                                          [mainId]: next,
                                        },
                                      });
                                    }}
                                  >
                                    {subLabel}
                                  </button>
                                );
                              })}
                            </div>
                            {selectedSubs.some(
                              (id) => !subs.some((s) => s.id === id)
                            ) && (
                              <div className="category-chips category-orphans">
                                {selectedSubs
                                  .filter((id) => !subs.some((s) => s.id === id))
                                  .map((id) => (
                                    <button
                                      key={`orphan-sub-${mainId}-${id}`}
                                      type="button"
                                      className="category-chip orphan active"
                                      onClick={() => {
                                        setEditForm({
                                          ...editForm,
                                          subCategories: {
                                            ...editForm.subCategories,
                                            [mainId]: selectedSubs.filter((x) => x !== id),
                                          },
                                        });
                                      }}
                                    >
                                      ⚠ {getSubCategoryLabel(mainId, id, categories)} — kaldır
                                    </button>
                                  ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="form-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={editForm.isUnesco || false}
                          onChange={(e) => setEditForm({ ...editForm, isUnesco: e.target.checked })}
                        />
                        UNESCO Listesinde
                      </label>
                    </div>

                    <div className="form-group">
                      <label>Durum *</label>
                      <select
                        value={editForm.status}
                        onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                        required
                      >
                        <option value="pending">{t('adminPanel.status.pending') || 'Beklemede'}</option>
                        <option value="published">{t('adminPanel.status.published') || 'Yayında'}</option>
                        <option value="rejected">{t('adminPanel.status.rejected') || 'Reddedildi'}</option>
                      </select>
                    </div>
                  </div>
                )}

                {activeEditTab === 'multilang' && (
                  <div className="form-section">
                    <div className="multilang-tabs">
                      {(['tr', 'en', 'ru', 'ar'] as const).map(lang => (
                        <button
                          key={lang}
                          className="lang-tab"
                          onClick={() => {/* Lang tab logic */}}
                        >
                          {lang.toUpperCase()}
                        </button>
                      ))}
                    </div>
                    
                    <div className="multilang-content">
                      {(['tr', 'en', 'ru', 'ar'] as const).map(lang => (
                        <div key={lang} className="lang-section">
                          <h3>{lang.toUpperCase()}</h3>
                          
                          <div className="form-group">
                            <label>Yer Adı ({lang.toUpperCase()})</label>
                            <input
                              type="text"
                              value={typeof editForm.name === 'string' ? '' : (editForm.name[lang] || '')}
                              onChange={(e) => updateField('name', e.target.value, lang)}
                              disabled={typeof editForm.name === 'string'}
                            />
                          </div>

                          <div className="form-group">
                            <label>İl ({lang.toUpperCase()})</label>
                            <input
                              type="text"
                              value={typeof editForm.city === 'string' ? '' : (editForm.city[lang] || '')}
                              onChange={(e) => updateField('city', e.target.value, lang)}
                              disabled={typeof editForm.city === 'string'}
                            />
                          </div>

                          <div className="form-group">
                            <label>İlçe ({lang.toUpperCase()})</label>
                            <input
                              type="text"
                              value={typeof editForm.district === 'string' ? '' : (editForm.district[lang] || '')}
                              onChange={(e) => updateField('district', e.target.value, lang)}
                              disabled={typeof editForm.district === 'string'}
                            />
                          </div>

                          <div className="form-group">
                            <label>Açıklama ({lang.toUpperCase()})</label>
                            <textarea
                              value={typeof editForm.description === 'string' ? '' : (editForm.description[lang] || '')}
                              onChange={(e) => updateField('description', e.target.value, lang)}
                              rows={6}
                              disabled={typeof editForm.description === 'string'}
                            />
                          </div>

                          <div className="form-group">
                            <label>Hikâye ({lang.toUpperCase()})</label>
                            <textarea
                              value={typeof editForm.story === 'string' ? '' : (editForm.story?.[lang] || '')}
                              onChange={(e) => updateField('story', e.target.value, lang)}
                              rows={6}
                              disabled={typeof editForm.story === 'string'}
                            />
                          </div>

                          <div className="form-group">
                            <label>Dönem ({lang.toUpperCase()})</label>
                            <input
                              type="text"
                              value={typeof editForm.period === 'string' ? '' : (editForm.period?.[lang] || '')}
                              onChange={(e) => updateField('period', e.target.value, lang)}
                              disabled={typeof editForm.period === 'string'}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeEditTab === 'visitTips' && editForm.visitTips && typeof editForm.visitTips === 'object' && !Array.isArray(editForm.visitTips) && (
                  <div className="form-section">
                    {(['tr', 'en', 'ru', 'ar'] as const).map(lang => {
                      const visitTipsObj = editForm.visitTips as MultilingualArray;
                      const langTips = visitTipsObj[lang] || [];
                      return (
                        <div key={lang} className="visit-tips-section">
                          <div className="visit-tips-header">
                            <h3>Ziyaret İpuçları ({lang.toUpperCase()})</h3>
                            <button 
                              type="button"
                              className="add-tip-btn"
                              onClick={() => addVisitTip(lang)}
                            >
                              + İpucu Ekle
                            </button>
                          </div>
                          <div className="visit-tips-list">
                            {langTips.map((tip: string, index: number) => (
                              <div key={index} className="visit-tip-item">
                                <textarea
                                  value={tip}
                                  onChange={(e) => updateVisitTips(lang, index, e.target.value)}
                                  rows={2}
                                  placeholder={`İpucu ${index + 1}`}
                                />
                                <button
                                  type="button"
                                  className="remove-tip-btn"
                                  onClick={() => removeVisitTip(lang, index)}
                                >
                                  ✕
                                </button>
                              </div>
                            ))}
                            {langTips.length === 0 && (
                              <p className="no-tips">Henüz ipucu eklenmemiş. "+ İpucu Ekle" butonuna tıklayın.</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {activeEditTab === 'photos' && (
                  <div className="form-section">
                    <div className="form-group">
                      <label>Ana Görsel URL</label>
                      <input
                        type="text"
                        value={editForm.imageUrl || ''}
                        onChange={(e) => setEditForm({ ...editForm, imageUrl: e.target.value })}
                        placeholder="https://..."
                      />
                    </div>

                    <div className="form-group">
                      <label>Fotoğraf URL'leri (her satıra bir URL)</label>
                      <textarea
                        value={(editForm.photos || []).join('\n')}
                        onChange={(e) => setEditForm({ 
                          ...editForm, 
                          photos: e.target.value.split('\n').filter(url => url.trim() !== '')
                        })}
                        rows={10}
                        placeholder="https://example.com/photo1.jpg&#10;https://example.com/photo2.jpg"
                      />
                    </div>

                    <div className="form-group">
                      <label>Liste Thumbnail Sırası ({selectedListThumbs.length}/{MAX_LIST_THUMBS})</label>
                      {selectedListThumbs.length === 0 ? (
                        <p className="thumb-help">Henüz seçili thumbnail yok. Aşağıdan en fazla 5 görsel seçin.</p>
                      ) : (
                        <div className="thumb-selected-list">
                          {selectedListThumbs.map((url, index) => (
                            <div className="thumb-selected-item" key={`${url}-${index}`}>
                              <img src={url} alt={`thumb-${index + 1}`} />
                              <div className="thumb-selected-actions">
                                <button type="button" onClick={() => moveThumb(index, -1)} disabled={index === 0}>↑</button>
                                <span>{index + 1}</span>
                                <button type="button" onClick={() => moveThumb(index, 1)} disabled={index === selectedListThumbs.length - 1}>↓</button>
                                <button type="button" onClick={() => removeThumbAt(index)}>✕</button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="form-group">
                      <label>Thumbnail Aday Havuzu</label>
                      {thumbCandidates.length === 0 ? (
                        <p className="thumb-help">Aday foto bulunamadı.</p>
                      ) : (
                        <div className="thumb-candidate-list">
                          {thumbCandidates.map((c) => {
                            const selected = selectedListThumbs.some((u) => stripUrlPathForCompare(u) === c.key);
                            const full = selectedListThumbs.length >= MAX_LIST_THUMBS;
                            return (
                              <div className="thumb-candidate-item" key={c.key}>
                                <img src={c.url} alt={c.label} />
                                <div className="thumb-candidate-meta">
                                  <span>{c.label}</span>
                                  <button
                                    type="button"
                                    disabled={selected || full}
                                    onClick={() => addThumbCandidate(c.url)}
                                  >
                                    {selected ? 'Secildi' : full ? 'Dolu' : '+ Ekle'}
                                  </button>
                                  <button type="button" onClick={() => removeCandidatePhoto(c)}>
                                    Sil
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeEditTab === 'location' && (
                  <div className="form-section">
                    <div className="form-row">
                      <div className="form-group">
                        <label>Enlem (Latitude) *</label>
                        <input
                          type="number"
                          step="any"
                          value={editForm.latitude}
                          onChange={(e) => setEditForm({ ...editForm, latitude: parseFloat(e.target.value) || 0 })}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Boylam (Longitude) *</label>
                        <input
                          type="number"
                          step="any"
                          value={editForm.longitude}
                          onChange={(e) => setEditForm({ ...editForm, longitude: parseFloat(e.target.value) || 0 })}
                          required
                        />
                      </div>
                    </div>
                    <div className="map-preview">
                      <p>Harita önizlemesi buraya gelecek</p>
                      <p className="coordinates-info">
                        Koordinatlar: {editForm.latitude.toFixed(6)}, {editForm.longitude.toFixed(6)}
                      </p>
                      {selectedPlace?.googleCoordsSyncedAt && (
                        <p className="coord-sync-field-note">
                          Bu yerin koordinatları Google ile senkronlandı (
                          {new Date(selectedPlace.googleCoordsSyncedAt).toLocaleString('tr-TR')})
                          {selectedPlace.googlePlaceId ? ` · place_id: ${selectedPlace.googlePlaceId}` : ''}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="edit-form-actions">
                <button className="save-btn" onClick={handleSave} disabled={saving}>
                  {saving ? (t('common.saving') || 'Kaydediliyor...') : (t('common.save') || 'Kaydet')}
                </button>
                {editForm.status !== 'published' && (
                  <button className="publish-btn" onClick={handlePublish}>
                    {t('adminPanel.publish') || 'Yayınla'}
                  </button>
                )}
                {editForm.status !== 'rejected' && (
                  <button className="reject-btn" onClick={handleReject}>
                    {t('adminPanel.reject') || 'Reddet'}
                  </button>
                )}
                <button className="delete-btn" onClick={handleDelete}>
                  {t('common.delete') || 'Sil'}
                </button>
              </div>
            </div>
          ) : (
            <div className="no-selection">
              <p>Düzenlemek için soldan bir yer seçin</p>
            </div>
          )}
        </div>
      </div>

      {/* PlaceSuggestions (Editör onayı bekleyenler) */}
      {suggestions.length > 0 && (
        <div className="suggestions-section">
          <h2>{t('adminPanel.pendingSuggestions') || 'Editör Onayı Bekleyen Öneriler'} ({suggestions.length})</h2>
          <div className="suggestions-list">
            {suggestions.map((suggestion) => {
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
                    <button className="approve-btn" onClick={() => handleApproveSuggestion(suggestion)}>
                      {t('adminPanel.approve') || 'Onayla'}
                    </button>
                    <button className="reject-btn" onClick={() => handleRejectSuggestion(suggestion)}>
                      {t('adminPanel.reject') || 'Reddet'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </PageShell>
  );
};

export default AdminPanelPage;
