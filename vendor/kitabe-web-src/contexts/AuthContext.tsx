import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { API_BASE_URL } from '../config/api';
import { getStoredToken, setStoredToken, clearStoredToken } from '../utils/authToken';

export type Kullanici = {
  id: string;
  isim: string;
  soyad: string;
  email: string;
  rol: string;
  kayitTarihi: number;
  hasPassword?: boolean;
};

type AuthContextTipi = {
  kullanici: Kullanici | null;
  getToken: () => Promise<string | null>;
  girisYap: (email: string, sifre: string) => Promise<{ success: boolean; msg?: string }>;
  cikisYap: () => void;
  yukleniyor: boolean;
  kayitOl: (email: string, sifre: string, extra: { isim?: string; soyad?: string }) => Promise<{ success: boolean; msg?: string; requiresEmailVerification?: boolean }>;
  users: Kullanici[];
  refreshUsers: () => Promise<void>;
  changeRole: (userId: string, yeniRol: string) => Promise<void>;
  updateUser: (userId: string, patch: { isim?: string; soyad?: string; email?: string; sifre?: string }) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; msg?: string }>;
  resetPasswordWithToken: (token: string, newPassword: string) => Promise<{ success: boolean; msg?: string }>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<{ success: boolean; msg?: string }>;
  deleteAccount: (password: string) => Promise<{ success: boolean; msg?: string }>;
};

