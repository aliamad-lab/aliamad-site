# Cahier des charges — Site personnel (aliamad.com)

*Ce fichier est la référence, et il vit dans le dépôt : il suit donc le projet sur n'importe quelle machine. Une copie subsiste dans `G:\Mon Drive\Site_perso`, mais c'est celle-ci qui fait foi.*

## 0. Règles éditoriales à respecter systématiquement

Énoncées par Ali en cours de projet. Elles ne se devinent pas à la lecture du code et s'appliquent à toute modification future.

- **L'université passe toujours avant l'hôpital.** « Faculté de médecine, Université de Lille — Service de psychiatrie adulte, CHU de Lille », jamais l'inverse ; de même en anglais. En tant que professeur, son employeur est l'Université de Lille : l'ordre reflète son statut réel, il n'est pas cosmétique.
- **Les illustrations sont des documents authentiques du domaine public** — gravures anciennes, planches d'époque — jamais des images générées. Les images qu'Ali avait choisies lui-même sont des documents d'époque ; une image synthétique jurerait sur un site de professeur de médecine, où l'authenticité des sources fait partie du fond. Chercher dans les fonds libres (Wellcome Collection, BIU Santé, Internet Archive) et **vérifier les droits avant toute proposition** : l'illustration d'origine de la page Recherche était un Escher protégé jusqu'en 2042.
- **Les images restent interchangeables et recadrables en une phrase.** Les originaux ne sont jamais rognés ; seul un point de focalisation est stocké. Google Sites imposait à Ali un cadrage subi qu'il ne pouvait pas corriger.
- **Toute modification du français donne lieu, dans la même intervention, à une proposition de mise à jour de l'anglais.** Ali ne doit jamais avoir à y penser.
- **`/dicosemiopsy` ne doit jamais changer d'adresse ni être redirigée** : elle est déclarée comme règlement de confidentialité sur la fiche Google Play de l'application DicoSemioPsy. Une adresse morte est un motif de retrait courant.

## 1. Contexte et objectifs

Le site personnel d'Ali Amad (aliamad.com), actuellement sous Google Sites, présente son activité de professeur de psychiatrie (Université de Lille / CHU de Lille) : clinique, recherche, enseignement, publications.

**Objectif de la refonte :** migrer vers une base technique que Claude Code peut piloter directement (lecture, édition, publication), tout en conservant l'identité éditoriale actuelle — un site de professeur académique présentant ses différentes activités, pas une refonte de fond en comble.

**Contraintes non négociables :**
- Édition de contenu très simple : correction d'une coquille ou d'une phrase en langage naturel, sans avoir à apprendre Git ou Markdown
- Version anglaise gérée avec un minimum d'effort manuel
- Le domaine actuel (aliamad.com) est conservé, aucun nouveau nom de domaine à acheter
- Gratuit dans un premier temps ; un abonnement payant peu coûteux (ex. GitHub) reste envisageable plus tard s'il apporte un vrai bénéfice pour l'ensemble des projets — à réévaluer si besoin, pas une priorité immédiate

## 2. État des lieux — audit du site actuel

**Structure actuelle (menu) :** Accueil / Clinique / Recherche / Enseignement / Publications

