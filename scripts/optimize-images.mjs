/**
 * PageSpeed: logo + şehir görsellerini küçültür ve WebP üretir.
 * Kullanım: node scripts/optimize-images.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const roots = [
  path.join(__dirname, '../public'),
  path.join(__dirname, '../../KitabeWeb/public'),
];

const CITY_MAX_WIDTH = 560;
const CITY_WEBP_QUALITY = 64;
const CITY_LCP_WIDTH = 400;
const CITY_LCP_QUALITY = 50;

async function optimizeLogo(publicDir) {
  const iconPath = path.join(publicDir, 'icon.png');
  if (!fs.existsSync(iconPath)) return;

  const headerWebp = path.join(publicDir, 'logo-header.webp');
  const headerPng = path.join(publicDir, 'logo-header.png');
  const appleIcon = path.join(publicDir, 'icon-180.png');

  await sharp(iconPath).resize(72, 72, { fit: 'cover' }).webp({ quality: 85 }).toFile(headerWebp);
  await sharp(iconPath).resize(72, 72, { fit: 'cover' }).png({ compressionLevel: 9 }).toFile(headerPng);
  await sharp(iconPath).resize(160, 160, { fit: 'cover' }).webp({ quality: 85 }).toFile(path.join(publicDir, 'logo-160.webp'));
  await sharp(iconPath).resize(260, 260, { fit: 'cover' }).webp({ quality: 85 }).toFile(path.join(publicDir, 'logo-260.webp'));
  await sharp(iconPath).resize(180, 180, { fit: 'cover' }).png({ compressionLevel: 9 }).toFile(appleIcon);
  const iconTmp = path.join(publicDir, 'icon.png.tmp');
  await sharp(iconPath).resize(512, 512, { fit: 'cover' }).png({ compressionLevel: 9 }).toFile(iconTmp);
  fs.renameSync(iconTmp, iconPath);

  console.log(`[logo] ${publicDir}`);
}

function citySourcePath(citiesDir, base) {
  const jpg = path.join(citiesDir, `${base}.jpg`);
  const jpeg = path.join(citiesDir, `${base}.jpeg`);
  const webp = path.join(citiesDir, `${base}.webp`);
  if (fs.existsSync(jpg)) return jpg;
  if (fs.existsSync(jpeg)) return jpeg;
  if (fs.existsSync(webp)) return webp;
  return null;
}

async function encodeCityVariant(input, outPath, width, quality) {
  const pipeline = sharp(input)
    .rotate()
    .resize(width, null, { withoutEnlargement: true })
    .webp({ quality, effort: 6, smartSubsample: true });

  if (path.resolve(input) === path.resolve(outPath)) {
    const buf = await pipeline.toBuffer();
    fs.writeFileSync(outPath, buf);
    return;
  }

  await pipeline.toFile(outPath);
}

async function optimizeCities(publicDir) {
  const citiesDir = path.join(publicDir, 'cities');
  if (!fs.existsSync(citiesDir)) return;

  const bases = new Set(
    fs
      .readdirSync(citiesDir)
      .filter((f) => /\.(jpe?g|webp)$/i.test(f))
      .map((f) => f.replace(/\.(jpe?g|webp)$/i, ''))
  );

  for (const base of bases) {
    const src = citySourcePath(citiesDir, base);
    if (!src) continue;

    const webpOut = path.join(citiesDir, `${base}.webp`);
    const lcpOut = path.join(citiesDir, `${base}-480.webp`);
    const jpgOut = path.join(citiesDir, `${base}.jpg`);

    await encodeCityVariant(src, webpOut, CITY_MAX_WIDTH, CITY_WEBP_QUALITY);
    await encodeCityVariant(src, lcpOut, CITY_LCP_WIDTH, CITY_LCP_QUALITY);

    if (/\.jpe?g$/i.test(src)) {
      const jpgTmp = `${jpgOut}.tmp`;
      await sharp(src)
        .rotate()
        .resize(CITY_MAX_WIDTH, null, { withoutEnlargement: true })
        .jpeg({ quality: CITY_WEBP_QUALITY, mozjpeg: true })
        .toFile(jpgTmp);
      fs.renameSync(jpgTmp, jpgOut);
    }

    const webpKb = (fs.statSync(webpOut).size / 1024).toFixed(1);
    const lcpKb = (fs.statSync(lcpOut).size / 1024).toFixed(1);
    console.log(`[city] ${base}: webp ${webpKb}KB, lcp-480 ${lcpKb}KB`);
  }
}

for (const publicDir of roots) {
  if (!fs.existsSync(publicDir)) continue;
  console.log(`\n=== ${publicDir} ===`);
  await optimizeLogo(publicDir);
  await optimizeCities(publicDir);
}
