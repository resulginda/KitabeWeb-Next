import { redirect } from 'next/navigation';
import { ensureLocaleCookie } from '@/lib/preferredLocale';

/** Middleware yönlendirmesi yedek — cookie + algılanan dile git */
export default async function HomePage() {
  const locale = await ensureLocaleCookie();
  redirect(`/${locale}`);
}
