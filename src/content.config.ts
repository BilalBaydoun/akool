import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const articles = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/articles" }),
  schema: z.object({
    title: z.string(),
    excerpt: z.string(),
    emoji: z.string(),
    tag: z.string(),
    tagFilter: z.string(),
    date: z.coerce.date(),
    readTime: z.string(),
    author: z.string(),
  }),
});

const foundations = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/foundations" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    icon: z.string(),
    order: z.number(),
  }),
});

const guides = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/guides" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    icon: z.string(),
    color: z.string(),
    textColor: z.string(),
  }),
});

export const collections = { articles, foundations, guides };
