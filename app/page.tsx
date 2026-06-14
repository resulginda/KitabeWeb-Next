import { redirect } from 'next/navigation';
import { LOCALES } from '@/lib/places';

export default function HomePage() {
  redirect('/tr');
}
