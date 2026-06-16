# kitabe.org nginx — SEO liste URL'leri

## Nerede?

**Asıl nginx config `KitabeWeb/nginx.conf.template` içinde** — Dokploy'daki SPA container'ı Next.js'e proxy yapar. VPS'e ayrıca SSH ile nginx yazmana gerek yok.

`nginx-seo-listings.conf` bu dosyanın referans kopyasıdır.

## Ne yapıldı?

`981e92d` commit'i ile kesfet slash URL'leri eklendi:

```nginx
location ~ ^/(tr|en|ru|ar)/[^/]+/(kesfet|explore|mesta|istikshaf)(/.*)?$ {
    proxy_pass http://$kitabe_next;
    ...
}
```

KitabeWeb (kitabe-web) redeploy olduktan sonra şunlar çalışmalı:

- `https://kitabe.org/tr/antalya/kesfet`
- `https://kitabe.org/tr/antalya/kesfet/muzeler`
- `https://kitabe.org/tr/antalya/kesfet/muratpasa/kiliseler`

## Dokploy'da kontrol

1. **KitabeWeb** uygulamasının yeni commit'i deploy etmesini bekle (`981e92d`).
2. Env'de `KITABE_NEXT_UPSTREAM` doğru olmalı (ör. `kitabeweb-nextjs-4ajgio:3000`).
3. Next.js container ayakta olmalı (`Ready` logu).

## Tire formatı (yedek)

Nginx deploy olmadan önce veya sorun olursa tire URL'ler de çalışır:

| Slash | Tire |
|-------|------|
| `/tr/antalya/kesfet/muzeler` | `/tr/antalya/kesfet-muzeler` |
