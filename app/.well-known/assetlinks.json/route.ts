import { NextResponse } from 'next/server';

// Android App Links doğrulaması (kitabe.org → uygulama).
// Bir uygulama birden fazla imza ile doğrulanabilir; bu yüzden hem prod hem
// (yerel test için) debug parmak izini ekliyoruz.
//   - 7C:00:F5... : Play Store / üretim imza anahtarı
//   - FA:C6:17... : Android SDK debug keystore (lokalde build alınan APK)
// NOT: Üretimde sadece prod (ve Play App Signing) parmak izlerini bırakmak en güvenlisidir.
const SHA256_FINGERPRINTS = [
  '7C:00:F5:4C:E1:19:4D:11:4B:F7:1B:C1:05:1E:3D:50:BE:02:F4:82:06:F5:54:76:84:F5:9B:15:3C:49:CD:A1',
  'FA:C6:17:45:DC:09:03:78:6F:B9:ED:E6:2A:96:2B:39:9F:73:48:F0:BB:6F:89:9B:83:32:66:75:91:03:3B:9C',
];

export const dynamic = 'force-static';

export function GET() {
  const body = [
    {
      relation: [
        'delegate_permission/common.handle_all_urls',
        'delegate_permission/common.get_login_creds',
      ],
      target: {
        namespace: 'android_app',
        package_name: 'com.kitabeapp',
        sha256_cert_fingerprints: SHA256_FINGERPRINTS,
      },
    },
  ];

  return NextResponse.json(body, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
