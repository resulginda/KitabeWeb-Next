import Link from 'next/link';
import { LOCALES } from '@/lib/places';

export default async function LocaleHomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!LOCALES.includes(locale as (typeof LOCALES)[number])) {
    return <p>Geçersiz dil.</p>;
  }

  return (
    <main style={{ maxWidth: 720, margin: '2rem auto', padding: '0 1rem' }}>
      <h1>Kitabe</h1>
      <p>Kültürel miras rehberi — SEO sayfaları bu dil altında yayınlanır.</p>
      <p>
        Eski uygulama:{' '}
        <a href="https://kitabe.org/home">kitabe.org/home</a>
      </p>
      <nav>
        <p>Diller:</p>
        <ul>
          {LOCALES.map((l) => (
            <li key={l}>
              <Link href={`/${l}`}>{l.toUpperCase()}</Link>
            </li>
          ))}
        </ul>
      </nav>
    </main>
  );
}
