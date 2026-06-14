/** Vite ve Next.js ortamlarında env değişkenlerini okur */
export function readEnv(key: string): string | undefined {
  if (typeof process !== 'undefined' && process.env[key]) {
    return process.env[key];
  }
  return undefined;
}
