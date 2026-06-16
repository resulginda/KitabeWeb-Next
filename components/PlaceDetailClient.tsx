'use client';

import dynamic from 'next/dynamic';
import { useEffect, useMemo, useState } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '@kitabe/contexts/AuthContext';
import { LanguageProvider, useLanguage, type Language } from '@kitabe/contexts/LanguageContext';
import { PlacesProvider } from '@kitabe/contexts/PlacesContext';
import { CategoriesProvider } from '@kitabe/contexts/CategoriesContext';
import { FavoritesProvider } from '@kitabe/contexts/FavoritesContext';
import { FiltreProvider } from '@kitabe/contexts/FiltreContext';
import { RouteProvider } from '@kitabe/contexts/RouteContext';
import { NotificationProvider } from '@kitabe/contexts/NotificationContext';
import { PhotoSubmissionProvider } from '@kitabe/contexts/PhotoSubmissionContext';
import { RatingProvider } from '@kitabe/contexts/RatingContext';
import { VisitedPlacesProvider } from '@kitabe/contexts/VisitedPlacesContext';
import { whenMaterialIconsReady } from '@kitabe/components/IconFontLoader';
import type { Place } from '@kitabe/types/place';
import '@/lib/i18n-client';

const DetailPage = dynamic(() => import('@kitabe/pages/DetailPage'), {
  ssr: false,
});

function LocaleSync({ locale }: { locale: Language }) {
  const { setLanguage } = useLanguage();
  useEffect(() => {
    setLanguage(locale);
  }, [locale, setLanguage]);
  return null;
}

function mapToClientPlace(apiPlace: Record<string, unknown>, locale: Language): Place {
  const pick = (field: unknown): string => {
    if (!field) return '';
    if (typeof field === 'string') return field;
    if (typeof field === 'object' && field !== null) {
      const o = field as Record<string, string>;
      return o[locale] || o.tr || o.en || '';
    }
    return '';
  };

  return {
    id: String(apiPlace.id),
    name: pick(apiPlace.name),
    city: pick(apiPlace.city),
    district: pick(apiPlace.district),
    category: (apiPlace.category as Place['category']) ?? [],
    description: pick(apiPlace.description),
    latitude: Number(apiPlace.latitude) || 0,
    longitude: Number(apiPlace.longitude) || 0,
    story: apiPlace.story ? pick(apiPlace.story) : undefined,
    visitTips: apiPlace.visitTips as Place['visitTips'],
    period: apiPlace.period ? pick(apiPlace.period) : undefined,
    isUnesco: Boolean(apiPlace.isUnesco),
    imageUrl: typeof apiPlace.imageUrl === 'string' ? apiPlace.imageUrl : undefined,
    thumbnailUrl: typeof apiPlace.thumbnailUrl === 'string' ? apiPlace.thumbnailUrl : undefined,
    photos: Array.isArray(apiPlace.photos) ? (apiPlace.photos as string[]) : undefined,
    googlePhotos: Array.isArray(apiPlace.googlePhotos)
      ? (apiPlace.googlePhotos as Place['googlePhotos'])
      : undefined,
    listGalleryThumbs: Array.isArray(apiPlace.listGalleryThumbs)
      ? (apiPlace.listGalleryThumbs as string[])
      : undefined,
    status: typeof apiPlace.status === 'string' ? apiPlace.status : 'published',
    updatedAt: apiPlace.updatedAt as Place['updatedAt'],
  };
}

export function PlaceDetailClient({
  place,
  locale,
}: {
  place: Record<string, unknown>;
  locale: Language;
}) {
  const [interactiveReady, setInteractiveReady] = useState(false);
  const initialPlace = useMemo(
    () => mapToClientPlace(place, locale),
    [place, locale]
  );

  useEffect(() => {
    let cancelled = false;
    Promise.all([whenMaterialIconsReady(), import('@kitabe/pages/DetailPage')]).then(() => {
      if (!cancelled) setInteractiveReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!interactiveReady) return;
    document.getElementById('place-detail-interactive')?.classList.add('is-ready');
    document.getElementById('place-detail-static')?.classList.add('is-hidden');
  }, [interactiveReady]);

  if (!interactiveReady) return null;

  return (
    <div id="place-detail-interactive" className="is-ready">
      <HelmetProvider>
        <AuthProvider>
          <LanguageProvider defaultLanguage={locale} localeFromUrl={locale}>
            <LocaleSync locale={locale} />
            <CategoriesProvider>
              <PlacesProvider>
                <FavoritesProvider>
                  <FiltreProvider>
                    <RouteProvider>
                      <NotificationProvider>
                        <PhotoSubmissionProvider>
                          <RatingProvider>
                            <VisitedPlacesProvider>
                              <MemoryRouter initialEntries={[`/detail/${initialPlace.id}`]}>
                                <DetailPage
                                  placeIdOverride={initialPlace.id}
                                  skipHelmet
                                  initialPlace={initialPlace}
                                />
                              </MemoryRouter>
                            </VisitedPlacesProvider>
                          </RatingProvider>
                        </PhotoSubmissionProvider>
                      </NotificationProvider>
                    </RouteProvider>
                  </FiltreProvider>
                </FavoritesProvider>
              </PlacesProvider>
            </CategoriesProvider>
          </LanguageProvider>
        </AuthProvider>
      </HelmetProvider>
    </div>
  );
}
