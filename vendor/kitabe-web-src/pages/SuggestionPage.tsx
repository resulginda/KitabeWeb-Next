import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { API_BASE_URL } from '../config/api';
import { apiFetch } from '../utils/apiClient';
import { getStoredToken } from '../utils/authToken';
import { TURKIYE_ILLER, TURKIYE_ILCELER } from '../data/turkiyeIllerIlceler';
import { useCategories } from '../contexts/CategoriesContext';
import { getLocalizedText, getLocalizedArray } from '../utils/multilang';
import MapView from '../components/MapView';
import './SuggestionPage.css';

const SuggestionPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const placeId = searchParams.get('placeId');
  const { kullanici } = useAuth();
  const { currentLanguage } = useLanguage();
  const { categories } = useCategories();

  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [description, setDescription] = useState('');
  const [story, setStory] = useState('');
  const [visitTips, setVisitTips] = useState<string[]>([]);
  const [visitTipInput, setVisitTipInput] = useState('');
  const [period, setPeriod] = useState('');
  const [isUnesco, setIsUnesco] = useState(false);
  const [category, setCategory] = useState<string[]>([]);
  const [latitude, setLatitude] = useState(39.92);
  const [longitude, setLongitude] = useState(32.85);
  const [photos, setPhotos] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  // Sayfa açıldığında en üste scroll et
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [placeId]);

  // PlaceId varsa mevcut yer bilgilerini yükle (PostgreSQL API)
  useEffect(() => {
    if (placeId) {
      const loadPlace = async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/api/places/${encodeURIComponent(placeId)}`);
          const json = await res.json();
          if (!json.success || !json.data) return;
          const data = json.data as Record<string, unknown>;
          setName(getLocalizedText(data.name as Parameters<typeof getLocalizedText>[0], currentLanguage) || '');
          setCity(getLocalizedText(data.city as Parameters<typeof getLocalizedText>[0], currentLanguage) || '');
          setDistrict(getLocalizedText(data.district as Parameters<typeof getLocalizedText>[0], currentLanguage) || '');
          setDescription(getLocalizedText(data.description as Parameters<typeof getLocalizedText>[0], currentLanguage) || '');
          setStory(getLocalizedText(data.story as Parameters<typeof getLocalizedText>[0], currentLanguage) || '');
          setPeriod(getLocalizedText(data.period as Parameters<typeof getLocalizedText>[0], currentLanguage) || '');
          const tips = getLocalizedArray(data.visitTips as Parameters<typeof getLocalizedArray>[0], currentLanguage);
          setVisitTips(tips);
          const cats = getLocalizedArray(data.category as Parameters<typeof getLocalizedArray>[0], currentLanguage);
          setCategory(cats);
          setIsUnesco(Boolean(data.isUnesco) || cats.includes('UNESCO'));
          if (typeof data.latitude === 'number' && !Number.isNaN(data.latitude)) setLatitude(data.latitude);
          if (typeof data.longitude === 'number' && !Number.isNaN(data.longitude)) setLongitude(data.longitude);
        } catch (error) {
          console.error('Place yüklenirken hata:', error);
        }
      };
      loadPlace();
    }
  }, [placeId, currentLanguage]);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setPhotos(prev => [...prev, ...files].slice(0, 5));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kullanici) {
      alert(t('suggestion.loginRequired') || 'Giriş yapmanız gerekiyor');
      return;
    }

    setUploading(true);
    try {
      const photoUrls: string[] = [];
      for (const photo of photos) {
        const fd = new FormData();
        fd.append('photo', photo);
        const tok = getStoredToken();
        const up = await fetch(`${API_BASE_URL}/api/upload/photo`, {
          method: 'POST',
          headers: tok ? { Authorization: `Bearer ${tok}` } : {},
          body: fd,
        });
        const upJson = await up.json();
        if (!up.ok || !upJson.url) throw new Error(upJson.message || 'Fotoğraf yüklenemedi');
        photoUrls.push(upJson.url);
      }

      const ml = (s: string) => {
        const v = s.trim();
        return { tr: v, en: v, ru: v, ar: v };
      };
      const visitTipsMl =
        visitTips.length > 0 ? { tr: visitTips, en: visitTips, ru: visitTips, ar: visitTips } : undefined;

      const changes: Record<string, unknown> = {
        name: ml(name),
        city: ml(city),
        district: ml(district),
        description: ml(description),
        story: story.trim() ? ml(story) : undefined,
        period: period.trim() ? ml(period) : undefined,
        category,
        isUnesco,
        latitude,
        longitude,
        photos: photoUrls,
      };
      if (visitTipsMl) changes.visitTips = visitTipsMl;

      const res = await apiFetch('/api/place-suggestions', {
        method: 'POST',
        body: JSON.stringify({
          type: placeId ? 'EDIT' : 'NEW',
          targetPlaceId: placeId || undefined,
          changes,
        }),
      });
      const out = await res.json();
      if (!res.ok || !out.success) throw new Error(out.message || 'Gönderilemedi');

      alert(t('suggestion.success') || 'Öneriniz başarıyla gönderildi');
      navigate('/my-suggestions');
    } catch (error) {
      console.error('Suggestion error:', error);
      alert(t('suggestion.error') || 'Bir hata oluştu');
    } finally {
      setUploading(false);
    }
  };

  const toggleCategory = (cat: string) => {
    if (cat === 'UNESCO') {
      setIsUnesco(!isUnesco);
      setCategory(prev => isUnesco ? prev.filter(c => c !== 'UNESCO') : [...prev, 'UNESCO']);
    } else {
      setCategory(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
    }
  };

  if (!kullanici) {
    return (
      <div className="suggestion-page">
        <div className="login-required">
          <p>{t('suggestion.loginRequired') || 'Bu özelliği kullanmak için giriş yapmanız gerekiyor'}</p>
          <button onClick={() => navigate('/login')}>{t('common.login')}</button>
        </div>
      </div>
    );
  }

  return (
    <div className="suggestion-page">
      <header className="suggestion-header">
        <h1>{placeId ? t('suggestion.editSuggestion') || 'Düzenleme Öner' : t('suggestion.newPlace') || 'Yeni Yer Öner'}</h1>
      </header>

      <form onSubmit={handleSubmit} className="suggestion-form">
        <div className="form-group">
          <label>{t('suggestion.placeName') || 'Yer Adı'}</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>{t('suggestion.city') || 'Şehir'}</label>
            <select value={city} onChange={(e) => setCity(e.target.value)} required>
              <option value="">{t('suggestion.selectCity') || 'Şehir Seç'}</option>
              {TURKIYE_ILLER.map(il => (
                <option key={il} value={il}>{il}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>{t('suggestion.district') || 'İlçe'}</label>
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              disabled={!city}
              required
            >
              <option value="">{t('suggestion.selectDistrict') || 'İlçe Seç'}</option>
              {city && TURKIYE_ILCELER[city]?.map(ilce => (
                <option key={ilce} value={ilce}>{ilce}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>{t('suggestion.description') || 'Açıklama'}</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            required
          />
        </div>

        <div className="form-group">
          <label>{t('suggestion.story') || 'Hikaye'}</label>
          <textarea
            value={story}
            onChange={(e) => setStory(e.target.value)}
            rows={6}
          />
        </div>

        <div className="form-group">
          <label>{t('suggestion.categories') || 'Kategoriler'}</label>
          <div className="category-chips">
            {categories.map(cat => (
              <button
                key={cat.value}
                type="button"
                className={`category-chip ${category.includes(cat.value) ? 'active' : ''}`}
                style={{ borderColor: cat.color }}
                onClick={() => toggleCategory(cat.value)}
              >
                {t(`categories.${cat.value}`) || cat.value}
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>{t('suggestion.visitTips') || 'Ziyaret İpuçları'}</label>
          <div className="visit-tips-input">
            <input
              type="text"
              value={visitTipInput}
              onChange={(e) => setVisitTipInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && visitTipInput.trim()) {
                  e.preventDefault();
                  setVisitTips(prev => [...prev, visitTipInput.trim()]);
                  setVisitTipInput('');
                }
              }}
              placeholder={t('suggestion.addTip') || 'İpucu ekle ve Enter\'a bas'}
            />
            <button
              type="button"
              onClick={() => {
                if (visitTipInput.trim()) {
                  setVisitTips(prev => [...prev, visitTipInput.trim()]);
                  setVisitTipInput('');
                }
              }}
            >
              +
            </button>
          </div>
          <div className="visit-tips-list">
            {visitTips.map((tip, idx) => (
              <div key={idx} className="visit-tip-item">
                <span>{tip}</span>
                <button
                  type="button"
                  onClick={() => setVisitTips(prev => prev.filter((_, i) => i !== idx))}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>{t('suggestion.location') || 'Konum'}</label>
          <div className="coordinates-input">
            <input
              type="number"
              step="any"
              value={latitude}
              onChange={(e) => setLatitude(parseFloat(e.target.value) || 0)}
              placeholder={t('suggestion.latitude') || 'Enlem'}
            />
            <input
              type="number"
              step="any"
              value={longitude}
              onChange={(e) => setLongitude(parseFloat(e.target.value) || 0)}
              placeholder={t('suggestion.longitude') || 'Boylam'}
            />
          </div>
          {latitude && longitude && !isNaN(latitude) && !isNaN(longitude) && (
            <div className="map-preview">
              <MapView
                places={[{
                  id: 'preview',
                  name: name || 'Yeni Yer',
                  city: city,
                  district: district,
                  category: category,
                  description: description,
                  latitude,
                  longitude,
                }]}
                center={{ lat: latitude, lng: longitude }}
                zoom={13}
              />
            </div>
          )}
        </div>

        <div className="form-group">
          <label>{t('suggestion.photos') || 'Fotoğraflar'} ({photos.length}/5)</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handlePhotoSelect}
            disabled={photos.length >= 5}
          />
          {photos.length === 0 && (
            <p style={{ color: '#666', fontSize: '0.9rem', marginTop: '0.5rem' }}>
              {t('suggestion.noFileSelected') || 'Dosya seçilmedi'}
            </p>
          )}
          <div className="photos-preview">
            {photos.map((photo, idx) => (
              <div key={idx} className="photo-preview">
                <img src={URL.createObjectURL(photo)} alt={`Photo ${idx + 1}`} />
                <button
                  type="button"
                  onClick={() => setPhotos(prev => prev.filter((_, i) => i !== idx))}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="form-actions">
          <button type="button" onClick={() => navigate(-1)}>
            {t('common.cancel')}
          </button>
          <button type="submit" disabled={uploading}>
            {uploading ? (t('suggestion.submitting') || t('suggestion.uploading') || 'Yükleniyor...') : (t('suggestion.submit') || 'Öneriyi Gönder')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SuggestionPage;

