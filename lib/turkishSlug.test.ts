/**
 * npx --yes tsx --test lib/turkishSlug.test.ts
 * (veya: node --import tsx --test lib/turkishSlug.test.ts)
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { slugPathLookupVariants } from './turkishSlug';

describe('slugPathLookupVariants', () => {
  it('Balıkesir eski URL → kanonik', () => {
    const v = slugPathLookupVariants(
      'bal-kesir/kuva-yi-milliye-museum-bal-kesir-national-struggle-museum'
    );
    assert.ok(
      v.includes('balikesir/kuva-yi-milliye-museum-balikesir-national-struggle-museum')
    );
  });

  it('Aydın eski URL → kanonik', () => {
    const v = slugPathLookupVariants(
      'ayd-n/dilek-peninsula-buyuk-menderes-delta-national-park'
    );
    assert.ok(v.includes('aydin/dilek-peninsula-buyuk-menderes-delta-national-park'));
  });

  it('Kırklareli eski URL → kanonik', () => {
    const v = slugPathLookupVariants('k-rklareli/mesta');
    assert.ok(v.includes('kirklareli/mesta'));
  });

  it('bilinmeyen path dokunulmaz', () => {
    assert.deepEqual(slugPathLookupVariants('ankara/unknown-place'), [
      'ankara/unknown-place',
    ]);
  });
});
