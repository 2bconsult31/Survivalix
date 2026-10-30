// @ts-check
import { defineConfig } from 'astro/config';
import { readdirSync, readFileSync } from 'node:fs';

import sitemap from '@astrojs/sitemap';

const SITE = 'https://www.survivalix.fr';
const RUBRIQUES = ['manuel', 'radar', 'cantine', 'atelier'];

// lastmod du sitemap : champ « updated » de l'article s'il existe, sinon sa date de publication.
function articleLastmod() {
  /** @type {Map<string, string>} */
  const dates = new Map();
  for (const rubrique of RUBRIQUES) {
    const dir = new URL(`./src/content/${rubrique}/`, import.meta.url);
    for (const file of readdirSync(dir)) {
      if (!file.endsWith('.md')) continue;
      const frontmatter = readFileSync(new URL(file, dir), 'utf-8').split(/^---$/m)[1] ?? '';
      const field = (/** @type {string} */ name) =>
        frontmatter.match(new RegExp(`^${name}:\\s*["']?(\\d{4}-\\d{2}-\\d{2})`, 'm'))?.[1];
      const date = field('updated') ?? field('date');
      if (date) dates.set(`${SITE}/${rubrique}/${file.replace(/\.md$/, '')}`, date);
    }
  }
  return dates;
}

const lastmod = articleLastmod();

export default defineConfig({
  site: SITE,
  trailingSlash: 'never',
  integrations: [
    sitemap({
      // La page de résultat du quiz est personnalisée : pas d'intérêt à l'indexer.
      filter: (page) => !page.includes('/survivant/resultat'),
      serialize(item) {
        const date = lastmod.get(item.url.replace(/\/$/, ''));
        if (date) item.lastmod = date;
        return item;
      },
    }),
  ],
});
