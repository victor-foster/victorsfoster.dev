// https://docs.astro.build/en/reference/configuration-reference/
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import { satteri } from '@astrojs/markdown-satteri';

export default defineConfig({
	site: 'https://www.victorfoster.dev',
	// Keep production's URLs without a trailing slash (/posts, not /posts/).
	// Astro docs: pair trailingSlash 'never' with build.format 'file'; vercel.json serves /posts from posts.html.
	trailingSlash: 'never',
	build: {
		format: 'file',
	},
	markdown: {
		// Astro 7 renders Markdown/MDX with Sätteri and turns smart punctuation on by default;
		// production (Nextra) kept straight quotes and `--` as typed.
		// https://docs.astro.build/en/guides/markdown-content/ (satteri features)
		processor: satteri({ features: { smartPunctuation: false } }),
	},
	integrations: [mdx()],
});
