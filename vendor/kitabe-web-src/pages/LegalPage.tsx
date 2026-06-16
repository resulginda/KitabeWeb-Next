import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PageShell } from '../components/PageShell';
import './LegalPage.css';

type LegalDocumentType = 'kvkk' | 'consent' | 'terms' | 'disclaimer';

const LegalPage = () => {
  const { t } = useTranslation();
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
    <PageShell
      title={getTitle()}
      backTo="/home"
      className="legal-page"
    >
      <div className="legal-content">
        <div className="legal-text">
          {getContent().split('\n').map((line, idx) => (
            <p key={idx}>{line || '\u00A0'}</p>
          ))}
        </div>
      </div>
    </PageShell>
  );
};

export default LegalPage;
