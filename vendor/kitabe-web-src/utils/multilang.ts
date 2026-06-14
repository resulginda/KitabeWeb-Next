export type Language = 'tr' | 'en' | 'ru' | 'ar';

export const getLocalizedText = (
  field: string | { tr?: string; en?: string; ru?: string; ar?: string } | undefined,
  language: Language = 'tr'
): string => {
  if (!field) return '';
  if (typeof field === 'string') return field;
  if (typeof field === 'object') {
    return field[language] || field.tr || '';
  }
  return '';
};

export const getLocalizedArray = (
  field: string[] | { tr?: string[]; en?: string[]; ru?: string[]; ar?: string[] } | any[] | undefined,
  language: Language = 'tr'
): string[] => {
  if (!field) return [];
  
  if (typeof field === 'object' && !Array.isArray(field) && (field.tr !== undefined || field.en !== undefined || field.ru !== undefined || field.ar !== undefined)) {
    let array = field[language];
    if (!array || !Array.isArray(array) || array.length === 0) {
      array = field.tr;
    }
    if (!array || !Array.isArray(array) || array.length === 0) {
      array = field.en || field.ru || field.ar || [];
    }
    return Array.isArray(array) ? array.map(item => typeof item === 'string' ? item : getLocalizedText(item, language)) : [];
  }
  
  if (Array.isArray(field)) {
    return field.map(item => {
      if (typeof item === 'string') return item;
      if (typeof item === 'object' && item !== null) {
        return getLocalizedText(item, language);
      }
      return String(item || '');
    });
  }
  
  return [];
};

