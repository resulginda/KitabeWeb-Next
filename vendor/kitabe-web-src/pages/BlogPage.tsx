import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import './BlogPage.css';

// Blog yazıları - SEO için önemli içerikler
const blogPosts = [
  {
    id: 'kahverengi-tabela-nedir',
    title: 'Türkiye\'de Kahverengi Tabela Nedir?',
    excerpt: 'Kahverengi tabelalar, Türkiye\'deki tarihi ve kültürel yerleri işaretleyen özel trafik işaretleridir. Bu yazıda kahverengi tabelaların anlamını, tarihçesini ve önemini keşfedin.',
    date: '2026-01-15',
    readTime: '5 dk',
    category: 'Kültürel Miras'
  },
  {
    id: 'beypazari-gezilecek-yerler',
    title: 'Beypazarı Gezilecek Yerler Rehberi',
    excerpt: 'Ankara\'nın tarihi ilçesi Beypazarı, geleneksel mimarisi, el sanatları ve lezzetli yemekleriyle ünlüdür. Beypazarı\'nda mutlaka görülmesi gereken yerleri keşfedin.',
    date: '2026-01-10',
    readTime: '8 dk',
    category: 'Gezi Rehberi'
  },
  {
    id: 'unesco-alanlari-turkiye',
    title: 'UNESCO Dünya Mirası Listesindeki Türkiye\'nin Kültürel Alanları',
    excerpt: 'Türkiye, UNESCO Dünya Mirası Listesi\'nde 19 alanla temsil edilmektedir. Bu yazıda Türkiye\'nin UNESCO listesindeki kültürel ve doğal miras alanlarını keşfedin.',
    date: '2026-01-05',
    readTime: '12 dk',
    category: 'Kültürel Miras'
  },
  {
    id: 'kulturel-rotalar-nedir',
    title: 'Kültürel Rotalar Nedir? Türkiye\'de Kültürel Turizm',
    excerpt: 'Kültürel rotalar, tarihi ve kültürel değerleri birbirine bağlayan özel güzergahlardır. Türkiye\'deki önemli kültürel rotaları ve bu rotaların önemini öğrenin.',
    date: '2025-12-28',
    readTime: '7 dk',
    category: 'Turizm'
  },
  {
    id: 'hafta-sonu-gunubirlik-gezi',
    title: 'Hafta Sonu Günübirlik Gezi Önerileri: Türkiye\'nin Gizli Cennetleri',
    excerpt: 'Hafta sonu kısa bir kaçamak mı yapmak istiyorsunuz? Türkiye\'nin dört bir yanındaki günübirlik gezilebilecek tarihi ve kültürel yerleri keşfedin.',
    date: '2025-12-20',
    readTime: '10 dk',
    category: 'Gezi Rehberi'
  },
  {
    id: 'tarihi-camiler-turkiye',
    title: 'Türkiye\'nin En Önemli Tarihi Camileri',
    excerpt: 'Türkiye, Osmanlı ve Selçuklu dönemlerinden kalma muhteşem camilerle doludur. Bu yazıda Türkiye\'nin en önemli tarihi camilerini ve mimari özelliklerini keşfedin.',
    date: '2025-12-15',
    readTime: '9 dk',
    category: 'Kültürel Miras'
  },
  {
    id: 'arkeoloji-muzeleri',
    title: 'Türkiye\'nin En İyi Arkeoloji Müzeleri',
    excerpt: 'Türkiye, zengin arkeolojik geçmişiyle dünyanın en önemli müzelerine ev sahipliği yapar. Bu yazıda Türkiye\'nin en önemli arkeoloji müzelerini keşfedin.',
    date: '2025-12-10',
    readTime: '8 dk',
    category: 'Müzeler'
  },
  {
    id: 'kapadokya-balon-turu',
    title: 'Kapadokya Balon Turu: Dünyanın En Büyüleyici Deneyimlerinden Biri',
    excerpt: 'Kapadokya\'nın eşsiz peribacaları üzerinde balon turu yapmak, Türkiye\'nin en unutulmaz deneyimlerinden biridir. Kapadokya balon turları hakkında bilmeniz gereken her şey.',
    date: '2025-12-05',
    readTime: '6 dk',
    category: 'Gezi Rehberi'
  }
];

const BlogPage = () => {
  const { t } = useTranslation();

  return (
    <>
      <Helmet>
        <title>{t('blog.title') || 'Blog - Kültürel Miras ve Gezi Yazıları'} | Kitabe</title>
        <meta name="description" content={t('blog.metaDescription') || 'Türkiye\'nin kültürel mirası, tarihi yerler, gezi rehberleri ve turizm hakkında kapsamlı blog yazıları.'} />
        <meta property="og:title" content={t('blog.title') || 'Blog - Kitabe'} />
        <meta property="og:description" content={t('blog.metaDescription') || 'Kültürel miras ve gezi yazıları.'} />
      </Helmet>
      <div className="blog-page">
        <div className="blog-container">
          <h1>{t('blog.title') || 'Blog'}</h1>
          <p className="blog-subtitle">
            {t('blog.subtitle') || 'Türkiye\'nin kültürel mirası, tarihi yerler ve gezi rehberleri hakkında yazılar'}
          </p>

          <div className="blog-posts">
            {blogPosts.map((post) => (
              <article key={post.id} className="blog-post-card">
                <div className="blog-post-header">
                  <span className="blog-category">{post.category}</span>
                  <span className="blog-date">{new Date(post.date).toLocaleDateString('tr-TR')} • {post.readTime}</span>
                </div>
                <h2>
                  <Link to={`/blog/${post.id}`}>{post.title}</Link>
                </h2>
                <p className="blog-excerpt">{post.excerpt}</p>
                <Link to={`/blog/${post.id}`} className="read-more">
                  {t('blog.readMore') || 'Devamını Oku →'}
                </Link>
              </article>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default BlogPage;

