import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { API_BASE_URL } from '../config/api';
import { useAuth } from './AuthContext';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: MultilingualText;
  message: MultilingualText;
  data: { [key: string]: unknown };
  read: boolean;
  readAt?: string;
  createdAt: string;
  priority: 'high' | 'medium' | 'low';
}

export type NotificationType =
  | 'photo_approved'
  | 'photo_rejected'
  | 'rating_approved'
  | 'rating_rejected'
  | 'suggestion_editor_approved'
  | 'suggestion_admin_approved'
  | 'suggestion_rejected'
  | 'new_place_in_favorite_city'
  | 'new_place_nearby'
  | 'new_photo_in_favorite_place'
  | 'new_suggestion_for_review'
  | 'suggestion_editor_approved_for_admin'
  | 'new_rating_for_review'
  | 'new_photo_for_review'
  | 'new_contact_form'
  | 'security_alert';

export type MultilingualText = {
  tr: string;
  en: string;
  ru?: string;
  ar?: string;
};

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refresh: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

function mapRow(n: { id: string; user_id?: string; type: string; title: unknown; message: unknown; data?: unknown; read?: boolean; read_at?: string; created_at?: string; priority?: string }): Notification {
  return {
    id: n.id,
    userId: n.user_id ?? '',
    type: n.type as NotificationType,
    title: (n.title as MultilingualText) ?? { tr: '', en: '' },
    message: (n.message as MultilingualText) ?? { tr: '', en: '' },
    data: (n.data as Record<string, unknown>) ?? {},
    read: Boolean(n.read),
    readAt: n.read_at,
    createdAt: n.created_at ?? '',
    priority: (n.priority as 'high' | 'medium' | 'low') ?? 'medium',
  };
}

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const { kullanici, getToken } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!kullanici) {
      setNotifications([]);
      setLoading(false);
      return;
    }
    const token = await getToken();
    if (!token) {
      setNotifications([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setNotifications(data.data.map(mapRow));
      } else {
        setNotifications([]);
      }
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [kullanici, getToken]);

  useEffect(() => {
    load();
  }, [load]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = useCallback(
    async (notificationId: string) => {
      if (!kullanici) return;
      const token = await getToken();
      if (!token) return;
      try {
        const res = await fetch(`${API_BASE_URL}/api/notifications/${notificationId}/read`, {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          setNotifications((prev) =>
            prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
          );
        }
      } catch (err) {
        console.error('Bildirim okundu işaretleme hatası:', err);
      }
    },
    [kullanici, getToken]
  );

  const markAllAsRead = useCallback(async () => {
    if (!kullanici) return;
    const token = await getToken();
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/notifications/read-all`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      }
    } catch (err) {
      console.error('Tüm bildirimleri okundu işaretleme hatası:', err);
    }
  }, [kullanici, getToken]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
        refresh: load,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
