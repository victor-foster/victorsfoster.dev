// Replaces scripts/gen-rss.mjs. https://docs.astro.build/en/recipes/rss/
import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getCollection } from 'astro:content';

export async function GET(context: APIContext) {
	const posts = await getCollection('posts');
	return rss({
		title: 'Victor Foster',
		description: 'Victor Foster',
		site: context.site!,
		// Match the site's slash-less URLs (trailingSlash: 'never'); rss() adds slashes by default.
		trailingSlash: false,
		// RSS <author> must be an email, so the name goes in <dc:creator> as the old feed did.
		xmlns: { dc: 'http://purl.org/dc/elements/1.1/', atom: 'http://www.w3.org/2005/Atom' },
		// Self link, as the old feed had (feed validators expect it)
		customData: `<atom:link href="${new URL('/feed.xml', context.site)}" rel="self" type="application/rss+xml"/>`,
		items: posts.map((post) => ({
			title: post.data.title,
			description: post.data.description ?? '',
			link: `/posts/${post.id}`,
			pubDate: post.data.date,
			categories: post.data.tag,
			customData: `<dc:creator><![CDATA[${post.data.author ?? 'Victor Foster'}]]></dc:creator>`,
		})),
	});
}
