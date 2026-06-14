import { revalidatePath, revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { secret, paths, tag, purgeSitemap } = body as {
    secret?: string;
    paths?: string[];
    tag?: string;
    purgeSitemap?: boolean;
  };

  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ message: 'Invalid secret' }, { status: 401 });
  }

  if (tag) revalidateTag(tag);
  if (Array.isArray(paths)) {
    for (const p of paths) {
      revalidatePath(p);
    }
  }

  revalidateTag('places-index');
  revalidateTag('listings-index');
  if (purgeSitemap) {
    revalidatePath('/sitemap.xml');
  }

  return NextResponse.json({ revalidated: true, paths, tag, purgeSitemap: !!purgeSitemap });
}
