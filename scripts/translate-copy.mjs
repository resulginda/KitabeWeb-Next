/**
 * Sabit metinlerdeki { tr, en, ru, ar, … } objelerine eksik dilleri ekler (kaynak: en).
 * Backend /api/internal/translate-ui ile çevirir; dosyaları yerinde günceller. Tekrar çalıştırmak
 * güvenlidir: dili zaten olan objeler atlanır.
 *
 * node --env-file=<backend/.env> scripts/translate-copy.mjs [--langs de,es,ja] [--dry] [dosya …]
 *   N8N_INTERNAL_KEY (veya KITABE_INTERNAL_KEY) ve isteğe bağlı KITABE_API_URL gerekir.
 *
 * Değişken adı slug/bayrak/dil adı içeren objeler otomatik çevrilmez; elle doldurulmak üzere listelenir.
 */
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/(\w:)/, '$1')), '..');
const API = process.env.KITABE_API_URL || 'https://api.kitabe.org';
const KEY = process.env.KITABE_INTERNAL_KEY || process.env.N8N_INTERNAL_KEY || '';
const BASE_LOCALES = ['tr', 'en', 'ru', 'ar'];
const SOURCE = 'en';
const MANUAL_NAME = /slug|flag|language_names|lang_names/i;
const BATCH_CHARS = 3500;

const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const opt = (name, def) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : def;
};
const LANGS = opt('--langs', 'de,es,ja').split(',').map((s) => s.trim()).filter(Boolean);
const DRY = flag('--dry');
const fileArgs = args.filter((a, i) => !a.startsWith('--') && !['--langs', '--delay-ms'].includes(args[i - 1]));

function listFiles() {
  if (fileArgs.length) return fileArgs.map((f) => path.resolve(ROOT, f));
  const out = [];
  const walk = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      if (['node_modules', '.next', 'vendor', 'public', 'scripts'].includes(e.name)) continue;
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (/\.(ts|tsx)$/.test(e.name) && !e.name.endsWith('.d.ts')) out.push(p);
    }
  };
  for (const d of ['app', 'components', 'lib']) walk(path.join(ROOT, d));
  return out;
}

function propName(p) {
  if (!ts.isPropertyAssignment(p)) return null;
  if (ts.isIdentifier(p.name) || ts.isStringLiteral(p.name)) return p.name.text;
  return null;
}

/** Literal düğümü JSON değerine çevir; desteklenmeyen ifade varsa undefined. */
function toValue(node) {
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
  if (ts.isParenthesizedExpression(node) || ts.isAsExpression(node) || ts.isSatisfiesExpression?.(node)) {
    return toValue(node.expression);
  }
  if (ts.isArrayLiteralExpression(node)) {
    const arr = node.elements.map(toValue);
    return arr.some((v) => v === undefined) ? undefined : arr;
  }
  if (ts.isObjectLiteralExpression(node)) {
    const obj = {};
    for (const p of node.properties) {
      const name = propName(p);
      if (name == null) return undefined;
      // Fonksiyonlar (ör. days: (n) => …) çevrilmez; tsc eksik alanı gösterir, elle yazılır.
      if (ts.isArrowFunction(p.initializer) || ts.isFunctionExpression(p.initializer)) continue;
      const v = toValue(p.initializer);
      if (v === undefined) return undefined;
      obj[name] = v;
    }
    return obj;
  }
  if (node.kind === ts.SyntaxKind.TrueKeyword) return true;
  if (node.kind === ts.SyntaxKind.FalseKeyword) return false;
  if (ts.isNumericLiteral(node)) return Number(node.text);
  return undefined;
}

function enclosingName(node) {
  for (let n = node.parent; n; n = n.parent) {
    if (ts.isVariableDeclaration(n) && ts.isIdentifier(n.name)) return n.name.text;
    if (ts.isPropertyAssignment(n)) {
      const name = propName(n);
      if (name && !BASE_LOCALES.includes(name)) return name;
    }
  }
  return '';
}

function quote(s) {
  return `'${s.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\r/g, '\\r').replace(/\n/g, '\\n')}'`;
}

function keyText(k) {
  return /^[A-Za-z_$][\w$]*$/.test(k) ? k : quote(k);
}

