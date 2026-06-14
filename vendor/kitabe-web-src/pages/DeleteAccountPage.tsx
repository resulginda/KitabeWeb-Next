import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import './DeleteAccountPage.css';

const DeleteAccountPage = () => {
  const { kullanici, cikisYap, deleteAccount } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [deleting, setDeleting] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const getRequiredConfirmText = () => {
    const lang = localStorage.getItem('kitabe_language') || 'tr';
    const confirmTexts: { [key: string]: string } = {
      tr: 'SİL',
      en: 'DELETE',
      ru: 'УДАЛИТЬ',
      ar: 'حذف'
    };
    return confirmTexts[lang] || 'SİL';
  };

  const requiredConfirmText = getRequiredConfirmText();

  const handleDeleteAccount = async () => {
    if (!kullanici) {
      setError(t('account.mustLogin') || 'Hesap silmek için giriş yapmanız gerekiyor.');
      return;
    }
    if (!password) {
      setError(t('account.enterPasswordToDelete') || 'Devam etmek için şifrenizi girin.');
      return;
    }
    if (confirmText !== requiredConfirmText) {
      setError(t('account.confirmTextRequired') || `Lütfen "${requiredConfirmText}" yazarak onaylayın.`);
      return;
    }
    if (!window.confirm(t('account.deleteAccountConfirm') || 'Bu işlem geri alınamaz. Hesabınız ve tüm verileriniz kalıcı olarak silinecektir.')) {
      return;
    }

    setDeleting(true);
    setError(null);
    try {
      const result = await deleteAccount(password);
      if (result.success) {
        cikisYap();
        navigate('/', { replace: true });
        alert(t('account.deleteSuccess') || 'Hesabınız başarıyla silindi.');
      } else {
        setError(result.msg || t('account.deleteError') || 'Hesap silme hatası');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('account.deleteError') || 'Hesap silme hatası');
    } finally {
      setDeleting(false);
    }
  };

  if (!kullanici) {
    return (
      <div className="delete-account-page">
        <Helmet>
          <title>{t('account.deleteAccount') || 'Hesap Silme'} - KitabeApp</title>
          <meta name="description" content={t('account.deleteAccountDescription') || 'Hesabınızı silmek için giriş yapmanız gerekiyor.'} />
        </Helmet>
        <div className="delete-account-container">
          <h1>{t('account.deleteAccount') || 'Hesap Silme'}</h1>
          <p>{t('account.mustLogin') || 'Hesap silmek için giriş yapmanız gerekiyor.'}</p>
          <button onClick={() => navigate('/login')} className="login-btn">
            {t('auth.login') || 'Giriş Yap'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="delete-account-page">
      <Helmet>
        <title>{t('account.deleteAccount') || 'Hesap Silme'} - KitabeApp</title>
        <meta name="description" content={t('account.deleteAccountDescription') || 'Hesabınızı ve tüm verilerinizi kalıcı olarak silin.'} />
      </Helmet>
      <div className="delete-account-container">
        <h1>{t('account.deleteAccount') || 'Hesabımı Sil'}</h1>
        <div className="delete-account-warning">
          <p className="warning-text">
            {t('account.deleteAccountWarning') || 'Hesabınızı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.'}
          </p>
          <p className="confirm-text">
            {t('account.deleteAccountConfirm') || 'Bu işlem geri alınamaz. Hesabınız ve tüm verileriniz kalıcı olarak silinecektir.'}
          </p>
          <ul className="delete-list">
            <li>{t('account.deleteData1') || 'Tüm kişisel bilgileriniz silinecek'}</li>
            <li>{t('account.deleteData2') || 'Favorileriniz silinecek'}</li>
            <li>{t('account.deleteData3') || 'Yer önerileriniz silinecek'}</li>
            <li>{t('account.deleteData4') || 'Tüm verileriniz kalıcı olarak silinecek'}</li>
          </ul>
        </div>

        <div className="delete-account-form">
          <label>
            {t('account.enterPasswordToDelete') || 'Devam etmek için şifrenizi girin:'}
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('account.enterPassword') || 'Şifreniz'}
              disabled={deleting}
            />
          </label>
          <label>
            {t('account.typeConfirm') || `Onaylamak için "${requiredConfirmText}" yazın:`}
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={requiredConfirmText}
              disabled={deleting}
            />
          </label>

          {error && <div className="error-message">{error}</div>}

          <div className="delete-account-actions">
            <button
              className="cancel-btn"
              onClick={() => navigate('/account-settings')}
              disabled={deleting}
            >
              {t('common.cancel') || 'İptal'}
            </button>
            <button
              className="delete-btn"
              onClick={handleDeleteAccount}
              disabled={deleting || confirmText !== requiredConfirmText || !password}
            >
              {deleting ? (t('account.deleting') || 'Siliniyor...') : (t('account.deleteAccount') || 'Hesabımı Sil')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteAccountPage;
