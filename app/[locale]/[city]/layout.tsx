import { AdSenseScript } from '@/components/AdSenseScript';

/** Şehir / detay / liste sayfalarında reklam scripti — locale hub (/tr) hariç */
export default function CityRoutesLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AdSenseScript />
      {children}
    </>
  );
}
