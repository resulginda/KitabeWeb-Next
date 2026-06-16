import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { PageShell, PageSection } from '../components/PageShell';
import './PrivacyPolicyPage.css';

const PrivacyPolicyPage = () => {
  const { t } = useTranslation();

  return (
    <>
      <Helmet>
        <title>{t('privacy.title') || 'Gizlilik Politikası - Kitabe'} | Kitabe</title>
        <meta name="description" content={t('privacy.metaDescription') || 'Kitabe gizlilik politikası. Kişisel verilerinizin nasıl korunduğunu öğrenin.'} />
        <meta property="og:title" content={t('privacy.title') || 'Gizlilik Politikası - Kitabe'} />
        <meta property="og:description" content={t('privacy.metaDescription') || 'Kitabe gizlilik politikası.'} />
      </Helmet>
      <PageShell
        title={t('privacy.title') || 'Gizlilik Politikası'}
        backTo="/home"
        className="privacy-page"
      >
        <div className="privacy-container">
          <div className="privacy-content">
            <p className="last-updated">
              {t('privacy.lastUpdated') || 'Son Güncelleme:'} 2026
            </p>

            <PageSection title={`1. ${t('privacy.dataController') || 'Veri Sorumlusu'}`}>
              <p>
                {t('privacy.dataControllerContent') || '6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) uyarınca, kişisel verileriniz aşağıdaki veri sorumlusu tarafından işlenmektedir:'}
              </p>
              <p>
                <strong>{t('privacy.controllerName') || 'Veri Sorumlusu:'}</strong> Resul GINDA<br />
                <strong>{t('privacy.address') || 'Adres:'}</strong> Talas/Kayseri, Türkiye<br />
                <strong>{t('privacy.email') || 'E-posta:'}</strong> info@kitabe.org
              </p>
            </PageSection>

            <PageSection title={`2. ${t('privacy.processedData') || 'İşlenen Kişisel Veriler'}`}>
              <p>
                {t('privacy.processedDataContent') || 'Uygulamamızı kullanırken aşağıdaki kişisel verileriniz işlenmektedir:'}
              </p>
              <ul>
                <li>{t('privacy.data1') || 'Kimlik Bilgileri: Ad, soyad'}</li>
                <li>{t('privacy.data2') || 'İletişim Bilgileri: E-posta adresi'}</li>
                <li>{t('privacy.data3') || 'Kullanıcı İşlem Bilgileri: Favoriler, öneriler, rota bilgileri'}</li>
                <li>{t('privacy.data4') || 'Konum Bilgileri: İzin verdiğiniz takdirde konum bilgileriniz'}</li>
                <li>{t('privacy.data5') || 'Teknik Bilgiler: Cihaz bilgileri, IP adresi, çerez bilgileri'}</li>
              </ul>
            </PageSection>

            <PageSection title={`3. ${t('privacy.processingPurposes') || 'İşleme Amaçları'}`}>
              <p>
                {t('privacy.processingPurposesContent') || 'Kişisel verileriniz aşağıdaki amaçlarla işlenmektedir:'}
              </p>
              <ul>
                <li>{t('privacy.purpose1') || 'Uygulama hizmetlerinin sunulması'}</li>
                <li>{t('privacy.purpose2') || 'Kullanıcı hesap yönetimi'}</li>
                <li>{t('privacy.purpose3') || 'Favoriler ve rota özelliklerinin sağlanması'}</li>
                <li>{t('privacy.purpose4') || 'Yer önerilerinin değerlendirilmesi'}</li>
                <li>{t('privacy.purpose5') || 'İstatistiksel analizler'}</li>
                <li>{t('privacy.purpose6') || 'Yasal yükümlülüklerin yerine getirilmesi'}</li>
              </ul>
            </PageSection>

            <PageSection title={`4. ${t('privacy.dataTransfer') || 'Veri Aktarımı'}`}>
              <p>
                {t('privacy.dataTransferContent') || 'Kişisel verileriniz, yukarıda belirtilen amaçlar doğrultusunda, yasal zorunluluklar çerçevesinde ve güvenlik önlemleri alınarak işlenmektedir. Hizmet sunumu ve analiz amacıyla aşağıda adı geçen üçüncü taraf hizmet sağlayıcılarıyla veri paylaşımı yapılmaktadır.'}
              </p>
            </PageSection>

            <PageSection title={`5. ${t('privacy.thirdPartyTitle') || 'Üçüncü Taraf Veri Paylaşımı'}`}>
              <p>
                {t('privacy.thirdPartyContent') || 'Uygulamamızda aşağıdaki üçüncü taraf hizmetleri kullanılmaktadır; bu hizmetler kendi politikalarına göre veri işleyebilir: (1) Google Firebase: kimlik doğrulama, veritabanı ve depolama hizmetleri için kullanılır; (2) Google AdMob: reklam gösterimi için kullanılır; cihaz kimliği ve kullanım verileri işlenebilir. Bu hizmetlerin gizlilik politikalarına kendi sitelerinden ulaşabilirsiniz.'}
              </p>
            </PageSection>

            <PageSection title={`6. ${t('privacy.dataRetention') || 'Veri Saklama Süresi'}`}>
              <p>
                {t('privacy.dataRetentionContent') || 'Kişisel verileriniz, KVKK ve ilgili mevzuat hükümlerine uygun olarak, işleme amacının gerektirdiği süre boyunca saklanmaktadır.'}
              </p>
            </PageSection>

            <PageSection title={`7. ${t('privacy.userRights') || 'Kullanıcı Hakları'}`}>
              <p>
                {t('privacy.userRightsContent') || 'KVKK\'nın 11. maddesi uyarınca aşağıdaki haklara sahipsiniz:'}
              </p>
              <ul>
                <li>{t('privacy.right1') || 'Kişisel verilerinizin işlenip işlenmediğini öğrenme'}</li>
                <li>{t('privacy.right2') || 'İşlenmişse buna ilişkin bilgi talep etme'}</li>
                <li>{t('privacy.right3') || 'İşlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme'}</li>
                <li>{t('privacy.right4') || 'Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme'}</li>
                <li>{t('privacy.right5') || 'Eksik veya yanlış işlenmişse düzeltilmesini isteme'}</li>
                <li>{t('privacy.right6') || 'KVKK\'da öngörülen şartlar çerçevesinde silinmesini veya yok edilmesini isteme'}</li>
              </ul>
            </PageSection>

            <PageSection title={`8. ${t('privacy.accountDeletionTitle') || 'Hesap Silme Hakkı'}`}>
              <p>
                {t('privacy.accountDeletionContent') || 'Hesabınızı ve kişisel verilerinizi silmek istediğinizde: Uygulama içinden Hesap Ayarları sayfasındaki "Hesabımı Sil" butonunu kullanarak hesabınızı kalıcı olarak silebilirsiniz. Alternatif olarak info@kitabe.org adresine e-posta göndererek hesap ve veri silme talebinizi iletebilirsiniz; talebiniz en kısa sürede işleme alınacaktır.'}
              </p>
            </PageSection>

            <PageSection title={`9. ${t('privacy.contact') || 'İletişim'}`}>
              <p>
                {t('privacy.contactContent') || 'KVKK kapsamındaki haklarınızı kullanmak veya gizlilik ile ilgili sorularınız için aşağıdaki iletişim bilgileri üzerinden bizimle iletişime geçebilirsiniz:'}
              </p>
              <p>
                <strong>{t('privacy.email') || 'E-posta:'}</strong>{' '}
                <a href="mailto:info@kitabe.org">info@kitabe.org</a>
              </p>
            </PageSection>
          </div>
        </div>
      </PageShell>
    </>
  );
};

export default PrivacyPolicyPage;
