#!/usr/bin/env node
/**
 * Şehir rehberi metinlerini OpenRouter ile üretir → cityGuideOverrides.ts günceller
 *
 * Kullanım:
 *   OPENROUTER_API_KEY=sk-or-... node scripts/generate-city-guides.mjs --city istanbul
 *   OPENROUTER_API_KEY=sk-or-... node scripts/generate-city-guides.mjs --all --min-places 5
 *   OPENROUTER_API_KEY=sk-or-... node scripts/generate-city-guides.mjs --city ankara --lang tr
 *
 * Model (insanî / doğal seyahat yazısı için önerilen):
 *   OPENROUTER_MODEL=anthropic/claude-sonnet-4   (varsayılan — en doğal ton)
 *   OPENROUTER_MODEL=google/gemini-2.5-flash     (daha ucuz, projede n8n'de de kullanılıyor)
 *
 * Not: OpenRouter'da "humanity" adlı ayrı bir eklenti yok; doğal dil için
 * Claude Sonnet 4 veya Gemini 2.5 Flash + anti-AI-slop prompt kullanıyoruz.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const OUT_FILE = path.join(ROOT, 'lib', 'cityGuideOverrides.ts');
const API_BASE = process.env.API_BASE_URL || 'https://api.kitabe.org';
const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY || '';
const MODEL =
  process.env.OPENROUTER_MODEL || 'anthropic/claude-sonnet-4';

const LOCALES = ['tr', 'en', 'ru', 'ar'];
const LOCALE_NAMES = {
  tr: 'Turkish',
  en: 'English',
  ru: 'Russian',
  ar: 'Arabic',
};

const PRIORITY_CITIES = [
  'istanbul',
  'ankara',
  'antalya',
  'izmir',
  'nevsehir',
  'bursa',
  'trabzon',
  'mugla',
];

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = { city: null, all: false, lang: null, minPlaces: 5, dryRun: false };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--city') opts.city = args[++i];
    else if (args[i] === '--all') opts.all = true;
    else if (args[i] === '--lang') opts.lang = args[++i];
    else if (args[i] === '--min-places') opts.minPlaces = Number(args[++i]) || 5;
    else if (args[i] === '--dry-run') opts.dryRun = true;
  }
  return opts;
}

async function fetchCityHubs(minPlaces) {
  const res = await fetch(`${API_BASE}/api/places/seo/taxonomy-index?locale=tr&minimal=1`);
  if (!res.ok) throw new Error(`taxonomy-index ${res.status}`);
  const json = await res.json();
  const combos = json?.data?.combinations || [];
  return combos
    .filter((c) => (!c.filter || c.filter.length === 0) && c.placeCount >= minPlaces)
    .map((c) => ({
      citySlug: c.citySlug,
      cityName: c.labels?.city || c.citySlug,
      placeCount: c.placeCount,
    }));
}

async function openRouterChat(prompt) {
  if (!OPENROUTER_KEY) {
    throw new Error('OPENROUTER_API_KEY ortam değişkeni gerekli');
  }
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENROUTER_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://kitabe.org',
      'X-Title': 'Kitabe City Guide Generator',
    },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.75,
      messages: [
        {
          role: 'system',
          content: `You are a senior travel editor at Kitabe (kitabe.org), writing city guides for Turkey's cultural heritage.

Writing style (human, not AI):
- Vary sentence length: mix short punchy lines with longer descriptive ones.
- Use active voice and concrete nouns (museum, mosque, bazaar, ferry, tram).
- Start paragraphs differently; avoid repeating "This city..." or "Visitors can...".
- No marketing clichés: nestled, tapestry, vibrant, hidden gem, must-visit, boasts, offers something for everyone.
- Sound like a knowledgeable local editor who has actually walked these streets.
- Output ONLY valid JSON — no markdown, no preamble.`,
        },
        { role: 'user', content: prompt },
      ],
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenRouter ${res.status}: ${err.slice(0, 300)}`);
  }
  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content || '';
  return text;
}

function extractJsonArray(text) {
  const match = text.match(/\[[\s\S]*\]/);
  if (!match) throw new Error('JSON array bulunamadı: ' + text.slice(0, 200));
  return JSON.parse(match[0]);
}

async function generateForCity(citySlug, cityName, placeCount, lang) {
  const langName = LOCALE_NAMES[lang];
  const wordTarget = lang === 'tr' ? 900 : 800;
  const prompt = `Write a city travel guide for "${cityName}" (${citySlug}), Turkey, for Kitabe.org city listing page.
Language: ${langName} (${lang})
Registered heritage places in our database: ${placeCount}

Requirements:
- Return a JSON array of 6-10 strings (each string is one paragraph, 80-150 words).
- Total ~${wordTarget} words across all paragraphs.
- Cover: why visit, historical context, main districts/areas, museum & heritage highlights, practical tips (best seasons, transport), sample 1-day route idea.
- Mention real categories (museums, mosques, castles, ancient sites, natural areas) without inventing fake place names.
- Sound like a knowledgeable local editor, not AI marketing copy.
- For Arabic (ar): use Modern Standard Arabic, clear and readable.

Output format example: ["paragraph 1...", "paragraph 2..."]`;

  console.log(`  → ${lang} (${MODEL})...`);
  const raw = await openRouterChat(prompt);
  const paragraphs = extractJsonArray(raw);
  if (!Array.isArray(paragraphs) || paragraphs.length < 4) {
    throw new Error(`${citySlug}/${lang}: yetersiz paragraf sayısı`);
  }
  return paragraphs.map((p) => String(p).trim()).filter(Boolean);
}

function readExistingOverrides() {
  if (!fs.existsSync(OUT_FILE)) return {};
  const src = fs.readFileSync(OUT_FILE, 'utf8');
  const m = src.match(/export const CITY_GUIDE_OVERRIDES[^=]*=\s*(\{[\s\S]*?\n\});\s*\n/);
  if (!m) return {};
  try {
    // eslint-disable-next-line no-eval
    return eval('(' + m[1] + ')');
  } catch {
    return {};
  }
}

function escapeTsString(s) {
  return s.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n');
}

function writeOverrides(map) {
  const entries = Object.entries(map)
    .map(([slug, locales]) => {
      const locEntries = Object.entries(locales)
        .map(([loc, paras]) => {
          const items = (paras || []).map((p) => `      '${escapeTsString(p)}'`).join(',\n');
          return `    ${loc}: [\n${items}\n    ]`;
        })
        .join(',\n');
      return `  '${slug}': {\n${locEntries}\n  }`;
    })
    .join(',\n');

  const content = `import type { Locale } from './places';

/**
 * Elle veya scripts/generate-city-guides.mjs ile üretilmiş şehir rehberleri.
 */
