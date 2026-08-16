/**
 * Calcule les deux visualisations de la page Recherche et les écrit sous forme
 * de SVG statiques.
 *
 *   src/data/collaborations.json  →  src/data/graphe.svg + src/data/carte.svg
 *
 * Le calcul a lieu ici, au moment de la compilation, plutôt que dans le
 * navigateur : la page reste servie sans une ligne de JavaScript, s'affiche
 * instantanément, et le contenu demeure lisible pour les moteurs de recherche
 * comme pour les lecteurs d'écran.
 *
 *   npm run visualisations
 */
import fs from 'node:fs';
import * as topojson from 'topojson-client';

const donnees = JSON.parse(fs.readFileSync('src/data/collaborations.json', 'utf8'));

const PAPIER = '#fbf9f3';
const ENCRE_DOUCE = '#55514a';
const ACCENT = '#003153';
const FILET = '#e0d9c9';

/* ================================================================ */
/* Graphe des co-auteurs                                             */
/* ================================================================ */

const { noeuds, aretes } = donnees.graphe;
const L = 900;
const H = 620;

// Disposition par forces : répulsion entre tous les nœuds, ressorts le long des
// liens, et rappel vers le centre. Soixante-six nœuds : le coût quadratique est
// sans conséquence, et le résultat est reproductible d'une compilation à
// l'autre puisque la position initiale est déterministe.
const positions = new Map();
noeuds.forEach((n, i) => {
  const angle = (i / noeuds.length) * Math.PI * 2;
  const rayon = n.moi ? 0 : 200 + (i % 5) * 20;
  positions.set(n.id, { x: L / 2 + Math.cos(angle) * rayon, y: H / 2 + Math.sin(angle) * rayon, vx: 0, vy: 0 });
});

const poidsMax = Math.max(...aretes.map((a) => a.poids));

for (let iteration = 0; iteration < 500; iteration++) {
  const refroidissement = 1 - iteration / 500;

  // Répulsion
  for (let i = 0; i < noeuds.length; i++) {
    for (let j = i + 1; j < noeuds.length; j++) {
      const a = positions.get(noeuds[i].id);
      const b = positions.get(noeuds[j].id);
      let dx = b.x - a.x;
      let dy = b.y - a.y;
      let d2 = dx * dx + dy * dy;
      if (d2 < 1) {
        dx = (i - j) * 0.1 + 0.1;
        dy = 0.1;
        d2 = 1;
      }
      const force = 9000 / d2;
      const d = Math.sqrt(d2);
      a.vx -= (dx / d) * force;
      a.vy -= (dy / d) * force;
      b.vx += (dx / d) * force;
      b.vy += (dy / d) * force;
    }
  }

  // Ressorts : plus la collaboration est fréquente, plus le lien est court
  for (const lien of aretes) {
    const a = positions.get(lien.a);
    const b = positions.get(lien.b);
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const d = Math.hypot(dx, dy) || 1;
    const repos = 150 - (lien.poids / poidsMax) * 90;
    const force = (d - repos) * 0.012;
    a.vx += (dx / d) * force;
    a.vy += (dy / d) * force;
    b.vx -= (dx / d) * force;
    b.vy -= (dy / d) * force;
  }

  // Rappel central, et Ali maintenu au centre : c'est son réseau
  for (const n of noeuds) {
    const p = positions.get(n.id);
    p.vx += (L / 2 - p.x) * 0.008;
    p.vy += (H / 2 - p.y) * 0.008;
    p.x += Math.max(-18, Math.min(18, p.vx * refroidissement));
    p.y += Math.max(-18, Math.min(18, p.vy * refroidissement));
    p.vx *= 0.82;
    p.vy *= 0.82;
    if (n.moi) {
      p.x = L / 2;
      p.y = H / 2;
    }
  }
}

// Recentre et met à l'échelle pour occuper tout le cadre
const marge = 60;
const xs = [...positions.values()].map((p) => p.x);
const ys = [...positions.values()].map((p) => p.y);
const echelle = Math.min(
  (L - 2 * marge) / (Math.max(...xs) - Math.min(...xs) || 1),
  (H - 2 * marge) / (Math.max(...ys) - Math.min(...ys) || 1),
);
const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
const cy = (Math.min(...ys) + Math.max(...ys)) / 2;
for (const p of positions.values()) {
  p.x = L / 2 + (p.x - cx) * echelle;
  p.y = H / 2 + (p.y - cy) * echelle;
}

const rayonDe = (n) => (n.moi ? 13 : 4 + Math.min(9, Math.sqrt(n.publications) * 1.5));

