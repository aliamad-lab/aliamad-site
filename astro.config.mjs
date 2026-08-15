import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import { unified } from '@astrojs/markdown-remark';

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

/**
 * Les liens écrits dans le contenu Markdown sont naturellement absolus
 * (`/clinique`). En recette, le site étant servi depuis un sous-répertoire, ils
 * mèneraient à des 404. Ce greffon leur applique le même préfixe que celui
 * qu'`urlFor` applique aux liens de navigation, pour que l'auteur du contenu
 * n'ait jamais à s'en préoccuper.
 */
function rehypeBaseUrl() {
  const prefix = base.replace(/\/$/, '');
  return (tree) => {
    if (!prefix) return;
    const walk = (node) => {
      const href = node?.properties?.href;
      if (node.tagName === 'a' && typeof href === 'string' && href.startsWith('/') && !href.startsWith('//')) {
        node.properties.href = prefix + href;
      }
      for (const child of node.children ?? []) walk(child);
    };
    walk(tree);
  };
}

export default defineConfig({
  site,
  base,
  integrations: [mdx()],
  i18n: {
    defaultLocale: 'fr',
    locales: ['fr', 'en'],
    routing: {
      // Garde les URL françaises identiques à celles de Google Sites
      // (/clinique, /recherche…) pour ne pas casser les liens existants.
      prefixDefaultLocale: false,
    },
  },
  markdown: {
    processor: unified({ rehypePlugins: [rehypeBaseUrl] }),
  },
  redirects: {
    // La page Calypso du site actuel renvoie désormais au site du projet.
    // Son contenu propre — clinique fondamentale, origine du nom, vidéos —
    // a rejoint la page Recherche, le site du projet ne le portant pas.
    '/calypso': 'https://calypso.univ-lille.fr/',
  },
  build: {
    format: 'directory',
  },
});
