/**
 * Chaîne de traitement de la bibliographie.
 *
 *   data/scholar-export.bib  →  src/data/publications.json
 *
 * L'export Google Scholar ne contient ni DOI ni affiliation : sans
 * enrichissement, la page afficherait près de trois cents titres inertes, sans
 * lien vers les articles et sans matière pour la carte des collaborations.
 * On complète donc chaque référence auprès de Crossref (DOI) puis d'OpenAlex
 * (institutions, pays).
 *
 * Les réponses sont mises en cache dans data/cache-enrichissement.json : une
 * seconde exécution ne rappelle pas les serveurs, et le travail reste
 * reprenable si l'on interrompt.
 *
 *   npm run publications
 */
import fs from 'node:fs';
import path from 'node:path';

const SOURCE = 'data/scholar-export.bib';
const CORRECTIONS = 'data/corrections-publications.json';
const CACHE = 'data/cache-enrichissement.json';
const SORTIE = 'src/data/publications.json';
const RAPPORT = 'data/rapport-publications.md';

// Crossref demande une adresse de contact pour l'accès au « pool poli », plus
// rapide et plus stable que l'accès anonyme.
const CONTACT = 'ali.amad@chu-lille.fr';

/* ------------------------------------------------------------------ */
/* Lecture du BibTeX                                                   */
/* ------------------------------------------------------------------ */

const ACCENTS = {
  "\\'e": 'é', "\\`e": 'è', "\\^e": 'ê', '\\"e': 'ë',
  "\\'a": 'á', "\\`a": 'à', "\\^a": 'â', '\\"a': 'ä',
  "\\'i": 'í', "\\`i": 'ì', "\\^i": 'î', '\\"i': 'ï',
  "\\'o": 'ó', "\\`o": 'ò', "\\^o": 'ô', '\\"o': 'ö',
  "\\'u": 'ú', "\\`u": 'ù', "\\^u": 'û', '\\"u': 'ü',
  "\\'y": 'ý', "\\'c": 'ć', '\\~n': 'ñ', '\\~a': 'ã', '\\~o': 'õ',
  '\\c c': 'ç', '\\cc': 'ç', '\\c C': 'Ç',
  "\\'E": 'É', "\\`E": 'È', "\\^E": 'Ê',
  "\\'A": 'Á', "\\`A": 'À', "\\^A": 'Â',
  "\\'O": 'Ó', "\\^O": 'Ô', "\\'U": 'Ú',
  '\\ss': 'ß', '\\o': 'ø', '\\O': 'Ø', '\\aa': 'å', '\\AA': 'Å',
  '\\ae': 'æ', '\\AE': 'Æ', '\\l': 'ł', '\\L': 'Ł',
};

/** Rend lisible le balisage LaTeX que Scholar laisse dans ses exports. */
function delatex(s) {
  if (!s) return s;
  let out = s;

  // {\'e} et \'{e} → é
  out = out.replace(/\{\\(.)\{?(\w)\}?\}/g, (m, accent, lettre) => ACCENTS[`\\${accent}${lettre}`] ?? m);
  out = out.replace(/\\(.)\{(\w)\}/g, (m, accent, lettre) => ACCENTS[`\\${accent}${lettre}`] ?? m);
  out = out.replace(/\{\\c\s*(\w)\}/g, (m, l) => ACCENTS[`\\c ${l}`] ?? m);

  for (const [latex, lettre] of Object.entries(ACCENTS)) out = out.split(`{${latex}}`).join(lettre);

  out = out.replace(/\\&/g, '&').replace(/\\%/g, '%').replace(/\\\$/g, '$').replace(/\\_/g, '_');
  out = out.replace(/[{}]/g, '');
  out = out.replace(/\s+/g, ' ').trim();
  return out;
}

