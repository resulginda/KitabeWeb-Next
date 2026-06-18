/**
 * Ortam değişkeni okuma — Vite + Next.js ortak.
 * Vite tarafında `import.meta.env` (readViteEnv) kullanılır; bu helper Next/SSR
 * tarafında `process.env` üzerinden NEXT_PUBLIC_* değerlerini döndürür.
 * Vite build'inde `process` tanımsız olabileceğinden güvenli erişim yapılır.
 */
export function readEnv(key: string): string | undefined {
  try {
    // `process` adına doğrudan erişmek Vite/tsc'de TS2591 verir (@types/node yok).
    // globalThis üzerinden cast ile erişerek Node tipleri olmadan güvenli okuruz.
    const proc = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process;
    const val = proc?.env?.[key];
    if (val) return val;
  } catch {
    /* Vite ortamı — process yok */
  }
  return undefined;
}
