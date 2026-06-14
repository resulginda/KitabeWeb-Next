import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { API_BASE_URL } from '../config/api';
import { useAuth } from './AuthContext';
import type { PhotoSubmission } from '../types/photoSubmission';

interface PhotoSubmissionContextType {
  getSubmissionsByPlace: (placeId: string) => PhotoSubmission[];
  getApprovedSubmissionsByPlace: (placeId: string) => PhotoSubmission[];
  getUserSubmissionsForPlace: (placeId: string, userId: string) => PhotoSubmission[];
  allSubmissions: PhotoSubmission[];
  pendingSubmissions: PhotoSubmission[];
  loading: boolean;
  refresh: () => Promise<void>;
}

const PhotoSubmissionContext = createContext<PhotoSubmissionContextType | undefined>(undefined);

function mapRow(r: Record<string, unknown>): PhotoSubmission {
  return {
    id: String(r.id),
    placeId: String(r.placeId ?? r.place_id ?? ''),
    userId: String(r.userId ?? r.user_id ?? ''),
    userName: String(r.userName ?? r.user_name ?? ''),
    userEmail: String(r.userEmail ?? r.user_email ?? ''),
    photoUrl: String(r.photoUrl ?? r.photo_url ?? ''),
    status: (r.status as PhotoSubmission['status']) ?? 'pending',
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  };
}

export const PhotoSubmissionProvider = ({ children }: { children: ReactNode }) => {
  const { kullanici, getToken } = useAuth();
  const [allSubmissions, setAllSubmissions] = useState<PhotoSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!kullanici) {
      setAllSubmissions([]);
      setLoading(false);
      return;
    }
    const token = await getToken();
    if (!token) {
      setAllSubmissions([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/photo-submissions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setAllSubmissions(data.data.map(mapRow));
      } else {
        setAllSubmissions([]);
      }
    } catch {
      setAllSubmissions([]);
    } finally {
      setLoading(false);
    }
  }, [kullanici, getToken]);

  useEffect(() => {
    load();
  }, [load]);

  const getSubmissionsByPlace = (placeId: string) =>
    allSubmissions.filter((s) => s.placeId === placeId);
  const getApprovedSubmissionsByPlace = (placeId: string) =>
    allSubmissions.filter((s) => s.placeId === placeId && s.status === 'approved');
  const getUserSubmissionsForPlace = (placeId: string, userId: string) =>
    allSubmissions.filter((s) => s.placeId === placeId && s.userId === userId);
  const pendingSubmissions = allSubmissions.filter((s) => s.status === 'pending');

  return (
    <PhotoSubmissionContext.Provider
      value={{
        getSubmissionsByPlace,
        getApprovedSubmissionsByPlace,
        getUserSubmissionsForPlace,
        allSubmissions,
        pendingSubmissions,
        loading,
        refresh: load,
      }}
    >
      {children}
    </PhotoSubmissionContext.Provider>
  );
};

export const usePhotoSubmissions = () => {
  const context = useContext(PhotoSubmissionContext);
  if (!context) throw new Error('usePhotoSubmissions must be used within PhotoSubmissionProvider');
  return context;
};
