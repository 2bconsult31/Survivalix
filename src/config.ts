import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const manuel = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/manuel' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.date(),
    tags: z.array(z.string()),
    image: z.string().optional(),
    image_alt: z.string().optional(),
    rubrique: z.string().optional(),
  })
});

export const collections = { manuel };