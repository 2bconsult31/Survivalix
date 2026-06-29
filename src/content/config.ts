import { defineCollection, z } from 'astro:content';

const manuel = defineCollection({
  type: 'content',
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