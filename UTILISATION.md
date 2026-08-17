# Utilisation du site

Ce fichier répond à trois questions : comment faire modifier le site, comment
reprendre le travail depuis un autre ordinateur, et comment mettre à jour les
publications une fois par an.

---

## Modifier le contenu

Demandez-le en langage naturel à Claude Code, ouvert dans le dossier du dépôt.
Aucune connaissance de Git ni de Markdown n'est nécessaire.

> « Corrige la deuxième phrase de la page Clinique, il manque un accent. »
>
> « Ajoute un paragraphe sur tel projet à la fin de la page Recherche. »
>
> « Remplace l'image de la page Enseignement par celle-ci, et cadre-la plus haut. »

Le fichier concerné est modifié, la modification est enregistrée, et la
publication est automatique — comptez une minute entre la demande et la mise en
ligne sur <https://www.aliamad.com>.

Toute modification du français entraîne une proposition de mise à jour de
l'anglais dans la même intervention.

---

## Reprendre depuis un autre ordinateur

**La conversation ne suit pas.** Les sessions Claude Code sont stockées
localement, par machine et par dossier : sur un autre ordinateur, vous repartez
d'une conversation vierge.

**Le contexte, lui, suit** — il est entièrement dans ce dépôt : le cahier des
charges (`CLAUDE.md`, chargé automatiquement par Claude Code), l'état
d'avancement (`PLAN-BUILD.md`), les corrections bibliographiques
(`data/corrections-publications.json`) et l'historique des décisions dans les
messages de commit. Il suffit donc de cloner le dépôt et de reprendre la
conversation où vous voulez.

### Installation sur une machine neuve

Une seule fois, installez [Git](https://git-scm.com/downloads),
[Node.js](https://nodejs.org/) (version 22 ou plus),
[GitHub CLI](https://cli.github.com/) et Claude Code. Puis :

```bash
gh auth login --web --git-protocol https
```

Choisissez **GitHub.com**, puis **Login with a web browser**. Un code à huit
caractères s'affiche **dans le terminal** — il n'arrive ni par courriel ni sur
un autre appareil. Notez-le, appuyez sur Entrée, collez-le dans la page qui
s'ouvre.

Récupérez ensuite le dépôt :

```bash
git clone https://github.com/aliamad-lab/aliamad-site.git
```

Puis, dans le dossier créé :

```bash
npm install
```

Ouvrez Claude Code dans ce dossier : il lit `CLAUDE.md` et retrouve tout le
contexte du projet.

### À chaque reprise de travail

Avant toute modification, récupérez ce qui a pu être fait ailleurs :

```bash
git pull
```

C'est le seul geste technique à retenir. L'oublier depuis deux machines
différentes crée un conflit à démêler.

---

## Mettre à jour les publications, une fois par an

1. Sur [votre profil Google Scholar](https://scholar.google.fr/citations?user=x5L4rgwAAAAJ&hl=fr),
   sélectionnez toutes les publications, puis **Exporter → BibTeX**.
2. Enregistrez le fichier obtenu sous `data/scholar-export.bib`, en remplaçant
   l'ancien.
3. Demandez à Claude de mettre à jour les publications.

Ce qui se passe alors, sans intervention de votre part :

- les accents encodés en LaTeX par Scholar sont rétablis ;
- les graphies multiples d'une même revue sont ramenées à une seule ;
- les doublons sont écartés, par titre puis par DOI ;
- les nouvelles références seulement sont soumises à Crossref (pour les DOI) et
  à OpenAlex (pour les affiliations) — les anciennes sont en cache ;
- **vos corrections manuelles sont conservées** : les publications que vous avez
  fait supprimer ou rectifier sont enregistrées dans
  `data/corrections-publications.json`, indexées par clé, et ne réapparaîtront
  pas.

Un rapport de relecture est produit dans `data/rapport-publications.md` : il
liste les références sans DOI, les titres douteux et les champs manquants — une
vingtaine de lignes à parcourir. Il signale aussi si la phrase « plus de 270
publications » doit être réaccordée.

---

## Adresses à ne jamais casser

- `/` `/clinique` `/recherche` `/enseignement` `/publications` — adresses
  héritées de Google Sites, reconduites à l'identique.
- **`/dicosemiopsy`** — déclarée comme règlement de confidentialité sur la fiche
  Google Play de l'application DicoSemioPsy. Ni renommage, ni redirection : une
  adresse morte expose l'application à un retrait.
- `/calypso` — redirige vers <https://calypso.univ-lille.fr/>.

## Où se trouve quoi

| Emplacement | Contenu |
|---|---|
| `src/content/pages/fr/` et `/en/` | le texte des pages, un fichier par page et par langue |
| `src/assets/images/` | les images d'origine, jamais rognées |
| `src/styles/global.css` | couleurs, typographie, proportions |
| `data/` | bibliographie, corrections, rapport de relecture |
| `scripts/` | chaînes de traitement (publications, icônes, vignettes, image de partage) |
