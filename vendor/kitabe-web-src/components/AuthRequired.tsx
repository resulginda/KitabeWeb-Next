import type { ReactNode } from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';

type AuthRequiredProps = {
  children: ReactNode;
};

export function AuthRequired({ children }: AuthRequiredProps) {
  const { t } = useTranslation();
  const { kullanici, yukleniyor } = useAuth();
  const location = useLocation();

  if (yukleniyor) {
    return (
      <div className="kb-auth-gate">
        <p>{t('common.loading')}</p>
      </div>
    );
  }

  if (!kullanici) {
    return (
      <div className="kb-auth-gate">
        <div className="kb-auth-gate-card animate-fade-in">
          <p className="kb-meta">{t('navigation.loginRegister', { defaultValue: 'Giriş gerekli' })}</p>
          <h1>{t('auth.gateTitle', { defaultValue: 'Bu özellik için giriş yapın' })}</h1>
          <p>
            {t('auth.gateMessage', {
              defaultValue: 'Rota planlama ve yakınımdakiler özelliklerini kullanmak için hesabınıza giriş yapmanız gerekir.',
            })}
          </p>
          <div className="kb-auth-gate-actions">
            <Link to="/login" state={{ from: location.pathname }} className="btn btn-primary">
              {t('common.login')}
            </Link>
            <Link to="/register" state={{ from: location.pathname }} className="btn btn-secondary">
              {t('common.register', { defaultValue: 'Kayıt ol' })}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export function AuthRedirect({ children }: AuthRequiredProps) {
  const { kullanici, yukleniyor } = useAuth();
  const location = useLocation();

  if (yukleniyor) return null;
  if (!kullanici) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  return <>{children}</>;
}
