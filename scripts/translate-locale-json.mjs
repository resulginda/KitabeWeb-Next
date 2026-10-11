/**
 * i18next dil dosyalarında (en.json kaynak) eksik anahtarları yeni dillere çevirir.
 * Her parçadan sonra dosyaya yazar; kota bitip yarıda kalırsa tekrar çalıştırmak kaldığı yerden devam eder.
 * Çevrilemeyen anahtarlar dosyaya yazılmaz (i18next en'e düşer).
 *
 * node --env-file=<backend/.env> scripts/translate-locale-json.mjs [--langs de,es,ja] [--dir <klasör>] [--dry]
 */
import fs from 'node:fs';
import path from 'node:path';
import { KEY, SOURCE, setDelayMs, translateFlat, usage } from './lib/translate-ui.mjs';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/(\w:)/, '$1')), '..');

const args = process.argv.slice(2);
const opt = (name, def) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : def;
};
const LANGS = opt('--langs', 'de,es,ja').split(',').map((s) => s.trim()).filter(Boolean);
const DIR = path.resolve(ROOT, opt('--dir', 'vendor/kitabe-web-src/i18n/locales'));
const DRY = args.includes('--dry');
setDelayMs(Number(opt('--delay-ms', '4000')));

const CONTEXT =
  'UI strings (i18next JSON) of Kitabe, a travel guide web app about places in Türkiye. ' +
  'Keys are code paths, not text. Keep {{placeholders}} exactly.';

function flatten(v, prefix, out) {
  if (typeof v === 'string') {
    if (v.trim()) out[prefix] = v;
  } else if (v && typeof v === 'object' && !Array.isArray(v)) {
    for (const [k, x] of Object.entries(v)) flatten(x, prefix ? `${prefix}.${k}` : k, out);
  }
  return out;
}

/** Kaynak yapısını ve sırasını koruyarak hedef metinlerle yeniden kur. */
function rebuild(src, prefix, map) {
  const out = {};
  for (const [k, x] of Object.entries(src)) {
    const p = prefix ? `${prefix}.${k}` : k;
    if (x && typeof x === 'object' && !Array.isArray(x)) {
      const child = rebuild(x, p, map);
      if (Object.keys(child).length) out[k] = child;
    } else if (typeof x === 'string' && map[p] !== undefined) {
      out[k] = map[p];
    } else if (typeof x === 'string' && !x.trim()) {
      out[k] = x;
    }
  }
  return out;
}

const readJson = (file) => (fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : {});

async function main() {
  if (!KEY && !DRY) {
    console.error('N8N_INTERNAL_KEY / KITABE_INTERNAL_KEY tanımlı değil (node --env-file=… ile verin).');
    process.exit(1);
  }
  const source = readJson(path.join(DIR, `${SOURCE}.json`));
  const sourceFlat = flatten(source, '', {});
  if (Object.keys(sourceFlat).some((k) => k.split('.').some((part) => !part))) {
    throw new Error('Kaynakta boş anahtar parçası var');
  }

  const failedAll = [];
  for (const lang of LANGS) {
    const file = path.join(DIR, `${lang}.json`);
    const done = flatten(readJson(file), '', {});
    const missing = Object.fromEntries(Object.entries(sourceFlat).filter(([k]) => !(k in done)));
    const chars = Object.values(missing).join('').length;
    console.log(`${lang}: ${Object.keys(missing).length} eksik anahtar (~${chars} karakter)`);
    if (DRY || !chars) continue;

    const save = () => fs.writeFileSync(file, `${JSON.stringify(rebuild(source, '', done), null, 2)}\n`, 'utf8');
    const { failed } = await translateFlat(missing, lang, CONTEXT, (items) => {
      Object.assign(done, items);
      save();
    });
    save();
    failedAll.push(...failed.map((k) => `${lang}: ${k}`));
  }

  console.log(`\nToken: ${usage.promptTokens} girdi, ${usage.completionTokens} çıktı (${usage.calls} çağrı).`);
  if (failedAll.length) {
    console.log(`\nÇevrilemeyen (tekrar çalıştırın) (${failedAll.length}):\n  ${failedAll.join('\n  ')}`);
  }
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
