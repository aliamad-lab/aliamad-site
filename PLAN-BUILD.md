# Plan de build — aliamad.com

*Établi le 15 août 2026, après audit de l'export Google Takeout et de l'export Google Scholar. Complète le cahier des charges (`CLAUDE.md`), qu'il ne remplace pas.*

## Choix techniques arrêtés

| Sujet | Choix | Motif |
|---|---|---|
| Générateur | **Astro** | i18n natif (FR racine / `/en/`), optimisation d'images intégrée, sortie 100 % statique, écosystème stable |
| Contenu | **Markdown + frontmatter**, un fichier par page et par langue | Lisible, éditable par Claude en langage naturel, diffable |
| Publications | **Collection de données JSON** générée depuis `ref.bib`, enrichie, puis commitée | Build reproductible, aucun appel réseau au moment du déploiement |
| Images | Originaux versionnés + `astro:assets` | WebP et déclinaisons responsives automatiques, original jamais rogné |
| Hébergement | **GitHub Pages** via GitHub Actions | Conforme au cahier des charges §3, gratuit |
| Domaine | `aliamad.com` en CNAME, **bascule en dernier** | Le site actuel reste en ligne tant que le nouveau n'est pas validé |

## Contraintes de conception issues de l'audit

1. **Les images doivent rester interchangeables.** Changer une image ou son cadrage = une phrase en langage naturel. Un point de focalisation est stocké par image ; l'original reste intact et réutilisable. *(Le cadrage subi de la page Enseignement ne doit plus jamais se reproduire.)*
2. **`/dicosemiopsy` doit répondre à l'identique.** URL référencée depuis la fiche Google Play. Aucune modification d'adresse, aucune redirection.
3. **Toutes les URL actuelles sont reconduites** : `/`, `/clinique`, `/recherche`, `/enseignement`, `/publications`, `/dicosemiopsy`. `/calypso` devient une redirection permanente vers `calypso.univ-lille.fr`.
4. **Aucune image sous droits.** Les illustrations sont des documents authentiques du domaine public, pas des images générées.

---

## Phase 0 — Fondations ✅ *terminée le 15 août 2026*

