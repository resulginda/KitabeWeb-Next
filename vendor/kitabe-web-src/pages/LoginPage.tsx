import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import './LoginPage.css';

const LoginPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
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
        navigate('/');
        return;
      }
      const msg = result.msg || t('login.error');
      setError(msg);
      if (typeof msg === 'string' && (msg.includes('Hesap bulunamadı') || msg.toLowerCase().includes('şifre tanımlı'))) {
        navigate('/register', { state: { initialEmail: email.trim() } });
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
    <div className="login-page">
      <div className="login-container">
        <h1>{t('login.title')}</h1>
        <form onSubmit={handleLogin} method="post" autoComplete="on">
          <input
            type="email"
            name="email"
            placeholder={t('login.emailPlaceholder')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
            required
          />
          <input
            type="password"
            name="password"
            placeholder={t('login.passwordPlaceholder')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
          {error && <div className="error-message">{error}</div>}
          <button type="submit" disabled={loading}>
            {loading ? t('login.loggingIn') : t('common.login')}
          </button>
          <button
            type="button"
            className="reset-btn"
            onClick={() => setShowResetModal(true)}
          >
            {t('login.forgotPassword')}
          </button>
          <button
            type="button"
            className="reset-btn"
            onClick={() => setShowLegalModal(true)}
          >
            {t('legal.legalDocuments')}
          </button>
        </form>
        <p className="register-link">
          {t('login.noAccount')} <Link to="/register">{t('common.register')}</Link>
        </p>
      </div>

      {showResetModal && (
        <div className="modal-overlay" onClick={() => setShowResetModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{t('login.resetPasswordTitle')}</h2>
            <p>{t('login.resetPasswordDesc')}</p>
            <input
              type="email"
              name="resetEmail"
              placeholder={t('login.resetEmailPlaceholder')}
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              autoComplete="email"
            />
            {error && <div className="error-message">{error}</div>}
            <div className="modal-buttons">
              <button onClick={handleResetPassword} disabled={loading}>
                {loading ? t('login.sending') : t('login.send')}
              </button>
              <button onClick={() => setShowResetModal(false)}>
                {t('common.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {showLegalModal && (
        <div className="modal-overlay" onClick={() => setShowLegalModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
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
              <button onClick={() => setShowLegalModal(false)}>{t('common.close')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
