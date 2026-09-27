// https://docs.astro.build/en/reference/configuration-reference/
import { defineConfig, fontProviders } from 'astro/config';
import mdx from '@astrojs/mdx';
import { satteri, satteriHeadingIdsPlugin } from '@astrojs/markdown-satteri';
import { externalLinks } from './src/lib/external-links.mjs';
import { headingAnchors } from './src/lib/heading-anchors.mjs';

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
		processor: satteri({
			features: { smartPunctuation: false },
			hastPlugins: [externalLinks, satteriHeadingIdsPlugin(), headingAnchors],
		}),
		// Nextra used Shiki's css-variables theme with its own light/dark palette (see src/styles/base.scss).
		// https://docs.astro.build/en/guides/syntax-highlighting/
		shikiConfig: { theme: 'css-variables' },
	},
	// Self-hosted, preloaded fonts with metric-matched fallbacks; loading them from Google at runtime
	// shifted the layout on swap (CLS 0.366). Weights match production's Google Fonts URL.
	// https://docs.astro.build/en/guides/fonts/
	fonts: [
		{
			provider: fontProviders.google(),
			name: 'Open Sans',
			cssVariable: '--font-open-sans',
			weights: [400],
			styles: ['normal'],
			subsets: ['latin'],
		},
		{
			provider: fontProviders.google(),
			name: 'Vollkorn',
			cssVariable: '--font-vollkorn',
			weights: [400, 600],
			styles: ['normal'],
			subsets: ['latin'],
		},
	],
	integrations: [mdx()],
});
