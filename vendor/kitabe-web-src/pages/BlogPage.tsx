import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { useLanguage } from '../contexts/LanguageContext';
import { getAllBlogPosts, getBlogDateLocale, type BlogLang } from '../data/blogPosts';
import { PageShell } from '../components/PageShell';
import './BlogPage.css';

const BlogPage = () => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const lang = (currentLanguage || 'tr') as BlogLang;
  const blogPosts = getAllBlogPosts(lang);
  const dateLocale = getBlogDateLocale(lang);

  return (
    <>
      <Helmet>
        <title>{t('blog.title')} | Kitabe</title>
        <meta name="description" content={t('blog.metaDescription')} />
        <meta property="og:title" content={t('blog.title')} />
        <meta property="og:description" content={t('blog.metaDescription')} />
      </Helmet>
      <PageShell
        title={t('blog.title')}
        subtitle={t('blog.subtitle')}
        backTo="/home"
        className="blog-page"
      >
        <div className="blog-container">
          <div className="blog-posts">
            {blogPosts.map((post) => (
              <article key={post.id} className="blog-post-card">
                <div className="blog-post-header">
                  <span className="blog-category">
                    {t(`blog.categories.${post.categoryKey}`)}
                  </span>
                  <span className="blog-date">
                    {new Date(post.date).toLocaleDateString(dateLocale)} •{' '}
                    {t('blog.minutesRead', { count: post.readMinutes })}
                  </span>
                </div>
                <h2>
                  <Link to={`/blog/${post.id}`}>{post.title}</Link>
                </h2>
                <p className="blog-excerpt">{post.excerpt}</p>
                <Link to={`/blog/${post.id}`} className="read-more">
                  {t('blog.readMore')}
                </Link>
              </article>
            ))}
          </div>
        </div>
      </PageShell>
    </>
  );
};

export default BlogPage;
