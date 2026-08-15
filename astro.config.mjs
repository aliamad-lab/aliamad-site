import { defineConfig } from 'astro/config';

/**
 * Le site vit successivement à deux adresses :
 *
 *  - en recette, sous https://aliamad-lab.github.io/aliamad-site/ — donc dans un
 *    sous-répertoire, ce qui impose un `base` ;
 *  - en production, à la racine de https://www.aliamad.com.
 *
 * Les deux se pilotent par variables d'environnement plutôt que par édition du
 * fichier, pour que la bascule de la phase 8 ne consiste qu'à changer le
 * workflow — sans risque d'oublier un réglage en chemin.
 */
const site = process.env.SITE_URL ?? 'https://www.aliamad.com';
const base = process.env.SITE_BASE ?? '/';

export default defineConfig({
  site,
  base,
  i18n: {
    defaultLocale: 'fr',
    locales: ['fr', 'en'],
    routing: {
      // Garde les URL françaises identiques à celles de Google Sites
      // (/clinique, /recherche…) pour ne pas casser les liens existants.
      prefixDefaultLocale: false,
    },
  },
  build: {
    format: 'directory',
  },
});