const AuthContext = createContext<AuthContextTipi | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [kullanici, setKullanici] = useState<Kullanici | null>(null);
  const [yukleniyor, setYukleniyor] = useState<boolean>(true);
  const [usersState, setUsersState] = useState<Kullanici[]>([]);

  const getToken = useCallback(async (): Promise<string | null> => {
    return getStoredToken();
  }, []);

  const fetchUsers = useCallback(async () => {
    if (kullanici?.rol !== 'admin') {
      setUsersState([]);
      return;
    }
    try {
      const token = await getToken();
      if (!token) return;
      const res = await fetch(`${API_BASE_URL}/api/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const text = await res.text();
      if (!text?.trim().startsWith('{')) {
        setUsersState([]);
        return;
      }
      const json = JSON.parse(text);
      if (json.success && Array.isArray(json.data)) {
        const list = json.data.map((u: { id: string; isim?: string; soyad?: string; email?: string; rol?: string; kayitTarihi?: number }) => ({
          id: u.id,
          isim: u.isim ?? '',
          soyad: u.soyad ?? '',
          email: u.email ?? '',
          rol: u.rol ?? 'user',
          kayitTarihi: u.kayitTarihi ?? 0,
        }));
        setUsersState(list);
      } else {
        setUsersState([]);
      }
    } catch {
      setUsersState([]);
    }
  }, [kullanici?.rol, getToken]);

  useEffect(() => {
    const initFromToken = async () => {
      try {
        const token = getStoredToken();
        if (!token) {
          setYukleniyor(false);
          return;
        }
        const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        if (json.success && json.user) {
          const u = json.user;
          setKullanici({
            id: u.id,
            isim: u.isim ?? '',
            soyad: u.soyad ?? '',
            email: u.email ?? '',
            rol: u.rol ?? 'user',
            kayitTarihi: u.kayitTarihi ? new Date(u.kayitTarihi).getTime() : Date.now(),
            hasPassword: u.hasPassword,
          });
        } else {
          clearStoredToken();
        }
      } catch {
        clearStoredToken();
      } finally {
        setYukleniyor(false);
      }
    };
    initFromToken();
  }, []);

  useEffect(() => {
    if (kullanici?.rol !== 'admin') {
      setUsersState([]);
      return;
    }
    fetchUsers();
  }, [kullanici?.rol, fetchUsers]);

  const girisYap = async (email: string, sifre: string): Promise<{ success: boolean; msg?: string }> => {
    const trimmedEmail = (email ?? '').trim();
    const trimmedPassword = (sifre ?? '').trim();
    if (!trimmedEmail) return { success: false, msg: 'Lütfen e-posta adresinizi girin.' };
    if (!trimmedPassword) return { success: false, msg: 'Lütfen şifrenizi girin.' };
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) return { success: false, msg: 'Geçerli bir e-posta adresi girin.' };

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmedEmail, password: trimmedPassword }),
      });
      const apiJson = await res.json();

      if (apiJson.success) {
        setStoredToken(apiJson.token);
        const u = apiJson.user;
        setKullanici({
          id: u.id,
          isim: u.isim ?? '',
          soyad: u.soyad ?? '',
          email: u.email ?? '',
          rol: u.rol ?? 'user',
          kayitTarihi: u.kayitTarihi ? new Date(u.kayitTarihi).getTime() : Date.now(),
          hasPassword: u.hasPassword ?? true,
        });
        return { success: true };
      }

      if (apiJson?.requiresEmailVerification) {
        return { success: false, msg: apiJson.message ?? 'E-posta adresinizi doğrulamanız gerekiyor.' };
      }
      return { success: false, msg: apiJson?.message ?? 'E-posta veya şifre hatalı.' };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'İnternet bağlantınızı kontrol edin.';
      return { success: false, msg };
    }
  };

  const cikisYap = () => {
    clearStoredToken();
    setKullanici(null);
  };

  const kayitOl = async (
    email: string,
    sifre: string,
    extra: { isim?: string; soyad?: string }
  ): Promise<{ success: boolean; msg?: string; requiresEmailVerification?: boolean }> => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password: sifre,
          isim: extra?.isim ?? '',
          soyad: extra?.soyad ?? '',
        }),
      });
      const json = await res.json();
      if (!json.success) {
        return { success: false, msg: json.message ?? 'Kayıt olunamadı!' };
      }
      if (json.requiresEmailVerification) {
        return {
          success: true,
          msg: json.message ?? 'Kayıt başarılı. Lütfen e-posta adresinize gelen bağlantıyı 1 saat içinde onaylayın.',
          requiresEmailVerification: true,
        };
      }
      if (json.token && json.user) {
        setStoredToken(json.token);
        const u = json.user;
        setKullanici({
          id: u.id,
          isim: u.isim ?? '',
          soyad: u.soyad ?? '',
          email: u.email ?? '',
          rol: u.rol ?? 'user',
          kayitTarihi: Date.now(),
          hasPassword: true,
        });
      }
      return { success: true, msg: json.message };
    } catch (e: unknown) {
      return { success: false, msg: e instanceof Error ? e.message : 'Kayıt olunamadı!' };
    }
  };

  const changeRole = async (userId: string, yeniRol: string) => {
    const token = await getToken();
    if (!token) throw new Error('Oturum bulunamadı');
    const res = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ rol: yeniRol }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message ?? 'Rol güncellenemedi');
    await fetchUsers();
  };

  const updateUser = async (
    userId: string,
    patch: { isim?: string; soyad?: string; email?: string; sifre?: string }
  ) => {
    const token = await getToken();
    if (!token) return;
    if (userId === kullanici?.id) {
      const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ isim: patch.isim, soyad: patch.soyad }),
      });
      const json = await res.json();
      if (json.success && json.user && kullanici) {
        setKullanici({
          ...kullanici,
          isim: json.user.isim ?? kullanici.isim,
          soyad: json.user.soyad ?? kullanici.soyad,
        });
      }
      return;
    }
    if (kullanici?.rol !== 'admin') return;
    const res = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        isim: patch.isim,
        soyad: patch.soyad,
        email: patch.email,
        sifre: patch.sifre,
      }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message ?? 'Kullanıcı güncellenemedi');
    await fetchUsers();
  };

  const deleteUser = async (userId: string) => {
    const token = await getToken();
    if (!token) throw new Error('Oturum bulunamadı');
    const res = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message ?? 'Kullanıcı silinemedi');
    await fetchUsers();
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; msg?: string }> => {
    const trimmed = (email ?? '').trim();
    if (!trimmed) return { success: false, msg: 'E-posta adresi gerekli.' };
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed }),
      });
      const text = await res.text();
      let json: { success?: boolean; message?: string; error?: string } | null = null;
      try {
        json = text?.trim().startsWith('{') ? JSON.parse(text) : null;
      } catch {
        return { success: false, msg: 'Sunucu beklenmeyen yanıt verdi.' };
      }
      if (json?.success) return { success: true, msg: json.message ?? 'Sıfırlama bağlantısı e-postanıza gönderildi.' };
      return { success: false, msg: (json?.message ?? json?.error) ?? 'İşlem yapılamadı.' };
    } catch (e: unknown) {
      return { success: false, msg: e instanceof Error ? e.message : 'İnternet bağlantınızı kontrol edin.' };
    }
  };

  const resetPasswordWithToken = async (
    token: string,
    newPassword: string
  ): Promise<{ success: boolean; msg?: string }> => {
    const t = (token ?? '').trim();
    const p = (newPassword ?? '').trim();
    if (!t) return { success: false, msg: 'Geçersiz veya süresi dolmuş link.' };
    if (p.length < 6) return { success: false, msg: 'Yeni şifre en az 6 karakter olmalıdır.' };
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: t, newPassword: p }),
      });
      const text = await res.text();
      let json: { success?: boolean; message?: string; error?: string } | null = null;
      try {
        json = text?.trim().startsWith('{') ? JSON.parse(text) : null;
      } catch {
        return { success: false, msg: 'Sunucu beklenmeyen yanıt verdi.' };
      }
if (json?.success) return { success: true, msg: json.message ?? 'Şifreniz güncellendi.' };
    return { success: false, msg: (json?.message ?? json?.error) ?? 'İşlem yapılamadı.' };
  } catch (e: unknown) {
    return { success: false, msg: e instanceof Error ? e.message : 'İnternet bağlantınızı kontrol edin.' };
  }
};

  const changePassword = async (
    oldPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; msg?: string }> => {
    const token = await getToken();
    if (!token) return { success: false, msg: 'Oturum bulunamadı.' };
    if ((newPassword ?? '').length < 6) return { success: false, msg: 'Yeni şifre en az 6 karakter olmalıdır.' };
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ oldPassword, newPassword }),
      });
      const text = await res.text();
      let json: { success?: boolean; message?: string } | null = null;
      try {
        json = text?.trim().startsWith('{') ? JSON.parse(text) : null;
      } catch {
        return { success: false, msg: 'Sunucu yanıtı işlenemedi.' };
      }
      if (json?.success) return { success: true, msg: json.message ?? 'Şifre güncellendi.' };
      return { success: false, msg: json?.message ?? 'Şifre güncellenemedi.' };
    } catch (e: unknown) {
      return { success: false, msg: e instanceof Error ? e.message : 'İnternet bağlantınızı kontrol edin.' };
    }
  };

  const deleteAccount = async (password: string): Promise<{ success: boolean; msg?: string }> => {
    const token = await getToken();
    if (!token) return { success: false, msg: 'Oturum bulunamadı.' };
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ password }),
      });
      const text = await res.text();
      let json: { success?: boolean; message?: string } | null = null;
      try {
        json = text?.trim().startsWith('{') ? JSON.parse(text) : null;
      } catch {
        return { success: false, msg: 'Sunucu yanıtı işlenemedi.' };
      }
      if (json?.success) {
        clearStoredToken();
        setKullanici(null);
        return { success: true };
      }
      return { success: false, msg: json?.message ?? 'Hesap silinemedi.' };
    } catch (e: unknown) {
      return { success: false, msg: e instanceof Error ? e.message : 'İşlem başarısız.' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        kullanici,
        getToken,
        girisYap,
        cikisYap,
        yukleniyor,
        kayitOl,
        users: usersState,
        refreshUsers: fetchUsers,
        changeRole,
        updateUser,
        deleteUser,
        resetPassword,
        resetPasswordWithToken,
        changePassword,
        deleteAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
