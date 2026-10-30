/**
 * Singapur / Asya bulut scraper IP'leri.
 * Canlı loglarda Huawei Cloud SG, Tencent ve benzeri aralıklar
 * Chrome UA taklit ederek saniyede onlarca sayfa çekiyor; gerçek kullanıcı değil.
 * Facebook crawler (57.141.x / meta-webindexer) buraya girmiyor.
 */

type Cidr = { base: number; mask: number; label: string };

function ipToInt(ip: string): number | null {
  const parts = ip.split('.');
  if (parts.length !== 4) return null;
  let n = 0;
  for (const p of parts) {
    const o = Number(p);
    if (!Number.isInteger(o) || o < 0 || o > 255) return null;
    n = (n << 8) + o;
  }
  return n >>> 0;
}

function parseCidr(cidr: string, label: string): Cidr | null {
  const [ip, bitsRaw] = cidr.split('/');
  const base = ipToInt(ip);
  const bits = Number(bitsRaw);
  if (base == null || !Number.isInteger(bits) || bits < 0 || bits > 32) return null;
  const mask = bits === 0 ? 0 : (0xffffffff << (32 - bits)) >>> 0;
  return { base: (base & mask) >>> 0, mask, label };
}

const CIDR_LIST = [
  // Huawei Cloud Singapore (log'daki 119.8.16x–18x IPler)
  '119.8.160.0/19',
  '119.13.0.0/16',
  '114.119.128.0/18',
  '159.138.0.0/16',
  '49.0.200.0/21',
  '110.238.104.0/21',
  '110.238.112.0/21',
  '110.238.120.0/22',
  // Logda aynı davranış: sahte Chrome + saniyede çok sayfa
  '166.108.0.0/16',
  '111.119.0.0/16',
  '101.44.0.0/16',
  '190.92.0.0/16',
  '124.243.128.0/17',
].map((c) => parseCidr(c, c)).filter((c): c is Cidr => !!c);

export function isBlockedScraperIp(ip: string | null | undefined): boolean {
  if (!ip || ip === '-' || ip === '::1' || ip === '127.0.0.1') return false;
  // X-Forwarded-For bazen IPv6 veya portlu gelebilir
  const clean = ip.replace(/^::ffff:/i, '').split('%')[0].trim();
  if (clean.includes(':')) return false; // IPv6: şimdilik atla
  const n = ipToInt(clean);
  if (n == null) return false;
  return CIDR_LIST.some((c) => (n & c.mask) >>> 0 === c.base);
}
