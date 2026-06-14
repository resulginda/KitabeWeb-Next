import { TURKIYE_ILLER, TURKIYE_ILCELER } from '../data/turkiyeIllerIlceler';

export type LocationQualityIssue = {
  field: 'city' | 'district';
  severity: 'warn' | 'info';
  message: string;
  suggestion?: string;
};

export function getTrField(
  value: string | { tr?: string; en?: string; ru?: string; ar?: string } | undefined | null
): string {
  if (!value) return '';
  if (typeof value === 'string') return value.trim();
  return (value.tr || value.en || '').trim();
}

function titleCaseTr(word: string): string {
  const w = word.trim();
  if (!w) return w;
  const lower = w.toLocaleLowerCase('tr-TR');
  return lower.charAt(0).toLocaleUpperCase('tr-TR') + lower.slice(1);
}

/** "adana" → "Adana", birebir eşleşme yoksa null */
export function findCanonicalCity(raw: string): string | null {
  const s = (raw || '').trim();
  if (!s) return null;
  if (TURKIYE_ILLER.includes(s)) return s;
  const lower = s.toLocaleLowerCase('tr-TR');
  return TURKIYE_ILLER.find((il) => il.toLocaleLowerCase('tr-TR') === lower) || null;
}

/** Scraper: "01320 Seyhan/Adana" → "Seyhan"; "Ağrı merkez" → "Merkez" */
export function parseScraperDistrict(raw: string, cityHint?: string): string {
  let s = (raw || '').trim();
  if (!s) return '';
  if (s === 'Merkez') return 'Merkez';

  const city = (cityHint || '').trim();
  if (city) {
    const cityLower = city.toLocaleLowerCase('tr-TR');
    const sLower = s.toLocaleLowerCase('tr-TR');
    // "Ağrı merkez", "Afyonkarahisar merkez" vb.
    if (sLower === `${cityLower} merkez` || sLower === `${cityLower} merkez ilçe`) {
      return 'Merkez';
    }
    if (sLower.startsWith(`${cityLower} `)) {
      const rest = s.slice(city.length).trim();
      if (rest && rest.toLocaleLowerCase('tr-TR') !== cityLower) {
        s = rest;
      }
    }
  }

  const slashMatch = s.match(/^(.+?)\s*\/\s*(.+)$/);
  if (slashMatch) {
    let left = slashMatch[1].trim().replace(/^\d+\s*/, '').trim();
    const right = slashMatch[2].trim();
    if (left) return titleCaseTr(left);
    if (cityHint && right.toLocaleLowerCase('tr-TR') === cityHint.toLocaleLowerCase('tr-TR')) {
      return '';
    }
  }

  s = s.replace(/^\d+\s*/, '').trim();
  if (!s) return '';

  const pkTail = s.match(/pk:\s*\d+\s+([^\s,]+)\s*$/i);
  if (pkTail && cityHint) {
    const canonicalCity = findCanonicalCity(cityHint) || cityHint;
    const w = titleCaseTr(pkTail[1].replace(/[^a-zçğıöşüA-ZÇĞİÖŞÜ]/gi, ''));
    const hit = findCanonicalDistrict(canonicalCity, w);
    if (hit) return hit;
  }

  if (cityHint) {
    const canonicalCity = findCanonicalCity(cityHint) || cityHint;
    const list = TURKIYE_ILCELER[canonicalCity];
    if (list) {
      const words = s.split(/\s+/).filter(Boolean);
      for (let i = words.length - 1; i >= 0; i--) {
        const cleaned = words[i].replace(/[^a-zçğıöşüA-ZÇĞİÖŞÜ]/gi, '');
        const w = titleCaseTr(cleaned);
        if (w && findCanonicalDistrict(canonicalCity, w)) return w;
      }
    }
  }

  return titleCaseTr(s);
}

export function findCanonicalDistrict(city: string, district: string): string | null {
  const list = TURKIYE_ILCELER[city];
  if (!list || !district) return null;
  const exact = list.find((d) => d === district);
  if (exact) return exact;
  const lower = district.toLocaleLowerCase('tr-TR');
  return list.find((d) => d.toLocaleLowerCase('tr-TR') === lower) || null;
}

export function normalizeAdminLocation(cityRaw: string, districtRaw: string): {
  city: string;
  district: string;
} {
  const parsedDistrict = parseScraperDistrict(districtRaw, cityRaw);
  const cityFromDistrict =
    districtRaw.includes('/') ? districtRaw.split('/').pop()?.trim() : '';
  const cityCandidate = findCanonicalCity(cityRaw) || findCanonicalCity(cityFromDistrict || '') || titleCaseTr(cityRaw);
  const districtCandidate = parsedDistrict || districtRaw.trim();
  const canonicalDistrict = findCanonicalDistrict(cityCandidate, districtCandidate);
  return {
    city: cityCandidate,
    district: canonicalDistrict || districtCandidate,
  };
}

function isLocationJunk(value: string): boolean {
  const s = (value || '').trim();
  if (!s) return true;
  if (s.length > 40) return true;
  if (/\/|pk:|mh\.|mah\.|no:|cd\.|sok\.|\d{5}/i.test(s)) return true;
  return false;
}

type MultilingualLocation = { tr: string; en: string; ru: string; ar: string };

