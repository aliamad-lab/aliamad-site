# aliamad-site

Site personnel d'Ali Amad, professeur de psychiatrie (Université de Lille, CHU de Lille).

Le cahier des charges et le plan de build vivent dans `G:\Mon Drive\Site_perso`
(`CLAUDE.md` et `PLAN-BUILD.md`).

## Modifier le contenu

Aucune manipulation technique n'est nécessaire : demandez la modification en
langage naturel à Claude, qui édite le fichier concerné et publie. Toute
modification du français donne lieu à une proposition de mise à jour de l'anglais
dans la même intervention.

## Commandes

| Commande | Effet |
|---|---|
| `npm run dev` | Aperçu local sur http://localhost:4321 |
| `npm run build` | Génère le site dans `dist/` |
| `npm run preview` | Sert le site généré, tel qu'il sera en ligne |

## Structure

```
src/
  i18n/config.ts     table des URL FR/EN, libellés, liens de profils, contact
  layouts/           gabarit commun (métadonnées, hreflang, en-tête, pied)
  components/        en-tête, pied de page, adresse de contact
  pages/             routes françaises (racine) et anglaises (/en/)
  styles/global.css  charte — variables de couleur et de typographie
.github/workflows/   publication automatique sur GitHub Pages
```

## Adresses à ne pas casser

Les URL suivantes existent déjà et sont reconduites à l'identique :

- `/`, `/clinique`, `/recherche`, `/enseignement`, `/publications`
- `/dicosemiopsy` — **référencée depuis la fiche Google Play de l'application
  DicoSemioPsy.** Cette adresse ne doit jamais changer ni être redirigée.
- `/calypso` — redirige vers <https://calypso.univ-lille.fr/>

## Domaine

Le domaine `aliamad.com` pointe encore vers Google Sites et **ne doit pas être
basculé avant validation** du nouveau site sur l'URL GitHub Pages de recette.

Aucun fichier `CNAME` n'est présent dans `public/`, et c'est délibéré : déclarer
le domaine personnalisé avant la bascule DNS ferait rediriger l'URL de recette
vers un domaine qui ne pointe pas encore ici, rendant le site intestable.
Le `CNAME` s'ajoute au moment de la bascule, pas avant.
