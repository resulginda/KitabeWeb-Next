import Link from 'next/link';
import { encodePathSegments } from '@/lib/detectLocale';
import {
  pickListingText,
  type ListingFilterResult,
  type ListingPlace,
  type Locale,
} from '@/lib/listings';
import type { FilterChip } from '@/lib/taxonomyChips';

const CHIP_HEADINGS: Record<Locale, { districts: string; categories: string }> = {
  tr: { districts: 'İlçeler', categories: 'Kategoriler' },
  en: { districts: 'Districts', categories: 'Categories' },
  ru: { districts: 'Районы', categories: 'Категории' },
  ar: { districts: 'الأحياء', categories: 'الفئات' },
};

export function FilterChipGroup({
  title,
  chips,
}: {
  title: string;
  chips: FilterChip[];
}) {
  if (!chips.length) return null;
  return (
    <section className="listing-chips" aria-label={title}>
      <h2 className="listing-chips-title">{title}</h2>
      <ul className="listing-chips-list">
        {chips.map((chip) => (
          <li key={chip.slug}>
            <Link href={chip.href} className="listing-chip">
              <span className="listing-chip-label">{chip.label}</span>
              <span className="listing-chip-count">{chip.count}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function ListingFilters({
  locale,
  districts = [],
  categories = [],
}: {
  locale: Locale;
  districts?: FilterChip[];
  categories?: FilterChip[];
}) {
  if (!districts.length && !categories.length) return null;
  const h = CHIP_HEADINGS[locale] ?? CHIP_HEADINGS.en;
  return (
    <div className="listing-filters">
      <FilterChipGroup title={h.districts} chips={districts} />
      <FilterChipGroup title={h.categories} chips={categories} />
    </div>
  );
}

export function PlaceListingCard({
  place,
  locale,
}: {
  place: ListingPlace;
  locale: Locale;
}) {
  const name = pickListingText(place.name, locale);
  const district = pickListingText(place.district, locale);
  const image = place.thumbnailUrl || place.imageUrl;
  const initial = name.trim().charAt(0).toUpperCase() || 'K';
  const href = place.detailPath
    ? encodePathSegments(place.detailPath)
    : place.citySlug && place.placeSlug
      ? encodePathSegments(`/${locale}/${place.citySlug}/${place.placeSlug}`)
      : '#';

  return (
    <Link href={href} className="listing-card">
      <div className="listing-card-image">
        {image ? (
          <img src={image} alt={name} loading="lazy" />
        ) : (
          <div className="listing-card-placeholder" aria-hidden>
            <span className="listing-card-initial">{initial}</span>
          </div>
        )}
      </div>
      <div className="listing-card-body">
        <h2 className="listing-card-title">{name}</h2>
        {district ? <p className="listing-card-district">{district}</p> : null}
      </div>
    </Link>
  );
}

export function ListingBreadcrumbs({
  items,
}: {
  items: ListingFilterResult['breadcrumb'];
}) {
  return (
    <nav className="listing-breadcrumb" aria-label="Breadcrumb">
      <ol>
        {items.map((item, i) => (
          <li key={`${item.href}-${i}`}>
            {i < items.length - 1 ? (
              <Link href={encodePathSegments(item.href)}>{item.label}</Link>
            ) : (
              <span aria-current="page">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function AppPromoBanner({ locale }: { locale: Locale }) {
  const copy: Record<Locale, { title: string; body: string; cta: string }> = {
    tr: {
      title: 'Kitabe Mobil Uygulaması',
      body: 'Haritada gez, hikâyeleri oku ve rotanı planla — Türkiye\'nin kültürel mirasını cebinde taşı.',
      cta: 'Uygulamayı İndir',
    },
    en: {
      title: 'Kitabe Mobile App',
      body: 'Explore on the map, read stories and plan your route — Turkey\'s heritage in your pocket.',
      cta: 'Get the App',
    },
    ru: {
      title: 'Мобильное приложение Kitabe',
      body: 'Исследуйте на карте, читайте истории и планируйте маршрут.',
      cta: 'Скачать',
    },
    ar: {
      title: 'تطبيق Kitabe',
      body: 'استكشف على الخريطة واقرأ القصص وخطط لمسارك.',
      cta: 'حمّل التطبيق',
    },
  };
  const t = copy[locale] || copy.en;

  return (
    <aside className="listing-app-banner">
      <div className="listing-app-banner-icon" aria-hidden>
        <span className="material-icons">explore</span>
      </div>
      <div>
        <h2>{t.title}</h2>
        <p>{t.body}</p>
      </div>
      <a
        href="/app"
        className="listing-app-banner-cta"
        rel="noopener noreferrer"
      >
        {t.cta}
      </a>
    </aside>
  );
}
