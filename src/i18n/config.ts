export const locales = ['fr', 'en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'fr';

/**
 * Chaque page porte un identifiant stable, indépendant de la langue. Le
 * sélecteur de langue s'en sert pour rester sur la page équivalente au lieu de
 * renvoyer à l'accueil (cahier des charges §5).
 *
 * Les slugs français reprennent à l'identique les adresses de Google Sites :
 * les changer casserait les liens déjà partagés et le référencement acquis.
 */
export const routes = {
  home: { fr: '', en: '' },
  clinical: { fr: 'clinique', en: 'clinical-activities' },
  research: { fr: 'recherche', en: 'research' },
  teaching: { fr: 'enseignement', en: 'teaching' },
  publications: { fr: 'publications', en: 'publications' },
} as const;

export type PageId = keyof typeof routes;

/** Rubriques du menu, dans l'ordre d'affichage. */
export const navOrder: PageId[] = ['home', 'clinical', 'research', 'teaching', 'publications'];

/** Construit l'URL d'une page dans une langue donnée. */
export function urlFor(id: PageId, locale: Locale): string {
  const slug = routes[id][locale];
  const prefix = locale === defaultLocale ? '' : `/${locale}`;
  return slug ? `${prefix}/${slug}` : prefix || '/';
}

export const ui = {
  fr: {
    siteTitle: 'Ali Amad',
    tagline: 'Professeur de psychiatrie — Université de Lille, CHU de Lille',
    nav: {
      home: 'Accueil',
      clinical: 'Clinique',
      research: 'Recherche',
      teaching: 'Enseignement',
      publications: 'Publications',
    },
    contactLabel: 'Contact',
    switchTo: 'Read this page in English',
    skipToContent: 'Aller au contenu',
    profiles: 'Profils académiques',
  },
  en: {
    siteTitle: 'Ali Amad',
    tagline: 'Professor of Psychiatry — University of Lille, Lille University Hospital',
    nav: {
      home: 'Home',
      clinical: 'Clinical activities',
      research: 'Research',
      teaching: 'Teaching',
      publications: 'Publications',
    },
    contactLabel: 'Contact',
    switchTo: 'Lire cette page en français',
    skipToContent: 'Skip to content',
    profiles: 'Academic profiles',
  },
} as const;

/**
 * Liens de pied de page, repris du site actuel où ils figuraient sur chaque page.
 */
export const profileLinks = [
  { label: 'Google Scholar', href: 'https://scholar.google.fr/citations?user=x5L4rgwAAAAJ&hl=fr' },
  { label: 'PubMed', href: 'https://pubmed.ncbi.nlm.nih.gov/?term=Amad%2C+A%5BAuthor%5D' },
  { label: 'ResearchGate', href: 'https://www.researchgate.net/profile/Ali-Amad' },
  { label: 'Université de Lille', href: 'https://pro.univ-lille.fr/ali-amad/' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/ali-amad-65a090191/' },
];

/**
 * Adresse professionnelle, stockée en morceaux pour n'apparaître nulle part en
 * clair dans le HTML servi. Elle est recomposée côté navigateur : lisible pour
 * un visiteur, coûteuse à récolter pour un robot collecteur d'adresses.
 */
export const contact = { user: 'ali.amad', domain: 'chu-lille.fr' };
