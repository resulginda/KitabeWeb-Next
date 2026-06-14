import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { API_BASE_URL } from '../config/api';
import { usePlaces } from '../contexts/PlacesContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { useRoute } from '../contexts/RouteContext';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useRatings } from '../contexts/RatingContext';
import { usePhotoSubmissions } from '../contexts/PhotoSubmissionContext';
import { useVisitedPlaces } from '../contexts/VisitedPlacesContext';
import { getLocalizedText, getLocalizedArray } from '../utils/multilang';
import { getPlaceImageUri, getGooglePhotoGalleryUrls } from '../utils/imageUtils';
import MapView from '../components/MapView';
import AdSenseBanner from '../components/AdSenseBanner';
import StarRating from '../components/StarRating';
import { PhotoLightbox } from '../components/PhotoLightbox';
import { notifyAdminsAndEditorsAboutNewPhoto } from '../services/notificationService';
import type { Place } from '../types/place';
import './DetailPage.css';

const DATE_LOCALES: Record<string, string> = {
  tr: 'tr-TR',
  en: 'en-US',
  ru: 'ru-RU',
  ar: 'ar-SA',
};

/** Mobil tarayıcı: iOS -> Apple Maps, diger -> OpenStreetMap. */
function externalMapOpenUrl(lat: number, lng: number, label?: string): string {
  if (typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent)) {
    const q = label ? encodeURIComponent(label) : `${lat},${lng}`;
    return `http://maps.apple.com/?ll=${lat},${lng}&q=${q}`;
  }
  const q = label ? encodeURIComponent(label) : `${lat},${lng}`;
  return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=15/${lat}/${lng}&query=${q}`;
}

const DetailPage = ({
  placeIdOverride,
  skipHelmet = false,
  initialPlace = null,
}: {
  placeIdOverride?: string;
  skipHelmet?: boolean;
  initialPlace?: Place | null;
} = {}) => {
  const { id: paramId } = useParams<{ id: string }>();
  const id = placeIdOverride ?? paramId;
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { fetchPlaceById } = usePlaces();
  const { getToken } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { isInRoute, addToRoute, removeFromRoute } = useRoute();
  const { kullanici } = useAuth();
  const { currentLanguage } = useLanguage();
  const { addRating, updateRating, deleteRating, getRatingsByPlace, getPlaceRatingSummary } = useRatings();
  const { getApprovedSubmissionsByPlace } = usePhotoSubmissions();
  const { isVisited, addToVisited, removeFromVisited, canMarkAsVisited } = useVisitedPlaces();
  const [place, setPlace] = useState<Place | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  
  // Rating states
  const [ratingModalVisible, setRatingModalVisible] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  
  // Photo upload states
  const [photoModalVisible, setPhotoModalVisible] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  
  // Visited state
  const [checkingVisit, setCheckingVisit] = useState(false);

  // Mobil cihaz tespiti
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      const isAndroid = /android/i.test(userAgent);
      const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream;
      setIsMobile(isAndroid || isIOS);
    };
    checkMobile();
  }, []);

  useEffect(() => {
    const loadPlace = async () => {
      if (!id) {
        setLoading(false);
        return;
      }
      if (initialPlace && initialPlace.id === id) {
        setPlace(initialPlace);
        setLoading(false);
        return;
      }
      try {
        const fullPlace = await fetchPlaceById(id);
        if (fullPlace) {
          setPlace(fullPlace);
        }
      } catch (err) {
        console.error('Place yüklenirken hata:', err);
      } finally {
        setLoading(false);
      }
    };
    loadPlace();
  }, [id, fetchPlaceById, initialPlace]);

  // Güvenli veri çıkarma - null/undefined kontrolü
  const name = place?.name 
    ? (typeof place.name === 'string' ? place.name : getLocalizedText(place.name, currentLanguage))
    : t('detail.unnamedPlace');
  const city = place?.city 
    ? (typeof place.city === 'string' ? place.city : getLocalizedText(place.city, currentLanguage))
    : '';
  const district = place?.district 
    ? (typeof place.district === 'string' ? place.district : getLocalizedText(place.district, currentLanguage))
    : '';
  const description = place?.description 
    ? (typeof place.description === 'string' ? place.description : getLocalizedText(place.description, currentLanguage))
    : t('detail.noDescription');
  const story = place?.story 
    ? (typeof place.story === 'string' ? place.story : getLocalizedText(place.story, currentLanguage))
    : '';
  const period = place?.period 
    ? (typeof place.period === 'string' ? place.period : getLocalizedText(place.period, currentLanguage))
    : '';
  const visitTips = useMemo(() => {
    if (!place?.visitTips) return [];
    if (Array.isArray(place.visitTips)) return place.visitTips;
    const tips = place.visitTips as any;
    if (tips.tr || tips.en || tips.ru || tips.ar) {
      return getLocalizedArray(tips, currentLanguage);
    }
    return [];
  }, [place?.visitTips, currentLanguage]);
  const categories = useMemo(() => {
    if (!place?.category) return [];
    if (Array.isArray(place.category)) return place.category;
    const cat = place.category as any;
    if (cat.tr || cat.en || cat.ru || cat.ar) {
      return getLocalizedArray(cat, currentLanguage);
    }
    if (cat.main && Array.isArray(cat.main)) {
      return cat.main.map((m: any) => getLocalizedText(m, currentLanguage)).filter(Boolean);
    }
    return [];
  }, [place?.category, currentLanguage]);
  const imageUrl = place ? getPlaceImageUri(place) : null;
  const photos = place?.photos || [];

  // Koordinat kontrolü
  const lat = place?.latitude;
  const lng = place?.longitude;
  const hasValidCoordinates = typeof lat === 'number' && typeof lng === 'number' && 
                              !isNaN(lat) && !isNaN(lng);

  // Paylaşma fonksiyonu
  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/detail/${place?.id || ''}`;

    // Web Share API desteği varsa kullan
    if (navigator.share) {
      try {
        await navigator.share({
          title: name,
          text: `${name} - ${city}, ${district}`,
          url: shareUrl,
        });
      } catch (error) {
        // Kullanıcı paylaşmayı iptal etti veya hata oluştu
        console.log('Paylaşma iptal edildi veya hata:', error);
      }
    } else {
      // Web Share API desteklenmiyorsa URL'yi panoya kopyala
      try {
        await navigator.clipboard.writeText(shareUrl);
        alert(t('detail.shareCopied') || 'Link panoya kopyalandı!');
      } catch (error) {
        // Fallback: textarea ile kopyalama
        const textarea = document.createElement('textarea');
        textarea.value = shareUrl;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        alert(t('detail.shareCopied') || 'Link panoya kopyalandı!');
      }
    }
  };

  // Uygulamada aç: zamanlayıcı kullanma — kullanıcı uygulamaya geçince sayfa arka planda kalır ve
  // 3 sn sonra Play Store'a atıyordu. Android: Intent + anında fallback; iOS: universal link (https).
  const handleOpenInApp = () => {
    const id = place?.id?.trim();
    if (!id) return;

    const ua = navigator.userAgent || navigator.vendor || (window as any).opera || '';
    const isAndroid = /android/i.test(ua);
    const isIOS = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;

    const canonicalBase = 'https://kitabe.org';
    const universalDetail = `${canonicalBase}/detail/${encodeURIComponent(id)}`;
    const playStore =
      'https://play.google.com/store/apps/details?id=com.kitabeapp';

    if (isAndroid) {
      const fallback = encodeURIComponent(playStore);
      // kitabe://detail/:id ile aynı hedef; yüklü değilse tarayıcı doğrudan Play Store'a gider
      window.location.href = `intent://detail/${encodeURIComponent(id)}#Intent;scheme=kitabe;package=com.kitabeapp;S.browser_fallback_url=${fallback};end`;
      return;
    }

    if (isIOS) {
      window.location.href = universalDetail;
      return;
    }

    window.location.href = universalDetail;
  };

  // Rating data
  const approvedRatings = useMemo(() => {
    if (!place) return [];
    return getRatingsByPlace(place.id).filter(r => r.status === 'approved');
  }, [place, getRatingsByPlace]);
  
  const ratingSummary = useMemo(() => {
    if (!place) return null;
    return getPlaceRatingSummary(place.id);
  }, [place, getPlaceRatingSummary]);
  
  const currentUserRating = useMemo(() => {
    if (!kullanici || !place) return null;
    return approvedRatings.find(r => r.userId === kullanici.id) || null;
  }, [kullanici, place, approvedRatings]);
  
  useEffect(() => {
    if (currentUserRating) {
      setUserRating(currentUserRating.rating);
      setRatingComment(currentUserRating.comment || '');
    } else {
      setUserRating(0);
      setRatingComment('');
    }
  }, [currentUserRating]);
  
  // Photo data
  const approvedUserPhotos = useMemo(() => {
    if (!place) return [];
    return getApprovedSubmissionsByPlace(place.id);
  }, [place, getApprovedSubmissionsByPlace]);
  
  const allPhotos = useMemo(() => {
    const placePhotos = photos.filter((p: any) => {
      const url = typeof p === 'string' ? p : (p?.uri || p?.url || '');
      return url && url.startsWith('http');
    });
    const googleUrls = place ? getGooglePhotoGalleryUrls(place) : [];
    const userPhotoUrls = approvedUserPhotos.map(sub => sub.photoUrl);
    return [...placePhotos, ...googleUrls, ...userPhotoUrls];
  }, [photos, approvedUserPhotos, place]);
  
  const visited = useMemo(() => {
    if (!place) return false;
    return isVisited(place.id);
  }, [place, isVisited]);
  
  // Rating handlers
  const handleSubmitRating = async () => {
    if (!place || !kullanici) return;
    
    if (userRating === 0) {
      alert(t('detail.rateRequired'));
      return;
    }
    
    setIsSubmittingRating(true);
    try {
      if (currentUserRating) {
        await updateRating(currentUserRating.id, userRating, ratingComment);
        alert(t('detail.ratingUpdated'));
      } else {
        await addRating(place.id, userRating, ratingComment);
        alert(t('detail.ratingSubmitted'));
      }
      setRatingModalVisible(false);
    } catch (error: any) {
      console.error('Rating submit error:', error);
      alert(error.message || t('detail.ratingSubmitFailed'));
    } finally {
      setIsSubmittingRating(false);
    }
  };
  
  const handleDeleteRating = async () => {
    if (!currentUserRating) return;
    
    if (confirm(t('detail.ratingDeleteConfirm'))) {
      try {
        await deleteRating(currentUserRating.id);
        alert(t('detail.ratingDeleted'));
        setRatingModalVisible(false);
        setUserRating(0);
        setRatingComment('');
      } catch (error: any) {
        console.error('Delete rating error:', error);
        alert(error.message || t('detail.ratingDeleteFailed'));
      }
    }
  };
  
  // Photo upload handlers
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setPhotoModalVisible(true);
    }
  };
  
  const handleUploadPhoto = async () => {
    if (!selectedPhoto || !place || !kullanici) return;
    const token = await getToken();
    if (!token) {
      alert(t('detail.loginRequiredShort'));
      return;
    }
    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append('photo', selectedPhoto);
      const uploadRes = await fetch(`${API_BASE_URL}/api/upload/photo`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const uploadData = await uploadRes.json();
      if (!uploadData.success || !uploadData.url) {
        throw new Error(uploadData.message || t('detail.photoUploadFailed'));
      }
      const photoUrl = uploadData.url;

      const subRes = await fetch(`${API_BASE_URL}/api/photo-submissions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ placeId: place.id, photoUrl }),
      });
      const subData = await subRes.json();
      if (!subData.success) throw new Error(subData.message || t('detail.submissionSaveFailed'));
      const submissionId = subData.data?.id ?? '';

      const userName = [kullanici.isim, kullanici.soyad].filter(Boolean).join(' ').trim() || t('detail.anonymous');
      const placeName = {
        tr: getLocalizedText(place.name, 'tr'),
        en: getLocalizedText(place.name, 'en'),
        ru: getLocalizedText(place.name, 'ru'),
        ar: getLocalizedText(place.name, 'ar'),
      };
      await notifyAdminsAndEditorsAboutNewPhoto(
        getToken,
        submissionId,
        place.id,
        placeName,
        kullanici.id,
        userName,
        photoUrl
      );

      alert(t('detail.photoSubmitted'));
      setPhotoModalVisible(false);
      setSelectedPhoto(null);
      setPhotoPreview(null);
    } catch (err: unknown) {
      console.error('Photo upload error:', err);
      alert(err instanceof Error ? err.message : t('detail.photoUploadError'));
    } finally {
      setUploadingPhoto(false);
    }
  };
  
  // Visited handlers
  const handleVisitedToggle = async () => {
    if (!kullanici) {
      alert(t('detail.visitedLoginRequired'));
      return;
    }
    
    if (!place) return;
    
    if (visited) {
      if (confirm(t('detail.visitedRemoveConfirm'))) {
        await removeFromVisited(place.id);
      }
    } else {
      setCheckingVisit(true);
      try {
        const check = await canMarkAsVisited(place);
        if (!check.canMark) {
          const messages: string[] = [];
          if (check.reasons.includes('location')) {
            messages.push(t('detail.visitedTooFar'));
          }
          if (check.reasons.includes('photo')) {
            messages.push(t('detail.visitedPhotoRequired'));
          }
          if (check.reasons.includes('cooldown')) {
            messages.push(t('detail.visitedCooldown'));
          }
          if (check.reasons.includes('rateLimit')) {
            messages.push(t('detail.visitedRateLimit'));
          }
          alert(messages.join('\n'));
        } else {
          const result = await addToVisited(place);
          if (result.success) {
            alert(result.message);
          } else {
            alert(result.message);
          }
        }
      } catch (error) {
        console.error('Gezdim işaretleme hatası:', error);
        alert(t('detail.visitedGenericError'));
      } finally {
        setCheckingVisit(false);
      }
    }
  };
  
  const formatUserName = (userName: string) => {
    if (!userName) return t('detail.anonymous');
    const parts = userName.trim().split(' ');
    if (parts.length === 0) return t('detail.anonymous');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
    return parts[0].charAt(0).toUpperCase() + parts[0].slice(1) + ' ' + parts[parts.length - 1].charAt(0).toUpperCase() + '.';
  };
  
  // Deep link URL'i
  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/detail/${place?.id || ''}` : '';
  const metaDescription = description.length > 160 ? description.substring(0, 160) + '...' : description;
  const fullTitle = `${name} - ${city}${district ? `, ${district}` : ''} | Kitabe`;

  if (loading) {
    return <div className="detail-page loading">{t('common.loading')}</div>;
  }

  if (!place) {
    return <div className="detail-page">{t('detail.noData')}</div>;
  }

  return (
    <>
      {!skipHelmet && (
      <Helmet>
        <title>{fullTitle}</title>
        <meta name="description" content={metaDescription} />
        <link rel="canonical" href={shareUrl} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={shareUrl} />
        <meta property="og:title" content={fullTitle} />
        <meta property="og:description" content={metaDescription} />
        {imageUrl && <meta property="og:image" content={imageUrl} />}
        <meta property="og:site_name" content="Kitabe" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={shareUrl} />
        <meta name="twitter:title" content={fullTitle} />
        <meta name="twitter:description" content={metaDescription} />
        {imageUrl && <meta name="twitter:image" content={imageUrl} />}
        
        {/* Additional SEO */}
        <meta name="keywords" content={`${name}, ${city}, ${district}, ${categories.join(', ')}, kültürel miras, tarihi yer, turizm, Kitabe`} />
        {place.isUnesco && <meta name="keywords" content={`UNESCO, ${name}, ${city}`} />}
      </Helmet>
      )}
      <div className="detail-page">
      {imageUrl && (
        <div className="detail-header">
          <img src={imageUrl} alt={name} onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }} />
          <div className="header-actions">
            <button
              className={`favorite-btn-large ${isFavorite(place.id) ? 'active' : ''}`}
              onClick={() => toggleFavorite(place)}
              title={isFavorite(place.id) ? t('detail.removeFromFavorites') : t('detail.addToFavorites')}
            >
              {isFavorite(place.id) ? '❤️' : '🤍'}
            </button>
            {kullanici && (
              <button
                className={`visited-btn-large ${visited ? 'active' : ''}`}
                onClick={handleVisitedToggle}
                disabled={checkingVisit}
                title={visited ? t('detail.unmarkVisited') : t('detail.markVisited')}
              >
                {visited ? '✓' : '○'}
              </button>
            )}
            <button
              className="share-btn-large"
              onClick={handleShare}
              title={t('detail.share') || 'Paylaş'}
            >
              📤
            </button>
          </div>
        </div>
      )}

      <div className={`detail-content ${imageUrl ? '' : 'no-header'}`.trim()}>
        {/* Mobil cihazlarda "Uygulamada aç" butonu */}
        {isMobile && (
          <div className="open-in-app-banner">
            <button type="button" className="open-in-app-btn" onClick={handleOpenInApp}>
              <span className="app-icon" aria-hidden>
                <img src="/app-icon.png" alt="" width={44} height={44} decoding="async" />
              </span>
              <span className="btn-text">
                <strong>{t('detail.openInAppTitle')}</strong>
                <small>{t('detail.openInAppSubtitle')}</small>
              </span>
              <span className="arrow" aria-hidden>
                →
              </span>
            </button>
          </div>
        )}
        
        <h1>{name}</h1>
        <div className="detail-meta">
          <span className="location">📍 {city}, {district}</span>
          {period && <span className="period">📅 {period}</span>}
          {place.isUnesco && <span className="unesco-badge">UNESCO</span>}
        </div>

        {categories.length > 0 && (
          <div className="categories">
            {categories.map((cat: string, idx: number) => (
              <span key={idx} className="category-tag">{cat}</span>
            ))}
          </div>
        )}

        <div className="section">
          <h2>{t('place.description')}</h2>
          <p>{description}</p>
        </div>

        {story && (
          <div className="section">
            <h2>{t('place.story')}</h2>
            <p>{story}</p>
          </div>
        )}

        {visitTips.length > 0 && (
          <div className="section">
            <h2>{t('place.visitTips')}</h2>
            <ul>
              {visitTips.map((tip, idx) => (
                <li key={idx}>{tip}</li>
              ))}
            </ul>
          </div>
        )}

        <AdSenseBanner slot="1122334455" format="horizontal" style={{ margin: '1rem 0', minHeight: '100px' }} />

        <div className="section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2>{t('detail.photos')}</h2>
            {kullanici && (
              <label className="add-photo-btn">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoSelect}
                  style={{ display: 'none' }}
                />
                <span className="material-icons">add_a_photo</span>
                {t('detail.addPhoto')}
              </label>
            )}
          </div>
          {allPhotos.length > 0 ? (
            <PhotoLightbox photos={allPhotos} altPrefix={name} />
          ) : (
            <p style={{ color: '#718096', fontStyle: 'italic' }}>{t('detail.noPhotosYet')}</p>
          )}
        </div>
        
        {/* Rating Section */}
        <div className="section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2>{t('detail.ratings')}</h2>
            {ratingSummary && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2d3748' }}>
                  {ratingSummary.averageRating.toFixed(1)}
                </span>
                <StarRating rating={ratingSummary.averageRating} readonly size={20} showEmptyStars={false} />
                <span style={{ fontSize: '0.9rem', color: '#718096' }}>
                  {t('detail.ratingsCount', { count: ratingSummary.totalRatings })}
                </span>
              </div>
            )}
          </div>
          
          {kullanici ? (
            <button
              className="rating-btn"
              onClick={() => setRatingModalVisible(true)}
            >
              <span className="material-icons">star</span>
              {currentUserRating ? t('detail.editYourRating') : t('detail.rateAndComment')}
            </button>
          ) : (
            <button
              className="rating-btn"
              onClick={() => navigate('/login')}
            >
              <span className="material-icons">star_border</span>
              {t('detail.rateLoginRequired')}
            </button>
          )}
          
          {approvedRatings.length > 0 && (
            <div className="ratings-list" style={{ marginTop: '1.5rem' }}>
              {approvedRatings.slice(0, 5).map((rating) => (
                <div key={rating.id} className="rating-item">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 'bold', color: '#2d3748' }}>
                      {formatUserName(rating.userName)}
                    </span>
                    <StarRating rating={rating.rating} readonly size={14} showEmptyStars={false} />
                    <span style={{ fontSize: '0.85rem', color: '#718096' }}>
                      {rating.createdAt?.toDate
                        ? new Date(rating.createdAt.toDate()).toLocaleDateString(
                            DATE_LOCALES[currentLanguage] || 'en-US'
                          )
                        : ''}
                    </span>
                  </div>
                  {rating.comment && (
                    <p style={{ color: '#4a5568', lineHeight: '1.6', margin: 0 }}>{rating.comment}</p>
                  )}
                </div>
              ))}
              {approvedRatings.length > 5 && (
                <p style={{ fontSize: '0.9rem', color: '#718096', fontStyle: 'italic', marginTop: '0.5rem' }}>
                  {t('detail.moreRatings', { count: approvedRatings.length - 5 })}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="section">
          <h2>{t('place.location')}</h2>
          {hasValidCoordinates ? (
            <>
              <div className="map-container" style={{ height: '300px', marginBottom: '20px' }}>
                <MapView
                  places={[place]}
                  center={{ lat: place.latitude, lng: place.longitude }}
                  zoom={15}
                />
              </div>
              <p>
                {t('detail.coordinates', {
                  lat: place.latitude.toFixed(6),
                  lng: place.longitude.toFixed(6),
                })}
              </p>
            </>
          ) : (
            <p style={{ color: '#ef4444', padding: '1rem' }}>
              {t('detail.noLocationInfo')}
            </p>
          )}
          <div className="action-buttons">
            {hasValidCoordinates && (
              <a
                href={externalMapOpenUrl(
                  place.latitude,
                  place.longitude,
                  getLocalizedText(place.name, currentLanguage) || undefined
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="map-link"
              >
                🗺️ {t('detail.openInMaps') || 'Haritada Aç'}
              </a>
            )}
            <button
              className={`route-btn ${isInRoute(place.id) ? 'in-route' : ''}`}
              onClick={() => {
                if (isInRoute(place.id)) {
                  removeFromRoute(place.id);
                } else {
                  addToRoute(place);
                }
              }}
              disabled={!hasValidCoordinates}
            >
              {isInRoute(place.id) ? `✓ ${t('detail.inRoute') || 'Rotada'}` : `+ ${t('detail.addToRoute') || 'Rotaya Ekle'}`}
            </button>
            {kullanici && (
              <button
                className="suggest-edit-btn"
                onClick={() => navigate(`/suggestion?placeId=${place.id}`)}
              >
                ✏️ {t('detail.editSuggestion') || 'Düzenleme Öner'}
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Rating Modal */}
      {ratingModalVisible && (
        <div className="modal-overlay" onClick={() => setRatingModalVisible(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0 }}>{t('detail.ratingTitle')}</h2>
              <button className="close-btn" onClick={() => setRatingModalVisible(false)} aria-label={t('detail.lightboxClose')}>×</button>
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#2d3748' }}>
                {t('detail.yourRating')}
              </label>
              <StarRating 
                rating={userRating} 
                onRatingChange={setUserRating}
                size={32}
              />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#2d3748' }}>
                {t('detail.yourComment')}
              </label>
              <textarea
                value={ratingComment}
                onChange={(e) => setRatingComment(e.target.value)}
                placeholder={t('detail.commentPlaceholder')}
                rows={4}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontFamily: 'inherit',
                  resize: 'vertical'
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                className="submit-rating-btn"
                onClick={handleSubmitRating}
                disabled={isSubmittingRating || userRating === 0}
              >
                {isSubmittingRating
                  ? t('detail.submitting')
                  : currentUserRating
                    ? t('detail.update')
                    : t('detail.submit')}
              </button>
              {currentUserRating && (
                <button
                  className="delete-rating-btn"
                  onClick={handleDeleteRating}
                >
                  {t('detail.delete')}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Photo Upload Modal */}
      {photoModalVisible && selectedPhoto && (
        <div className="modal-overlay" onClick={() => {
          setPhotoModalVisible(false);
          setSelectedPhoto(null);
          setPhotoPreview(null);
        }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0 }}>{t('detail.uploadPhotoTitle')}</h2>
              <button className="close-btn" onClick={() => {
                setPhotoModalVisible(false);
                setSelectedPhoto(null);
                setPhotoPreview(null);
              }} aria-label={t('detail.lightboxClose')}>×</button>
            </div>
            {photoPreview && (
              <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
                <img 
                  src={photoPreview} 
                  alt="Preview" 
                  style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px' }}
                />
              </div>
            )}
            <button
              className="upload-photo-btn"
              onClick={handleUploadPhoto}
              disabled={uploadingPhoto}
            >
              {uploadingPhoto ? t('detail.uploading') : t('detail.uploadPhoto')}
            </button>
          </div>
        </div>
      )}
    </div>
    </>
  );
};

export default DetailPage;

