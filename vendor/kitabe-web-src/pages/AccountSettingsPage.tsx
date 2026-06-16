import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { PageShell, PageSection, PageLoginRequired } from '../components/PageShell';

type SettingsSection = 'profile' | 'password' | 'language' | 'danger';

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
  const [activeSection, setActiveSection] = useState<SettingsSection>('profile');

  const profileRef = useRef<HTMLElement>(null);
  const passwordRef = useRef<HTMLElement>(null);
  const languageRef = useRef<HTMLElement>(null);
  const dangerRef = useRef<HTMLElement>(null);

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

  const scrollToSection = (section: SettingsSection) => {
    setActiveSection(section);
    const refMap = {
      profile: profileRef,
      password: passwordRef,
      language: languageRef,
      danger: dangerRef,
    };
    refMap[section].current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

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
      setSuccessMessage(t('account.profileUpdated', 'Profil güncellendi'));
    } catch (err) {
      console.error('Profile update error:', err);
      alert(t('account.updateError', 'Güncelleme hatası'));
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
      alert(t('account.passwordMismatch', 'Şifreler eşleşmiyor'));
      return;
    }
    if (newPassword.length < 6) {
      alert(t('account.passwordTooShort', 'Şifre en az 6 karakter olmalı'));
      return;
    }
    setSaving(true);
    try {
      const result = await changePassword(oldPassword, newPassword);
      if (result.success) {
        setSuccessMessage(result.msg || t('account.passwordUpdated', 'Şifre güncellendi'));
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        alert(result.msg || t('account.passwordUpdateError', 'Şifre güncelleme hatası'));
      }
    } catch {
      alert(t('account.passwordUpdateError', 'Şifre güncelleme hatası'));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!kullanici) return;
    if (!deletePassword) {
      alert(t('account.enterPasswordToDelete', 'Şifrenizi girin'));
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
      alert(result.msg || t('account.deleteError', 'Hesap silme hatası'));
    } catch {
      alert(t('account.deleteError', 'Hesap silme hatası'));
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (!kullanici) {
    return <PageLoginRequired message={t('account.loginRequired', 'Giriş yapmanız gerekiyor')} />;
  }

  const initials =
    `${kullanici.isim?.charAt(0) ?? ''}${kullanici.soyad?.charAt(0) ?? ''}`.toUpperCase() || 'K';

  const navItems: { id: SettingsSection; icon: string; label: string; danger?: boolean }[] = [
    { id: 'profile', icon: 'person', label: t('account.profileInfo', 'Profil Bilgileri') },
    { id: 'password', icon: 'lock', label: t('account.passwordUpdate', 'Şifre') },
    { id: 'language', icon: 'language', label: t('common.language', 'Dil') },
    { id: 'danger', icon: 'warning_amber', label: t('account.dangerZone', 'Tehlikeli Bölge'), danger: true },
  ];

  return (
    <PageShell
      title={t('account.editAccount', 'Hesap Bilgilerini Düzenle')}
      subtitle={t('account.settingsSubtitle', 'Profil, güvenlik ve tercihleriniz')}
      backTo="/account"
      shellClassName="kb-page-wide"
    >
      {successMessage ? <div className="kb-page-alert is-success">{successMessage}</div> : null}

      <div className="kb-settings-user-strip">
        <div className="kb-member-avatar">{initials}</div>
        <div>
          <strong>
            {kullanici.isim} {kullanici.soyad}
          </strong>
          <span>{kullanici.email}</span>
        </div>
      </div>

      <div className="kb-settings-layout">
        <nav className="kb-settings-nav" aria-label={t('account.settingsNav', 'Ayarlar menüsü')}>
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`kb-settings-nav-btn ${activeSection === item.id ? 'is-active' : ''} ${item.danger ? 'is-danger' : ''}`}
              onClick={() => scrollToSection(item.id)}
            >
              <span className="material-icons">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="kb-settings-panels">
          <PageSection className="kb-settings-panel" ref={profileRef}>
            <h2 className="kb-page-section-title">
              <span className="material-icons">person</span>
              {t('account.profileInfo', 'Profil Bilgileri')}
            </h2>
            <div className="kb-form-row">
              <div className="kb-form-field">
                <label htmlFor="settings-first-name">{t('account.firstName', 'Ad')}</label>
                <input
                  id="settings-first-name"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  autoComplete="given-name"
                />
              </div>
              <div className="kb-form-field">
                <label htmlFor="settings-last-name">{t('account.lastName', 'Soyad')}</label>
                <input
                  id="settings-last-name"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  autoComplete="family-name"
                />
              </div>
            </div>
            <div className="kb-form-field">
              <label htmlFor="settings-email">{t('account.email', 'E-posta')}</label>
              <input id="settings-email" type="email" value={kullanici.email} disabled />
              <p className="kb-form-field-hint">
                {t('account.emailReadonly', 'E-posta adresi değiştirilemez')}
              </p>
            </div>
            <button type="button" className="kb-btn-save" onClick={handleSaveProfile} disabled={saving}>
              <span className="material-icons">save</span>
              {saving ? t('common.loading') : t('common.save')}
            </button>
          </PageSection>

          <PageSection className="kb-settings-panel" ref={passwordRef}>
            <h2 className="kb-page-section-title">
              <span className="material-icons">lock</span>
              {t('account.passwordUpdate', 'Şifre Güncelleme')}
            </h2>
            <div className="kb-form-field">
              <label htmlFor="settings-old-pw">{t('account.oldPassword', 'Eski Şifre')}</label>
              <input
                id="settings-old-pw"
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>
            <div className="kb-form-row">
              <div className="kb-form-field">
                <label htmlFor="settings-new-pw">{t('account.newPassword', 'Yeni Şifre')}</label>
                <input
                  id="settings-new-pw"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                />
              </div>
              <div className="kb-form-field">
                <label htmlFor="settings-confirm-pw">{t('account.confirmPassword', 'Yeni Şifre (Tekrar)')}</label>
                <input
                  id="settings-confirm-pw"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                />
              </div>
            </div>
            <button type="button" className="kb-btn-save" onClick={handleUpdatePassword} disabled={saving}>
              <span className="material-icons">lock_reset</span>
              {saving ? t('common.loading') : t('account.updatePassword', 'Şifremi Güncelle')}
            </button>
          </PageSection>

          <PageSection className="kb-settings-panel" ref={languageRef}>
            <h2 className="kb-page-section-title">
              <span className="material-icons">language</span>
              {t('common.language', 'Dil')}
            </h2>
            <div className="kb-form-field">
              <label htmlFor="settings-lang">{t('language.selectLanguage', 'Dil Seçin')}</label>
              <select
                id="settings-lang"
                value={currentLanguage}
                onChange={(e) => setLanguage(e.target.value as 'tr' | 'en' | 'ru' | 'ar')}
              >
                <option value="tr">{t('language.turkish')}</option>
                <option value="en">{t('language.english')}</option>
                <option value="ru">{t('language.russian')}</option>
                <option value="ar">{t('language.arabic')}</option>
              </select>
            </div>
          </PageSection>

          <PageSection className="kb-settings-panel" ref={dangerRef} danger>
            <h2 className="kb-page-section-title">
              <span className="material-icons">warning_amber</span>
              {t('account.dangerZone', 'Tehlikeli Bölge')}
            </h2>
            <p>{t('account.deleteAccountWarning', 'Bu işlem geri alınamaz.')}</p>
            <button type="button" className="kb-danger-btn" onClick={() => setShowDeleteModal(true)}>
              <span className="material-icons">delete_forever</span>
              {t('account.deleteAccount', 'Hesabımı Sil')}
            </button>
          </PageSection>
        </div>
      </div>

      {showDeleteModal && (
        <div className="kb-settings-modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="kb-settings-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <h2>{t('account.deleteAccount', 'Hesabımı Sil')}</h2>
            <p>
              {t(
                'account.deleteAccountConfirm',
                'Bu işlem geri alınamaz. Hesabınız ve tüm verileriniz kalıcı olarak silinecektir.'
              )}
            </p>
            <div className="kb-form-field">
              <label htmlFor="delete-pw">{t('account.enterPasswordToDelete', 'Şifrenizi girin')}</label>
              <input
                id="delete-pw"
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder={t('account.enterPassword', 'Şifrenizi girin')}
                autoComplete="current-password"
              />
            </div>
            <div className="kb-settings-modal-actions">
              <button type="button" className="btn-secondary" onClick={() => setShowDeleteModal(false)}>
                {t('common.cancel')}
              </button>
              <button type="button" className="kb-danger-btn" onClick={handleDeleteAccount} disabled={deleting}>
                {deleting ? t('common.loading') : t('common.delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
};

export default AccountSettingsPage;
