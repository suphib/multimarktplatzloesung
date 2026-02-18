import { defineCollection, z } from 'astro:content';

const blogCollection = defineCollection({
  type: 'content',
  schema: z.object({
    titel: z.string(),
    beschreibung: z.string(),
    datum: z.string(),
    autor: z.string(),
    lesezeit: z.string(),
    tags: z.array(z.string()).optional(),
    bild: z.string().optional(),
  }),
});

export const collections = {
  blog: blogCollection,
};
