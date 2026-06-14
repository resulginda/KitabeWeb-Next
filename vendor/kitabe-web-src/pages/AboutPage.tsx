import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import './AboutPage.css';

const AboutPage = () => {
  const { t } = useTranslation();

  return (
    <>
      <Helmet>
        <title>{t('about.title') || 'Hakkımızda - Kitabe'} | Kitabe</title>
        <meta name="description" content={t('about.metaDescription') || 'Kitabe hakkında bilgi edinin. Türkiye\'nin kültürel mirasını keşfetmek için tasarlanmış platform.'} />
        <meta property="og:title" content={t('about.title') || 'Hakkımızda - Kitabe'} />
        <meta property="og:description" content={t('about.metaDescription') || 'Kitabe hakkında bilgi edinin.'} />
      </Helmet>
      <div className="about-page">
        <div className="about-container">
          <h1>{t('about.title') || 'Hakkımızda'}</h1>
          
          <section className="about-section">
            <h2>{t('about.whoWeAre') || 'Biz Kimiz?'}</h2>
            <p>
              {t('about.whoWeAreContent') || 'Kitabe, Türkiye\'nin zengin kültürel mirasını dijital dünyaya taşımayı hedefleyen bir platformdur. Ülkemizin dört bir yanındaki tarihi yerler, müzeler, anıtlar ve kültürel alanları tek bir çatı altında toplayarak, kullanıcılarımıza kapsamlı bir keşif deneyimi sunuyoruz.'}
            </p>
            <p>
              {t('about.missionContent') || 'Misyonumuz, Türkiye\'nin kültürel değerlerini korumak, tanıtmak ve gelecek nesillere aktarmaktır. Teknolojinin gücünü kullanarak, kültürel mirasımızı daha erişilebilir hale getirmeyi amaçlıyoruz.'}
            </p>
          </section>

          <section className="about-section">
            <h2>{t('about.ourVision') || 'Vizyonumuz'}</h2>
            <p>
              {t('about.visionContent') || 'Türkiye\'nin en kapsamlı kültürel miras platformu olmak ve herkesin ülkemizin zengin tarihini keşfetmesine olanak sağlamak. Gelecekte, sadece yerler hakkında bilgi sunmakla kalmayıp, interaktif turlar, sanal gerçeklik deneyimleri ve eğitici içeriklerle kullanıcı deneyimini zenginleştirmeyi hedefliyoruz.'}
            </p>
          </section>

          <section className="about-section">
            <h2>{t('about.whatWeOffer') || 'Ne Sunuyoruz?'}</h2>
            <ul>
              <li>{t('about.offer1') || 'Türkiye genelinde binlerce kültürel yer hakkında detaylı bilgi'}</li>
              <li>{t('about.offer2') || 'Harita üzerinde interaktif keşif imkanı'}</li>
              <li>{t('about.offer3') || 'Favori yerlerinizi kaydetme ve rota oluşturma'}</li>
              <li>{t('about.offer4') || 'Kullanıcıların yeni yerler önerebileceği topluluk platformu'}</li>
              <li>{t('about.offer5') || 'Çok dilli destek (Türkçe, İngilizce, Rusça, Arapça)'}</li>
            </ul>
          </section>

          <section className="about-section">
            <h2>{t('about.ourValues') || 'Değerlerimiz'}</h2>
            <p>
              {t('about.valuesContent') || 'Kültürel mirasın korunması, doğru bilginin yayılması ve herkesin bu değerlere erişebilmesi bizim için çok önemlidir. Topluluk katılımına açığız ve kullanıcılarımızın önerileriyle platformumuzu sürekli geliştiriyoruz.'}
            </p>
          </section>

          <section className="about-section">
            <h2>{t('about.contactUs') || 'Bize Ulaşın'}</h2>
            <p>
              {t('about.contactContent') || 'Sorularınız, önerileriniz veya geri bildirimleriniz için bizimle iletişime geçebilirsiniz. İletişim sayfamızdan bize ulaşabilir veya doğrudan e-posta gönderebilirsiniz.'}
            </p>
            <p>
              <strong>{t('about.email') || 'E-posta:'}</strong> info@kitabe.org
            </p>
          </section>
        </div>
      </div>
    </>
  );
};

export default AboutPage;

