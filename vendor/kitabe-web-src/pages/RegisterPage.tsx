import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import './RegisterPage.css';

const RegisterPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
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
        navigate('/login');
        return;
      }
      if (result.success) {
        navigate('/');
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
    <div className="register-page">
      <div className="register-container">
        <h1>{t('register.title')}</h1>
        <form onSubmit={handleRegister} method="post" autoComplete="on">
          <input
            type="text"
            name="firstName"
            placeholder={t('register.firstNamePlaceholder')}
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            autoComplete="given-name"
            required
          />
          <input
            type="text"
            name="lastName"
            placeholder={t('register.lastNamePlaceholder')}
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            autoComplete="family-name"
            required
          />
          <input
            type="email"
            name="email"
            placeholder={t('register.emailPlaceholder')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
          <input
            type="password"
            name="password"
            placeholder={t('register.passwordPlaceholder')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            required
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder={t('register.confirmPasswordPlaceholder')}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            required
          />
          <label className="legal-checkbox">
            <input
              type="checkbox"
              checked={acceptLegal}
              onChange={(e) => setAcceptLegal(e.target.checked)}
            />
            <span>
              {t('register.acceptLegal')} <Link to="/kullanim-sartlari">{t('legal.terms')}</Link>
              {t('register.and')} <Link to="/gizlilik-politikasi">{t('legal.privacy')}</Link> {t('register.acceptLegalEnd')}
            </span>
          </label>
          {error && <div className="error-message">{error}</div>}
          <button type="submit" disabled={loading}>
            {loading ? t('register.registering') : t('common.register')}
          </button>
        </form>
        <p className="login-link">
          {t('register.alreadyHaveAccount')} <Link to="/login">{t('common.login')}</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
