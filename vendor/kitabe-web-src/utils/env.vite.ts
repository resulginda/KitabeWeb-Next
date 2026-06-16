/** Vite client bundle — import.meta.env desteği */
export function isViteDevMode(): boolean {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const env = (import.meta as any).env as { DEV?: boolean } | undefined;
    return env?.DEV === true;
  } catch {
    return false;
  }
}

export function readViteEnv(key: string): string | undefined {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const env = (import.meta as any).env as Record<string, string | undefined> | undefined;
    return env?.[key];
  } catch {
    return undefined;
  }
}
