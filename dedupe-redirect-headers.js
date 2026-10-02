// Next.js 15.4.1+ hatası (vercel/next.js#82117): ISR sayfasında permanentRedirect()
// önbellek dolmadan ilk istekte Location ve x-nextjs-stale-time başlıklarını iki kez
// yazıyor. Bazı tarayıcı/botlar (Bing, undici) bunları "/a, /a" diye birleştirip
// bozuk adrese gidiyor. `node -r ./dedupe-redirect-headers.js server.js` ile yüklenir.
const http = require('http');

const SINGLE_VALUE = new Set(['location', 'x-nextjs-stale-time']);
const originalAppendHeader = http.ServerResponse.prototype.appendHeader;

if (typeof originalAppendHeader === 'function') {
  http.ServerResponse.prototype.appendHeader = function appendHeader(name, value) {
    if (SINGLE_VALUE.has(String(name).toLowerCase()) && this.hasHeader(name)) {
      this.setHeader(name, value);
      return this;
    }
    return originalAppendHeader.call(this, name, value);
  };
}
