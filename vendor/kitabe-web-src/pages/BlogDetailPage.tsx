import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import './BlogDetailPage.css';

// Blog yazıları içerikleri
const blogContent: Record<string, { title: string; content: string; date: string; category: string }> = {
  'kahverengi-tabela-nedir': {
    title: 'Türkiye\'de Kahverengi Tabela Nedir?',
    date: '2026-01-15',
    category: 'Kültürel Miras',
    content: `Kahverengi tabelalar, Türkiye'deki tarihi ve kültürel yerleri işaretleyen özel trafik işaretleridir. Bu tabelalar, sürücüleri ve yolcuları yakındaki önemli kültürel miras alanları hakkında bilgilendirmek için kullanılır.

Kahverengi tabelaların tarihçesi 1960'lı yıllara dayanmaktadır. İlk olarak Avrupa'da kullanılmaya başlanan bu sistem, Türkiye'de de 1980'li yıllardan itibaren yaygınlaşmıştır. Kahverengi renk, doğal ve kültürel mirası temsil eder.

Türkiye'de kahverengi tabelalar genellikle şu tür yerleri işaretler:
- Tarihi camiler ve kiliseler
- Müzeler ve arkeolojik alanlar
- Antik kentler ve kaleler
- Doğal güzellikler ve milli parklar
- Geleneksel köyler ve kültürel alanlar

Bu tabelalar, turistlerin ve yerel halkın kültürel mirasımızı keşfetmesine yardımcı olur. Ayrıca, kültürel turizmin gelişmesine de önemli katkı sağlar.`
  },
  'beypazari-gezilecek-yerler': {
    title: 'Beypazarı Gezilecek Yerler Rehberi',
    date: '2026-01-10',
    category: 'Gezi Rehberi',
    content: `Ankara'nın tarihi ilçesi Beypazarı, geleneksel mimarisi, el sanatları ve lezzetli yemekleriyle ünlüdür. İlçe, Osmanlı döneminden kalma evleri ve dar sokaklarıyla ziyaretçilerini büyüler.

Beypazarı'nda mutlaka görülmesi gereken yerler:

1. Beypazarı Tarihi Evleri: Osmanlı mimarisinin en güzel örneklerini görebileceğiniz bu evler, restore edilmiş haliyle ziyaretçilere açıktır.

2. Beypazarı Müzesi: İlçenin tarihi ve kültürel mirasını sergileyen müze, zengin bir koleksiyona sahiptir.

3. İnözü Vadisi: Doğal güzellikleriyle ünlü bu vadi, yürüyüş ve piknik için idealdir.

4. Geleneksel El Sanatları: Beypazarı, gümüş işlemeciliği ve dokumacılık gibi geleneksel el sanatlarıyla ünlüdür.

5. Beypazarı Lezzetleri: İlçenin meşhur havuç lokumu, cevizli sucuk ve diğer yöresel lezzetlerini mutlaka denemelisiniz.

Beypazarı, Ankara'ya yakınlığı nedeniyle günübirlik geziler için idealdir.`
  },
  'unesco-alanlari-turkiye': {
    title: 'UNESCO Dünya Mirası Listesindeki Türkiye\'nin Kültürel Alanları',
    date: '2026-01-05',
    category: 'Kültürel Miras',
    content: `Türkiye, UNESCO Dünya Mirası Listesi'nde 19 alanla temsil edilmektedir. Bu alanlar, insanlığın ortak mirası olarak kabul edilen eşsiz kültürel ve doğal değerlerdir.

Türkiye'nin UNESCO listesindeki kültürel alanları:

1. İstanbul'un Tarihi Alanları (1985)
2. Göreme Milli Parkı ve Kapadokya (1985)
3. Divriği Ulu Camii ve Darüşşifası (1985)
4. Hattuşaş: Hitit Başkenti (1986)
5. Nemrut Dağı (1987)
6. Xanthos-Letoon (1988)
7. Hierapolis-Pamukkale (1988)
8. Safranbolu Şehri (1994)
9. Truva Antik Kenti (1998)
10. Selimiye Camii ve Külliyesi (2011)
11. Çatalhöyük Neolitik Kenti (2012)
12. Bursa ve Cumalıkızık: Osmanlı İmparatorluğu'nun Doğuşu (2014)
13. Pergamon Antik Kenti (2014)
14. Diyarbakır Kalesi ve Hevsel Bahçeleri (2015)
15. Efes (2015)
16. Ani Arkeolojik Alanı (2016)
17. Aphrodisias (2017)
18. Göbekli Tepe (2018)
19. Arslantepe Höyüğü (2021)

Bu alanlar, Türkiye'nin zengin kültürel mirasının dünya çapında tanınmasını sağlar.`
  },
  'kulturel-rotalar-nedir': {
    title: 'Kültürel Rotalar Nedir? Türkiye\'de Kültürel Turizm',
    date: '2025-12-28',
    category: 'Turizm',
    content: `Kültürel rotalar, tarihi ve kültürel değerleri birbirine bağlayan özel güzergahlardır. Bu rotalar, ziyaretçilere bir bölgenin kültürel mirasını sistematik bir şekilde keşfetme imkanı sunar.

Türkiye'deki önemli kültürel rotalar:

1. İpek Yolu: Binlerce yıllık ticaret yolu, Türkiye'den geçerek Asya ve Avrupa'yı birbirine bağlar.

2. Likya Yolu: Antalya ve Muğla arasında uzanan, dünyanın en güzel yürüyüş rotalarından biri.

3. Karia Yolu: Muğla ve Aydın bölgesindeki antik kentleri birbirine bağlayan rota.

4. Frig Yolu: Eskişehir, Kütahya ve Afyonkarahisar'daki Frig uygarlığı kalıntılarını keşfetme rotası.

5. Evliya Çelebi Yolu: Ünlü seyyah Evliya Çelebi'nin izinden giden kültürel rota.

Kültürel rotalar, sadece turizm için değil, aynı zamanda yerel ekonomiyi desteklemek ve kültürel mirası korumak için de önemlidir.`
  },
  'hafta-sonu-gunubirlik-gezi': {
    title: 'Hafta Sonu Günübirlik Gezi Önerileri: Türkiye\'nin Gizli Cennetleri',
    date: '2025-12-20',
    category: 'Gezi Rehberi',
    content: `Hafta sonu kısa bir kaçamak mı yapmak istiyorsunuz? Türkiye'nin dört bir yanında günübirlik gezilebilecek tarihi ve kültürel yerler bulunmaktadır.

İstanbul çevresi:
- Polonezköy: Doğal güzellikleri ve tarihi dokusuyla ünlü köy
- Şile: Deniz, kum ve tarihi fener
- Ağva: İki nehir arasında saklı cennet

Ankara çevresi:
- Beypazarı: Osmanlı mimarisinin güzel örnekleri
- Gordion: Frig uygarlığının başkenti
- Kızılcahamam: Kaplıcaları ve doğal güzellikleri

İzmir çevresi:
- Şirince: Tarihi Rum köyü
- Birgi: Osmanlı dönemi mimarisi
- Foça: Antik kent ve deniz

Antalya çevresi:
- Side: Antik kent ve plaj
- Aspendos: Dünyanın en iyi korunmuş antik tiyatrosu
- Termessos: Dağların arasında saklı antik kent

Bu yerler, hafta sonu kısa kaçamaklar için idealdir.`
  },
  'tarihi-camiler-turkiye': {
    title: 'Türkiye\'nin En Önemli Tarihi Camileri',
    date: '2025-12-15',
    category: 'Kültürel Miras',
    content: `Türkiye, Osmanlı ve Selçuklu dönemlerinden kalma muhteşem camilerle doludur. Bu camiler, sadece dini yapılar değil, aynı zamanda mimari şaheserlerdir.

Türkiye'nin en önemli tarihi camileri:

1. Ayasofya Camii (İstanbul): Bizans ve Osmanlı mimarisinin birleşimi
2. Sultanahmet Camii (İstanbul): Mavi çinileriyle ünlü "Mavi Cami"
3. Süleymaniye Camii (İstanbul): Mimar Sinan'ın başyapıtı
4. Selimiye Camii (Edirne): UNESCO Dünya Mirası
5. Ulu Camii (Bursa): Erken Osmanlı mimarisinin örneği
6. Divriği Ulu Camii (Sivas): UNESCO Dünya Mirası, eşsiz taş işçiliği
7. Kocatepe Camii (Ankara): Modern Türk mimarisinin örneği

Bu camiler, Türk-İslam mimarisinin en güzel örneklerini sergiler ve ziyaretçilerini büyüler.`
  },
  'arkeoloji-muzeleri': {
    title: 'Türkiye\'nin En İyi Arkeoloji Müzeleri',
    date: '2025-12-10',
    category: 'Müzeler',
    content: `Türkiye, zengin arkeolojik geçmişiyle dünyanın en önemli müzelerine ev sahipliği yapar. Bu müzeler, binlerce yıllık tarihi eserleri sergiler.

Türkiye'nin en önemli arkeoloji müzeleri:

1. İstanbul Arkeoloji Müzesi: Dünyanın en zengin koleksiyonlarından biri
2. Anadolu Medeniyetleri Müzesi (Ankara): Türkiye'nin en önemli müzesi
3. Antalya Müzesi: Akdeniz bölgesinin arkeolojik hazineleri
4. Efes Müzesi: Antik Efes kentinin eserleri
5. Zeugma Mozaik Müzesi (Gaziantep): Dünyanın en büyük mozaik müzesi
6. Çorum Müzesi: Hitit uygarlığının eserleri
7. Bergama Müzesi: Antik Pergamon'un hazineleri

Bu müzeler, Türkiye'nin binlerce yıllık tarihini ziyaretçilere sunar.`
  },
  'kapadokya-balon-turu': {
    title: 'Kapadokya Balon Turu: Dünyanın En Büyüleyici Deneyimlerinden Biri',
    date: '2025-12-05',
    category: 'Gezi Rehberi',
    content: `Kapadokya'nın eşsiz peribacaları üzerinde balon turu yapmak, Türkiye'nin en unutulmaz deneyimlerinden biridir. Her yıl binlerce turist, bu büyüleyici deneyimi yaşamak için Kapadokya'ya gelir.

Kapadokya balon turları hakkında bilmeniz gerekenler:

1. En İyi Zaman: Sabahın erken saatleri, gün doğumu sırasında en güzel manzaraları sunar.

2. Güvenlik: Tüm balon şirketleri, uluslararası güvenlik standartlarına uygun çalışır.

3. Fiyatlar: Balon turları genellikle 150-300 Euro arasında değişir.

4. Süre: Tipik bir balon turu 1-1.5 saat sürer.

5. Rezervasyon: Özellikle yaz aylarında önceden rezervasyon yapmanız önerilir.

Kapadokya balon turu, hayatınızın en unutulmaz deneyimlerinden biri olacaktır.`
  }
};

const BlogDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const post = slug ? blogContent[slug] : null;

  if (!post) {
    return (
      <div className="blog-detail-page">
        <div className="blog-detail-container">
          <h1>{t('blog.notFound') || 'Yazı Bulunamadı'}</h1>
          <Link to="/blog">{t('blog.backToBlog') || "← Blog'a Dön"}</Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{post.title} | Kitabe Blog</title>
        <meta name="description" content={post.content.substring(0, 160)} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.content.substring(0, 160)} />
      </Helmet>
      <div className="blog-detail-page">
        <div className="blog-detail-container">
          <button className="back-btn" onClick={() => navigate(-1)}>
            ← {t('common.back') || 'Geri'}
          </button>
          
          <article className="blog-article">
            <div className="blog-article-header">
              <span className="blog-category">{post.category}</span>
              <span className="blog-date">{new Date(post.date).toLocaleDateString('tr-TR')}</span>
            </div>
            
            <h1>{post.title}</h1>
            
            <div className="blog-article-content">
              {post.content.split('\n\n').map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </div>
          </article>

          <div className="blog-navigation">
            <Link to="/blog" className="back-to-blog">
              {t('blog.backToBlog') || '← Tüm Yazılar'}
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default BlogDetailPage;

