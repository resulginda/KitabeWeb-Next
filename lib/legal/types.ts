import type { Locale } from '@/lib/places';

export type LegalDoc = 'about' | 'privacy' | 'terms' | 'contact';

export type LegalSection = {
  title: string;
  paragraphs?: string[];
  list?: string[];
};

export type LegalPageContent = {
  title: string;
  metaDescription: string;
  sections: LegalSection[];
};

export type LegalContentMap = Record<Locale, LegalPageContent>;

export const LEGAL_DOCS: LegalDoc[] = ['about', 'privacy', 'terms', 'contact'];

export const LEGAL_DOC_LABELS: Record<Locale, Record<LegalDoc, string>> = {
  tr: { about: 'Hakkımızda', privacy: 'Gizlilik Politikası', terms: 'Kullanım Koşulları', contact: 'İletişim' },
  en: { about: 'About Us', privacy: 'Privacy Policy', terms: 'Terms of Use', contact: 'Contact' },
  ru: { about: 'О нас', privacy: 'Политика конфиденциальности', terms: 'Условия использования', contact: 'Контакты' },
  ar: { about: 'من نحن', privacy: 'سياسة الخصوصية', terms: 'شروط الاستخدام', contact: 'اتصل بنا' },
};

/** Eski Türkçe URL → yeni kanonik yol */
export const LEGACY_LEGAL_REDIRECTS: Record<string, string> = {
  '/hakkimizda': '/legal/tr/about',
  '/gizlilik-politikasi': '/legal/tr/privacy',
  '/kullanim-sartlari': '/legal/tr/terms',
  '/iletisim': '/legal/tr/contact',
};

export function legalPath(locale: Locale, doc: LegalDoc): string {
  return `/legal/${locale}/${doc}`;
}
