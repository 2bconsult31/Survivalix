import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const manuel = defineCollection({
  loader: glob({ pattern: '**/*.md', base: 'src/content/manuel' }),
  schema: z.object({
    title: z.string(),
    seo_title: z.string().optional(),
    description: z.string(),
    date: z.date(),
    tags: z.array(z.string()),
    image: z.string().optional(),
    image_alt: z.string().optional(),
    rubrique: z.string().optional(),
    checklist: z.string().optional(),
  })
});

const cantine = defineCollection({
  loader: glob({ pattern: '**/*.md', base: 'src/content/cantine' }),
  schema: z.object({
    title: z.string(),
    seo_title: z.string().optional(),
    description: z.string(),
    date: z.date(),
    tags: z.array(z.string()),
    image: z.string().optional(),
    image_alt: z.string().optional(),
    recette_png: z.string().optional(),
    temps_prep: z.string().optional(),
    temps_cuisson: z.string().optional(),
    personnes: z.number().optional(),
    difficulte: z.string().optional(),
    energie: z.string().optional(),
    conservation: z.string().optional(),
  })
});

const atelier = defineCollection({
  loader: glob({ pattern: '**/*.md', base: 'src/content/atelier' }),
  schema: z.object({
    title: z.string(),
    seo_title: z.string().optional(),
    description: z.string(),
    date: z.date(),
    tags: z.array(z.string()),
    image: z.string().optional(),
    image_alt: z.string().optional(),
    fiche_png: z.string().optional(),
    difficulte: z.string().optional(),
    duree: z.string().optional(),
    materiel: z.string().optional(),
  })
});

const radar = defineCollection({
  loader: glob({ pattern: '**/*.md', base: 'src/content/radar' }),
  schema: z.object({
    title: z.string(),
    seo_title: z.string().optional(),
    description: z.string(),
    date: z.date(),
    tags: z.array(z.string()),
    image: z.string().optional(),
    image_alt: z.string().optional(),
    source: z.string().optional(),
    source_url: z.string().optional(),
  })
});

export const collections = { manuel, cantine, atelier, radar };