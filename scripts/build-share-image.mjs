/**
 * Fabrique l'image de partage — la vignette affichée quand un lien du site est
 * envoyé par courriel ou posté sur un réseau social.
 *
 * Le texte est converti en tracés vectoriels depuis le fichier de police du
 * site : le moteur SVG de sharp ignore les `@font-face`, et se rabattrait sinon
 * sur une police système sans rapport avec la charte.
 *
 *   npm run partage
 */
import sharp from 'sharp';
import fs from 'node:fs';
import opentype from 'opentype.js';

const PAPIER = '#fbf9f3';
const ENCRE = '#1f1d1a';
const ENCRE_DOUCE = '#55514a';
const ACCENT = '#003153';
const FILET = '#e0d9c9';

// Format recommandé par les principaux réseaux.
const L = 1200;
const H = 630;

/**
 * Node réutilise un même pool mémoire pour ses Buffers : `.buffer` y donne
 * accès en entier, pas au seul fichier lu. Sans cette découpe, l'analyseur de
 * police reçoit les octets du voisin.
 */
function lirePolice(chemin) {
  const buf = fs.readFileSync(chemin);
  return opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
}

const regulier = lirePolice('node_modules/@fontsource/eb-garamond/files/eb-garamond-latin-400-normal.woff');
const demiGras = lirePolice('node_modules/@fontsource/eb-garamond/files/eb-garamond-latin-600-normal.woff');

/**
 * Rend une chaîne sous forme de tracés, un par signe.
 *
 * Deux précautions, l'une et l'autre nées d'un rendu tronqué en silence :
 *
 *  - les signes sont placés un à un, le rendu d'une chaîne entière par
 *    opentype.js produisant des coordonnées `NaN` sur cette police ;
 *  - l'abscisse est arrondie à chaque pas, car l'accumulation en virgule
 *    flottante finit par donner des valeurs du type 291.28000000000003 que
 *    `toPathData` convertit elle aussi en `NaN`.
 *
 * Dans les deux cas le moteur SVG abandonne le tracé à cet endroit sans rien
 * signaler : d'où le contrôle explicite ci-dessous.
 */
function tracer(police, texte, x, y, corps, couleur, interlettrage = 0) {
  let curseur = x;
  const morceaux = [];
  for (const signe of texte) {
    const abscisse = Math.round(curseur * 100) / 100;
    const trace = police.getPath(signe, abscisse, y, corps).toPathData(2);
    if (trace.includes('NaN')) throw new Error(`Tracé invalide pour « ${signe} » à x=${abscisse}`);
    if (trace) morceaux.push(`<path d="${trace}" fill="${couleur}"/>`);
    curseur = abscisse + police.getAdvanceWidth(signe, corps) + interlettrage;
  }
  return morceaux.join('');
}

const gravure = await sharp('src/assets/images/accueil-darwin-chat-dos-arque.jpg')
  .extract({ left: 0, top: 0, width: 1492, height: 1499 })
  .resize(420, 420, { fit: 'contain', background: PAPIER })
  .toBuffer();

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${L}" height="${H}">
  <rect width="${L}" height="${H}" fill="${PAPIER}"/>
  <rect x="0" y="0" width="${L}" height="10" fill="${ACCENT}"/>
  ${tracer(demiGras, 'Ali Amad', 80, 250, 86, ACCENT)}
  <line x1="80" y1="292" x2="300" y2="292" stroke="${ACCENT}" stroke-width="2"/>
  ${tracer(regulier, 'Professeur de psychiatrie', 80, 358, 40, ENCRE)}
  ${tracer(regulier, 'Université de Lille — CHU de Lille', 80, 408, 31, ENCRE_DOUCE)}
  <line x1="80" y1="500" x2="620" y2="500" stroke="${FILET}" stroke-width="1"/>
  ${tracer(regulier, 'ALIAMAD.COM', 80, 545, 26, ENCRE_DOUCE, 3)}
</svg>`;

await sharp(Buffer.from(svg))
  .composite([{ input: gravure, top: 105, left: 700 }])
  .png({ compressionLevel: 9, palette: true })
  .toFile('public/partage.png');

const { size } = fs.statSync('public/partage.png');
console.log(`public/partage.png — ${L}×${H}, ${(size / 1024).toFixed(0)} Ko`);
