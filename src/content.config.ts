import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Le contenu vit dans des fichiers Markdown, un par page et par langue. C'est
 * ce qui rend l'édition en langage naturel possible : corriger une phrase
 * revient à modifier une ligne de texte, sans toucher au code.
 */
const pages = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/pages' }),
  schema: ({ image }) =>
    z.object({
      /** Identifiant partagé par les deux langues, cf. src/i18n/config.ts */
      pageId: z.enum(['home', 'clinical', 'research', 'teaching', 'publications']),
      locale: z.enum(['fr', 'en']),
      /** Titre de l'onglet et des résultats de recherche */
      title: z.string(),
      /** Titre affiché en haut de la page */
      heading: z.string(),
      description: z.string(),

      banner: image().optional(),
      /** Texte alternatif : obligatoire dès qu'une image est présente */
      bannerAlt: z.string().optional(),
      /**
       * Point de focalisation du recadrage, au format CSS object-position.
       * Se règle en une phrase sans jamais rogner l'original.
       */
      bannerFocus: z.string().default('50% 50%'),
      /** Mention de source, pour les documents d'archive */
      bannerCredit: z.string().optional(),
    }),
});

export const collections = { pages };
