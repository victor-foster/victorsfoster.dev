// https://docs.astro.build/en/reference/configuration-reference/
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

export default defineConfig({
	site: 'https://www.victorfoster.dev',
	// Keep production's URLs without a trailing slash (/posts, not /posts/).
	// Astro docs: pair trailingSlash 'never' with build.format 'file'; vercel.json serves /posts from posts.html.
	trailingSlash: 'never',
	build: {
		format: 'file',
	},
	integrations: [mdx()],
});
