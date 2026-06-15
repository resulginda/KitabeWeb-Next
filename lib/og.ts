export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://kitabe.org';

export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-default.jpg`;

/** Sosyal paylaşım önizlemesi için mutlak görsel URL */
export function absoluteOgImage(url?: string | null): string {
  if (!url || !String(url).trim()) return DEFAULT_OG_IMAGE;
  const u = String(url).trim();
  if (u.startsWith('http://') || u.startsWith('https://')) return u;
  return `${SITE_URL}${u.startsWith('/') ? u : `/${u}`}`;
}

export function cityOgImage(citySlug: string): string {
  return absoluteOgImage(`/cities/${citySlug}.jpg`);
}

export const DEFAULT_OG = {
  siteName: 'Kitabe',
  type: 'website' as const,
  images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: 'Kitabe — Türkiye Kültürel Miras Rehberi' }],
};