- Dépôt `C:\Users\aliam\dev\aliamad-site` — **hors du dossier Google Drive**, dont la synchronisation entre en conflit avec les dépendances et l'historique Git. GitHub assure la sauvegarde
- Dépôt GitHub public [`aliamad-lab/aliamad-site`](https://github.com/aliamad-lab/aliamad-site) — public parce que GitHub Pages n'est gratuit qu'à cette condition. Adresses de commit en `users.noreply.github.com`, l'adresse personnelle n'apparaît pas dans l'historique
- Astro 7, i18n natif, 10 pages générées dans les deux langues
- En-tête, navigation, pied de page avec les 5 liens de profils
- Contact `ali.amad@chu-lille.fr` recomposé côté navigateur, jamais servi en clair
- `lang` correct par page, plus `canonical`, `hreflang` et `meta description`, tous absents du site actuel
- Publication automatique à chaque envoi, vérifiée de bout en bout

**Recette en ligne :** <https://aliamad-lab.github.io/aliamad-site/>

Le site de recette est servi depuis un sous-répertoire et porte un `noindex` : sans lui, Google indexerait un doublon en concurrence avec aliamad.com. L'adresse et le préfixe sont pilotés par les variables `SITE_URL` et `SITE_BASE` du workflow, de sorte que la bascule de la phase 8 se réduise à les retirer.

## Phase 1 — Contenu français ✅ *terminée le 15 août 2026*

Reprise du texte existant, à l'identique sauf corrections listées. Le contenu vit dans des fichiers Markdown, un par page et par langue, éditables en langage naturel.

**Restes à traiter, signalés à Ali :**

- la phrase sur **Pharmapredicat** est une formulation d'attente, à valider ou remplacer par son texte
- le lien de la page Clinique qui menait de « électroconvulsivothérapie » vers `conn-ect.com` **n'a pas été repris** : l'ancre paraissait décalée par rapport à sa cible, et CONN-ECT figure dans la liste des dispositifs en bas de page. À rétablir si l'intention était bien celle-là
- le décompte « plus de 250 publications » est retiré en attendant le chiffre exact de la phase 4
- la page Recherche n'a plus de bandeau, l'Escher ayant été écarté
- la provenance exacte de la gravure d'accueil (chat au dos arqué) reste à confirmer avant d'afficher une mention de source
- la politique de confidentialité annonce une « date de mise à jour clairement indiquée » qui ne figure nulle part sur la page

- **Accueil** — bio courte renforcée (§4 du cahier des charges : qu'un visiteur pressé situe immédiatement fonctions et rattachements). Correction : « je m'**inéresse** » → « je m'intéresse »
- **Clinique** — repris tel quel. À vérifier : l'ancre « électroconvulsivothérapie » pointe vers `conn-ect.com` alors que « catatonie » pointe vers `catatonia.fr` ; l'ancre semble décalée par rapport à sa cible
- **Recherche** — reprise, **augmentée du contenu Calypso** aujourd'hui isolé :
  - la clinique fondamentale et ses fondements épistémologiques
  - les symptômes psychiatriques objectivables
  - **l'origine mythologique du nom** — Calypso, Καλυψώ, « celle qui cache » : le projet révèle des manifestations cliniques jusque-là dissimulées. *Élément à conserver impérativement, absent du site du projet*
  - les 3 vidéos (CFP 2019, CFP Lille 2022, Encéphale 2025), en chargement différé
  - le nom CALYPSO renvoie vers `calypso.univ-lille.fr`
  - mention de Pharmapredicat en texte, sans lien, conformément au §4
  - développement de l'acronyme retenu : **C**linique et Ana**LY**ses **PS**ychiatriques **O**bjectives — « Clinique » au singulier, capitales composant CALYPSO
- **Enseignement** — repris tel quel
- **Publications** — voir phase 4
- **DicoSemioPsy** — politique de confidentialité reprise mot pour mot (document à portée réglementaire, aucune réécriture)

Titres harmonisés : « Activités cliniques », « Activités de recherche », « Activités d'enseignement » — aujourd'hui en minuscule, capitales et casse normale selon les pages. Accueil et Publications reçoivent un H1. Chaque page reçoit une `meta description`, aujourd'hui absente partout.

## Phase 2 — Charte graphique 🔶 *typographie et couleurs arrêtées le 15 août 2026*

Trois variantes complètes ont été soumises sur un extrait réel du site. **Variante A retenue.**

| Élément | Valeur |
|---|---|
| Typographie | **EB Garamond**, titres et texte |
| Papier | `#FBF9F3` |
| Accent | `#003153` — bleu de Prusse historique |
| Accent foncé | `#00253F` |
| Encre | `#1F1D1A`, adoucie en `#55514A` |
| Filets | `#E0D9C9` |

Le caractère, issu de la Renaissance française, fait suite aux planches d'époque qui illustrent les pages : le site forme un tout, difficile à confondre avec un rendu générique.

Réglages induits : corps de texte monté d'un cran (la petite hauteur d'x du Garamond le ferait paraître plus petit à taille nominale égale), interlettrage des capitales augmenté. Polices auto-hébergées, jeux latin, latin étendu et grec seulement — le grec sert à l'origine du nom CALYPSO.

**Favicon :** la gravure du chat au dos arqué, qui remplissait déjà ce rôle sur Google Sites — elle apparaissait deux fois sur chacune des sept pages, ce qui la désignait comme icône du site et non comme bandeau. La page d'accueil n'avait donc aucune image, et n'en a pas davantage aujourd'hui.

**Mise en page**, corrigée après première relecture d'Ali : colonne de texte ramenée à 40rem et centrée, les bandeaux d'images débordant jusqu'à 58rem ; menu tenant sur une ligne ; sélecteur de langue réduit au drapeau, en SVG plutôt qu'en emoji, Windows ne disposant pas toujours des glyphes de drapeaux.

**Reste à faire dans cette phase :** image de partage.

## Phase 3 — Images

- Recadrage libre des 4 images conservées, **à commencer par Enseignement** (original 1260 × 933 disponible en entier)
- Remplacement de l'image Recherche (*Drawing Hands* d'Escher, sous droits jusqu'en 2042, et seulement 554 × 470) par une planche de mains issue du domaine public — piste Bourgery, *Traité complet de l'anatomie de l'homme*, via Wellcome Collection ou BIU Santé. L'idée de continuité clinique/recherche est rendue par la mise en page, en vis-à-vis ou en miroir
- Textes alternatifs descriptifs sur toutes les images, aujourd'hui inexistants :
  - Accueil — chat au dos arqué, planche de Darwin, *L'Expression des émotions* (1872)
  - Clinique — unité clinique du CHU de Lille
  - Enseignement — gravure XIX<sup>e</sup>, démonstration clinique
  - Publications — revues scientifiques *(image de banque générique, remplaçable à terme)*
- Conversion WebP et déclinaisons responsives

## Phase 4 — Publications ✅ *terminée le 15 août 2026*

**278 publications**, dont 209 avec DOI (75 %) et 201 avec affiliations — soit **26 pays et 318 institutions distinctes**, matière suffisante pour la carte de la phase 5.

Chaîne relancée par `npm run publications`. Le rapport `data/rapport-publications.md` liste ce qui reste à relire : 69 références sans DOI, 26 sans revue, 12 sans auteur, 4 sans année, 1 entrée sans titre et 1 titre douteux (`deneve2026brain`, où Scholar a mis le nom de la revue à la place du titre).

Trois pièges rencontrés, à ne pas réintroduire :

1. Comparer deux titres en divisant par le **plus petit** des deux ensembles de mots donne un score parfait à tout titre court inclus dans un titre long — d'où un DOI attribué à un article sans rapport. Diviser par le plus grand, et refuser d'apparier les titres de moins de quatre mots significatifs.
2. Dédupliquer au fil de l'eau rend le résultat dépendant de l'ordre de lecture. Trier explicitement par qualité.
3. Les compteurs doivent être calculés **après** les déduplications, sinon ils décrivent un jeu de données qui n'existe plus.

*Notes de conception ci-dessous, conservées pour mémoire.*

Chaîne de traitement depuis `Ref/ref.bib` (288 entrées, 2011–2026).

1. **Analyse** du BibTeX, décodage des accents en échappement LaTeX
2. **Déduplication** — 2 doublons identifiés : *Hospitalization in French forensic units* et *Drum training induces long-term plasticity*
3. **Normalisation des revues** — `L'Enc{\'e}phale` / `L'encephale` (38 entrées pour une seule revue), `Annales Médico-psychologiques` / `ANNALES MEDICO-PSYCHOLOGIQUES`, `European Psychiatry` / `EUROPEAN PSYCHIATRY`. Les 136 « revues distinctes » recouvrent un nombre sensiblement inférieur
4. **Enrichissement DOI** via Crossref, appariement par titre, auteur et année *(décidé en V1)*
5. **Enrichissement affiliations** via OpenAlex — institution et pays, nécessaires à la carte de la phase 5
6. **Reprise manuelle** du reliquat : 20 entrées sans revue, 8 sans auteur, 4 sans année, 1 sans titre, plus les non-appariés Crossref
7. **Génération** de la page, groupée par année, chaque référence cliquable vers son DOI

Le décompte affiché passe de « plus de 250 » à un chiffre exact.

**Nécessite Ali :** relecture du reliquat non apparié.

## Phase 5 — Visualisations ✅ *terminée le 16 août 2026*

Les deux visualisations dérivent des mêmes données que la page Publications, sans aucun nettoyage supplémentaire — ce qui était l'objet du §8.

- **Graphe des co-auteurs** : 66 collaborateurs réguliers (seuil de 4 publications communes), 306 liens. Disposition par forces calculée à la compilation, pas dans le navigateur, de sorte que la page reste servie sans JavaScript.
- **Carte** : 26 pays, du plus dense au plus isolé. Coloration par paliers et non en dégradé continu : avec 1455 affiliations françaises contre une seule burundaise, une échelle linéaire n'aurait montré qu'un pays. Fonds cartographique embarqué dans le dépôt, aucun appel à un service externe.

**Reste à valider par Ali**, conformément au §10 : l'allure des deux visualisations, le seuil de 4 publications pour le graphe, et le choix des paliers de la carte.

Prototypage à partir des données de la phase 4, sans traitement séparé.

- **Graphe des co-auteurs** — depuis les champs auteurs normalisés
- **Carte géographique** — depuis les affiliations OpenAlex

Conformément au §10, les deux sont soumis à validation après prototypage. **Seul lot non bloquant pour la mise en ligne** : s'ils demandent plus de travail que prévu, le site part sans eux et ils s'ajoutent ensuite.

## Phase 6 — Version anglaise ✅ *terminée le 16 août 2026, en attente de relecture*

Les cinq pages sont traduites et en ligne sous `/en/`. Les intitulés d'institutions n'ont pas été traduits mécaniquement : l'AESP conserve son nom français assorti d'une glose anglaise, les congrès gardent leur intitulé d'origine, et les trois vidéos sont signalées comme étant en français.

**Nécessite Ali :** relecture de validation, en particulier du vocabulaire clinique.

## Phase 6 bis — notes de traduction

- Traduction de l'ensemble, vocabulaire médical et noms d'institutions traités avec soin — les intitulés officiels d'institutions ne se traduisent pas mécaniquement
- **À ne pas oublier :** la direction de la F2RSM Psy, ajoutée au français le 15 août 2026 (accueil et page Recherche), doit figurer dans les deux pages anglaises correspondantes
- Sélecteur de langue conservant la page courante, drapeau britannique
- `meta description` et balises `hreflang` dans les deux langues
- Intervient une fois le français stabilisé, pour ne pas traduire deux fois

**Nécessite Ali :** relecture de validation.

## Phase 7 — Déploiement de recette

- Publication sur l'URL GitHub Pages par défaut, domaine **non touché**
- Vérifications : rendu mobile, contrastes, navigation clavier, temps de chargement, intégrité des liens externes, `/dicosemiopsy` conforme
- Le site Google Sites reste en ligne et inchangé pendant toute cette phase

## Phase 8 — Bascule du domaine

Dernière étape, et la seule difficilement réversible.

- Retrait des variables `SITE_URL` et `SITE_BASE` du workflow : le site repart à la racine du domaine et redevient indexable
- Ajout du fichier `public/CNAME`. **Pas avant :** déclarer le domaine personnalisé à GitHub fait rediriger l'URL de recette vers un domaine qui ne pointe pas encore ici, rendant le site intestable
- Enregistrement CNAME chez le registrar, certificat HTTPS
- Contrôle des 6 URL reconduites, `/dicosemiopsy` en premier
- Google Sites conservé quelques semaines en filet de sécurité avant retrait

**Nécessite Ali :** accès au registrar DNS, et accord explicite avant toute modification. Je ne touche pas au domaine sans votre feu vert.

---

## Ce qu'il reste à fournir

- Confirmation du compte GitHub
- Arbitrages de la phase 2 sur pièces
- Relecture du reliquat bibliographique (phase 4) et de l'anglais (phase 6)
- Accès DNS, au moment de la phase 8 seulement

## Points laissés ouverts

- Photo professionnelle en noir et blanc : intégration non tranchée (§10). S'accorderait avec fond papier et bleu marine, l'Accueil serait l'emplacement naturel
- Image Publications : banque d'images générique, la seule qui ne soit pas un document d'auteur
