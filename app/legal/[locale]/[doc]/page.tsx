import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { LegalPageView } from '@/components/legal/LegalPageView';
import { getLegalPageContent } from '@/lib/legal';
import { LEGAL_DOCS, type LegalDoc } from '@/lib/legal/types';
import { LOCALES, type Locale } from '@/lib/places';
import { SITE_URL } from '@/lib/og';

export const dynamic = 'force-static';

type Props = { params: Promise<{ locale: string; doc: string }> };

export function generateStaticParams() {
  const out: { locale: string; doc: string }[] = [];
  for (const locale of LOCALES) {
    for (const doc of LEGAL_DOCS) {
      out.push({ locale, doc });
    }
  }
  return out;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, doc } = await params;
  if (!LOCALES.includes(locale as Locale) || !LEGAL_DOCS.includes(doc as LegalDoc)) {
    return { title: 'Kitabe' };
  }
  const loc = locale as Locale;
  const legalDoc = doc as LegalDoc;
  const content = getLegalPageContent(legalDoc, loc);
  if (!content) return { title: 'Kitabe' };

  const languages: Record<string, string> = {};
  for (const l of LOCALES) {
    languages[l] = `${SITE_URL}/legal/${l}/${legalDoc}`;
  }
  languages['x-default'] = `${SITE_URL}/legal/tr/${legalDoc}`;

  return {
    title: `${content.title} | Kitabe`,
    description: content.metaDescription,
    alternates: {
      canonical: `${SITE_URL}/legal/${loc}/${legalDoc}`,
      languages,
    },
    robots: { index: true, follow: true },
  };
}

export default async function LegalDocPage({ params }: Props) {
  const { locale, doc } = await params;
  if (!LOCALES.includes(locale as Locale) || !LEGAL_DOCS.includes(doc as LegalDoc)) {
    notFound();
  }
  const loc = locale as Locale;
  const legalDoc = doc as LegalDoc;
  const content = getLegalPageContent(legalDoc, loc);
  if (!content) notFound();

  return <LegalPageView locale={loc} doc={legalDoc} content={content} />;
}
