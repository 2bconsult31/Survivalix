// @ts-check
import { defineConfig } from 'astro/config';

import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://www.survivalix.fr',
  trailingSlash: 'never',
  integrations: [
    sitemap({
      // La page de résultat du quiz est personnalisée : pas d'intérêt à l'indexer.
      filter: (page) => !page.includes('/survivant/resultat'),
    }),
  ],
});
