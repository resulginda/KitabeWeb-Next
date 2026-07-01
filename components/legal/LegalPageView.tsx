import Link from 'next/link';
import type { Locale } from '@/lib/places';
import { LOCALES } from '@/lib/places';
import { SiteFooter } from '@/components/SiteFooter';
import { ContactFormClient } from '@/components/legal/ContactFormClient';
import {
  LEGAL_DOC_LABELS,
  LEGAL_DOCS,
  legalPath,
  type LegalDoc,
  type LegalPageContent,
} from '@/lib/legal/types';

export function LegalPageView({
  locale,
  doc,
  content,
}: {
  locale: Locale;
  doc: LegalDoc;
  content: LegalPageContent;
}) {
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <div className="legal-page-shell" dir={dir}>
      <header className="legal-page-header">
        <Link href={`/${locale}`} className="legal-page-logo">
          Kitabe
        </Link>
        <nav className="legal-lang-switch" aria-label="Language">
          {LOCALES.map((loc) => (
            <Link
              key={loc}
              href={legalPath(loc, doc)}
              className={loc === locale ? 'is-active' : undefined}
              hrefLang={loc}
            >
              {loc.toUpperCase()}
            </Link>
          ))}
        </nav>
        <nav className="legal-doc-nav" aria-label="Legal">
          {LEGAL_DOCS.map((d) => (
            <Link
              key={d}
              href={legalPath(locale, d)}
              className={d === doc ? 'is-active' : undefined}
            >
              {LEGAL_DOC_LABELS[locale][d]}
            </Link>
          ))}
        </nav>
      </header>

      <main className="legal-page-main">
        <h1>{content.title}</h1>
        {content.sections.map((section) => (
          <section key={section.title || 'intro'} className="legal-section">
            {section.title ? <h2>{section.title}</h2> : null}
            {section.paragraphs?.map((p) => (
              <p key={p.slice(0, 40)}>{p}</p>
            ))}
            {section.list ? (
              <ul>
                {section.list.map((item) => (
                  <li key={item.slice(0, 40)}>{item}</li>
                ))}
              </ul>
            ) : null}
          </section>
        ))}
        {doc === 'contact' ? <ContactFormClient locale={locale} /> : null}
      </main>

      <SiteFooter locale={locale} />
    </div>
  );
}
