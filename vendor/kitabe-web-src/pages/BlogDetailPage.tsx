import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { useLanguage } from '../contexts/LanguageContext';
import { getBlogPost, getBlogDateLocale, type BlogLang } from '../data/blogPosts';
import { PageShell } from '../components/PageShell';
import './BlogDetailPage.css';

const BlogDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const lang = (currentLanguage || 'tr') as BlogLang;

  const post = slug ? getBlogPost(slug, lang) : null;

  if (!post) {
    return (
      <PageShell
        title={t('blog.notFound')}
        backTo="/blog"
        className="blog-detail-page"
      >
        <div className="blog-detail-container" />
      </PageShell>
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
      <PageShell
        title={post.title}
        backTo="/blog"
        className="blog-detail-page"
      >
        <div className="blog-detail-container">
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

            <div className="blog-article-content">
              {post.content.split('\n\n').map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </div>
          </article>
        </div>
      </PageShell>
    </>
  );
};

export default BlogDetailPage;
