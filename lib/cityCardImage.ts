/** Şehir kartı görselleri — PageSpeed sıkıştırma + doğru srcset boyutu */
export const CITY_CARD_IMAGE_SIZES = '(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 280px';
export const CITY_CARD_IMAGE_QUALITY = 50;

export function cityCardLcpSrcSet(webpPath: string): string {
  const compact = webpPath.replace(/\.webp$/i, '-480.webp');
  return `${compact} 400w, ${webpPath} 560w`;
}
