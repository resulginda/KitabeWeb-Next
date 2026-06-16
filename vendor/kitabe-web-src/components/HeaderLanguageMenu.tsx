import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage, type Language } from '../contexts/LanguageContext';
import { LANGUAGE_OPTIONS, getLanguageOption } from '../config/languages';
import './HeaderLanguageMenu.css';

export function HeaderLanguageMenu() {
  const { t } = useTranslation();
  const { currentLanguage, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const current = getLanguageOption(currentLanguage);

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

  const pick = (code: Language) => {
    setLanguage(code, { manual: true });
    setOpen(false);
  };

  return (
    <div className="header-lang" ref={rootRef}>
      <button
        type="button"
        className="header-lang-trigger"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
        title={t('common.language')}
      >
        <span className="header-lang-flag" aria-hidden>
          {current.flag}
        </span>
        <span className="header-lang-chevron" aria-hidden>
          {open ? '▴' : '▾'}
        </span>
      </button>

      {open && (
        <ul className="header-lang-menu" role="listbox" aria-label={t('common.language')}>
          {LANGUAGE_OPTIONS.map((lang) => (
            <li key={lang.code} role="option" aria-selected={currentLanguage === lang.code}>
              <button
                type="button"
                className={`header-lang-item ${currentLanguage === lang.code ? 'is-active' : ''}`}
                onClick={() => pick(lang.code)}
              >
                <span className="header-lang-flag">{lang.flag}</span>
                <span className="header-lang-name">{lang.name}</span>
                {currentLanguage === lang.code && <span className="header-lang-check">✓</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
