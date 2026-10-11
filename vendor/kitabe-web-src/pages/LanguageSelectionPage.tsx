import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../contexts/LanguageContext';
import { LANGUAGE_OPTIONS as languages, type Language } from '../config/languages';
import { PageShell, PageSection } from '../components/PageShell';

export default function LanguageSelectionPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentLanguage, setLanguage } = useLanguage();
  const [selectedLang, setSelectedLang] = useState(currentLanguage);

  const handleSelectLanguage = async (langCode: Language) => {
    setSelectedLang(langCode);
    setLanguage(langCode);
    navigate('/home', { replace: true });
  };

  return (
    <PageShell
      title={t('language.selectLanguage')}
      subtitle={`${t('common.welcome')} ${t('common.selectLanguage')}`}
      backTo="/account"
      className="account-page"
    >
      <div className="account-container">
        <PageSection>
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
            onClick={() => handleSelectLanguage(selectedLang || 'tr')}
          >
            {t('common.done')}
          </button>
        </PageSection>
      </div>
    </PageShell>
  );
}