function toMultilingualField(
  value: string | { tr?: string; en?: string; ru?: string; ar?: string } | undefined | null
): MultilingualLocation {
  if (!value) return { tr: '', en: '', ru: '', ar: '' };
  if (typeof value === 'string') return { tr: value.trim(), en: '', ru: '', ar: '' };
  return {
    tr: (value.tr || '').trim(),
    en: (value.en || '').trim(),
    ru: (value.ru || '').trim(),
    ar: (value.ar || '').trim(),
  };
}

/** TR il/ilçe kaynağından tüm dillere senkronlar (kaydetmede kullan). */
export function syncMultilingualLocation(
  cityField: string | { tr?: string; en?: string; ru?: string; ar?: string } | undefined | null,
  districtField: string | { tr?: string; en?: string; ru?: string; ar?: string } | undefined | null
): { city: MultilingualLocation; district: MultilingualLocation } {
  const prevCity = toMultilingualField(cityField);
  const prevDistrict = toMultilingualField(districtField);
  const citySource = prevCity.tr || prevCity.en || prevCity.ru || prevCity.ar;
  const districtSource = prevDistrict.tr || prevDistrict.en || prevDistrict.ru || prevDistrict.ar;
  const { city, district } = normalizeAdminLocation(citySource, districtSource);

  return {
    city: {
      tr: city,
      en: isLocationJunk(prevCity.en) ? city : prevCity.en,
      ru: isLocationJunk(prevCity.ru) ? city : prevCity.ru,
      ar: isLocationJunk(prevCity.ar) ? city : prevCity.ar,
    },
    district: {
      tr: district,
      en: district,
      ru: district,
      ar: district,
    },
  };
}

export function getLocationDataQuality(cityRaw: string, districtRaw: string): LocationQualityIssue[] {
  const issues: LocationQualityIssue[] = [];
  const city = cityRaw.trim();
  const district = districtRaw.trim();

  if (city && !findCanonicalCity(city)) {
    const suggestion = findCanonicalCity(city.toLocaleLowerCase('tr-TR')) || titleCaseTr(city);
    issues.push({
      field: 'city',
      severity: 'warn',
      message: `İl standart listede yok: "${city}"`,
      suggestion,
    });
  }

  if (district && /\/|\d{5}/.test(district)) {
    const parsed = parseScraperDistrict(district, city);
    issues.push({
      field: 'district',
      severity: 'warn',
      message: `İlçe scraper formatında görünüyor: "${district}"`,
      suggestion: parsed || undefined,
    });
  } else if (district && district !== 'Merkez') {
    const canonicalCity = findCanonicalCity(city) || city;
    if (canonicalCity && TURKIYE_ILCELER[canonicalCity] && !findCanonicalDistrict(canonicalCity, district)) {
      issues.push({
        field: 'district',
        severity: 'info',
        message: `İlçe "${district}" ${canonicalCity} listesinde yok — elle düzeltebilir veya öneriden seçebilirsiniz.`,
      });
    }
  }

  return issues;
}

/** Filtre + datalist: DB'deki tüm il varyantları */
export function collectCityFilterOptions(
  places: Array<{ city?: string | { tr?: string } }>
): Array<{ value: string; label: string; canonical: boolean }> {
  const seen = new Map<string, string>();
  places.forEach((p) => {
    const c = getTrField(p.city);
    if (!c) return;
    const key = c.toLocaleLowerCase('tr-TR');
    if (!seen.has(key)) seen.set(key, c);
  });

  const options: Array<{ value: string; label: string; canonical: boolean }> = [];
  const keys = [...seen.keys()].sort((a, b) => a.localeCompare(b, 'tr'));

  keys.forEach((key) => {
    const display = seen.get(key) || key;
    const canonical = findCanonicalCity(display);
    const isCanonical = Boolean(canonical && canonical === display);
    let label = display;
    if (!isCanonical && canonical) {
      label = `${display} → ${canonical}?`;
    }
    options.push({ value: display, label, canonical: isCanonical });
  });

  return options;
}

export function getCityDatalistOptions(currentCity: string): string[] {
  const set = new Set<string>(TURKIYE_ILLER);
  if (currentCity.trim()) set.add(currentCity.trim());
  const canonical = findCanonicalCity(currentCity);
  if (canonical) set.add(canonical);
  return [...set].sort((a, b) => a.localeCompare(b, 'tr'));
}

export function getDistrictDatalistOptions(city: string, currentDistrict: string): string[] {
  const set = new Set<string>();
  const canonicalCity = findCanonicalCity(city) || city;
  const list = TURKIYE_ILCELER[canonicalCity];
  if (list) list.forEach((d) => set.add(d));
  if (currentDistrict.trim()) {
    set.add(currentDistrict.trim());
    const parsed = parseScraperDistrict(currentDistrict, city);
    if (parsed) set.add(parsed);
  }
  set.add('Merkez');
  return [...set].sort((a, b) => a.localeCompare(b, 'tr'));
}

export function citiesMatchFilter(placeCity: string, filterCity: string): boolean {
  if (!filterCity) return true;
  return placeCity.toLocaleLowerCase('tr-TR') === filterCity.toLocaleLowerCase('tr-TR');
}
