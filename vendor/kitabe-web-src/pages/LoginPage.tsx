import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import './LoginPage.css';

const LoginPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from || '/home';
  const { girisYap, resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [showLegalModal, setShowLegalModal] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await girisYap(email, password);
      if (result.success) {
        navigate(from, { replace: true });
        return;
      }
      const msg = result.msg || t('login.error');
      setError(msg);
      if (typeof msg === 'string' && (msg.includes('Hesap bulunamadı') || msg.toLowerCase().includes('şifre tanımlı'))) {
        navigate('/register', { state: { initialEmail: email.trim(), from } });
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('login.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!resetEmail) {
      setError(t('login.resetEmailRequired'));
      return;
    }
    setError('');
    setLoading(true);
    try {
      const result = await resetPassword(resetEmail);
      if (result.success) {
        alert(result.msg || t('login.resetPasswordSent'));
        setShowResetModal(false);
        setResetEmail('');
      } else {
        setError(result.msg || 'Şifre sıfırlama hatası');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Şifre sıfırlama hatası');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="kb-login-page">
      <aside className="kb-login-visual" aria-hidden>
        <div className="kb-login-visual-content">
          <p className="kb-meta" style={{ color: 'var(--accent)' }}>
            Kitabe
          </p>
          <h2>{t('login.visualTitle', { defaultValue: 'Favorilerinizi kaydedin, rotalarınızı planlayın' })}</h2>
          <p>
            {t('login.visualSubtitle', {
              defaultValue: 'Giriş yaparak favori yerlerinizi senkronize edin ve kişisel seyahat rotaları oluşturun.',
            })}
          </p>
        </div>
      </aside>

      <div className="kb-login-form-panel">
        <div className="kb-login-card">
          <h1>{t('login.title')}</h1>
          <p className="kb-lead">{t('login.subtitle', { defaultValue: 'Hesabınıza giriş yapın' })}</p>

          <form onSubmit={handleLogin} method="post" autoComplete="on">
            <div className="kb-form-group">
              <label htmlFor="login-email">{t('login.emailPlaceholder')}</label>
              <input
                id="login-email"
                type="email"
                name="email"
                placeholder={t('login.emailPlaceholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                required
              />
            </div>
            <div className="kb-form-group">
              <label htmlFor="login-password">{t('login.passwordPlaceholder')}</label>
              <input
                id="login-password"
                type="password"
                name="password"
                placeholder={t('login.passwordPlaceholder')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>
            {error && <div className="kb-error">{error}</div>}
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? t('login.loggingIn') : t('common.login')}
            </button>
            <button type="button" className="btn btn-ghost btn-sm login-link-btn" onClick={() => setShowResetModal(true)}>
              {t('login.forgotPassword')}
            </button>
            <button type="button" className="btn btn-ghost btn-sm login-link-btn" onClick={() => setShowLegalModal(true)}>
              {t('legal.legalDocuments')}
            </button>
          </form>

          <p className="login-footer-text">
            {t('login.noAccount')}{' '}
            <Link to="/register" state={{ from }}>
              {t('common.register')}
            </Link>
          </p>
        </div>
      </div>

      {showResetModal && (
        <div className="modal-overlay" onClick={() => setShowResetModal(false)}>
          <div className="modal-content kb-panel" onClick={(e) => e.stopPropagation()}>
            <h2>{t('login.resetPasswordTitle')}</h2>
            <p>{t('login.resetPasswordDesc')}</p>
            <div className="kb-form-group">
              <input
                type="email"
                name="resetEmail"
                placeholder={t('login.resetEmailPlaceholder')}
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
            {error && <div className="kb-error">{error}</div>}
            <div className="modal-buttons">
              <button type="button" className="btn btn-primary" onClick={handleResetPassword} disabled={loading}>
                {loading ? t('login.sending') : t('login.send')}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowResetModal(false)}>
                {t('common.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {showLegalModal && (
        <div className="modal-overlay" onClick={() => setShowLegalModal(false)}>
          <div className="modal-content kb-panel legal-modal" onClick={(e) => e.stopPropagation()}>
            <h2>{t('legal.legalDocuments')}</h2>
            <h3>{t('legal.kvkkTitle')}</h3>
            <p>{t('legal.kvkkContent')}</p>
            <h3>{t('legal.consentTitle')}</h3>
            <p>{t('legal.consentContent')}</p>
            <h3>{t('legal.termsTitle')}</h3>
            <p>{t('legal.termsContent')}</p>
            <h3>{t('legal.disclaimerTitle')}</h3>
            <p>{t('legal.disclaimerContent')}</p>
            <div className="modal-buttons">
              <button type="button" className="btn btn-secondary" onClick={() => setShowLegalModal(false)}>
                {t('common.close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
