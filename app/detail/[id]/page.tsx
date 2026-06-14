import { notFound, redirect } from 'next/navigation';
import { slugPathForLocale } from '@/lib/detectLocale';
import { ensureLocaleCookie } from '@/lib/preferredLocale';
import type { Locale } from '@/lib/places';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'https://api.kitabe.org';

/** Eski /detail/:id deep link'lerini slug URL'ye yönlendir */
export default async function LegacyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const preferred = await ensureLocaleCookie();

  const res = await fetch(`${API}/api/places/${encodeURIComponent(id)}`, {
    next: { revalidate: 3600 },
  });

  if (!res.ok) notFound();
  const json = await res.json();
  const place = json.data;

  const target =
    slugPathForLocale(place?.slug, preferred) ||
    slugPathForLocale(place?.slug, 'en' as Locale) ||
    slugPathForLocale(place?.slug, 'tr' as Locale);

  if (!target) {
    redirect(`https://kitabe.org/detail/${id}`);
  }

  redirect(target);
}
