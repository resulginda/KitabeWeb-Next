import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../contexts/LanguageContext';

const languages = [
  { code: 'tr' as const, name: 'Türkçe', flag: '🇹🇷' },
  { code: 'en' as const, name: 'English', flag: '🇬🇧' },
  { code: 'ru' as const, name: 'Русский', flag: '🇷🇺' },
  { code: 'ar' as const, name: 'العربية', flag: '🇸🇦' },
];

export default function LanguageSelectionPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentLanguage, setLanguage } = useLanguage();
  const [selectedLang, setSelectedLang] = useState(currentLanguage);

  const handleSelectLanguage = async (langCode: typeof languages[0]['code']) => {
    setSelectedLang(langCode);
    setLanguage(langCode);
    navigate('/home', { replace: true });
  };

  return (
    <div className="account-page">
      <div className="account-container">
        <h1>{t('language.selectLanguage')}</h1>
        <p>{t('common.welcome')} {t('common.selectLanguage')}</p>
        <div className="account-menu">
          {languages.map((lang) => (
            <button
              key={lang.code}
              className="menu-item"
              onClick={() => handleSelectLanguage(lang.code)}
              style={selectedLang === lang.code ? { border: '2px solid var(--primary)' } : undefined}
            >
              <span className="menu-icon">{lang.flag}</span>
              <span>{lang.name}</span>
            </button>
          ))}
        </div>
        <button
          className="btn btn-primary"
          onClick={() => handleSelectLanguage((selectedLang || 'tr') as typeof languages[0]['code'])}
        >
          {t('common.done')}
        </button>
      </div>
    </div>
  );
}

