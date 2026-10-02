const MAX = 160;
const MIN = 120;

/** "St.", "Hz.", "M.Ö.", "yy.", "19." gibi kısaltma ve sıra sayılarında cümle bölünmez. */
const ABBREVIATION_END = /(?:^|[\s(])(?:(?:\p{Lu}\p{Ll}{0,2}\.)+|yy\.|vb\.|\d{1,4}\.)$/u;

function sentences(text: string): string[] {
  const parts = text.replace(/\s+/g, ' ').trim().split(/(?<=[.!?؟])\s+/).filter(Boolean);
  const merged: string[] = [];
  for (const part of parts) {
    const last = merged[merged.length - 1];
    if (last && ABBREVIATION_END.test(last)) merged[merged.length - 1] = `${last} ${part}`;
    else merged.push(part);
  }
  return merged;
}

function clip(text: string, max = MAX): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  const space = cut.lastIndexOf(' ');
  return `${(space > max * 0.6 ? cut.slice(0, space) : cut).replace(/[\s,;:—-]+$/, '')}…`;
}

function join(text: string, sentence: string): string {
  if (!text) return sentence;
  return `${/[.!?؟…]$/.test(text) ? text : `${text}.`} ${sentence}`;
}

/**
 * Arama motorları 120–160 karakter bekler: kısa açıklamayı ek metinlerden cümle
 * cümle tamamlar, yine kısa kalırsa sığan ilk `suffixes` metnini ekler, uzunsa kelime sınırında keser.
 */
export function fitMetaDescription(base: string, extras: string[] = [], suffixes: string[] = []): string {
  let text = base.replace(/\s+/g, ' ').trim();
  if (text.length >= MIN) return clip(text);

  for (const extra of extras) {
    for (const sentence of sentences(extra)) {
      if (text.includes(sentence)) continue;
      const next = join(text, sentence);
      if (next.length > MAX) break;
      text = next;
      if (text.length >= MIN) return text;
    }
  }

  for (const suffix of suffixes) {
    const next = join(text, suffix);
    if (next.length <= MAX) return next;
  }
  return clip(text);
}
