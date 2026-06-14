import { redirect } from 'next/navigation';

const SPA_BASE =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'https://kitabe.org';

/** Next kökü — KitabeWeb SPA ana sayfasına yönlendir */
export default function RootPage() {
  redirect(`${SPA_BASE}/home`);
}
