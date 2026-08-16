/**
 * Prépare les deux visualisations de la page Recherche à partir des données
 * déjà constituées pour la page Publications.
 *
 *   src/data/publications.json  →  src/data/collaborations.json
 *
 * Aucun nettoyage spécifique n'est demandé à Ali : c'est tout l'intérêt de
 * dériver les deux vues du même jeu de données annuel.
 *
 *   npm run collaborations
 */
import fs from 'node:fs';

const publications = JSON.parse(fs.readFileSync('src/data/publications.json', 'utf8'));

/* ---------------------------------------------------------------- */
/* Co-auteurs                                                        */
/* ---------------------------------------------------------------- */

/** Ramène « Amad, Ali » et « Amad, A » à une même clé. */
function clefAuteur(brut) {
  const a = brut.trim();
  if (!a || /^others$/i.test(a)) return null;

  let nom;
  let prenoms;
  if (a.includes(',')) {
    const [n, ...reste] = a.split(',');
    nom = n.trim();
    prenoms = reste.join(' ').trim();
  } else {
    const morceaux = a.split(/\s+/);
    nom = morceaux.pop() ?? '';
    prenoms = morceaux.join(' ');
  }

  // Une seule initiale : « Geoffroy, Pierre A » et « Geoffroy, PA » doivent se
  // rejoindre, sans quoi le graphe compte deux personnes là où il n'y en a
  // qu'une.
  const initiale = prenoms.replace(/[^A-Za-zÀ-ÿ]/g, '')[0]?.toUpperCase() ?? '';
  return {
    clef: `${nom.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')}|${initiale}`,
    affichage: initiale ? `${nom} ${initiale}` : nom,
  };
}

const MOI = 'amad|A';

const auteurs = new Map();
const liens = new Map();

for (const p of publications) {
  const presents = [];
  for (const brut of p.auteurs ?? []) {
    const a = clefAuteur(brut);
    if (!a) continue;
    if (!auteurs.has(a.clef)) auteurs.set(a.clef, { nom: a.affichage, publications: 0, annees: [] });
    const fiche = auteurs.get(a.clef);
    fiche.publications++;
    if (p.annee) fiche.annees.push(p.annee);
    presents.push(a.clef);
  }

  // Arêtes entre tous les co-auteurs d'une même publication
  const uniques = [...new Set(presents)];
  for (let i = 0; i < uniques.length; i++) {
    for (let j = i + 1; j < uniques.length; j++) {
      const paire = [uniques[i], uniques[j]].sort().join('::');
      liens.set(paire, (liens.get(paire) ?? 0) + 1);
    }
  }
}

// Le graphe complet compte plus de mille personnes : illisible. On retient les
// collaborateurs les plus réguliers, ceux avec qui le lien est réellement
// significatif.
const SEUIL = 4;
const retenus = new Set(
  [...auteurs.entries()]
    .filter(([clef, a]) => clef === MOI || a.publications >= SEUIL)
    .map(([clef]) => clef),
);

const noeuds = [...retenus]
  .map((clef) => ({
    id: clef,
    nom: auteurs.get(clef).nom,
    publications: auteurs.get(clef).publications,
    premiere: Math.min(...auteurs.get(clef).annees),
    derniere: Math.max(...auteurs.get(clef).annees),
    moi: clef === MOI,
  }))
  .sort((a, b) => b.publications - a.publications);

const aretes = [...liens.entries()]
  .map(([paire, poids]) => {
    const [a, b] = paire.split('::');
    return { a, b, poids };
  })
  .filter((l) => retenus.has(l.a) && retenus.has(l.b) && l.poids >= 2);

/* ---------------------------------------------------------------- */
/* Géographie                                                        */
/* ---------------------------------------------------------------- */

const parPays = new Map();
const parInstitution = new Map();

for (const p of publications) {
  for (const i of p.institutions ?? []) {
    if (!i.nom) continue;
    if (!parInstitution.has(i.nom)) parInstitution.set(i.nom, { nom: i.nom, pays: i.pays, publications: 0 });
    parInstitution.get(i.nom).publications++;
    if (i.pays) parPays.set(i.pays, (parPays.get(i.pays) ?? 0) + 1);
  }
}

const pays = [...parPays.entries()]
  .map(([code, publications]) => ({ code, publications }))
  .sort((a, b) => b.publications - a.publications);

const institutions = [...parInstitution.values()]
  .sort((a, b) => b.publications - a.publications)
  .slice(0, 40);

/* ---------------------------------------------------------------- */

const sortie = {
  genere: new Date().toISOString().slice(0, 10),
  graphe: { seuil: SEUIL, noeuds, aretes },
  geographie: { pays, institutions },
};

fs.writeFileSync('src/data/collaborations.json', JSON.stringify(sortie, null, 1));

console.log(`Graphe   : ${noeuds.length} co-auteurs retenus (seuil ${SEUIL} publications), ${aretes.length} liens`);
console.log(`Géographie : ${pays.length} pays, ${parInstitution.size} institutions`);
console.log('→ src/data/collaborations.json');
