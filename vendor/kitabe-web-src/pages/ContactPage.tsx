import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { API_BASE_URL } from '../config/api';
import { getStoredToken } from '../utils/authToken';
import { useAuth } from '../contexts/AuthContext';
import { readEnv } from '../utils/env';
import { readViteEnv } from '../utils/env.vite';
import './ContactPage.css';

const GOOGLE_ADS_ID = 'AW-856201742';
const CONTACT_CONVERSION_LABEL =
  readEnv('NEXT_PUBLIC_GOOGLE_ADS_CONTACT_CONVERSION_LABEL') ||
  readViteEnv('VITE_GOOGLE_ADS_CONTACT_CONVERSION_LABEL');

function trackContactFormConversion() {
  const gtag = (window as Window & { gtag?: (...args: unknown[]) => void }).gtag;
  if (!gtag || !CONTACT_CONVERSION_LABEL) return;
  gtag('event', 'conversion', {
    send_to: `${GOOGLE_ADS_ID}/${CONTACT_CONVERSION_LABEL}`,
  });
}

const ContactPage = () => {
  const { t } = useTranslation();
  const { kullanici } = useAuth();
  const [formData, setFormData] = useState({
    isim: '',
    soyisim: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!kullanici) return;
    setFormData((prev) => ({
      ...prev,
      isim: kullanici.isim || prev.isim,
      soyisim: kullanici.soyad || prev.soyisim,
      email: kullanici.email || prev.email,
    }));
  }, [kullanici]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!formData.isim.trim() || !formData.soyisim.trim() || !formData.email.trim() || !formData.subject || !formData.message.trim()) {
      setError(t('contact.error') || 'Lütfen tüm alanları doldurun.');
      return;
    }
    if (!formData.email.includes('@')) {
      setError(t('contact.validation.emailInvalidMessage') || 'Geçerli bir e-posta girin.');
      return;
    }
    setSubmitting(true);
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      const tok = getStoredToken();
      if (tok) headers.Authorization = `Bearer ${tok}`;
      const res = await fetch(`${API_BASE_URL}/api/contact-forms`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          isim: formData.isim.trim(),
          soyisim: formData.soyisim.trim(),
          mail: formData.email.trim(),
          konu: formData.subject.trim(),
          mesaj: formData.message.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || t('contact.error') || 'Gönderilemedi');
        return;
      }
      setSubmitted(true);
      trackContactFormConversion();
      setFormData({
        isim: kullanici?.isim || '',
        soyisim: kullanici?.soyad || '',
        email: kullanici?.email || '',
        subject: '',
        message: '',
      });
      setTimeout(() => setSubmitted(false), 4000);
    } catch {
      setError(t('contact.error') || 'Gönderilemedi');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>{t('contact.title') || 'İletişim - Kitabe'} | Kitabe</title>
        <meta name="description" content={t('contact.metaDescription') || 'Kitabe ile iletişime geçin. Sorularınız, önerileriniz ve geri bildirimleriniz için bizimle iletişime geçebilirsiniz.'} />
        <meta property="og:title" content={t('contact.title') || 'İletişim - Kitabe'} />
        <meta property="og:description" content={t('contact.metaDescription') || 'Kitabe ile iletişime geçin.'} />
      </Helmet>
      <div className="contact-page">
        <div className="contact-container">
          <h1>{t('contact.title') || 'İletişim'}</h1>
          
          <div className="contact-content">
            <section className="contact-info">
              <h2>{t('contact.getInTouch') || 'Bize Ulaşın'}</h2>
              <p>
                {t('contact.description') || 'Sorularınız, önerileriniz, geri bildirimleriniz veya destek talepleriniz için bizimle iletişime geçebilirsiniz. Size en kısa sürede dönüş yapacağız.'}
              </p>
              
              <div className="contact-details">
                <div className="contact-item">
                  <strong>{t('contact.email') || 'E-posta:'}</strong>
                  <a href="mailto:info@kitabe.org">info@kitabe.org</a>
                </div>
                <div className="contact-item">
                  <strong>{t('contact.address') || 'Adres:'}</strong>
                  <span>Talas/Kayseri, Türkiye</span>
                </div>
                <div className="contact-item">
                  <strong>{t('contact.responseTime') || 'Yanıt Süresi:'}</strong>
                  <span>{t('contact.responseTimeValue') || '24-48 saat içinde'}</span>
                </div>
              </div>
            </section>

            <section className="contact-form-section">
              <h2>{t('contact.sendMessage') || 'Mesaj Gönder'}</h2>
              {submitted ? (
                <div className="success-message">
                  {t('contact.successMessage') || 'Mesajınız başarıyla gönderildi! En kısa sürede size dönüş yapacağız.'}
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="contact-form">
                  {error && <div className="error-message" style={{ color: '#c62828', marginBottom: 12 }}>{error}</div>}
                  <div className="form-group">
                    <label htmlFor="isim">{t('contact.name') || 'Ad'}</label>
                    <input
                      type="text"
                      id="isim"
                      value={formData.isim}
                      onChange={(e) => setFormData({ ...formData, isim: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="soyisim">{t('contact.surname') || 'Soyad'}</label>
                    <input
                      type="text"
                      id="soyisim"
                      value={formData.soyisim}
                      onChange={(e) => setFormData({ ...formData, soyisim: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="email">{t('contact.email') || 'E-posta'}</label>
                    <input
                      type="email"
                      id="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="subject">{t('contact.subject') || 'Konu'}</label>
                    <select
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      required
                    >
                      <option value="">{t('contact.subjectPlaceholder') || 'Konu seçiniz'}</option>
                      <option value="öneri">{t('contact.subjectOptions.suggestion')}</option>
                      <option value="şikayet">{t('contact.subjectOptions.complaint')}</option>
                      <option value="soru">{t('contact.subjectOptions.question')}</option>
                      <option value="diğer">{t('contact.subjectOptions.other')}</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="message">{t('contact.message') || 'Mesaj'}</label>
                    <textarea
                      id="message"
                      rows={6}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required
                    />
                  </div>
                  
                  <button type="submit" className="submit-btn" disabled={submitting}>
                    {submitting ? '…' : t('contact.send') || 'Gönder'}
                  </button>
                </form>
              )}
            </section>
          </div>
        </div>
      </div>
    </>
  );
};

export default ContactPage;

