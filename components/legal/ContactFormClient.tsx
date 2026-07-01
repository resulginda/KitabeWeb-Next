'use client';

import { useState } from 'react';
import type { Locale } from '@/lib/places';
import { CONTACT_UI } from '@/lib/legal';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.kitabe.org';

export function ContactFormClient({ locale }: { locale: Locale }) {
  const t = CONTACT_UI[locale] || CONTACT_UI.en;
  const [form, setForm] = useState({
    isim: '',
    soyisim: '',
    email: '',
    subject: 'general',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'err'>('idle');

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.isim.trim() || !form.soyisim.trim() || !form.email.includes('@') || !form.message.trim()) {
      setStatus('err');
      return;
    }
    setStatus('sending');
    try {
      const res = await fetch(`${API_BASE}/api/contact-forms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isim: form.isim.trim(),
          soyisim: form.soyisim.trim(),
          mail: form.email.trim(),
          konu: form.subject,
          mesaj: form.message.trim(),
        }),
      });
      if (!res.ok) throw new Error('fail');
      setStatus('ok');
      setForm({ isim: '', soyisim: '', email: '', subject: 'general', message: '' });
    } catch {
      setStatus('err');
    }
  };

  return (
    <form className="legal-contact-form" onSubmit={onSubmit}>
      <div className="legal-contact-row">
        <label>
          {t.firstName}
          <input
            type="text"
            name="isim"
            required
            value={form.isim}
            onChange={(e) => setForm((f) => ({ ...f, isim: e.target.value }))}
          />
        </label>
        <label>
          {t.lastName}
          <input
            type="text"
            name="soyisim"
            required
            value={form.soyisim}
            onChange={(e) => setForm((f) => ({ ...f, soyisim: e.target.value }))}
          />
        </label>
      </div>
      <label>
        {t.email}
        <input
          type="email"
          name="email"
          required
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
        />
      </label>
      <label>
        {t.subject}
        <select
          name="subject"
          value={form.subject}
          onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
        >
          <option value="general">{t.subjects.general}</option>
          <option value="bug">{t.subjects.bug}</option>
          <option value="partnership">{t.subjects.partnership}</option>
          <option value="other">{t.subjects.other}</option>
        </select>
      </label>
      <label>
        {t.message}
        <textarea
          name="message"
          required
          rows={6}
          value={form.message}
          onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
        />
      </label>
      <button type="submit" className="legal-contact-submit" disabled={status === 'sending'}>
        {status === 'sending' ? t.sending : t.send}
      </button>
      {status === 'ok' && <p className="legal-contact-msg legal-contact-msg--ok">{t.success}</p>}
      {status === 'err' && <p className="legal-contact-msg legal-contact-msg--err">{t.error}</p>}
      <p className="legal-contact-email">
        <a href="mailto:info@kitabe.org">info@kitabe.org</a>
      </p>
    </form>
  );
}