const svgGraphe = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${L} ${H}" role="img" aria-labelledby="graphe-titre">
  <title id="graphe-titre">Réseau des co-auteurs : ${noeuds.length} collaborateurs réguliers, reliés par leurs publications communes</title>
  <g stroke="${ACCENT}" fill="none">
    ${aretes
      .map((l) => {
        const a = positions.get(l.a);
        const b = positions.get(l.b);
        const opacite = (0.08 + (l.poids / poidsMax) * 0.35).toFixed(2);
        return `<line x1="${a.x.toFixed(1)}" y1="${a.y.toFixed(1)}" x2="${b.x.toFixed(1)}" y2="${b.y.toFixed(1)}" stroke-opacity="${opacite}" stroke-width="${(0.5 + (l.poids / poidsMax) * 2).toFixed(2)}"/>`;
      })
      .join('\n    ')}
  </g>
  <g>
    ${noeuds
      .map((n) => {
        const p = positions.get(n.id);
        const r = rayonDe(n);
        return `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${r.toFixed(1)}" fill="${n.moi ? ACCENT : PAPIER}" stroke="${ACCENT}" stroke-width="${n.moi ? 0 : 1.2}"><title>${n.nom} — ${n.publications} publications communes (${n.premiere}–${n.derniere})</title></circle>`;
      })
      .join('\n    ')}
  </g>
  <g font-family="EB Garamond, Georgia, serif" fill="${ENCRE_DOUCE}">
    ${noeuds
      .filter((n) => n.publications >= 10 || n.moi)
      .map((n) => {
        const p = positions.get(n.id);
        const r = rayonDe(n);
        return `<text x="${p.x.toFixed(1)}" y="${(p.y - r - 5).toFixed(1)}" text-anchor="middle" font-size="${n.moi ? 17 : 12.5}" font-weight="${n.moi ? 600 : 400}" fill="${n.moi ? ACCENT : ENCRE_DOUCE}">${n.nom}</text>`;
      })
      .join('\n    ')}
  </g>
</svg>`;

fs.writeFileSync('src/data/graphe.svg', svgGraphe);
console.log(`Graphe : ${noeuds.length} nœuds, ${aretes.length} liens → src/data/graphe.svg`);

/* ================================================================ */
/* Carte des collaborations                                          */
/* ================================================================ */

// Correspondance entre les codes à deux lettres d'OpenAlex et les codes
// numériques du fonds cartographique.
const CODES = {
  FR: 250, GB: 826, US: 840, BE: 56, DE: 276, CA: 124, NL: 528, FI: 246,
  ES: 724, SE: 752, PT: 620, NO: 578, AU: 36, JP: 392, IE: 372, DK: 208,
  LU: 442, CL: 152, CH: 756, IT: 380, NP: 524, CI: 384, MC: 492, PK: 586,
  BR: 76, BI: 108, AT: 40, PL: 616, CZ: 203, GR: 300, TR: 792, CN: 156,
  IN: 356, ZA: 710, MA: 504, TN: 788, DZ: 12, SN: 686, RU: 643, IL: 376,
  KR: 410, MX: 484, AR: 32, NZ: 554, SG: 702, HU: 348, RO: 642, RS: 688,
  HR: 191, BG: 100, EE: 233, LT: 440, LV: 428, SI: 705, SK: 703, IS: 352,
};

const parPays = new Map(donnees.geographie.pays.map((p) => [CODES[p.code], p.publications]));

const monde = JSON.parse(fs.readFileSync('node_modules/world-atlas/countries-110m.json', 'utf8'));
const pays = topojson.feature(monde, monde.objects.countries);

// Projection équirectangulaire, l'Antarctique écarté : il n'apporte rien ici et
// mange un quart de la hauteur.
const CL = 900;
const CH_ = 420;
const projeter = ([lon, lat]) => [((lon + 180) / 360) * CL, ((85 - lat) / 150) * CH_];

function cheminDe(geometrie) {
  const anneaux = geometrie.type === 'Polygon' ? [geometrie.coordinates] : geometrie.coordinates;
  return anneaux
    .map((polygone) =>
      polygone
        .map((anneau) => anneau.map((pt, i) => `${i ? 'L' : 'M'}${projeter(pt).map((v) => v.toFixed(1)).join(' ')}`).join('') + 'Z')
        .join(''),
    )
    .join('');
}

// Quatre paliers plutôt qu'un dégradé continu : avec 1455 publications pour la
// France contre 1 pour le Burundi, une échelle linéaire n'afficherait qu'un
// seul pays.
const palier = (n) => (n >= 100 ? 0.85 : n >= 20 ? 0.6 : n >= 5 ? 0.38 : 0.2);

const svgCarte = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${CL} ${CH_}" role="img" aria-labelledby="carte-titre">
  <title id="carte-titre">Carte des collaborations : ${donnees.geographie.pays.length} pays représentés, de la France au Burundi</title>
  <g stroke="${PAPIER}" stroke-width="0.4">
    ${pays.features
      .filter((f) => f.id !== '010')
      .map((f) => {
        const n = parPays.get(Number(f.id));
        const remplissage = n ? ACCENT : FILET;
        const opacite = n ? palier(n) : 0.45;
        const infobulle = n ? `<title>${f.properties.name} — ${n} affiliations</title>` : '';
        return `<path d="${cheminDe(f.geometry)}" fill="${remplissage}" fill-opacity="${opacite}">${infobulle}</path>`;
      })
      .join('\n    ')}
  </g>
</svg>`;

fs.writeFileSync('src/data/carte.svg', svgCarte);
console.log(`Carte : ${donnees.geographie.pays.length} pays → src/data/carte.svg`);
