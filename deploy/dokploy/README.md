# Dokploy — kitabe.org güvenlik ve deploy

Dokploy uygulamalarında **ayrı Nginx yok**; trafik **Traefik** (`dokploy-traefik`) üzerinden container portuna gider. Loglardaki `nginx` satırları Traefik veya host proxy'sinden gelir.

**En pratik çözüm:** `middleware.ts` — redeploy sonrası `/.git`, `/wp-admin` vb. **404** döner (SPA catch-all 200 vermez).

---

## Adım 1 — Uygulamayı yeniden deploy et (zorunlu)

1. Dokploy → **Projects** → KitabeWeb-Next (veya kitabe.org uygulaması)
2. **Deployments** → **Deploy** (son commit'i çek)
3. Deploy bitince test:

```bash
curl -sI https://kitabe.org/.git/config | findstr HTTP
# Beklenen: HTTP/2 404  (veya HTTP/1.1 404)
```

Bu adım Nginx/Traefik ayarı gerektirmez; middleware uygulama katmanında çalışır.

---

## Adım 2 — Build tipi (ilk kurulum / Dockerfile)

| Ayar | Değer |
|------|--------|
| Build Type | **Dockerfile** |
| Dockerfile path | `Dockerfile` |
| Build context | Repo kökü |

**Environment variables** (Dokploy → Environment):

```
NEXT_PUBLIC_API_URL=https://api.kitabe.org
NEXT_PUBLIC_SITE_URL=https://kitabe.org
SERVER_API_KEY=<revalidate-secret>
PORT=3000
```

Uygulama `0.0.0.0:3000` dinlemeli (Dockerfile'da `HOSTNAME=0.0.0.0`).

---

## Adım 3 — Domain ayarı

1. **Domains** → `kitabe.org` (+ isteğe bağlı `www.kitabe.org`)
2. **Container Port:** `3000`
3. **HTTPS:** açık, sertifika **Let's Encrypt**
4. **Advanced → Ports** bölümünü **kapatın** (IP:port ile erişim gerekmiyorsa); domain ile çakışabilir.

---

## Adım 4 — Traefik (opsiyonel, sunucu SSH)

Uygulama katmanından önce engellemek için sunucuda:

```bash
sudo nano /etc/dokploy/traefik/dynamic/kitabe-security.yml
```

İçeriği: `deploy/dokploy/traefik-block-scanners.yml` dosyasını yapıştırın.

```bash
sudo docker restart dokploy-traefik
```

---

## Adım 5 — Backend API (slug 404 düzeltmesi)

Aynı deploy turunda **Kitabe API** servisini de yeniden başlatın (`Kitabe-rn/backend` — `places.js` slug fallback).

---

## Sorun giderme

| Belirti | Çözüm |
|---------|--------|
| `.git/config` hâlâ 200 + HTML | Middleware deploy olmamış; cache temizleyip redeploy |
| Bad Gateway | Container port 3000 değil; domain portunu kontrol et |
| Sitemap yavaş | Parçalı sitemap deploy edildi (`/sitemap/tr.xml` vb.) |
| Arapça 404 | API + Next birlikte deploy; `npm run audit-slugs -- --locale=ar` |

---

## Özet

| Ne | Nerede |
|----|--------|
| Tarayıcı taraması → 404 | `middleware.ts` + **Redeploy** |
| Dockerfile | `Dockerfile` |
| Traefik (SSH) | `deploy/dokploy/traefik-block-scanners.yml` |
