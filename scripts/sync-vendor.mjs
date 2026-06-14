#!/usr/bin/env node
/**
 * KitabeWeb/src → vendor/kitabe-web-src kopyalar.
 * Dokploy tek repo (KitabeWeb-Next) ile deploy için gerekli.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const sources = [
  path.join(root, '..', 'KitabeWeb', 'src'),
  path.join(root, 'vendor', 'kitabe-web-src'),
];
const src = fs.existsSync(sources[0]) ? sources[0] : null;
const dest = sources[1];

if (!src) {
  if (fs.existsSync(dest)) {
    console.log('[sync-vendor] Kaynak yok, mevcut vendor kullanılıyor.');
    process.exit(0);
  }
  console.error('[sync-vendor] KitabeWeb/src bulunamadı ve vendor boş.');
  process.exit(1);
}

function copyDir(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const a = path.join(from, entry.name);
    const b = path.join(to, entry.name);
    if (entry.isDirectory()) copyDir(a, b);
    else fs.copyFileSync(a, b);
  }
}

if (fs.existsSync(dest)) fs.rmSync(dest, { recursive: true, force: true });
copyDir(src, dest);
console.log('[sync-vendor] Kopyalandı:', src, '→', dest);
