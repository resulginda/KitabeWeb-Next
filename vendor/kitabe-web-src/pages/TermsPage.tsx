import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import './TermsPage.css';

const TermsPage = () => {
  const { t } = useTranslation();

  return (
    <>
      <Helmet>
        <title>{t('terms.title') || 'Kullanım Şartları - Kitabe'} | Kitabe</title>
        <meta name="description" content={t('terms.metaDescription') || 'Kitabe kullanım şartları. Platform kullanım koşullarını öğrenin.'} />
        <meta property="og:title" content={t('terms.title') || 'Kullanım Şartları - Kitabe'} />
        <meta property="og:description" content={t('terms.metaDescription') || 'Kitabe kullanım şartları.'} />
      </Helmet>
      <div className="terms-page">
        <div className="terms-container">
          <h1>{t('terms.title') || 'Kullanım Şartları'}</h1>
          
          <div className="terms-content">
            <p className="last-updated">
              {t('terms.lastUpdated') || 'Son Güncelleme:'} 2026
            </p>

            <section>
              <h2>1. {t('terms.general') || 'Genel Hükümler'}</h2>
              <p>
                {t('terms.generalContent') || 'Bu Kullanım Şartları, Kitabe uygulamasının kullanımına ilişkin şartları ve koşulları belirlemektedir. Uygulamayı kullanarak bu şartları kabul etmiş sayılırsınız. Bu uygulama, bireysel geliştirici Resul GINDA tarafından geliştirilmiş ve yayınlanmıştır.'}
              </p>
            </section>

            <section>
              <h2>2. {t('terms.applicationUse') || 'Uygulama Kullanımı'}</h2>
              <h3>2.1</h3>
              <p>
                {t('terms.useContent1') || 'Kitabe uygulaması, kullanıcıların kültürel miras yerlerini keşfetmesi, favorilere eklemesi ve rota oluşturması için tasarlanmıştır.'}
              </p>
              <h3>2.2</h3>
              <p>
                {t('terms.useContent2') || 'Uygulamayı yalnızca yasal amaçlarla kullanabilirsiniz.'}
              </p>
              <h3>2.3</h3>
              <p>
                {t('terms.useContent3') || 'Uygulamayı kötüye kullanmak, zararlı içerik paylaşmak veya başkalarının haklarını ihlal etmek yasaktır.'}
              </p>
            </section>

            <section>
              <h2>3. {t('terms.userAccounts') || 'Kullanıcı Hesapları'}</h2>
              <h3>3.1</h3>
              <p>
                {t('terms.accountContent1') || 'Hesap oluştururken doğru ve güncel bilgiler vermeniz gerekmektedir.'}
              </p>
              <h3>3.2</h3>
              <p>
                {t('terms.accountContent2') || 'Hesap bilgilerinizin güvenliğinden siz sorumlusunuz.'}
              </p>
              <h3>3.3</h3>
              <p>
                {t('terms.accountContent3') || 'Hesabınızın yetkisiz kullanımından şüphelenirseniz derhal bizimle iletişime geçiniz.'}
              </p>
            </section>

            <section>
              <h2>4. {t('terms.content') || 'İçerik ve Öneriler'}</h2>
              <h3>4.1</h3>
              <p>
                {t('terms.content1') || 'Kullanıcılar tarafından önerilen yerler editör ve admin onayından geçmektedir.'}
              </p>
              <h3>4.2</h3>
              <p>
                {t('terms.content2') || 'Yanlış, yanıltıcı veya uygunsuz içerik paylaşmak yasaktır.'}
              </p>
              <h3>4.3</h3>
              <p>
                {t('terms.content3') || 'Telif hakkı ihlali yapmak yasaktır.'}
              </p>
            </section>

            <section>
              <h2>5. {t('terms.intellectualProperty') || 'Fikri Mülkiyet'}</h2>
              <h3>5.1</h3>
              <p>
                {t('terms.ipContent1') || 'Uygulama içeriği, tasarımı ve yazılımı telif hakkı ile korunmaktadır.'}
              </p>
              <h3>5.2</h3>
              <p>
                {t('terms.ipContent2') || 'Uygulama içeriğini izinsiz kopyalamak, dağıtmak veya kullanmak yasaktır.'}
              </p>
            </section>

            <section>
              <h2>6. {t('terms.serviceChanges') || 'Hizmet Değişiklikleri'}</h2>
              <h3>6.1</h3>
              <p>
                {t('terms.serviceContent1') || 'Uygulama hizmetlerini önceden haber vermeksizin değiştirme, askıya alma veya sonlandırma hakkımız saklıdır.'}
              </p>
              <h3>6.2</h3>
              <p>
                {t('terms.serviceContent2') || 'Uygulama güncellemeleri otomatik olarak yapılabilir.'}
              </p>
            </section>

            <section>
              <h2>7. {t('terms.limitations') || 'Sınırlamalar'}</h2>
              <h3>7.1</h3>
              <p>
                {t('terms.limitationsContent1') || 'Uygulama "olduğu gibi" sunulmaktadır. Herhangi bir garanti verilmemektedir.'}
              </p>
              <h3>7.2</h3>
              <p>
                {t('terms.limitationsContent2') || 'Uygulama kullanımından kaynaklanan herhangi bir zarardan sorumlu değiliz.'}
              </p>
            </section>

            <section>
              <h2>8. {t('terms.termination') || 'Fesih'}</h2>
              <h3>8.1</h3>
              <p>
                {t('terms.terminationContent') || 'Bu şartları ihlal etmeniz durumunda hesabınızı askıya alma veya sonlandırma hakkımız saklıdır.'}
              </p>
            </section>

            <section>
              <h2>9. {t('terms.changes') || 'Değişiklikler'}</h2>
              <h3>9.1</h3>
              <p>
                {t('terms.changesContent') || 'Bu Kullanım Şartları zaman zaman güncellenebilir. Güncellemeler uygulama içinde duyurulacaktır.'}
              </p>
            </section>

            <section>
              <h2>10. {t('terms.legalDisputes') || 'Yasal Uyuşmazlıklar'}</h2>
              <h3>10.1</h3>
              <p>
                {t('terms.legalContent1') || 'Bu şartlar Türkiye Cumhuriyeti yasalarına tabidir.'}
              </p>
              <h3>10.2</h3>
              <p>
                {t('terms.legalContent2') || 'Uyuşmazlıkların çözümünde Türkiye Cumhuriyeti mahkemeleri yetkilidir.'}
              </p>
            </section>

            <section>
              <h2>11. {t('terms.contact') || 'İletişim'}</h2>
              <p>
                {t('terms.contactContent') || 'Sorularınız, önerileriniz veya şikayetleriniz için bizimle iletişime geçebilirsiniz:'}
              </p>
              <p>
                <strong>{t('terms.email') || 'E-posta:'}</strong> info@kitabe.org
              </p>
            </section>
          </div>
        </div>
      </div>
    </>
  );
};

export default TermsPage;

