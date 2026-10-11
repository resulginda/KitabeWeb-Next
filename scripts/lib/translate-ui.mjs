/**
 * Backend /api/internal/translate-ui istemcisi (translate-copy / translate-locale-json ortak).
 * N8N_INTERNAL_KEY (veya KITABE_INTERNAL_KEY) ve isteğe bağlı KITABE_API_URL gerekir.
 */
const API = process.env.KITABE_API_URL || 'https://api.kitabe.org';
export const KEY = process.env.KITABE_INTERNAL_KEY || process.env.N8N_INTERNAL_KEY || '';
export const SOURCE = 'en';
const BATCH_CHARS = 3500;
const RETRY_WAITS_MS = [20000, 40000, 60000, 90000, 120000, 180000];

export const usage = { promptTokens: 0, completionTokens: 0, calls: 0 };

let delayMs = 4000;
export function setDelayMs(ms) {
  if (Number.isFinite(ms) && ms >= 0) delayMs = ms;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function translateBatch(items, lang, context) {
  for (let attempt = 0; attempt <= RETRY_WAITS_MS.length; attempt++) {
    await sleep(delayMs);
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

/**
 * Düz metin haritasını (anahtar → metin) parça parça çevir.
 * onBatch her parçadan sonra çağrılır (ara kayıt için).
 */
export async function translateFlat(flat, lang, context, onBatch) {
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
    if (onBatch) onBatch(d.items);
  };
  for (const [k, v] of Object.entries(flat)) {
    if (size + v.length > BATCH_CHARS) await flush();
    batch[k] = v;
    size += v.length + k.length;
  }
  await flush();
  return { result, failed };
}
