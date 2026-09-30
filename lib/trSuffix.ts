const TR_VOWELS = 'aeıioöuü';

function trLastVowel(word: string): string {
  const w = word.toLocaleLowerCase('tr').replace(/â/g, 'a').replace(/î/g, 'i').replace(/û/g, 'u');
  for (let i = w.length - 1; i >= 0; i--) {
    if (TR_VOWELS.includes(w[i])) return w[i];
  }
  return 'e';
}

function endsWithVowel(word: string): boolean {
  return TR_VOWELS.includes(word.toLocaleLowerCase('tr').slice(-1));
}

/** Özel ada ünlü uyumuna göre ilgi eki: İstanbul'un, Amasya'nın, Kaş'ın */
export function trGen(word: string): string {
  const v = trLastVowel(word);
  const h = 'aı'.includes(v) ? 'ı' : 'ei'.includes(v) ? 'i' : 'ou'.includes(v) ? 'u' : 'ü';
  return `${word}'${endsWithVowel(word) ? 'n' : ''}${h}n`;
}

/** Özel ada bulunma eki: İstanbul'da, Kaş'ta, İzmir'de */
export function trLoc(word: string): string {
  const v = trLastVowel(word);
  const a = 'aıou'.includes(v) ? 'a' : 'e';
  const d = 'çfhkpsşt'.includes(word.toLocaleLowerCase('tr').slice(-1)) ? 't' : 'd';
  return `${word}'${d}${a}`;
}
