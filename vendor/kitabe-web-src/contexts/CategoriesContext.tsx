import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { API_BASE_URL } from '../config/api';
import { useLanguage } from './LanguageContext';
import { getLocalizedText } from '../utils/multilang';

export interface CategoryOption {
  value: string;
  icon: string;
  color: string;
  name?: string | { tr?: string; en?: string; ru?: string; ar?: string };
  subCategories?: Array<{
    id: string;
    name?: string | { tr?: string; en?: string; ru?: string; ar?: string };
  }>;
}

interface CategoriesContextType {
  categories: CategoryOption[];
  loading: boolean;
  error: string | null;
}

const CategoriesContext = createContext<CategoriesContextType | undefined>(undefined);

const FALLBACK: CategoryOption[] = [
  { value: 'Doğal Alan', icon: 'landscape', color: '#5ab596', name: 'Doğal Alan' },
  { value: 'Antik Çağ', icon: 'history-edu', color: '#d1a34e', name: 'Antik Çağ' },
  { value: 'Müze', icon: 'museum', color: '#c98546', name: 'Müze' },
  { value: 'Anıt', icon: 'park', color: '#8d63c9', name: 'Anıt' },
  { value: 'Cami', icon: 'mosque', color: '#82acd9', name: 'Cami' },
  { value: 'Kale', icon: 'fort', color: '#7e6e4a', name: 'Kale' },
  { value: 'Saray', icon: 'account-balance', color: '#c0907b', name: 'Saray' },
  { value: 'Modern', icon: 'apartment', color: '#ba79b0', name: 'Modern' },
  { value: 'UNESCO', icon: 'public', color: '#50b557', name: 'UNESCO' },
];

export const CategoriesProvider = ({ children }: { children: ReactNode }) => {
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentLanguage } = useLanguage();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch(`${API_BASE_URL}/api/categories`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (data.success && Array.isArray(data.data)) {
          const list: CategoryOption[] = data.data.map(
            (row: { id?: string; value?: string; icon?: string; color?: string; name?: unknown; subCategories?: Array<{ id?: string; name?: unknown }> }) => {
              const nameRaw = row.name ?? row.value ?? row.id;
              const localizedName = getLocalizedText(
                nameRaw as Parameters<typeof getLocalizedText>[0],
                currentLanguage
              );
              const localizedSubs = Array.isArray(row.subCategories)
                ? row.subCategories
                    .filter((s) => s && s.id)
                    .map((s) => ({
                      id: String(s.id),
                      name: getLocalizedText(
                        (s.name ?? s.id) as Parameters<typeof getLocalizedText>[0],
                        currentLanguage
                      ) || String(s.id),
                    }))
                : [];
              return {
                value: row.value || row.id || '',
                icon: row.icon || 'category',
                color: row.color || '#666666',
                name: localizedName,
                subCategories: localizedSubs,
              };
            }
          );
          setCategories(list);
          setError(null);
        } else {
          setError(data.message || 'Kategoriler alınamadı');
          setCategories(FALLBACK);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message);
          setCategories(FALLBACK);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [currentLanguage]);

  return (
    <CategoriesContext.Provider value={{ categories, loading, error }}>
      {children}
    </CategoriesContext.Provider>
  );
};

export const useCategories = () => {
  const context = useContext(CategoriesContext);
  if (!context) {
    return { categories: FALLBACK, loading: false, error: null };
  }
  return context;
};
