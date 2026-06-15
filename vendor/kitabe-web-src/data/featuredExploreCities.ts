/** TÜİK / turizm verilerine göre en çok ziyaret edilen 9 şehir — 3×3 grid */
export type ExploreCityLocale = 'tr' | 'en' | 'ru' | 'ar';

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
};

export const FEATURED_EXPLORE_CITIES: FeaturedExploreCity[] = [
  {
    slug: 'istanbul',
    names: { tr: 'İstanbul', en: 'Istanbul', ru: 'Стамбул', ar: 'إسطنبول' },
    image: '/cities/istanbul.jpg',
    imageAlt: {
      tr: 'İstanbul Boğaz manzarası',
      en: 'Istanbul Bosphorus view',
      ru: 'Вид на Босфор, Стамбул',
      ar: 'منظر البوسفور، إسطنبول',
    },
  },
  {
    slug: 'antalya',
    names: { tr: 'Antalya', en: 'Antalya', ru: 'Анталья', ar: 'أنطاليا' },
    image: '/cities/antalya.jpg',
    imageAlt: {
      tr: 'Antalya kıyısı',
      en: 'Antalya coastline',
      ru: 'Побережье Антальи',
      ar: 'ساحل أنطاليا',
    },
  },
  {
    slug: 'izmir',
    names: { tr: 'İzmir', en: 'Izmir', ru: 'Измир', ar: 'إزمير' },
    image: '/cities/izmir.jpg',
    imageAlt: {
      tr: 'İzmir Saat Kulesi',
      en: 'Izmir Clock Tower',
      ru: 'Часовая башня, Измир',
      ar: 'برج الساعة، إزمير',
    },
  },
  {
    slug: 'mugla',
    names: { tr: 'Muğla', en: 'Mugla', ru: 'Мугла', ar: 'موغلا' },
    image: '/cities/mugla.jpg',
    imageAlt: {
      tr: 'Muğla — Bodrum kıyısı',
      en: 'Mugla — Bodrum coast',
      ru: 'Мугла — побережье Бодрума',
      ar: 'موغلا — ساحل بودروم',
    },
  },
  {
    slug: 'nevsehir',
    names: { tr: 'Nevşehir', en: 'Nevsehir', ru: 'Невшехир', ar: 'نوشهير' },
    image: '/cities/nevsehir.jpg',
    imageAlt: {
      tr: 'Kapadokya balonları',
      en: 'Cappadocia hot air balloons',
      ru: 'Воздушные шары Каппадокии',
      ar: 'مناطيد كابادوكيا',
    },
  },
  {
    slug: 'ankara',
    names: { tr: 'Ankara', en: 'Ankara', ru: 'Анкара', ar: 'أنقرة' },
    image: '/cities/ankara.jpg',
    imageAlt: {
      tr: 'Ankara',
      en: 'Ankara',
      ru: 'Анкара',
      ar: 'أنقرة',
    },
  },
  {
    slug: 'bursa',
    names: { tr: 'Bursa', en: 'Bursa', ru: 'Бурса', ar: 'بورصة' },
    image: '/cities/bursa.jpg',
    imageAlt: {
      tr: 'Bursa Ulu Camii',
      en: 'Bursa Grand Mosque',
      ru: 'Улу-Джами, Бурса',
      ar: 'جامع بورصا الكبير',
    },
  },
  {
    slug: 'aydin',
    names: { tr: 'Aydın', en: 'Aydin', ru: 'Айдын', ar: 'أيدين' },
    image: '/cities/aydin.jpg',
    imageAlt: {
      tr: 'Efes Celsus Kütüphanesi',
      en: 'Ephesus Celsus Library',
      ru: 'Библиотека Цельса, Эфес',
      ar: 'مكتبة أفسس',
    },
  },
  {
    slug: 'trabzon',
    names: { tr: 'Trabzon', en: 'Trabzon', ru: 'Трабзон', ar: 'طرابزون' },
    image: '/cities/trabzon.jpg',
    imageAlt: {
      tr: 'Sümela Manastırı',
      en: 'Sumela Monastery',
      ru: 'Монастырь Сумела',
      ar: 'دير سوميلا',
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
