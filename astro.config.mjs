import { defineConfig } from 'astro/config';

// Le site est bilingue : le français occupe la racine, l'anglais le préfixe /en/.
// prefixDefaultLocale: false garde les URL françaises identiques à celles de
// Google Sites (/clinique, /recherche…), ce qui évite de casser les liens existants.
export default defineConfig({
  site: 'https://www.aliamad.com',
  i18n: {
    defaultLocale: 'fr',
    locales: ['fr', 'en'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  build: {
    // /clinique plutôt que /clinique/index.html
    format: 'directory',
  },
});
