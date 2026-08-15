/**
 * Récupère les miniatures YouTube une fois pour toutes et les range dans le
 * dépôt.
 *
 * L'intérêt : la page retrouve l'aspect d'une vidéo YouTube, miniature comprise,
 * sans qu'aucune requête ne parte chez Google à l'ouverture. Une miniature
 * appelée en direct depuis i.ytimg.com signalerait la visite à chaque
 * chargement ; servie depuis le site, elle ne signale rien et s'affiche plus
 * vite.
 *
 *   npm run thumbnails
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const videos = [
  { id: 'mPIuvoqGzm4', nom: 'calypso-clinique-fondamentale' },
  { id: 'dY2bxclkMtg', nom: 'calypso-bases-epistemologiques' },
  { id: 'H6OMQm-QRL8', nom: 'calypso-depression' },
];

const outDir = 'src/assets/images/videos';
fs.mkdirSync(outDir, { recursive: true });

for (const { id, nom } of videos) {
  // maxresdefault n'existe pas pour toutes les vidéos ; hqdefault est toujours
  // présent et suffit largement à la taille où la miniature est affichée.
  let buffer = null;
  for (const variante of ['maxresdefault', 'hqdefault']) {
    const res = await fetch(`https://i.ytimg.com/vi/${id}/${variante}.jpg`);
    if (res.ok) {
      const b = Buffer.from(await res.arrayBuffer());
      // YouTube renvoie une image grise de 120×90 quand la variante manque.
      const { width } = await sharp(b).metadata();
      if (width > 200) {
        buffer = b;
        console.log(`${nom.padEnd(34)} ${variante} ${width}px`);
        break;
      }
    }
  }

  if (!buffer) {
    console.error(`${nom} : aucune miniature récupérée`);
    process.exitCode = 1;
    continue;
  }

  const dest = path.join(outDir, `${nom}.jpg`);
  await sharp(buffer).jpeg({ quality: 82 }).toFile(dest);
  console.log(`  → ${dest} (${(fs.statSync(dest).size / 1024).toFixed(0)} Ko)`);
}
