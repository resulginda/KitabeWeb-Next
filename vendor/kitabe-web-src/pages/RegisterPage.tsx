import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import './RegisterPage.css';

const RegisterPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string; initialEmail?: string } | null)?.from || '/home';
  const { kayitOl } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [acceptLegal, setAcceptLegal] = useState(false);

  useEffect(() => {
    const initialEmail = (location.state as { initialEmail?: string } | null)?.initialEmail;
    if (typeof initialEmail === 'string' && initialEmail.trim()) {
      setEmail(initialEmail.trim());
    }
  }, [location.state]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError(t('register.passwordMismatch') || 'Şifreler eşleşmiyor');
      return;
    }

    if (password.length < 6) {
      setError(t('register.passwordTooShort') || 'Şifre en az 6 karakter olmalı');
      return;
    }

    if (!acceptLegal) {
      setError(t('register.acceptLegalRequired') || 'Yasal belgeleri kabul etmelisiniz');
      return;
    }

    setLoading(true);
    try {
      const result = await kayitOl(email, password, {
        isim: firstName,
        soyad: lastName,
      });
      if (result.success && result.requiresEmailVerification) {
        alert(result.msg || 'Kayıt başarılı. E-postanızı doğrulayın.');
        navigate('/login', { state: { from } });
        return;
      }
      if (result.success) {
        navigate(from, { replace: true });
        return;
      }
      setError(result.msg || t('register.registerError'));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('register.registerError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page kb-login-page">
      <aside className="kb-login-visual" aria-hidden>
        <div className="kb-login-visual-content">
          <p className="kb-meta" style={{ color: 'var(--accent)' }}>
            Kitabe
          </p>
          <h2>{t('register.visualTitle', { defaultValue: 'Türkiye kültür mirasını keşfedin' })}</h2>
          <p>
            {t('register.visualSubtitle', {
              defaultValue: 'Ücretsiz hesap oluşturun; favorilerinizi kaydedin ve rotalar planlayın.',
            })}
          </p>
        </div>
      </aside>

      <div className="kb-login-form-panel">
        <div className="kb-login-card">
          <h1>{t('register.title')}</h1>
          <p className="kb-lead">{t('register.subtitle', { defaultValue: 'Yeni hesap oluşturun' })}</p>

          <form onSubmit={handleRegister} method="post" autoComplete="on">
            <div className="kb-form-group">
              <input
                type="text"
                name="firstName"
                placeholder={t('register.firstNamePlaceholder')}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                autoComplete="given-name"
                required
              />
            </div>
            <div className="kb-form-group">
              <input
                type="text"
                name="lastName"
                placeholder={t('register.lastNamePlaceholder')}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                autoComplete="family-name"
                required
              />
            </div>
            <div className="kb-form-group">
              <input
                type="email"
                name="email"
                placeholder={t('register.emailPlaceholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
            <div className="kb-form-group">
              <input
                type="password"
                name="password"
                placeholder={t('register.passwordPlaceholder')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
            </div>
            <div className="kb-form-group">
              <input
                type="password"
                name="confirmPassword"
                placeholder={t('register.confirmPasswordPlaceholder')}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
            </div>
            <label className="legal-checkbox">
              <input type="checkbox" checked={acceptLegal} onChange={(e) => setAcceptLegal(e.target.checked)} />
              <span>
                {t('register.acceptLegal')} <Link to="/kullanim-sartlari">{t('legal.terms')}</Link>
                {t('register.and')} <Link to="/gizlilik-politikasi">{t('legal.privacy')}</Link> {t('register.acceptLegalEnd')}
              </span>
            </label>
            {error && <div className="kb-error">{error}</div>}
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? t('register.registering') : t('common.register')}
            </button>
          </form>
          <p className="login-link">
            {t('register.alreadyHaveAccount')}{' '}
            <Link to="/login" state={{ from }}>
              {t('common.login')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
