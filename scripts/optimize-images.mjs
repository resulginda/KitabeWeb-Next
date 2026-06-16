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

async function optimizeCities(publicDir) {
  const citiesDir = path.join(publicDir, 'cities');
  if (!fs.existsSync(citiesDir)) return;

  const files = fs.readdirSync(citiesDir).filter((f) => /\.jpe?g$/i.test(f));
  for (const file of files) {
    const src = path.join(citiesDir, file);
    const base = file.replace(/\.jpe?g$/i, '');
    const webpOut = path.join(citiesDir, `${base}.webp`);
    const jpgOut = path.join(citiesDir, file);

    await sharp(src)
      .resize(640, null, { withoutEnlargement: true })
      .webp({ quality: 82 })
      .toFile(webpOut);

    await sharp(src)
      .resize(640, null, { withoutEnlargement: true })
      .jpeg({ quality: 82, mozjpeg: true })
      .toFile(jpgOut + '.tmp');

    fs.renameSync(jpgOut + '.tmp', jpgOut);
    const webpKb = (fs.statSync(webpOut).size / 1024).toFixed(1);
    const jpgKb = (fs.statSync(jpgOut).size / 1024).toFixed(1);
    console.log(`[city] ${base}: webp ${webpKb}KB, jpg ${jpgKb}KB`);
  }
}

for (const publicDir of roots) {
  if (!fs.existsSync(publicDir)) continue;
  console.log(`\n=== ${publicDir} ===`);
  await optimizeLogo(publicDir);
  await optimizeCities(publicDir);
}
