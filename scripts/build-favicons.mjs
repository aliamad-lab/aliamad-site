/**
 * Fabrique les icônes du site à partir de la gravure du chat au dos arqué,
 * qui servait déjà de favicon sur le site Google Sites.
 *
 * L'original est en portrait : un recadrage carré centré sur l'animal est
 * nécessaire, sinon la silhouette est tronquée aux petites tailles. À 16 pixels,
 * c'est la forme du dos arqué qui reste lisible, pas le détail du pelage.
 *
 *   npm run favicons
 */
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const source = 'src/assets/images/accueil-darwin-chat-dos-arque.jpg';
const outDir = 'public';
fs.mkdirSync(outDir, { recursive: true });

const { width, height } = await sharp(source).metadata();

// Le bas de la planche n'est que hachurage de sol et signature du graveur :
// illisible en icône, et il écraserait l'animal s'il restait dans le cadre.
const utile = { left: 0, top: 0, width, height: Math.round(height * 0.82) };

// On garde l'animal entier plutôt que de tailler un carré dedans : découper au
// format carré amputait l'arche du dos et le bout de la queue, or c'est
// justement cette silhouette qui reste reconnaissable à 16 pixels.
const square = sharp(source)
  .extract(utile)
  // Fond papier plutôt que transparent : l'icône reste lisible sur les onglets
  // clairs comme sombres.
  .flatten({ background: '#fbf9f3' });

const targets = [
  { file: 'favicon-32.png', size: 32 },
  { file: 'favicon-96.png', size: 96 },
  { file: 'apple-touch-icon.png', size: 180 },
  { file: 'icon-192.png', size: 192 },
  { file: 'icon-512.png', size: 512 },
];

for (const { file, size } of targets) {
  await square
    .clone()
    .resize(size, size, { fit: 'contain', background: '#fbf9f3' })
    .png({ quality: 90 })
    .toFile(path.join(outDir, file));
  const { size: bytes } = fs.statSync(path.join(outDir, file));
  console.log(`${file.padEnd(22)} ${size}×${size}  ${(bytes / 1024).toFixed(1)} Ko`);
}

console.log(`\nSource : ${width}×${height}, zone utile ${utile.width}×${utile.height}`);
