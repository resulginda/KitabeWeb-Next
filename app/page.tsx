import { redirect } from 'next/navigation';

/** kitabe.org/ → dil yönlendirmesi middleware'de; bu yalnız yedek */
export default function RootPage() {
  redirect('/tr');
}
