import { redirect } from 'next/navigation';
import { getPreferredLocale } from '@/lib/preferredLocale';

/** kitabe.org/ → dil tercihine göre /tr, /en, /ru veya /ar */
export default async function RootPage() {
  const locale = await getPreferredLocale();
  redirect(`/${locale}`);
}
