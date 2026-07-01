import type { LegalDoc, LegalPageContent } from './types';
import type { Locale } from '@/lib/places';
import { ABOUT_CONTENT } from './content/about';
import { PRIVACY_CONTENT } from './content/privacy';
import { TERMS_CONTENT } from './content/terms';

const MAP: Record<Exclude<LegalDoc, 'contact'>, typeof ABOUT_CONTENT> = {
  about: ABOUT_CONTENT,
  privacy: PRIVACY_CONTENT,
  terms: TERMS_CONTENT,
};

export const CONTACT_UI: Record<
  Locale,
  {
    title: string;
    metaDescription: string;
    intro: string;
    firstName: string;
    lastName: string;
    email: string;
    subject: string;
    message: string;
    send: string;
    sending: string;
    success: string;
    error: string;
    subjects: { general: string; bug: string; partnership: string; other: string };
  }
> = {
  tr: {
    title: 'İletişim',
    metaDescription: 'Kitabe ile iletişime geçin. Sorularınız, önerileriniz ve iş birlikleri için info@kitabe.org.',
    intro: 'Sorularınız, geri bildirimleriniz veya iş birliği teklifleriniz için formu doldurun veya doğrudan info@kitabe.org adresine yazın.',
    firstName: 'Ad',
    lastName: 'Soyad',
    email: 'E-posta',
    subject: 'Konu',
    message: 'Mesajınız',
    send: 'Gönder',
    sending: 'Gönderiliyor…',
    success: 'Mesajınız alındı. En kısa sürede dönüş yapacağız.',
    error: 'Gönderilemedi. Lütfen tekrar deneyin veya info@kitabe.org yazın.',
    subjects: { general: 'Genel', bug: 'Hata bildirimi', partnership: 'İş birliği', other: 'Diğer' },
  },
  en: {
    title: 'Contact',
    metaDescription: 'Contact Kitabe for questions, feedback and partnerships. info@kitabe.org',
    intro: 'Fill in the form below or email us at info@kitabe.org.',
    firstName: 'First name',
    lastName: 'Last name',
    email: 'Email',
    subject: 'Subject',
    message: 'Message',
    send: 'Send',
    sending: 'Sending…',
    success: 'Thank you! We will reply as soon as possible.',
    error: 'Could not send. Please try again or email info@kitabe.org.',
    subjects: { general: 'General', bug: 'Bug report', partnership: 'Partnership', other: 'Other' },
  },
  ru: {
    title: 'Контакты',
    metaDescription: 'Связаться с Kitabe: вопросы, отзывы, сотрудничество. info@kitabe.org',
    intro: 'Заполните форму или напишите на info@kitabe.org.',
    firstName: 'Имя',
    lastName: 'Фамилия',
    email: 'Эл. почта',
    subject: 'Тема',
    message: 'Сообщение',
    send: 'Отправить',
    sending: 'Отправка…',
    success: 'Сообщение получено. Мы ответим в ближайшее время.',
    error: 'Не удалось отправить. Напишите на info@kitabe.org.',
    subjects: { general: 'Общее', bug: 'Ошибка', partnership: 'Сотрудничество', other: 'Другое' },
  },
  ar: {
    title: 'اتصل بنا',
    metaDescription: 'تواصل مع Kitabe للأسئلة والملاحظات والشراكات. info@kitabe.org',
    intro: 'املأ النموذج أو راسلنا على info@kitabe.org.',
    firstName: 'الاسم',
    lastName: 'اللقب',
    email: 'البريد الإلكتروني',
    subject: 'الموضوع',
    message: 'الرسالة',
    send: 'إرسال',
    sending: 'جارٍ الإرسال…',
    success: 'تم استلام رسالتك. سنرد في أقرب وقت.',
    error: 'تعذّر الإرسال. راسل info@kitabe.org.',
    subjects: { general: 'عام', bug: 'بلاغ خطأ', partnership: 'شراكة', other: 'أخرى' },
  },
};

export function getLegalPageContent(doc: LegalDoc, locale: Locale): LegalPageContent | null {
  if (doc === 'contact') {
    const ui = CONTACT_UI[locale] || CONTACT_UI.en;
    return {
      title: ui.title,
      metaDescription: ui.metaDescription,
      sections: [{ title: '', paragraphs: [ui.intro] }],
    };
  }
  const content = MAP[doc][locale] || MAP[doc].en;
  return content;
}
