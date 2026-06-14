import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { useLanguage } from '../contexts/LanguageContext';
import { getBlogPost, getBlogDateLocale, type BlogLang } from '../data/blogPosts';
import './BlogDetailPage.css';

const BlogDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentLanguage } = useLanguage();
  const lang = (currentLanguage || 'tr') as BlogLang;

  const post = slug ? getBlogPost(slug, lang) : null;

  if (!post) {
    return (
      <div className="blog-detail-page">
        <div className="blog-detail-container">
          <h1>{t('blog.notFound')}</h1>
          <Link to="/blog">{t('blog.backToBlog')}</Link>
        </div>
      </div>
    );
  }

  const dateLocale = getBlogDateLocale(lang);
  const description = post.content.substring(0, 160);

  return (
    <>
      <Helmet>
        <title>{post.title} | Kitabe Blog</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={description} />
      </Helmet>
      <div className="blog-detail-page">
        <div className="blog-detail-container">
          <button className="back-btn" onClick={() => navigate(-1)}>
            ← {t('common.back')}
          </button>

          <article className="blog-article">
            <div className="blog-article-header">
              <span className="blog-category">
                {t(`blog.categories.${post.categoryKey}`)}
              </span>
              <span className="blog-date">
                {new Date(post.date).toLocaleDateString(dateLocale)} •{' '}
                {t('blog.minutesRead', { count: post.readMinutes })}
              </span>
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
              {t('blog.backToBlog')}
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default BlogDetailPage;
