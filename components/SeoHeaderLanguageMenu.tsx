'use client';

import { useEffect, useRef, useState } from 'react';
import { HUB_HEADER_COPY } from '@/lib/hubHeaderCopy';
import { mapSeoPathToLocaleQuick } from '@/lib/seoLocaleSwitch';
import { LOCALES, type Locale } from '@/lib/places';

const LANGUAGE_NAMES: Record<Locale, string> = {
  tr: 'Türkçe',
  en: 'English',
  ru: 'Русский',
  ar: 'العربية',
};

/** SEO içerik sayfaları — bayrak emoji yerine kod + doğrudan locale URL yönlendirmesi */
export function SeoHeaderLanguageMenu({
  locale,
  pathname,
}: {
  locale: Locale;
  pathname: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const copy = HUB_HEADER_COPY[locale];

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const pick = async (target: Locale) => {
    setOpen(false);
    if (target === locale) return;

    try {
      const res = await fetch(
        `/api/locale-path?locale=${encodeURIComponent(target)}&path=${encodeURIComponent(pathname)}`
      );
      if (res.ok) {
        const data = (await res.json()) as { path?: string };
        if (data.path && data.path !== pathname) {
          window.location.assign(data.path);
          return;
        }
      }
    } catch {
      /* istemci yedeği */
    }

    const fallback = mapSeoPathToLocaleQuick(pathname, target);
    if (fallback && fallback !== pathname) {
      window.location.assign(fallback);
    }
  };

  return (
    <div className="header-lang seo-header-lang" ref={rootRef}>
      <button
        type="button"
        className="header-lang-trigger"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
        title={copy.language}
      >
        <span className="header-lang-badge" aria-hidden>
          {locale.toUpperCase()}
        </span>
        <span className="header-lang-chevron" aria-hidden>
          {open ? '▴' : '▾'}
        </span>
      </button>

      {open && (
        <ul className="header-lang-menu" role="listbox" aria-label={copy.language}>
          {LOCALES.map((code) => (
            <li key={code} role="option" aria-selected={locale === code}>
              <button
                type="button"
                className={`header-lang-item${locale === code ? ' is-active' : ''}`}
                onClick={() => void pick(code)}
              >
                <span className="header-lang-badge header-lang-badge--menu">{code.toUpperCase()}</span>
                <span className="header-lang-name">{LANGUAGE_NAMES[code]}</span>
                {locale === code && <span className="header-lang-check">✓</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
