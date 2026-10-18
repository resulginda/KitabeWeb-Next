/**
 * Eski EN/RU/AR URL'lerinde "ı" (U+0131) tireye dönüşmüştü (Aydın → ayd-n).
 * Lookup / eşleme için kanonik ↔ eski biçim varyantları.
 * Yeni slug üretimi backend placeSlug.slugifyPart'ta yapılır.
 */
export const TURKISH_LETTER_SLUG_REPAIRS: ReadonlyArray<readonly [string, string]> = [
  ['bal-kesir', 'balikesir'],
  ['ayd-n', 'aydin'],
  ['k-rklareli', 'kirklareli'],
  ['k-r-kkale', 'kirikkale'],
  ['k-rsehir', 'kirsehir'],
  ['sanl-urfa', 'sanliurfa'],
  ['diyarbak-r', 'diyarbakir'],
];

/** Verilen path için kanonik ve eski ı→tire biçimleri. */
export function slugPathLookupVariants(fullSlug: string): string[] {
  const raw = String(fullSlug || '').trim();
  if (!raw) return [];
  const out = new Set<string>([raw]);
  let wave = [raw];
  for (const [from, to] of TURKISH_LETTER_SLUG_REPAIRS) {
    const next: string[] = [];
    for (const v of wave) {
      next.push(v);
      if (v.includes(from)) next.push(v.split(from).join(to));
      if (v.includes(to)) next.push(v.split(to).join(from));
    }
    wave = [...new Set(next)];
  }
  for (const v of wave) out.add(v);
  return [...out];
}