function toTs(v, indent) {
  const inner = indent + '  ';
  if (typeof v === 'string') return quote(v);
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  if (Array.isArray(v)) {
    if (!v.length) return '[]';
    const inline = `[${v.map((x) => toTs(x, inner)).join(', ')}]`;
    if (inline.length + indent.length < 100 && !inline.includes('\n')) return inline;
    return `[\n${v.map((x) => inner + toTs(x, inner)).join(',\n')},\n${indent}]`;
  }
  const entries = Object.entries(v);
  if (!entries.length) return '{}';
  if (entries.every(([, x]) => typeof x !== 'object')) {
    const inline = `{ ${entries.map(([k, x]) => `${keyText(k)}: ${toTs(x, inner)}`).join(', ')} }`;
    if (inline.length + indent.length < 100) return inline;
  }
  return `{\n${entries.map(([k, x]) => `${inner}${keyText(k)}: ${toTs(x, inner)}`).join(',\n')},\n${indent}}`;
}

/** Değerdeki tüm metinleri yol → metin olarak düzleştir. */
function flatten(v, prefix, out) {
  if (typeof v === 'string') {
    if (v.trim()) out[prefix] = v;
  } else if (Array.isArray(v)) {
    v.forEach((x, i) => flatten(x, `${prefix}[${i}]`, out));
  } else if (v && typeof v === 'object') {
    for (const [k, x] of Object.entries(v)) flatten(x, `${prefix}.${k}`, out);
  }
  return out;
}

function rebuild(v, prefix, map) {
  if (typeof v === 'string') return v.trim() ? map[prefix] : v;
  if (Array.isArray(v)) return v.map((x, i) => rebuild(x, `${prefix}[${i}]`, map));
  if (v && typeof v === 'object') {
    const o = {};
    for (const [k, x] of Object.entries(v)) o[k] = rebuild(x, `${prefix}.${k}`, map);
    return o;
  }
  return v;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const usage = { promptTokens: 0, completionTokens: 0, calls: 0 };

const DELAY_MS = Number(opt('--delay-ms', '4000'));
const RETRY_WAITS_MS = [20000, 40000, 60000, 90000, 120000, 180000];

async function translateBatch(items, lang, context) {
  for (let attempt = 0; attempt <= RETRY_WAITS_MS.length; attempt++) {
    await sleep(DELAY_MS);
    const res = await fetch(`${API}/api/internal/translate-ui`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Kitabe-Internal-Key': KEY },
      body: JSON.stringify({ items, targetLang: lang, sourceLang: SOURCE, context }),
    }).catch((e) => ({ ok: false, status: 0, json: async () => ({ message: e.message }) }));
    const json = await res.json().catch(() => ({}));
    const u = json.data?.usage;
    if (u) for (const k of Object.keys(usage)) usage[k] += u[k] || 0;
    if (res.ok) return json.data;
    if ((res.status === 429 || res.status === 0 || res.status >= 500) && attempt < RETRY_WAITS_MS.length) {
      const wait = RETRY_WAITS_MS[attempt];
      console.log(`   ${lang}: HTTP ${res.status} — ${wait / 1000} sn bekleniyor…`);
      await sleep(wait);
      continue;
    }
    throw new Error(`translate-ui HTTP ${res.status}: ${json.message || ''}`);
  }
  throw new Error('translate-ui: tekrar denemeler tükendi (kota?)');
}

/** Düz metin haritasını parça parça çevir. */
async function translateFlat(flat, lang, context) {
  const result = {};
  const failed = [];
  let batch = {};
  let size = 0;
  const flush = async () => {
    if (!Object.keys(batch).length) return;
    const d = await translateBatch(batch, lang, context);
    Object.assign(result, d.items);
    failed.push(...d.failed);
    batch = {};
    size = 0;
  };
  for (const [k, v] of Object.entries(flat)) {
    if (size + v.length > BATCH_CHARS) await flush();
    batch[k] = v;
    size += v.length + k.length;
  }
  await flush();
  return { result, failed };
}

