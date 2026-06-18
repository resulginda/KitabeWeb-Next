'use client';

import dynamic from 'next/dynamic';
import '@kitabe/index.css';

/**
 * KitabeWeb (Vite SPA) — Next.js içinde istemci tarafı "ada" olarak çalışır.
 * react-router BrowserRouter window gerektirdiği için ssr:false zorunlu.
 * Gerçek path window.location'dan okunur (middleware rewrite URL'i korur).
 */
const SpaApp = dynamic(() => import('@kitabe/App'), {
  ssr: false,
  loading: () => null,
});

export default function SpaHost() {
  return <SpaApp />;
}
