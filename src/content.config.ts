// https://docs.astro.build/en/guides/content-collections/
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const posts = defineCollection({
	loader: glob({
		pattern: '*.mdx',
		base: './src/content/posts',
		// The default id is a lowercased slug; keep the filename as-is so /posts/how-I-setup-my-developer-blog survives.
		generateId: ({ entry }) => entry.replace(/\.mdx$/, ''),
	}),
	schema: z.object({
		title: z.string(),
		date: z.coerce.date(),
		description: z.string().optional(),
		// Nextra accepted `tag: a` or `tag: [a, b]`
		tag: z
			.union([z.string(), z.array(z.string())])
			.optional()
			.transform((tag) => (tag === undefined ? [] : [tag].flat())),
		author: z.string().optional(),
		image: z.string().optional(),
	}),
});

export const collections = { posts };
