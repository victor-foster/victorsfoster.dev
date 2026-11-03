// Replaces scripts/gen-rss.mjs. https://docs.astro.build/en/recipes/rss/
import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { loadRenderers } from 'astro:container';
import { getCollection, render } from 'astro:content';
import { getContainerRenderer } from '@astrojs/mdx/container-renderer';
import { parse, renderSync, walkSync, ELEMENT_NODE, type ElementNode } from 'ultrahtml';
import { SITE_NAME } from '../lib/site';

// Full post HTML for <content:encoded>, rendered as on the site through the Container API.
// https://docs.astro.build/en/reference/container-reference/
const container = await AstroContainer.create({ renderers: await loadRenderers([getContainerRenderer()]) });

/**
 * Feed readers don't load the site's CSS, so drop markup that only works with it: the sr-only
 * " (opens in a new tab)" labels (src/lib/external-links.mjs), the "#" section links
 * (src/lib/heading-anchors.mjs) and Shiki's `style="color: var(--astro-code-…)"` attributes, which the
 * W3C feed validator flags. Root-relative and fragment URLs are made absolute.
 */
function toFeedHtml(html: string, postUrl: URL): string {
	const doc = parse(html);
	const siteOnly: ElementNode[] = [];
	walkSync(doc, (node) => {
		if (node.type !== ELEMENT_NODE) return;
		const classes = (node.attributes.class ?? '').split(/\s+/);
		if (classes.includes('sr-only') || classes.includes('subheading-anchor')) {
			siteOnly.push(node);
			return;
		}
		delete node.attributes.style;
		for (const attr of ['href', 'src']) {
			const value = node.attributes[attr];
			if (value?.startsWith('/') || value?.startsWith('#')) node.attributes[attr] = new URL(value, postUrl).href;
		}
	});
	for (const node of siteOnly) {
		const parent = node.parent as ElementNode;
		parent.children = parent.children.filter((child) => child !== node);
	}
	return renderSync(doc);
}

export async function GET(context: APIContext) {
	const posts = (await getCollection('posts')).sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
	return rss({
		title: 'Victor Foster',
		description: SITE_NAME,
		site: context.site!,
		// Match the site's slash-less URLs (trailingSlash: 'never'); rss() adds slashes by default.
		trailingSlash: false,
		// RSS <author> must be an email, so the name goes in <dc:creator> as the old feed did.
		xmlns: { dc: 'http://purl.org/dc/elements/1.1/', atom: 'http://www.w3.org/2005/Atom' },
		// Self link, as the old feed had (feed validators expect it)
		customData: `<atom:link href="${new URL('/feed.xml', context.site)}" rel="self" type="application/rss+xml"/>`,
		items: await Promise.all(
			posts.map(async (post) => {
				const link = `/posts/${post.id}`;
				const { Content } = await render(post);
				return {
					title: post.data.title,
					description: post.data.description ?? '',
					content: toFeedHtml(await container.renderToString(Content), new URL(link, context.site)),
					link,
					pubDate: post.data.date,
					categories: post.data.tag,
					customData: `<dc:creator><![CDATA[${post.data.author ?? 'Victor Foster'}]]></dc:creator>`,
				};
			}),
		),
	});
}
