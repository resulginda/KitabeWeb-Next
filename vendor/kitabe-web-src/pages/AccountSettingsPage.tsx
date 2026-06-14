import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import './AccountSettingsPage.css';

const AccountSettingsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { kullanici, updateUser, cikisYap, changePassword, deleteAccount } = useAuth();
  const { currentLanguage, setLanguage } = useLanguage();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (kullanici) {
      setFirstName(kullanici.isim || '');
      setLastName(kullanici.soyad || '');
    }
  }, [kullanici]);

  useEffect(() => {
    if (!successMessage) return;
    const timer = setTimeout(() => setSuccessMessage(''), 3000);
    return () => clearTimeout(timer);
  }, [successMessage]);

  const handleSaveProfile = async () => {
    if (!kullanici) return;
    if (!firstName.trim() || !lastName.trim()) {
      alert(t('account.missingFieldMessage', 'Lütfen ad ve soyad alanlarını doldurun.'));
      return;
    }
    setSaving(true);
    try {
      await updateUser(kullanici.id, {
        isim: firstName.trim(),
        soyad: lastName.trim(),
      });
      setSuccessMessage(t('account.profileUpdated') || 'Profil güncellendi');
    } catch (err) {
      console.error('Profile update error:', err);
      alert(t('account.updateError') || 'Güncelleme hatası');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!kullanici?.hasPassword) {
      alert(
        t(
          'account.noPasswordResetHint',
          'Şifre tanımlı değil. Şifrenizi belirlemek için "Şifremi unuttum" kullanın.'
        )
      );
      return;
    }
    if (!oldPassword || !newPassword || !confirmPassword) {
      alert(t('account.fillAllPassword', 'Lütfen tüm şifre alanlarını doldurun.'));
      return;
    }
    if (newPassword !== confirmPassword) {
      alert(t('account.passwordMismatch') || 'Şifreler eşleşmiyor');
      return;
    }
    if (newPassword.length < 6) {
      alert(t('account.passwordTooShort') || 'Şifre en az 6 karakter olmalı');
      return;
    }
    setSaving(true);
    try {
      const result = await changePassword(oldPassword, newPassword);
      if (result.success) {
        setSuccessMessage(result.msg || t('account.passwordUpdated') || 'Şifre güncellendi');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        alert(result.msg || t('account.passwordUpdateError') || 'Şifre güncelleme hatası');
      }
    } catch (err) {
      alert(t('account.passwordUpdateError') || 'Şifre güncelleme hatası');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!kullanici) return;
    if (!deletePassword) {
      alert(t('account.enterPasswordToDelete') || 'Şifrenizi girin');
      return;
    }
    if (!kullanici.hasPassword) {
      alert(
        t(
          'account.noPasswordDeleteHint',
          'Şifre tanımlı değil. Hesabınızı silebilmek için önce şifrenizi belirleyin.'
        )
      );
      return;
    }
    setDeleting(true);
    try {
      const result = await deleteAccount(deletePassword);
      if (result.success) {
        alert(t('account.accountDeletedMessage', 'Hesabınız başarıyla silindi.'));
        cikisYap();
        navigate('/');
        return;
      }
      alert(result.msg || t('account.deleteError') || 'Hesap silme hatası');
    } catch (err) {
      alert(t('account.deleteError') || 'Hesap silme hatası');
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (!kullanici) {
    return (
      <div className="account-settings-page">
        <div className="login-required">
          <p>{t('account.loginRequired') || 'Giriş yapmanız gerekiyor'}</p>
          <button onClick={() => navigate('/login')}>{t('common.login')}</button>
        </div>
      </div>
    );
  }

  return (
    <div className="account-settings-page">
      <header className="settings-header">
        <h1>{t('account.editAccount') || 'Hesap Bilgilerini Düzenle'}</h1>
      </header>

      <div className="settings-content">
        {successMessage ? (
          <section className="settings-section" style={{ borderLeft: '4px solid #34d399', background: '#d1fae5' }}>
            <p style={{ margin: 0, color: '#065f46', fontWeight: 600 }}>{successMessage}</p>
          </section>
        ) : null}
        <section className="settings-section">
          <h2>{t('account.profileInfo') || 'Profil Bilgileri'}</h2>
          <div className="form-group">
            <label>{t('account.firstName')}</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>{t('account.lastName')}</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>{t('account.email')}</label>
            <input type="email" value={kullanici.email} disabled />
          </div>
          <button onClick={handleSaveProfile} disabled={saving}>
            {saving ? t('common.loading') : t('common.save')}
          </button>
        </section>

        <section className="settings-section">
          <h2>{t('account.passwordUpdate') || 'Şifre Güncelleme'}</h2>
          <div className="form-group">
            <label>{t('account.oldPassword')}</label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>{t('account.newPassword')}</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>{t('account.confirmPassword')}</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <button onClick={handleUpdatePassword} disabled={saving}>
            {saving ? t('common.loading') : t('account.updatePassword')}
          </button>
        </section>

        <section className="settings-section">
          <h2>{t('common.language')}</h2>
          <div className="form-group">
            <select value={currentLanguage} onChange={(e) => setLanguage(e.target.value as 'tr' | 'en' | 'ru' | 'ar')}>
              <option value="tr">{t('language.turkish')}</option>
              <option value="en">{t('language.english')}</option>
              <option value="ru">{t('language.russian')}</option>
              <option value="ar">{t('language.arabic')}</option>
            </select>
          </div>
        </section>

        <section className="settings-section danger-zone">
          <h2>{t('account.dangerZone') || 'Tehlikeli Bölge'}</h2>
          <p>{t('account.deleteAccountWarning') || 'Hesabınızı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.'}</p>
          <button className="delete-btn" onClick={() => setShowDeleteModal(true)}>
            {t('account.deleteAccount') || 'Hesabımı Sil'}
          </button>
        </section>
      </div>

      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{t('account.deleteAccount') || 'Hesabımı Sil'}</h2>
            <p>{t('account.deleteAccountConfirm') || 'Bu işlem geri alınamaz. Hesabınız ve tüm verileriniz kalıcı olarak silinecektir.'}</p>
            <div className="form-group">
              <label>{t('account.enterPasswordToDelete') || 'Devam etmek için şifrenizi girin:'}</label>
              <input
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder={t('account.enterPassword') || 'Şifrenizi girin'}
              />
            </div>
            <div className="modal-actions">
              <button className="delete-btn" onClick={handleDeleteAccount} disabled={deleting}>
                {deleting ? t('common.loading') : t('common.delete')}
              </button>
              <button onClick={() => setShowDeleteModal(false)}>
                {t('common.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountSettingsPage;
