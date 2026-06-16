#!/usr/bin/env node
/**
 * Arapça (ve diğer) slug URL'lerinin canlı durumunu kontrol eder.
 * Kullanım: node scripts/audit-slugs.mjs [--locale=ar] [--limit=50]
 */
const API = process.env.NEXT_PUBLIC_API_URL ?? 'https://api.kitabe.org';
const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://kitabe.org';
const LOCALES = ['tr', 'en', 'ru', 'ar'];

const args = process.argv.slice(2);
const localeFilter = args.find((a) => a.startsWith('--locale='))?.split('=')[1];
const limit = Number(args.find((a) => a.startsWith('--limit='))?.split('=')[1] ?? 100);

function encodePathSegments(path) {
  return path
    .split('/')
    .map((segment) => {
      if (!segment) return segment;
      try {
        return encodeURIComponent(decodeURIComponent(segment));
      } catch {
        return encodeURIComponent(segment);
      }
    })
    .join('/');
}

async function fetchIndex() {
  const res = await fetch(`${API}/api/places/seo/index`);
  if (!res.ok) throw new Error(`SEO index HTTP ${res.status}`);
  const json = await res.json();
  return json.data ?? [];
}

async function checkUrl(url) {
  try {
    const res = await fetch(url, { method: 'HEAD', redirect: 'manual' });
    return res.status;
  } catch {
    return 0;
  }
}

async function main() {
  console.log(`Fetching index from ${API}...`);
  const index = await fetchIndex();
  const locales = localeFilter ? [localeFilter] : LOCALES;
  const problems = [];
  let checked = 0;

  for (const row of index) {
    if (checked >= limit) break;
    for (const loc of locales) {
      if (checked >= limit) break;
      const slug = row.slug?.[loc];
      if (!slug) {
        problems.push({ id: row.id, locale: loc, issue: 'missing_slug' });
        continue;
      }
      const [city, ...rest] = slug.split('/');
      const path = encodePathSegments(`/${loc}/${city}/${rest.join('/')}`);
      const url = `${SITE}${path}`;
      const status = await checkUrl(url);
      checked++;
      if (status !== 200 && status !== 301 && status !== 308) {
        problems.push({ id: row.id, locale: loc, url, status, slug });
      }
      if (checked % 25 === 0) process.stderr.write(`Checked ${checked}...\n`);
    }
  }

  console.log(`\nChecked ${checked} URLs`);
  console.log(`Problems: ${problems.length}`);
  if (problems.length) {
    console.log(JSON.stringify(problems.slice(0, 30), null, 2));
    if (problems.length > 30) console.log(`... and ${problems.length - 30} more`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