function collect(sf) {
  const found = [];
  const visit = (node) => {
    if (ts.isObjectLiteralExpression(node)) {
      const props = new Map();
      for (const p of node.properties) {
        const n = propName(p);
        if (n) props.set(n, p);
      }
      if (BASE_LOCALES.every((l) => props.has(l))) {
        const missing = LANGS.filter((l) => !props.has(l));
        if (missing.length) found.push({ node, props, missing });
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
  return found;
}

async function processFile(file, report) {
  const text = fs.readFileSync(file, 'utf8');
  const kind = file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
  const sf = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, kind);
  const found = collect(sf);
  if (!found.length) return;
  const rel = path.relative(ROOT, file).replace(/\\/g, '/');

  const jobs = [];
  for (const f of found) {
    const name = enclosingName(f.node);
    const line = sf.getLineAndCharacterOfPosition(f.node.getStart()).line + 1;
    const src = f.props.get(SOURCE).initializer;
    const value = toValue(src);
    if (MANUAL_NAME.test(name) || value === undefined) {
      report.manual.push(`${rel}:${line} ${name || '(isimsiz)'}${value === undefined ? ' — literal değil' : ''}`);
      continue;
    }
    jobs.push({ ...f, name, line, value });
  }
  if (!jobs.length) return;
  if (DRY) {
    const chars = jobs.reduce((n, j) => n + Object.values(flatten(j.value, '', {})).join('').length, 0);
    console.log(`   ${rel}: ${jobs.length} obje, ~${chars} karakter (${jobs.map((j) => j.name || j.line).join(', ')})`);
    report.done += jobs.length;
    report.chars = (report.chars || 0) + chars;
    return;
  }

  const inserts = jobs.map(() => ({}));
  for (const lang of LANGS) {
    const flat = {};
    jobs.forEach((j, i) => {
      if (j.missing.includes(lang)) flatten(j.value, `${i}`, flat);
    });
    if (!Object.keys(flat).length) continue;
    const context = `Strings from ${rel} of a Next.js travel site (keys are code paths, not text).`;
    const { result, failed } = await translateFlat(flat, lang, context);
    jobs.forEach((j, i) => {
      if (!j.missing.includes(lang)) return;
      const keys = Object.keys(flatten(j.value, `${i}`, {}));
      if (keys.some((k) => failed.includes(k) || result[k] === undefined)) {
        report.failed.push(`${rel}:${j.line} ${j.name} (${lang})`);
        return;
      }
      inserts[i][lang] = rebuild(j.value, `${i}`, result);
    });
    console.log(`   ${rel} → ${lang}: ${Object.keys(flat).length} metin`);
  }

  const edits = [];
  jobs.forEach((j, i) => {
    const langs = LANGS.filter((l) => inserts[i][l] !== undefined);
    if (!langs.length) return;
    const anchor = BASE_LOCALES.concat(LANGS).map((l) => j.props.get(l)).filter(Boolean)
      .sort((a, b) => b.end - a.end)[0];
    const lineStart = text.lastIndexOf('\n', anchor.getStart()) + 1;
    const indent = text.slice(lineStart, anchor.getStart()).match(/^\s*/)[0];
    const sameLine = !text.slice(j.node.getStart(), j.node.end).includes('\n');
    const body = langs.map((l) => `${l}: ${toTs(inserts[i][l], indent)}`);
    const insertText = sameLine ? `, ${body.join(', ')}` : `,\n${body.map((b) => indent + b).join(',\n')}`;
    edits.push({ pos: anchor.end, insertText });
    report.done++;
  });
  edits.sort((a, b) => b.pos - a.pos);
  let out = text;
  for (const e of edits) out = out.slice(0, e.pos) + e.insertText + out.slice(e.pos);
  if (!DRY && edits.length) fs.writeFileSync(file, out, 'utf8');
}

async function main() {
  if (!KEY && !DRY) {
    console.error('N8N_INTERNAL_KEY / KITABE_INTERNAL_KEY tanımlı değil (node --env-file=… ile verin).');
    process.exit(1);
  }
  const report = { done: 0, manual: [], failed: [] };
  for (const file of listFiles()) await processFile(file, report);
  if (DRY) console.log(`\n[deneme] toplam ~${report.chars || 0} kaynak karakter × ${LANGS.length} dil`);
  console.log(`\n${DRY ? '[deneme] ' : ''}${report.done} obje güncellendi. Token: ${usage.promptTokens} girdi, ${usage.completionTokens} çıktı (${usage.calls} çağrı).`);
  if (report.manual.length) console.log(`\nElle doldurulacak (${report.manual.length}):\n  ${report.manual.join('\n  ')}`);
  if (report.failed.length) console.log(`\nÇevrilemeyen (tekrar çalıştırın) (${report.failed.length}):\n  ${report.failed.join('\n  ')}`);
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
