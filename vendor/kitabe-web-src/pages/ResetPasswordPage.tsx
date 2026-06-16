import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { PageShell } from '../components/PageShell';
import './LoginPage.css';

const ResetPasswordPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const { resetPasswordWithToken } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Geçersiz veya eksik sıfırlama bağlantısı.');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (newPassword.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Şifreler eşleşmiyor.');
      return;
    }
    setLoading(true);
    try {
      const result = await resetPasswordWithToken(token, newPassword);
      if (result.success) {
        setSuccess(true);
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(result.msg || 'Şifre güncellenemedi.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <PageShell
        title="Şifre Güncellendi"
        backTo="/login"
        className="login-page"
      >
        <div className="login-container">
          <p>Yeni şifrenizle giriş yapabilirsiniz. Giriş sayfasına yönlendiriliyorsunuz...</p>
          <Link to="/login">Giriş sayfasına git</Link>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell
      title={t('login.resetPasswordTitle') || 'Yeni Şifre Belirle'}
      backTo="/login"
      className="login-page"
    >
      <div className="login-container">
        {!token ? (
          <p className="error-message">{error}</p>
        ) : (
          <form onSubmit={handleSubmit}>
            <input
              type="password"
              placeholder="Yeni şifre (en az 6 karakter)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              minLength={6}
              required
            />
            <input
              type="password"
              placeholder="Yeni şifreyi tekrar girin"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              minLength={6}
              required
            />
            {error && <div className="error-message">{error}</div>}
            <button type="submit" disabled={loading}>
              {loading ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}
            </button>
          </form>
        )}
        <p className="register-link">
          <Link to="/login">{t('common.login')}</Link>
        </p>
      </div>
    </PageShell>
  );
};

export default ResetPasswordPage;
