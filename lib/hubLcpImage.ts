import type { StaticImageData } from 'next/image';
import istanbulLcp from '../public/cities/istanbul-480.webp';
import istanbulFull from '../public/cities/istanbul.webp';

export const HUB_LCP_CITY_SLUG = 'istanbul';

/** LCP — `/_next/static/media/*` ile immutable önbellek */
export const hubLcpImage: StaticImageData = istanbulLcp;

export const hubLcpSrcSet = `${istanbulLcp.src} ${istanbulLcp.width}w, ${istanbulFull.src} 560w`;

export function isHubLcpCitySlug(slug: string): boolean {
  return slug === HUB_LCP_CITY_SLUG;
}