export type CityGuideOverride = Partial<Record<Locale, string[]>>;

export const CITY_GUIDE_OVERRIDES: Record<string, CityGuideOverride> = {
${entries}
};

export function cityGuideParagraphs(citySlug: string, locale: Locale): string[] {
  const guide = CITY_GUIDE_OVERRIDES[citySlug];
  if (!guide) return [];
  return guide[locale] ?? guide.tr ?? [];
}
`;

  fs.writeFileSync(OUT_FILE, content, 'utf8');
  console.log(`\n✅ Yazıldı: ${OUT_FILE}`);
}

async function main() {
  const opts = parseArgs();
  if (!opts.city && !opts.all) {
    console.log(`
Kitabe şehir rehberi üretici (OpenRouter)

  --city istanbul     Tek şehir
  --all               Öncelikli şehirlerin hepsi (veya --min-places ile API'den)
  --lang tr           Sadece bir dil (varsayılan: tr,en,ru,ar)
  --min-places 5      Minimum yer sayısı
  --dry-run           API çağrısı yapma

Ortam: OPENROUTER_API_KEY (zorunlu), OPENROUTER_MODEL (opsiyonel)
`);
    process.exit(1);
  }

  let cities = [];
  if (opts.city) {
    const hubs = await fetchCityHubs(1);
    const found = hubs.find((c) => c.citySlug === opts.city);
    if (!found) throw new Error(`Şehir bulunamadı: ${opts.city}`);
    cities = [found];
  } else {
    const hubs = await fetchCityHubs(opts.minPlaces);
    const slugSet = new Set(PRIORITY_CITIES);
    cities = hubs.filter((c) => slugSet.has(c.citySlug));
    if (!cities.length) cities = hubs.slice(0, 8);
  }

  const langs = opts.lang ? [opts.lang] : LOCALES;
  const existing = readExistingOverrides();

  console.log(`Model: ${MODEL}`);
  console.log(`Şehirler: ${cities.map((c) => c.citySlug).join(', ')}`);
  console.log(`Diller: ${langs.join(', ')}\n`);

  for (const city of cities) {
    console.log(`\n[${city.citySlug}] ${city.cityName} (${city.placeCount} yer)`);
    if (!existing[city.citySlug]) existing[city.citySlug] = {};

    for (const lang of langs) {
      if (opts.dryRun) {
        console.log(`  (dry-run) ${lang}`);
        continue;
      }
      try {
        existing[city.citySlug][lang] = await generateForCity(
          city.citySlug,
          city.cityName,
          city.placeCount,
          lang
        );
        await new Promise((r) => setTimeout(r, 1500));
      } catch (e) {
        console.error(`  ❌ ${lang}:`, e.message);
      }
    }
  }

  if (!opts.dryRun) writeOverrides(existing);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
