import { notFound, redirect } from 'next/navigation';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'https://api.kitabe.org';

/** Eski /detail/:id deep link'lerini slug URL'ye yönlendir */
export default async function LegacyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const res = await fetch(`${API}/api/places/${encodeURIComponent(id)}`, {
    next: { revalidate: 3600 },
  });

  if (!res.ok) notFound();
  const json = await res.json();
  const place = json.data;
  const trSlug = place?.slug?.tr;

  if (!trSlug) {
    redirect(`https://kitabe.org/detail/${id}`);
  }

  const [city, ...rest] = trSlug.split('/');
  redirect(`/tr/${city}/${rest.join('/')}`);
}
