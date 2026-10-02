import { timingSafeEqual } from 'crypto';
import { revalidatePath, revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

function secretMatches(given: unknown, expected: string): boolean {
  if (typeof given !== 'string') return false;
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Next önbellek etiketleri URL'nin yüzde-kodlu pathname'inden üretilir; Kiril/Arap yollar ancak kodlu hâliyle eşleşir. */
function pathVariants(path: string): string[] {
  let decoded = path;
  try {
    decoded = decodeURI(path);
  } catch {
    // geçersiz % dizisi: olduğu gibi kullan
  }
  const variants = new Set<string>([path]);
  for (const form of [decoded.normalize('NFC'), decoded.normalize('NFD')]) {
    variants.add(form);
    variants.add(encodeURI(form));
  }
  return [...variants];
}

export async function POST(req: NextRequest) {
  const expected = process.env.REVALIDATE_SECRET;
  if (!expected) {
    return NextResponse.json({ message: 'Revalidation disabled' }, { status: 503 });
  }

  let body: {
    secret?: unknown;
    paths?: unknown;
    tag?: unknown;
    purgeSitemap?: unknown;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: 'Invalid body' }, { status: 400 });
  }

  if (!secretMatches(body.secret, expected)) {
    return NextResponse.json({ message: 'Invalid secret' }, { status: 401 });
  }

  const tag = typeof body.tag === 'string' ? body.tag : undefined;
  const paths = Array.isArray(body.paths)
    ? body.paths.filter((p): p is string => typeof p === 'string' && p.startsWith('/'))
    : undefined;
  const purgeSitemap = body.purgeSitemap === true;

  if (tag) revalidateTag(tag);
  if (paths) {
    for (const p of paths) {
      for (const variant of pathVariants(p)) revalidatePath(variant);
    }
  }

  revalidateTag('places-index');
  revalidateTag('listings-index');
  if (purgeSitemap) {
    revalidatePath('/sitemap.xml');
  }

  return NextResponse.json({ revalidated: true, paths, tag, purgeSitemap });
}