**Points forts à conserver :**
- Contenu rédigé avec rigueur, ton cohérent
- Bons liens croisés vers l'écosystème de projets (CALYPSO, DEMHETER, catatonia.fr, CONN-ECT, AESP)
- Liens Google Scholar / PubMed / ResearchGate / Université de Lille / LinkedIn en pied de chaque page
- Une image de bannière par page, avec un vrai travail de sélection (notamment la photo de l'unité clinique)

**Manques et limites identifiés :**
- Aucune version anglaise (navigation, contenu, meta-descriptions)
- Images sans texte alternatif (`alt`) — manque pour l'accessibilité et le référencement
- Page Publications dépendante d'un widget tiers (BibBase) — sans objet dans la nouvelle architecture (voir section 7)
- Pas d'adresse de contact directement visible sur les pages
- Aucun contrôle programmatique possible : Google Sites n'a pas d'API publique, toute édition est manuelle via l'interface Google
- Identité visuelle par défaut Google Sites, perçue comme trop "SaaS/américaine" pour un site académique (voir section 9)

## 3. Architecture technique cible

- **Générateur de site statique** — délégué à Claude, choix fait en phase de build (piste actuelle : un outil simple et bien supporté type Astro, adapté au bilingue et au statique), sans impact sur l'expérience d'usage d'Ali
- **Dépôt Git** comme source de vérité pour tout le contenu (texte, images, configuration)
- **Hébergement** : GitHub (GitHub Pages) — cohérent avec le choix déjà fait pour les autres projets (outil de références, capture d'idées), une seule plateforme à gérer pour l'ensemble de l'écosystème. Gratuit par défaut ; passage à une offre payante envisageable plus tard si pertinent pour l'ensemble des projets
- **Domaine** : aliamad.com repointé en DNS (CNAME) vers le nouvel hébergement
- **Workflow d'édition** : demande en langage naturel à Claude (chat, application mobile, ou Claude Code) → modification du fichier source correspondant → commit → publication automatique (déploiement continu)

## 4. Contenu et structure des pages

- Conservation de l'ossature en 5 rubriques : Accueil, Clinique, Recherche, Enseignement, Publications
- Reprise du contenu texte actuel comme base (à fournir par Ali — voir note méthodologique ci-dessous)
- Ajout d'une adresse de contact directement visible

**Note méthodologique :** le texte exact des pages actuelles n'a pas pu être extrait de façon fiable par recherche/fetch automatisé (Google Sites bloque l'accès automatisé, et les extraits disponibles sont fragmentaires). Solution retenue : export via **Google Takeout** (Drive → dossier du site → zip contenant toutes les pages en HTML et toutes les images en une fois), à fournir au moment du build — pas de copier-coller manuel nécessaire.

**Décisions sur les anciennes pages orphelines :**
- **CV / bio dédiée** — *décidé* : pas de page séparée, le contenu narratif des autres pages couvre déjà ce rôle. La bio courte de l'Accueil sera vérifiée/renforcée pour qu'un visiteur pressé identifie rapidement qui est Ali et ses fonctions actuelles.
- **Graphe de collaborations** — conservé, complété par une carte géographique, voir section 8
- **Calypso** — simple lien vers la page dédiée existante, pas de page orpheline sur aliamad.com
- **Master recherche en psychiatrie** — page supprimée (projet non abouti)

**Principe général pour les projets futurs (pas seulement Pharmapredicat) :** quand un nouvel axe de recherche ou projet n'a pas encore de page dédiée, il est simplement mentionné en texte sur la page concernée, avec un lien hypertexte ajouté dès qu'une page dédiée existe et que du contenu réel est fourni par Ali. Aucune page "en construction" n'est publiée entre-temps.
*Exemple d'application actuel : Pharmapredicat / études des traitements physiques sur la catatonie — mentionné sur la page Recherche, lien ajouté quand la page dédiée sera prête.*

## 5. Multilinguisme (FR/EN)

- Structure bilingue native : racine du site en français, préfixe `/en/` pour l'anglais
- **Bascule globale et cohérente** : le changement de langue reste actif à travers la navigation du site (on reste sur l'équivalent de la même page dans l'autre langue, pas de retour systématique à l'accueil)
- **Icône** : drapeau britannique (UK) pour représenter l'anglais, pas le drapeau américain
- **Traduction initiale** : réalisée par Claude à partir du contenu français existant (vocabulaire médical et noms d'institutions traités avec attention), avec une relecture de validation par Ali
- **Maintenance continue** : toute modification apportée à la version française déclenche une proposition de mise à jour de la version anglaise dans la même intervention — pas de double saisie manuelle

## 6. Images

- Récupération et réoptimisation des images actuelles (incluses dans le même export Google Takeout que le texte, voir section 4)
- Ajout de textes alternatifs descriptifs sur toutes les images
- Recadrage et positionnement libres, sans les contraintes du format bannière de Google Sites (notamment la photo de l'unité clinique, citée comme prioritaire)
- Formats optimisés (WebP), déclinaisons responsives selon la taille d'écran

## 7. Page Publications — bibliographie propre d'Ali

**Point de clarification :** cette page liste exclusivement les publications propres d'Ali (pas les références externes qu'il consulte et archive par ailleurs — cela relève de l'outil de gestion des références académiques, un système séparé avec sa propre collection de données). Les deux projets partagent la même techno (dépôt Git, même générateur de site) mais restent deux collections de contenu distinctes.

**Approche retenue :** Google Scholar reste la source (la plus complète, y compris pour les publications en informatique absentes de PubMed). Aucune automatisation fiable de Scholar n'est possible : pas d'API publique, pas de widget d'embed officiel, et le scraping viole ses conditions d'utilisation.

Workflow retenu :
1. Ali extrait un CSV depuis Google Scholar une fois par an *(seul geste manuel restant)*
2. Claude prend en charge tout le traitement : déduplication (par DOI/titre), nettoyage des artefacts de formatage (virgules/points-virgules mal échappés), structuration en données propres
3. Génération native de la page Publications à partir de ces données — plus aucun widget tiers (BibBase ou autre)

**Piste complémentaire possible (non prioritaire) :** enrichissement des fiches via OpenAlex/Crossref (résumés, DOI, venue) une fois les publications identifiées par le CSV — à évaluer plus tard si utile.

## 8. Carte géographique des collaborations + graphe des co-auteurs

Les deux visualisations sont conservées, en complément l'une de l'autre :
- **Graphe des co-auteurs** : réseau de collaboration déjà apprécié dans son principe
- **Carte géographique** : lieux de collaboration en France et à l'international, absente jusqu'ici

**Piste à prototyper :** générer les deux à partir de la même donnée annuelle déjà traitée pour la page Publications (le CSV Scholar nettoyé par Claude), enrichie si besoin par les données d'affiliation OpenAlex (institution, pays) pour la carte. Objectif : éviter le nettoyage manuel spécifique que demandait auparavant la préparation du graphe seul. À tester en phase de build.

## 9. Charte graphique

**Diagnostic du style actuel :** l'esthétique Google Sites (polices par défaut, coins arrondis, cartes à ombres, accent bleu Google) renvoie une identité visuelle "SaaS" plutôt qu'académique — ce qu'Ali perçoit comme "à l'américaine."

**Direction retenue :** sobre, professionnelle, élégante, académique — fond clair évoquant le papier plutôt que l'écran, une seule couleur d'accent choisie avec intention, typographie de titre avec du caractère (serif), peu ou pas de cartes à ombres portées, mise en page éditoriale (marges généreuses, hiérarchie claire).

**Couleur d'accent retenue :** bleu marine / bleu de Prusse — évoque la rigueur universitaire et scientifique, et rejoint la tradition de l'illustration scientifique historique (cartographie, planches anatomiques). Valeur exacte à affiner en phase de build avec des essais visuels.

**Cohérence avec l'outil de références :** même esprit "revue savante" que la bibliothèque de références (fond clair, serif, une couleur d'accent, pas de cartes) — mais teintes et typographies personnalisées pour ce site plutôt que reprises à l'identique, pour que le résultat reste distinctif plutôt que de ressembler à un rendu générique.

**Éléments à ajouter :**
- Favicon personnalisé
- Image de partage (aperçu de lien pour réseaux sociaux/email)
- Adresse de contact visible (déjà notée en section 4)
- Typographie soignée pour la lecture longue (descriptions de recherche, publications)

**Photo professionnelle :** Ali dispose d'une photo en noir et blanc. Intégration non tranchée pour l'instant — à noter que le noir et blanc s'accorderait bien avec la direction retenue (fond papier + bleu marine), à considérer si besoin de trancher plus tard.

## 10. Décisions en attente

- [ ] Validation des deux visualisations (carte + graphe) après prototypage technique en phase de build
- [x] Valeurs exactes des couleurs (fond, accent, texte) et choix des polices — *tranché le 15 août 2026 sur essais comparés : EB Garamond, papier `#FBF9F3`, bleu de Prusse `#003153`. Détail dans `PLAN-BUILD.md`, phase 2*
- [ ] Intégration ou non de la photo noir et blanc, et à quel endroit

## 11. Hors périmètre V1 (pistes futures)

- Enrichissement des fiches de publications via OpenAlex/Crossref
- Automatisation complète de la veille Google Scholar si une solution fiable apparaît côté API
- Passage à une offre d'hébergement payante, si pertinent pour l'ensemble des projets
