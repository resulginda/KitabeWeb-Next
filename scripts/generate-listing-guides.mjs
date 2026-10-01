#!/usr/bin/env node
/**
 * Liste sayfaları (şehir / ilçe / kategori / ilçe+kategori) için o sayfadaki GERÇEK yer
 * verisine dayalı rehber metinleri üretir → content/listing-guides/{tr,en,ru,ar}.json
 *
 * Kullanım (PowerShell):
 *   $env:OPENROUTER_API_KEY="sk-or-..."; node scripts/generate-listing-guides.mjs --limit 3 --langs tr
 *   $env:OPENROUTER_API_KEY="sk-or-..."; node scripts/generate-listing-guides.mjs
 *
 * Seçenekler:
 *   --langs tr,en,ru,ar    Diller (varsayılan: hepsi)
 *   --kind city|single|double   Yalnız bir sayfa türü
 *   --min-single 8         İlçe veya kategori sayfası için minimum yer (listingQuality ile aynı)
 *   --min-double 15        İlçe+kategori sayfası için minimum yer
 *   --group "Antalya||muze"   Tek bir groupKey
 *   --limit N              En fazla N sayfa (pilot için)
 *   --concurrency 3
 *   --force                Var olan metinlerin üzerine yaz
 *   --include-overridden   cityGuideOverrides.ts'te elle rehberi olan şehirleri de üret
 *   --dry-run              Seçilen sayfaları listele, API çağrısı yapma
 *
 * Ortam: OPENROUTER_API_KEY (zorunlu, dosyaya yazılmaz), OPENROUTER_MODEL (opsiyonel)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'content', 'listing-guides');
const OVERRIDES_FILE = path.join(ROOT, 'lib', 'cityGuideOverrides.ts');
const API_BASE = process.env.API_BASE_URL || 'https://api.kitabe.org';
const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY || '';
const MODEL = process.env.OPENROUTER_MODEL || 'anthropic/claude-sonnet-4';

const LOCALES = ['tr', 'en', 'ru', 'ar'];
const LOCALE_NAMES = { tr: 'Turkish', en: 'English', ru: 'Russian', ar: 'Modern Standard Arabic' };
const MAX_PLACES_IN_PROMPT = 25;

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = {
    langs: LOCALES,
    kind: null,
    minSingle: 8,
    minDouble: 15,
    group: null,
    limit: Infinity,
    concurrency: 3,
    force: false,
    includeOverridden: false,
    dryRun: false,
  };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--langs') opts.langs = args[++i].split(',').map((s) => s.trim()).filter((l) => LOCALES.includes(l));
    else if (a === '--kind') opts.kind = args[++i];
    else if (a === '--min-single') opts.minSingle = Number(args[++i]) || opts.minSingle;
    else if (a === '--min-double') opts.minDouble = Number(args[++i]) || opts.minDouble;
    else if (a === '--group') opts.group = args[++i];
    else if (a === '--limit') opts.limit = Number(args[++i]) || Infinity;
    else if (a === '--concurrency') opts.concurrency = Math.max(1, Number(args[++i]) || 3);
    else if (a === '--force') opts.force = true;
    else if (a === '--include-overridden') opts.includeOverridden = true;
    else if (a === '--dry-run') opts.dryRun = true;
  }
  return opts;
}

function overriddenCitySlugs() {
  if (!fs.existsSync(OVERRIDES_FILE)) return new Set();
  const src = fs.readFileSync(OVERRIDES_FILE, 'utf8');
  return new Set([...src.matchAll(/^ {2}'([a-z0-9-]+)': \{/gm)].map((m) => m[1]));
}

function readGuides(lang) {
  const file = path.join(OUT_DIR, `${lang}.json`);
  if (!fs.existsSync(file)) return {};
  return JSON.parse(fs.readFileSync(file, 'utf8') || '{}');
}

function writeGuides(lang, map) {
  const sorted = Object.fromEntries(Object.keys(map).sort().map((k) => [k, map[k]]));
  const file = path.join(OUT_DIR, `${lang}.json`);
  const tmp = `${file}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(sorted, null, 2) + '\n', 'utf8');
  fs.renameSync(tmp, file);
}

function kindOf(combo) {
  const n = combo.filter?.length ?? 0;
  return n === 0 ? 'city' : n === 1 ? 'single' : 'double';
}

async function fetchJson(url, attempts = 3) {
  for (let i = 1; ; i++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`${res.status} ${url}`);
      return await res.json();
    } catch (e) {
      if (i >= attempts) throw e;
      await sleep(1500 * i);
    }
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function selectPages(opts) {
  const json = await fetchJson(`${API_BASE}/api/places/seo/taxonomy-index?locale=tr&minimal=1`);
  const skipCities = opts.includeOverridden ? new Set() : overriddenCitySlugs();
  return (json?.data?.combinations || [])
    .filter((c) => {
      if (opts.group) return c.groupKey === opts.group;
      const kind = kindOf(c);
      if (opts.kind && opts.kind !== kind) return false;
      if (kind === 'city') return !skipCities.has(c.citySlug);
      if (kind === 'single') return c.placeCount >= opts.minSingle;
      return c.placeCount >= opts.minDouble;
    })
    .sort((a, b) => b.placeCount - a.placeCount);
}

async function fetchListing(combo) {
  const qs = new URLSearchParams({ locale: 'tr', city: combo.citySlug });
  if (combo.filter?.length) qs.set('filter', combo.filter.join('/'));
  const json = await fetchJson(`${API_BASE}/api/places/seo/filter?${qs}`);
  if (!json?.data) throw new Error(`filter boş: ${combo.groupKey}`);
  return json.data;
}

const pick = (obj, lang) => (obj && typeof obj === 'object' ? obj[lang] || obj.tr || obj.en || '' : String(obj || ''));

function countBy(items) {
  const m = new Map();
  for (const it of items) if (it) m.set(it, (m.get(it) || 0) + 1);
  return [...m.entries()].sort((a, b) => b[1] - a[1]);
}

function buildFacts(listing, lang) {
  const places = listing.places || [];
  const districts = countBy(places.map((p) => pick(p.district, lang)));
  const categories = countBy(places.flatMap((p) => (p.category?.main || []).map((c) => pick(c, lang))));
  const subTypes = countBy(
    places.flatMap((p) => Object.values(p.category?.sub || {}).flat().map((c) => pick(c, lang)))
  );

  // Açıklaması zengin yerler önce; aynı ilçeden çok yer gelmesin diye ilçe başına sınır
  const perDistrictCap = listing.kind === 'city' || listing.kind === 'category' ? 4 : MAX_PLACES_IN_PROMPT;
  const ranked = [...places].sort((a, b) => pick(b.description, lang).length - pick(a.description, lang).length);
  const used = new Map();
  const featured = [];
  for (const p of ranked) {
    const d = pick(p.district, lang);
    if ((used.get(d) || 0) >= perDistrictCap) continue;
    used.set(d, (used.get(d) || 0) + 1);
    featured.push(p);
    if (featured.length >= MAX_PLACES_IN_PROMPT) break;
  }

  const placeLines = featured
    .map((p) => {
      const desc = pick(p.description, lang).replace(/\s+/g, ' ').slice(0, 320);
      const sub = Object.values(p.category?.sub || {}).flat().map((c) => pick(c, lang)).join(', ');
      return `- ${pick(p.name, lang)} | ${pick(p.district, lang)} | ${sub || '-'} | ${desc || '-'}`;
    })
    .join('\n');

  return { total: listing.total ?? places.length, districts, categories, subTypes, placeLines };
}

function scopeDescription(listing) {
  const { city, district, category } = listing.labels || {};
  switch (listing.kind) {
    case 'city':
      return `the city/province of ${city} as a whole`;
    case 'district':
      return `the ${district} district of ${city}`;
    case 'category':
      return `places of the category "${category}" across ${city}`;
    default:
      return `places of the category "${category}" in the ${district} district of ${city}`;
  }
}

function wordTarget(kind) {
  if (kind === 'city') return { words: '650-850', paras: '6-8' };
  if (kind === 'district_category') return { words: '350-450', paras: '4-5' };
  return { words: '450-600', paras: '5-6' };
}

function buildPrompt(listing, lang) {
  const f = buildFacts(listing, lang);
  const t = wordTarget(listing.kind);
  const fmt = (arr, n = 12) => arr.slice(0, n).map(([k, v]) => `${k} (${v})`).join(', ') || '-';

  return `Write the editorial introduction for a Kitabe.org listing page about ${scopeDescription(listing)}, Turkey.
Write in ${LOCALE_NAMES[lang]}. Labels below are in Turkish; use their natural ${LOCALE_NAMES[lang]} form (keep proper names).

DATA FROM OUR DATABASE (this is the ground truth):
- Places listed on this page: ${f.total}
- Districts: ${fmt(f.districts)}
- Main categories: ${fmt(f.categories)}
- Place types: ${fmt(f.subTypes)}
- Featured places (name | district | type | our description):
${f.placeLines}

TASK:
Return a JSON array of ${t.paras} strings; each string is one paragraph. Total ${t.words} words.
Help a traveller decide what to see and plan a visit using THIS page's places:
- What makes this particular selection distinctive (periods, styles, themes visible in the data).
- Concrete highlights: name at least 6 places from the featured list and say something specific about each, based on our descriptions plus well-established historical knowledge.
- How to group visits (by district / proximity / theme) and how much time to allow, in general terms.
- One short paragraph of practical, non-perishable advice (dress codes at mosques, footwear at ruins, seasons, combining with nearby areas).

HARD RULES:
- Mention ONLY places that appear in the featured list. Do not invent places, dates, opening hours, ticket prices or phone numbers.
- If unsure about a fact, leave it out rather than guess.
- Do not repeat the page title as the first words; do not start two paragraphs the same way.
- No headings, no bullet lists, no markdown, no emojis inside paragraphs.
- Output ONLY the JSON array, e.g. ["...", "..."]`;
}

const SYSTEM_PROMPT = `You are a senior travel editor at Kitabe (kitabe.org), a guide to Turkey's cultural heritage sites.

Writing style (human, not AI):
- Vary sentence length; mix short lines with longer descriptive ones.
- Active voice, concrete nouns (minaret, caravanserai, mosaic, ferry, tram).
- No marketing clichés: nestled, tapestry, vibrant, hidden gem, must-visit, boasts, rich history, offers something for everyone, step back in time.
- Sound like a knowledgeable local editor who has walked these streets, not an advert.
- Be factual and grounded in the data you are given.
- Output ONLY valid JSON.`;

async function openRouterChat(prompt) {
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENROUTER_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://kitabe.org',
      'X-Title': 'Kitabe Listing Guide Generator',
    },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.7,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
    }),
  });
  if (!res.ok) throw new Error(`OpenRouter ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const data = await res.json();
  return { text: data?.choices?.[0]?.message?.content || '', usage: data?.usage };
}

function parseParagraphs(text) {
  const match = text.match(/\[[\s\S]*\]/);
  if (!match) throw new Error('JSON array yok: ' + text.slice(0, 160));
  const arr = JSON.parse(match[0]);
  if (!Array.isArray(arr)) throw new Error('JSON array değil');
  return arr.map((p) => String(p).replace(/\s+/g, ' ').trim()).filter(Boolean);
}

function wordCount(paragraphs) {
  return paragraphs.join(' ').split(/\s+/).filter(Boolean).length;
}

const MIN_WORDS = { city: 450, district: 300, category: 300, district_category: 230 };

async function generate(listing, lang) {
  let lastErr;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const { text, usage } = await openRouterChat(buildPrompt(listing, lang));
      const paragraphs = parseParagraphs(text);
      const words = wordCount(paragraphs);
      if (paragraphs.length < 3 || words < MIN_WORDS[listing.kind]) {
        throw new Error(`kısa çıktı (${paragraphs.length} paragraf, ${words} kelime)`);
      }
      return { paragraphs, words, usage };
    } catch (e) {
      lastErr = e;
      await sleep(2000 * attempt);
    }
  }
  throw lastErr;
}

async function main() {
  const opts = parseArgs();
  if (!opts.dryRun && !OPENROUTER_KEY) {
    console.error('OPENROUTER_API_KEY ortam değişkeni gerekli (dosyaya yazmayın).');
    process.exit(1);
  }
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const guides = Object.fromEntries(opts.langs.map((l) => [l, readGuides(l)]));

  const pages = await selectPages(opts);
  const jobs = [];
  for (const combo of pages) {
    const langs = opts.force ? opts.langs : opts.langs.filter((l) => !guides[l][combo.groupKey]?.length);
    if (langs.length) jobs.push({ combo, langs });
    if (jobs.length >= opts.limit) break;
  }

  const byKind = countBy(pages.map(kindOf));
  console.log(`Model: ${MODEL}`);
  console.log(`Uygun sayfa: ${pages.length} (${byKind.map(([k, v]) => `${k}: ${v}`).join(', ')})`);
  console.log(`Üretilecek: ${jobs.length} sayfa, ${jobs.reduce((s, j) => s + j.langs.length, 0)} metin\n`);
  if (opts.dryRun) {
    for (const j of jobs.slice(0, 50)) console.log(`  ${j.combo.groupKey} (${j.combo.placeCount}) → ${j.langs.join(',')}`);
    return;
  }

  let done = 0;
  let failed = 0;
  let tokensIn = 0;
  let tokensOut = 0;
  let cursor = 0;

  async function worker() {
    while (cursor < jobs.length) {
      const { combo, langs } = jobs[cursor++];
      let listing;
      try {
        listing = await fetchListing(combo);
      } catch (e) {
        failed += langs.length;
        console.error(`❌ ${combo.groupKey}: ${e.message}`);
        continue;
      }
      for (const lang of langs) {
        try {
          const { paragraphs, words, usage } = await generate(listing, lang);
          guides[lang][combo.groupKey] = paragraphs;
          writeGuides(lang, guides[lang]);
          tokensIn += usage?.prompt_tokens || 0;
          tokensOut += usage?.completion_tokens || 0;
          done++;
          console.log(`✓ [${done}] ${combo.groupKey} ${lang} — ${paragraphs.length} paragraf, ${words} kelime`);
        } catch (e) {
          failed++;
          console.error(`❌ ${combo.groupKey} ${lang}: ${e.message}`);
        }
      }
    }
  }

  await Promise.all(Array.from({ length: opts.concurrency }, worker));
  console.log(`\nBitti: ${done} başarılı, ${failed} hatalı. Token: ${tokensIn} girdi / ${tokensOut} çıktı`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