function lireBib(chemin) {
  const brut = fs.readFileSync(chemin, 'utf8');
  const blocs = brut.split(/\n(?=@)/).filter((b) => b.trim().startsWith('@'));

  return blocs.map((bloc) => {
    const entete = /^@(\w+)\s*\{\s*([^,]*),/.exec(bloc);
    const champs = {};
    for (const m of bloc.matchAll(/(\w+)\s*=\s*\{((?:[^{}]|\{[^{}]*\})*)\}/g)) {
      champs[m[1].toLowerCase()] = delatex(m[2]);
    }
    return {
      cle: entete?.[2] ?? '',
      type: entete?.[1]?.toLowerCase() ?? 'misc',
      titre: champs.title ?? '',
      auteurs: decouperAuteurs(champs.author),
      annee: champs.year ? Number(champs.year) : null,
      revue: champs.journal ?? champs.booktitle ?? '',
      volume: champs.volume ?? '',
      numero: champs.number ?? '',
      pages: champs.pages ?? '',
      editeur: champs.publisher ?? '',
    };
  });
}

/**
 * Scholar sépare normalement par « and », mais laisse passer des listes
 * séparées par des virgules. On rattrape les deux cas.
 */
function decouperAuteurs(champ) {
  if (!champ) return [];
  const parties = /\sand\s/.test(champ) ? champ.split(/\s+and\s+/) : champ.split(/,\s*(?=[A-Z])/);
  return parties.map((a) => a.trim()).filter(Boolean);
}

/* ------------------------------------------------------------------ */
/* Normalisation                                                       */
/* ------------------------------------------------------------------ */

const clefTitre = (t) =>
  (t ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

/**
 * Une même revue apparaît sous plusieurs graphies dans l'export : casse,
 * accents, abréviations. On les ramène à une forme unique, en retenant la
 * graphie la mieux accentuée rencontrée.
 */
function normaliserRevues(publications) {
  const formes = new Map();
  for (const p of publications) {
    if (!p.revue) continue;
    const clef = clefTitre(p.revue);
    const actuelle = formes.get(clef);
    // On préfère la graphie qui porte le plus d'accents et le moins de capitales
    const score = (s) => (s.match(/[éèêàçùôîë]/gi)?.length ?? 0) * 2 - (s.match(/[A-Z]/g)?.length ?? 0);
    if (!actuelle || score(p.revue) > score(actuelle)) formes.set(clef, p.revue);
  }
  for (const p of publications) {
    if (p.revue) p.revue = formes.get(clefTitre(p.revue));
  }
  return formes.size;
}

function dedupliquer(publications) {
  const vues = new Map();
  const doublons = [];
  const sansTitre = [];
  for (const p of publications) {
    const clef = clefTitre(p.titre);
    // Une entrée sans titre ne peut pas être dédoublonnée, mais l'écarter en
    // silence reviendrait à perdre une publication. On la conserve et on la
    // signale dans le rapport de relecture.
    if (!clef) {
      sansTitre.push(p);
      vues.set(`sans-titre-${sansTitre.length}`, p);
      continue;
    }
    if (vues.has(clef)) {
      doublons.push(p.titre);
      // On garde la version la plus complète des deux
      const gardee = vues.get(clef);
      const remplissage = (x) => Object.values(x).filter(Boolean).length;
      if (remplissage(p) > remplissage(gardee)) vues.set(clef, p);
    } else {
      vues.set(clef, p);
    }
  }
  return { publications: [...vues.values()], doublons, sansTitre };
}

/* ------------------------------------------------------------------ */
/* Enrichissement                                                      */
/* ------------------------------------------------------------------ */

const cache = fs.existsSync(CACHE) ? JSON.parse(fs.readFileSync(CACHE, 'utf8')) : {};
const pause = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Proportion de mots communs entre deux titres.
 *
 * Le dénominateur est le plus grand des deux ensembles, et non le plus petit :
 * sinon un titre de deux mots inclus dans un titre long obtient un score
 * parfait. C'est ainsi qu'une entrée intitulée « BRAIN COMMUNICATIONS » — où
 * Scholar avait mis le nom de la revue à la place du titre — s'était vu
 * attribuer le DOI d'un article sans rapport.
 */
function similarite(a, b) {
  const mots = (s) => new Set(clefTitre(s).split(' ').filter((m) => m.length > 3));
  const A = mots(a);
  const B = mots(b);
  if (!A.size || !B.size) return 0;
  let communs = 0;
  for (const m of A) if (B.has(m)) communs++;
  return communs / Math.max(A.size, B.size);
}

/**
 * Un titre de moins de quatre mots significatifs ne permet pas un appariement
 * fiable : trop peu de matière pour distinguer un article d'un autre. On
 * préfère l'absence de DOI à un DOI faux.
 */
const titreApparaissable = (t) => clefTitre(t).split(' ').filter((m) => m.length > 3).length >= 4;

async function chercherCrossref(pub) {
  if (!titreApparaissable(pub.titre)) return null;

  const requete = new URL('https://api.crossref.org/works');
  requete.searchParams.set('query.bibliographic', `${pub.titre} ${pub.revue}`.slice(0, 300));
  requete.searchParams.set('rows', '3');
  requete.searchParams.set('select', 'DOI,title,issued,container-title,type');
  requete.searchParams.set('mailto', CONTACT);

  const res = await fetch(requete, { headers: { 'User-Agent': `aliamad.com (mailto:${CONTACT})` } });
  if (!res.ok) return null;
  const data = await res.json();

  for (const item of data.message?.items ?? []) {
    const titreTrouve = item.title?.[0] ?? '';
    const score = similarite(pub.titre, titreTrouve);
    const anneeTrouvee = item.issued?.['date-parts']?.[0]?.[0];
    // Un titre proche ne suffit pas : on exige aussi une année cohérente, sinon
    // les errata et rééditions se font passer pour l'article original.
    const anneeOk = !pub.annee || !anneeTrouvee || Math.abs(anneeTrouvee - pub.annee) <= 2;
    if (score >= 0.82 && anneeOk) {
      return { doi: item.DOI, titreCrossref: titreTrouve, score: Number(score.toFixed(2)) };
    }
  }
  return null;
}

async function chercherOpenAlex(doi) {
  const res = await fetch(`https://api.openalex.org/works/doi:${encodeURIComponent(doi)}?mailto=${CONTACT}`);
  if (!res.ok) return null;
  const w = await res.json();

  const institutions = [];
  for (const a of w.authorships ?? []) {
    for (const i of a.institutions ?? []) {
      if (i.display_name) institutions.push({ nom: i.display_name, pays: i.country_code ?? null });
    }
  }
  // Dédoublonnage par nom
  const uniques = [...new Map(institutions.map((i) => [i.nom, i])).values()];

  return {
    openalex: w.id ?? null,
    citations: w.cited_by_count ?? null,
    revueOpenAlex: w.primary_location?.source?.display_name ?? null,
    accesLibre: w.open_access?.is_oa ?? false,
    urlAccesLibre: w.open_access?.oa_url ?? null,
    institutions: uniques,
  };
}

/* ------------------------------------------------------------------ */
/* Exécution                                                           */
/* ------------------------------------------------------------------ */

console.log('Lecture de', SOURCE);
let publications = lireBib(SOURCE);
console.log(`  ${publications.length} entrées`);

/**
 * Corrections manuelles, appliquées avant tout traitement.
 *
 * L'export Scholar comporte des entrées irrécupérables par programme : champs
 * intervertis, titres tronqués, fragments de texte à la place d'un titre. Elles
 * sont rectifiées ou écartées ici, dans un fichier de données que l'on peut
 * modifier sans toucher au script.
 */
const corrections = JSON.parse(fs.readFileSync(CORRECTIONS, 'utf8'));

const exclues = publications.filter((p) => p.cle in corrections.exclusions);
publications = publications.filter((p) => !(p.cle in corrections.exclusions));
if (exclues.length) console.log(`  ${exclues.length} entrée(s) écartée(s) manuellement`);

let rectifiees = 0;
for (const p of publications) {
  const correction = corrections.remplacements[p.cle];
  if (!correction) continue;
  for (const [champ, valeur] of Object.entries(correction)) {
    if (!champ.startsWith('_')) p[champ] = valeur;
  }
  rectifiees++;
}
if (rectifiees) console.log(`  ${rectifiees} entrée(s) rectifiée(s) manuellement`);

const nbRevues = normaliserRevues(publications);
console.log(`  ${nbRevues} revues distinctes après normalisation`);

const { publications: uniques, doublons, sansTitre } = dedupliquer(publications);
publications = uniques;
console.log(`  ${doublons.length} doublon(s) écarté(s)`);
if (sansTitre.length) console.log(`  ${sansTitre.length} entrée(s) sans titre, conservée(s) et signalée(s)`);

console.log('\nEnrichissement Crossref puis OpenAlex…');
let apparies = 0;
let avecInstitutions = 0;

for (const [i, pub] of publications.entries()) {
  const clef = clefTitre(pub.titre);

  // Un DOI fourni par une correction fait autorité : on ne le cherche pas, on
  // s'en sert directement pour interroger OpenAlex.
  const doiManuel = corrections.remplacements[pub.cle]?.doi ?? null;

  if (!(clef in cache)) {
    try {
      const cr = doiManuel ? { doi: doiManuel } : await chercherCrossref(pub);
      let oa = null;
      if (cr?.doi) {
        await pause(120);
        oa = await chercherOpenAlex(cr.doi);
      }
      cache[clef] = { ...(cr ?? {}), ...(oa ?? {}) };
    } catch (err) {
      console.warn(`  ! ${pub.titre.slice(0, 55)} — ${err.message}`);
      cache[clef] = {};
    }
    await pause(120);
    if (i % 20 === 0) fs.writeFileSync(CACHE, JSON.stringify(cache, null, 1));
  }

  Object.assign(pub, cache[clef]);

  // Les corrections manuelles sont réappliquées : elles priment sur ce que les
  // services renvoient, faute de quoi le cache écraserait le travail à la main.
  const correction = corrections.remplacements[pub.cle];
  if (correction) {
    for (const [champ, valeur] of Object.entries(correction)) {
      if (!champ.startsWith('_')) pub[champ] = valeur;
    }
  }

  if (pub.doi) apparies++;
  if (pub.institutions?.length) avecInstitutions++;

  if ((i + 1) % 25 === 0) console.log(`  ${i + 1}/${publications.length}`);
}

fs.writeFileSync(CACHE, JSON.stringify(cache, null, 1));

/**
 * Seconde déduplication, par DOI cette fois.
 *
 * Scholar produit parfois deux entrées pour un même article, l'une correcte,
 * l'autre dont le champ titre a reçu le nom de la revue. Leurs titres diffèrent,
 * la comparaison par titre ne peut donc pas les rapprocher — mais leur DOI est
 * le même. Cette passe n'est possible qu'après l'enrichissement.
 */
// Un titre tout en capitales et sans revue associée trahit un champ mal rempli.
const qualite = (x) =>
  (x.revue ? 2 : 0) + (x.titre && x.titre === x.titre.toUpperCase() ? -3 : 0) + (x.titre?.length ?? 0) / 100;

const groupesDoi = new Map();
for (const p of publications) {
  if (!p.doi) continue;
  if (!groupesDoi.has(p.doi)) groupesDoi.set(p.doi, []);
  groupesDoi.get(p.doi).push(p);
}

const gagnantes = new Set();
const doublonsDoi = [];
for (const [doi, groupe] of groupesDoi) {
  // Tri explicite plutôt que comparaison au fil de l'eau : le résultat ne
  // dépend plus de l'ordre de lecture du fichier.
  const triees = [...groupe].sort((a, b) => qualite(b) - qualite(a));
  gagnantes.add(triees[0]);
  for (const perdante of triees.slice(1)) doublonsDoi.push(`${perdante.titre} (DOI ${doi})`);
}

if (doublonsDoi.length) {
  publications = publications.filter((p) => !p.doi || gagnantes.has(p));
  console.log(`  ${doublonsDoi.length} doublon(s) supplémentaire(s) détecté(s) par DOI`);
}

// Scholar conserve le double tiret LaTeX, qui doit s'afficher comme un tiret
// demi-cadratin — dans les pages comme dans les titres.
for (const p of publications) {
  if (p.pages) p.pages = p.pages.replace(/-{2,}/g, '–');
  if (p.titre) p.titre = p.titre.replace(/(\w)-{2,}(\w)/g, '$1 – $2');
}

// Les compteurs sont établis après les deux déduplications, sans quoi ils
// décriraient un jeu de données qui n'existe plus.
apparies = publications.filter((p) => p.doi).length;
avecInstitutions = publications.filter((p) => p.institutions?.length).length;

publications.sort((a, b) => (b.annee ?? 0) - (a.annee ?? 0) || a.titre.localeCompare(b.titre, 'fr'));

fs.mkdirSync(path.dirname(SORTIE), { recursive: true });
fs.writeFileSync(SORTIE, JSON.stringify(publications, null, 1));

/* ------------------------------------------------------------------ */
/* Rapport de relecture                                                */
/* ------------------------------------------------------------------ */

const sansDoi = publications.filter((p) => !p.doi);
const sansRevue = publications.filter((p) => !p.revue);
const sansAuteur = publications.filter((p) => !p.auteurs.length);
const sansAnnee = publications.filter((p) => !p.annee);

/**
 * Un titre qui reproduit le nom d'une revue présente ailleurs dans le corpus
 * est presque toujours un enregistrement Scholar mal rempli, où le champ revue
 * a débordé sur le champ titre. On ne corrige pas d'office — impossible de
 * deviner le vrai titre — mais on le signale nommément.
 */
const revuesConnues = new Set(publications.map((p) => clefTitre(p.revue)).filter(Boolean));
const titresSuspects = publications.filter(
  (p) => p.titre && revuesConnues.has(clefTitre(p.titre)) && !p.revue,
);

const rapport = [
  '# Relecture de la bibliographie',
  '',
  `Généré le ${new Date().toLocaleDateString('fr-FR')} depuis \`${SOURCE}\`.`,
  '',
  `- **${publications.length}** publications retenues`,
  `- l'introduction de la page annonce « plus de ${Math.floor(publications.length / 10) * 10} publications » — à réaccorder si ce seuil a changé`,
  `- **${apparies}** appariées à un DOI (${Math.round((apparies / publications.length) * 100)} %)`,
  `- **${avecInstitutions}** avec des affiliations exploitables pour la carte`,
  `- **${doublons.length}** doublon(s) écarté(s)`,
  '',
  `## Titres douteux (${titresSuspects.length})`,
  '',
  "Le titre reproduit le nom d'une revue : l'export Scholar a vraisemblablement",
  'rempli le mauvais champ. À remplacer par le vrai titre, ou à supprimer.',
  '',
  ...(titresSuspects.length
    ? titresSuspects.map((p) => `- clé \`${p.cle}\` — ${p.annee ?? 's.d.'} — « ${p.titre} »`)
    : ['*Aucun.*']),
  '',
  '## Sans DOI — à vérifier à la main',
  '',
  ...(sansDoi.length
    ? sansDoi.map((p) => `- ${p.annee ?? 's.d.'} — ${p.titre}${p.revue ? ` *(${p.revue})*` : ''}`)
    : ['*Aucune.*']),
  '',
  '## Champs manquants dans l’export Scholar',
  '',
  `**Sans revue (${sansRevue.length})**`,
  '',
  ...(sansRevue.length ? sansRevue.map((p) => `- ${p.annee ?? 's.d.'} — ${p.titre}`) : ['*Aucune.*']),
  '',
  `**Sans auteur (${sansAuteur.length})**`,
  '',
  ...(sansAuteur.length ? sansAuteur.map((p) => `- ${p.annee ?? 's.d.'} — ${p.titre}`) : ['*Aucune.*']),
  '',
  `**Sans année (${sansAnnee.length})**`,
  '',
  ...(sansAnnee.length ? sansAnnee.map((p) => `- ${p.titre}`) : ['*Aucune.*']),
  '',
  '## Doublons écartés',
  '',
  '**Par titre identique**',
  '',
  ...(doublons.length ? doublons.map((t) => `- ${t}`) : ['*Aucun.*']),
  '',
  '**Par DOI identique** — titres différents, même article',
  '',
  ...(doublonsDoi.length ? doublonsDoi.map((t) => `- ${t}`) : ['*Aucun.*']),
  '',
  `## Entrées sans titre (${sansTitre.length})`,
  '',
  'Conservées faute de pouvoir les identifier, mais inaffichables en l’état.',
  '',
  ...(sansTitre.length
    ? sansTitre.map((p) => `- clé \`${p.cle}\` — ${p.annee ?? 's.d.'}${p.revue ? `, ${p.revue}` : ''}`)
    : ['*Aucune.*']),
  '',
].join('\n');

fs.writeFileSync(RAPPORT, rapport);

console.log(`\n${publications.length} publications écrites dans ${SORTIE}`);
console.log(`  ${apparies} avec DOI, ${avecInstitutions} avec affiliations`);
console.log(`Rapport de relecture : ${RAPPORT}`);
