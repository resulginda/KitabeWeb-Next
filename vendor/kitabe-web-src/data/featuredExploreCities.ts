/** TÜİK / turizm verilerine göre en çok ziyaret edilen 9 şehir — 3×3 grid */
import type { Language } from '../config/languages';

export type ExploreCityLocale = Language;

export type FeaturedExploreCity = {
  slug: string;
  names: Record<ExploreCityLocale, string>;
  /** Yerel statik görsel — /public/cities/ */
  image: string;
  imageAlt: Record<ExploreCityLocale, string>;
};

const HUB_SLUG: Record<ExploreCityLocale, string> = {
  tr: 'kesfet',
  en: 'explore',
  ru: 'mesta',
  ar: 'istikshaf',
  de: 'explore',
  es: 'explore',
  ja: 'explore',
};

export const FEATURED_EXPLORE_CITIES: FeaturedExploreCity[] = [
  {
    slug: 'istanbul',
    names: { tr: 'İstanbul', en: 'Istanbul', ru: 'Стамбул', ar: 'إسطنبول', de: 'Istanbul', es: 'Estambul', ja: 'イスタンブール' },
    image: '/cities/istanbul.webp',
    imageAlt: {
      tr: 'İstanbul Boğaz manzarası',
      en: 'Istanbul Bosphorus view',
      ru: 'Вид на Босфор, Стамбул',
      ar: 'منظر البوسفور، إسطنبول',
      de: 'Blick auf den Bosporus, Istanbul',
      es: 'Vista del Bósforo, Estambul',
      ja: 'イスタンブール、ボスポラス海峡の眺め',
    },
  },
  {
    slug: 'antalya',
    names: { tr: 'Antalya', en: 'Antalya', ru: 'Анталья', ar: 'أنطاليا', de: 'Antalya', es: 'Antalya', ja: 'アンタルヤ' },
    image: '/cities/antalya.webp',
    imageAlt: {
      tr: 'Antalya kıyısı',
      en: 'Antalya coastline',
      ru: 'Побережье Антальи',
      ar: 'ساحل أنطاليا',
      de: 'Küste von Antalya',
      es: 'Costa de Antalya',
      ja: 'アンタルヤの海岸',
    },
  },
  {
    slug: 'izmir',
    names: { tr: 'İzmir', en: 'Izmir', ru: 'Измир', ar: 'إزمير', de: 'Izmir', es: 'Esmirna', ja: 'イズミル' },
    image: '/cities/izmir.webp',
    imageAlt: {
      tr: 'İzmir Saat Kulesi',
      en: 'Izmir Clock Tower',
      ru: 'Часовая башня, Измир',
      ar: 'برج الساعة، إزمير',
      de: 'Uhrturm von Izmir',
      es: 'Torre del Reloj de Esmirna',
      ja: 'イズミルの時計塔',
    },
  },
  {
    slug: 'mugla',
    names: { tr: 'Muğla', en: 'Mugla', ru: 'Мугла', ar: 'موغلا', de: 'Muğla', es: 'Muğla', ja: 'ムーラ' },
    image: '/cities/mugla.webp',
    imageAlt: {
      tr: 'Muğla — Bodrum kıyısı',
      en: 'Mugla — Bodrum coast',
      ru: 'Мугла — побережье Бодрума',
      ar: 'موغلا — ساحل بودروم',
      de: 'Muğla – Küste von Bodrum',
      es: 'Muğla — costa de Bodrum',
      ja: 'ムーラ — ボドルムの海岸',
    },
  },
  {
    slug: 'nevsehir',
    names: { tr: 'Nevşehir', en: 'Nevsehir', ru: 'Невшехир', ar: 'نوشهير', de: 'Nevşehir', es: 'Nevşehir', ja: 'ネヴシェヒル' },
    image: '/cities/nevsehir.webp',
    imageAlt: {
      tr: 'Kapadokya balonları',
      en: 'Cappadocia hot air balloons',
      ru: 'Воздушные шары Каппадокии',
      ar: 'مناطيد كابادوكيا',
      de: 'Heißluftballons in Kappadokien',
      es: 'Globos aerostáticos en Capadocia',
      ja: 'カッパドキアの気球',
    },
  },
  {
    slug: 'ankara',
    names: { tr: 'Ankara', en: 'Ankara', ru: 'Анкара', ar: 'أنقرة', de: 'Ankara', es: 'Ankara', ja: 'アンカラ' },
    image: '/cities/ankara.webp',
    imageAlt: {
      tr: 'Ankara',
      en: 'Ankara',
      ru: 'Анкара',
      ar: 'أنقرة',
      de: 'Ankara',
      es: 'Ankara',
      ja: 'アンカラ',
    },
  },
  {
    slug: 'bursa',
    names: { tr: 'Bursa', en: 'Bursa', ru: 'Бурса', ar: 'بورصة', de: 'Bursa', es: 'Bursa', ja: 'ブルサ' },
    image: '/cities/bursa.webp',
    imageAlt: {
      tr: 'Bursa Ulu Camii',
      en: 'Bursa Grand Mosque',
      ru: 'Улу-Джами, Бурса',
      ar: 'جامع بورصا الكبير',
      de: 'Große Moschee von Bursa',
      es: 'Gran Mezquita de Bursa',
      ja: 'ブルサのウル・ジャーミィ',
    },
  },
  {
    slug: 'aydin',
    names: { tr: 'Aydın', en: 'Aydin', ru: 'Айдын', ar: 'أيدين', de: 'Aydın', es: 'Aydın', ja: 'アイドゥン' },
    image: '/cities/aydin.webp',
    imageAlt: {
      tr: 'Efes Celsus Kütüphanesi',
      en: 'Ephesus Celsus Library',
      ru: 'Библиотека Цельса, Эфес',
      ar: 'مكتبة أفسس',
      de: 'Celsus-Bibliothek in Ephesos',
      es: 'Biblioteca de Celso, Éfeso',
      ja: 'エフェソスのケルスス図書館',
    },
  },
  {
    slug: 'trabzon',
    names: { tr: 'Trabzon', en: 'Trabzon', ru: 'Трабзон', ar: 'طرابزون', de: 'Trabzon', es: 'Trebisonda', ja: 'トラブゾン' },
    image: '/cities/trabzon.webp',
    imageAlt: {
      tr: 'Sümela Manastırı',
      en: 'Sumela Monastery',
      ru: 'Монастырь Сумела',
      ar: 'دير سوميلا',
      de: 'Sumela-Kloster',
      es: 'Monasterio de Sumela',
      ja: 'スメラ修道院',
    },
  },
];

export function buildExploreCityUrl(locale: ExploreCityLocale, citySlug: string): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://kitabe.org';
  return `${origin}/${locale}/${citySlug}/${HUB_SLUG[locale]}`;
}

export function buildLocaleHubUrl(locale: ExploreCityLocale): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://kitabe.org';
  return `${origin}/${locale}`;
}
