import { useEffect } from 'react';

const READY_CLASS = 'material-icons-ready';
const FONT_SPEC = '24px "Material Icons"';
const MAX_WAIT_MS = 4000;

/** Google Material Icons yüklenince kök html'e sınıf ekler — ligature metni flash'ını keser */
export function IconFontLoader() {
  useEffect(() => {
    if (document.documentElement.classList.contains(READY_CLASS)) return;

    let done = false;
    const markReady = () => {
      if (done) return;
      done = true;
      document.documentElement.classList.add(READY_CLASS);
    };

    const timeout = window.setTimeout(markReady, MAX_WAIT_MS);

    if (document.fonts?.load) {
      document.fonts.load(FONT_SPEC).then(markReady).catch(markReady);
    } else {
      markReady();
    }

    return () => window.clearTimeout(timeout);
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
