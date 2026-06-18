/**
 * Ortam değişkeni okuma — Vite + Next.js ortak.
 * Vite tarafında `import.meta.env` (readViteEnv) kullanılır; bu helper Next/SSR
 * tarafında `process.env` üzerinden NEXT_PUBLIC_* değerlerini döndürür.
 * Vite build'inde `process` tanımsız olabileceğinden güvenli erişim yapılır.
 */
export function readEnv(key: string): string | undefined {
  try {
    if (typeof process !== 'undefined' && process.env) {
      const val = process.env[key];
      if (val) return val;
    }
  } catch {
    /* Vite ortamı — process yok */
  }
  return undefined;
}
