import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import './UserManagementPage.css';

const UserManagementPage = () => {
  const { t } = useTranslation();
  const { kullanici, users, changeRole, updateUser, deleteUser, resetPassword } = useAuth();
  const [roleModal, setRoleModal] = useState<{ visible: boolean; user: any }>({ visible: false, user: null });
  const [editModal, setEditModal] = useState<{ visible: boolean; user: any; isim: string; soyad: string; email: string; newPassword: string }>({
    visible: false,
    user: null,
    isim: '',
    soyad: '',
    email: '',
    newPassword: '',
  });

  if (!kullanici || kullanici.rol !== 'admin') {
    return (
      <div className="user-management-page">
        <div className="access-denied">
          <p>{t('adminPanel.accessDenied') || 'Bu sayfaya erişim yetkiniz yok'}</p>
        </div>
      </div>
    );
  }

  const handleChangeRole = async (userId: string, newRole: string) => {
    await changeRole(userId, newRole);
    setRoleModal({ visible: false, user: null });
  };

  const handleEdit = (user: any) => {
    setEditModal({
      visible: true,
      user,
      isim: user.isim || '',
      soyad: user.soyad || '',
      email: user.email || '',
      newPassword: '',
    });
  };

  const handleSaveEdit = async () => {
    if (!editModal.user) return;
    try {
      await updateUser(editModal.user.id, {
        isim: editModal.isim,
        soyad: editModal.soyad,
        email: editModal.email,
      });
      
      if (editModal.newPassword && editModal.newPassword.trim() !== '') {
        await resetPassword(editModal.email);
        alert(t('userManagement.passwordResetSent') || 'Şifre sıfırlama email\'i gönderildi');
      }
      
      setEditModal({ visible: false, user: null, isim: '', soyad: '', email: '', newPassword: '' });
    } catch (error: any) {
      console.error('Kullanıcı güncellenirken hata:', error);
      alert(t('userManagement.updateError') || 'Kullanıcı güncellenirken bir hata oluştu');
    }
  };

  const handleDelete = (user: any) => {
    if (window.confirm(t('userManagement.deleteConfirm') || `${user.isim} - ${user.email} silinsin mi?`)) {
      deleteUser(user.id);
    }
  };

  const getRoleColor = (rol: string) => {
    switch (rol) {
      case 'admin': return '#f59e42';
      case 'editor': return '#6074f8';
      case 'user': return '#5ab596';
      default: return '#999';
    }
  };

  return (
    <div className="user-management-page">
      <header className="management-header">
        <h1>{t('account.userManagement') || 'Kullanıcı Yönetimi'}</h1>
      </header>

      <div className="users-list">
        {users.map((user) => (
          <div key={user.id} className="user-item">
            <div className="user-info">
              <h3>{user.isim} {user.soyad}</h3>
              <p className="user-email">{user.email}</p>
              <span className="role-badge" style={{ backgroundColor: getRoleColor(user.rol) }}>
                {user.rol === 'admin' 
                  ? (t('userManagement.role.admin') || 'Admin')
                  : user.rol === 'editor' 
                  ? (t('userManagement.role.editor') || 'Editör')
                  : (t('userManagement.role.user') || 'Kullanıcı')}
              </span>
            </div>
            {user.rol !== 'admin' && (
              <div className="user-actions">
                <button onClick={() => setRoleModal({ visible: true, user })}>
                  {t('userManagement.changeRole') || 'Rol Değiştir'}
                </button>
                <button onClick={() => handleEdit(user)}>
                  {t('common.edit')}
                </button>
                <button className="delete-btn" onClick={() => handleDelete(user)}>
                  {t('common.delete')}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {roleModal.visible && (
        <div className="modal-overlay" onClick={() => setRoleModal({ visible: false, user: null })}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{t('userManagement.selectRole') || 'Rol Seç'}</h2>
            <div className="role-options">
              <button
                onClick={() => handleChangeRole(roleModal.user.id, 'user')}
                className={roleModal.user.rol === 'user' ? 'active' : ''}
              >
                {t('userManagement.role.user') || 'Kullanıcı'}
              </button>
              <button
                onClick={() => handleChangeRole(roleModal.user.id, 'editor')}
                className={roleModal.user.rol === 'editor' ? 'active' : ''}
              >
                {t('userManagement.role.editor') || 'Editör'}
              </button>
            </div>
            <button onClick={() => setRoleModal({ visible: false, user: null })}>
              {t('common.cancel')}
            </button>
          </div>
        </div>
      )}

      {editModal.visible && (
        <div className="modal-overlay" onClick={() => setEditModal({ visible: false, user: null, isim: '', soyad: '', email: '', newPassword: '' })}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{t('userManagement.editUser') || 'Kullanıcıyı Düzenle'}</h2>
            <div className="edit-form">
              <input
                type="text"
                placeholder={t('account.firstName')}
                value={editModal.isim}
                onChange={(e) => setEditModal({ ...editModal, isim: e.target.value })}
              />
              <input
                type="text"
                placeholder={t('account.lastName')}
                value={editModal.soyad}
                onChange={(e) => setEditModal({ ...editModal, soyad: e.target.value })}
              />
              <input
                type="email"
                placeholder={t('account.email')}
                value={editModal.email}
                onChange={(e) => setEditModal({ ...editModal, email: e.target.value })}
              />
              <input
                type="password"
                placeholder={t('userManagement.newPassword') || 'Yeni Şifre (isteğe bağlı)'}
                value={editModal.newPassword}
                onChange={(e) => setEditModal({ ...editModal, newPassword: e.target.value })}
              />
              {editModal.newPassword && editModal.newPassword.trim() !== '' && (
                <p className="password-hint">
                  {t('userManagement.passwordResetHint') || 'Not: Şifre değiştirmek için kullanıcıya email gönderilecektir.'}
                </p>
              )}
            </div>
            <div className="modal-actions">
              <button onClick={handleSaveEdit}>{t('common.save')}</button>
              <button onClick={() => setEditModal({ visible: false, user: null, isim: '', soyad: '', email: '', newPassword: '' })}>
                {t('common.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagementPage;

