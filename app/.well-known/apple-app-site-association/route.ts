import { NextResponse } from 'next/server';

// iOS Universal Links doğrulaması (kitabe.org → uygulama).
// Dosya uzantısız ve application/json olarak servis edilmeli.
const APP_ID = '4M6F9WR7WL.com.kitabeapp';

export const dynamic = 'force-static';

export function GET() {
  const body = {
    applinks: {
      apps: [],
      details: [
        {
          appID: APP_ID,
          paths: [
            '/detail/*',
            '/tr/*',
            '/en/*',
            '/ru/*',
            '/ar/*',
            '/reset-password',
            '/reset-password/*',
          ],
        },
      ],
    },
  };

  return NextResponse.json(body, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
