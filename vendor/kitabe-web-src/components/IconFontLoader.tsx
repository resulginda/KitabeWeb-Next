import { useEffect } from 'react';

const READY_CLASS = 'material-icons-ready';
const FONT_SPEC = '24px "Material Icons"';
const MAX_WAIT_MS = 4000;

/** Material Icons yüklenince kök html'e sınıf ekler — ligature flash'ını keser */
export function IconFontLoader() {
  useEffect(() => {
    if (document.documentElement.classList.contains(READY_CLASS)) return;

    let done = false;
    const markReady = () => {
      if (done) return;
      done = true;
      requestAnimationFrame(() => {
        document.documentElement.classList.add(READY_CLASS);
      });
    };

    const timeout = window.setTimeout(markReady, MAX_WAIT_MS);

    const loadFont = () => {
      if (document.fonts?.load) {
        document.fonts.load(FONT_SPEC).then(markReady).catch(markReady);
      } else {
        markReady();
      }
    };

    const schedule =
      typeof window !== 'undefined' && 'requestIdleCallback' in window
        ? (cb: () => void) => {
            const id = window.requestIdleCallback(cb, { timeout: 1500 });
            return () => window.cancelIdleCallback(id);
          }
        : (cb: () => void) => {
            const id = window.setTimeout(cb, 0);
            return () => window.clearTimeout(id);
          };

    const cancelSchedule = schedule(loadFont);
    return () => {
      window.clearTimeout(timeout);
      cancelSchedule();
    };
  }, []);

  return null;
}

/** Detay sayfası gibi kritik geçişlerde font hazır olana kadar bekle */
export function whenMaterialIconsReady(): Promise<void> {
  if (typeof document === 'undefined') return Promise.resolve();
  if (document.documentElement.classList.contains(READY_CLASS)) return Promise.resolve();

  return Promise.race([
    document.fonts?.load?.(FONT_SPEC) ?? Promise.resolve(),
    new Promise<void>((r) => window.setTimeout(r, MAX_WAIT_MS)),
  ]).then(() => {
    document.documentElement.classList.add(READY_CLASS);
  });
}
