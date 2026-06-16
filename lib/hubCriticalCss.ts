/** İlk boyama için minimal CSS — harici stylesheet beklenmeden header + LCP kartı */
export const HUB_CRITICAL_CSS = `
:root{--primary:#8D6E63;--header-h:64px;--bg-main:#F5F5F5;--text-on-primary:#fff;--gap-md:20px}
*,*::before,*::after{box-sizing:border-box}
body{margin:0;background:var(--bg-main);color:#232323}
.page-container{flex:1;display:flex;flex-direction:column;padding-bottom:5rem}
.site-header{position:sticky;top:0;z-index:1100;height:var(--header-h);background:var(--primary);color:var(--text-on-primary)}
.site-header-inner{height:100%;display:flex;align-items:center;padding:0 16px;gap:var(--gap-md)}
.site-header-logo{display:flex;align-items:center;gap:10px;color:inherit;text-decoration:none;font-size:1.5rem;font-weight:600}
.site-header-logo-img{width:36px;height:36px;border-radius:10px}
.locale-hub-card-image{position:relative;aspect-ratio:16/10;background:#e8f0ea;overflow:hidden}
.locale-hub-card-img-native,.locale-hub-card-image img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.locale-hub-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:1rem}
`.replace(/\s+/g, ' ').trim();
