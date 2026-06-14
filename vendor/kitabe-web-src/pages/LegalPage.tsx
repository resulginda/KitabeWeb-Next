import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './LegalPage.css';

type LegalDocumentType = 'kvkk' | 'consent' | 'terms' | 'disclaimer';

const LegalPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const documentType: LegalDocumentType = (searchParams.get('type') as LegalDocumentType) || 'kvkk';

  const getTitle = () => {
    switch (documentType) {
      case 'kvkk':
        return t('legal.kvkkTitle');
      case 'consent':
        return t('legal.consentTitle');
      case 'terms':
        return t('legal.termsTitle');
      case 'disclaimer':
        return t('legal.disclaimerTitle');
      default:
        return t('legal.kvkkTitle');
    }
  };

  const getContent = () => {
    switch (documentType) {
      case 'kvkk':
        return t('legal.kvkkContent');
      case 'consent':
        return t('legal.consentContent');
      case 'terms':
        return t('legal.termsContent');
      case 'disclaimer':
        return t('legal.disclaimerContent');
      default:
        return t('legal.kvkkContent');
    }
  };

  return (
    <div className="legal-page">
      <div className="legal-header">
        <button className="back-btn" onClick={() => navigate(-1)}>← {t('common.back')}</button>
        <h1>{getTitle()}</h1>
      </div>
      <div className="legal-content">
        <div className="legal-text">
          {getContent().split('\n').map((line, idx) => (
            <p key={idx}>{line || '\u00A0'}</p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LegalPage;

