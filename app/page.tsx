import { redirect } from 'next/navigation';

/** kitabe.org/ → SPA ana ekranı */
export default function RootPage() {
  redirect('/home');
}
