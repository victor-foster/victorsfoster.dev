// Post-build check that dist/ keeps every production URL, its metadata and the RSS feed.
// Expected values were captured from https://www.victorfoster.dev on 2026-09-27.
//
//   npm run build && npm run verify
import { existsSync, readFileSync } from 'node:fs';

const SITE = 'https://www.victorfoster.dev';
const DIST = new URL('../dist/', import.meta.url);
const DEFAULT_DESCRIPTION = 'Victor Foster - UI Engineer';
const DEFAULT_IMAGE = `${SITE}/og-image.png`;

const POSTS = {
	unleashed: 'notes-and-takeaways-from-web-unleashed-2024',
	css: 'css-custom-properties-the-future-is-now-and-its-looking-pretty-colorful',
	blog: 'how-I-setup-my-developer-blog',
};
const NEWEST_FIRST = [POSTS.unleashed, POSTS.css, POSTS.blog].map((slug) => `/posts/${slug}`);

const PAGES = [
	{ route: '/', title: 'About', h1: 'About' },
	{ route: '/photos', title: 'Photos', h1: 'Photos' },
	{ route: '/posts', title: 'Posts', h1: 'Posts', postLinks: NEWEST_FIRST },
	{
		route: `/posts/${POSTS.unleashed}`,
		title: 'Notes and Takeaways from Web Unleashed 2024',
		h1: 'Notes and Takeaways from Web Unleashed 2024',
		description: 'Covering performance engineering, TypeScript tips, and modern frontend patterns.',
		date: ['2024-10-27', 'Sun Oct 27 2024'],
		tags: ['web development', 'web performance'],
		author: null,
	},
	{
		route: `/posts/${POSTS.css}`,
		title: "CSS Custom Properties - The Future is Now, and It's Looking Pretty Colorful",
		h1: "CSS Custom Properties - The Future is Now, and It's Looking Pretty Colorful",
		description: 'From Hue to You - Creating a Customizable Color Palette with Modern CSS',
		date: ['2023-04-02', 'Sun Apr 02 2023'],
		tags: ['web development'],
		author: 'Victor Foster',
	},
	{
		route: `/posts/${POSTS.blog}`,
		title: 'How I setup my developer blog.',
		h1: 'How I setup my developer blog.',
		description: 'How I setup my developer blog.',
		date: ['2022-01-17', 'Mon Jan 17 2022'],
		tags: ['web development'],
		author: 'Victor Foster',
		externalLink: 'https://nextjs.org/',
	},
	{
		route: '/tags/web%20development',
		title: 'Tagged Posts',
		h1: 'Posts Tagged with “web development”',
		postLinks: NEWEST_FIRST,
	},
	{
		route: '/tags/web%20performance',
		title: 'Tagged Posts',
		h1: 'Posts Tagged with “web performance”',
		postLinks: [`/posts/${POSTS.unleashed}`],
	},
];

const failures = [];
let checks = 0;
const check = (where, ok, message) => {
	checks++;
	if (!ok) failures.push(`${where}: ${message}`);
};

// --- tiny HTML helpers (dist/ is our own build output, so regexes are enough) ---
const decode = (s) =>
	s
		.replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
		.replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
		.replace(/&quot;/g, '"')
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&amp;/g, '&');
const attrs = (tag) =>
	Object.fromEntries(
		[...tag.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g)].map((m) => [
			m[1].toLowerCase(),
			decode(m[2] ?? m[3] ?? m[4]),
		]),
	);
const tags = (html, name) => [...html.matchAll(new RegExp(`<${name}\\b[^>]*>`, 'gi'))].map((m) => attrs(m[0]));
const meta = (html, key) => tags(html, 'meta').find((a) => a.property === key || a.name === key)?.content;
const text = (s) =>
	decode(
		s
			.replace(/<!--[\s\S]*?-->/g, '')
			.replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, '')
			.replace(/<[^>]+>/g, ''),
	).trim();
const firstText = (html, name) => {
	const m = html.match(new RegExp(`<${name}\\b[^>]*>([\\s\\S]*?)</${name}>`, 'i'));
	return m ? text(m[1]) : undefined;
};
const postHrefs = (html) => [...new Set([...html.matchAll(/href="(\/posts\/[^"]+)"/g)].map((m) => m[1]))];

const fileFor = (route) => new URL(route === '/' ? 'index.html' : `${decodeURIComponent(route.slice(1))}.html`, DIST);

// --- pages ---
for (const page of PAGES) {
	const { route } = page;
	const file = fileFor(route);
	check(route, existsSync(file), `missing ${decodeURIComponent(file.pathname.replace(DIST.pathname, 'dist/'))}`);
	if (!existsSync(file)) continue;

	const html = readFileSync(file, 'utf8');
	const url = route === '/' ? `${SITE}/` : `${SITE}${route}`;
	const description = page.description ?? DEFAULT_DESCRIPTION;

	check(route, /<html\b[^>]*\blang="en"/i.test(html), 'missing <html lang="en">');
	check(route, firstText(html, 'title') === page.title, `<title> is ${JSON.stringify(firstText(html, 'title'))}`);
	if (page.h1) check(route, firstText(html, 'h1') === page.h1, `<h1> is ${JSON.stringify(firstText(html, 'h1'))}`);

	const canonical = tags(html, 'link').find((a) => a.rel === 'canonical')?.href;
	check(route, canonical === url, `canonical is ${canonical}, expected ${url}`);
	check(
		route,
		tags(html, 'link').some((a) => a.rel === 'alternate' && a.type === 'application/rss+xml' && a.href === '/feed.xml'),
		'missing RSS <link rel="alternate">',
	);

	const expectedMeta = {
		description,
		'og:type': 'website',
		'og:url': url,
		'og:title': page.title,
		'og:description': description,
		'og:site_name': DEFAULT_DESCRIPTION,
		'og:image': DEFAULT_IMAGE,
		'og:image:width': '1200',
		'og:image:height': '630',
		'og:image:alt': page.title,
		'twitter:card': 'summary_large_image',
		'twitter:title': page.title,
		'twitter:description': description,
		'twitter:image': DEFAULT_IMAGE,
		'twitter:image:alt': page.title,
	};
	for (const [key, expected] of Object.entries(expectedMeta)) {
		const actual = meta(html, key);
		check(route, actual === expected, `meta ${key} is ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`);
	}

	if (page.date) {
		const [iso, label] = page.date;
		const time = html.match(/<time\b([^>]*)>([^<]*)<\/time>/i);
		const datetime = time && attrs(time[1]).datetime;
		check(route, datetime?.startsWith(iso), `<time datetime> is ${datetime}, expected ${iso}`);
		check(
			route,
			time && text(time[2]) === label,
			`date text is ${JSON.stringify(time && text(time[2]))}, expected "${label}"`,
		);
	}
	if (page.tags) {
		for (const tag of page.tags) {
			check(route, html.includes(`href="/tags/${encodeURIComponent(tag)}"`), `missing tag link for "${tag}"`);
		}
	}
	if (page.author !== undefined) {
		const hasAuthor = text(html).includes(`${page.author ?? 'Victor Foster'},`);
		check(route, hasAuthor === Boolean(page.author), page.author ? 'missing author' : 'author shown but post has none');
	}
	if (page.postLinks) {
		const hrefs = postHrefs(html);
		check(route, JSON.stringify(hrefs) === JSON.stringify(page.postLinks), `post links are ${JSON.stringify(hrefs)}`);
	}
	if (page.externalLink) {
		const link = [...html.matchAll(/(<a\b[^>]*>)([\s\S]*?)<\/a>/g)].find((m) => attrs(m[1]).href === page.externalLink);
		const a = link && attrs(link[1]);
		check(route, a?.target === '_blank', `external link ${page.externalLink} missing target="_blank"`);
		check(
			route,
			a?.rel?.split(/\s+/).includes('noreferrer'),
			`external link ${page.externalLink} missing rel="noreferrer"`,
		);
		check(
			route,
			link?.[2].includes('(opens in a new tab)'),
			`external link ${page.externalLink} missing sr-only label`,
		);
	}
	check(
		route,
		!tags(html, 'a').some((a) => a.href?.startsWith('/') && a.target),
		'internal link has a target attribute',
	);
	check(route, !html.includes('UA-29309617'), 'still contains the Universal Analytics ID');
}

// --- static files ---
check('/og-image.png', existsSync(new URL('og-image.png', DIST)), 'missing dist/og-image.png');
check('/favicon.ico', existsSync(new URL('favicon.ico', DIST)), 'missing dist/favicon.ico');

// Photo caption links: /images/<name>.jpg is built from src/assets/photos/<name>.jpg, byte for byte
const photosFile = new URL('photos.html', DIST);
const photoLinks = existsSync(photosFile)
	? [...new Set([...readFileSync(photosFile, 'utf8').matchAll(/href="(\/images\/[^"]+)"/g)].map((m) => m[1]))]
	: [];
check('/photos', photoLinks.length > 0, 'no /images/ caption links');
for (const link of photoLinks) {
	const built = new URL(link.slice(1), DIST);
	const source = new URL(`../src/assets/photos/${link.slice('/images/'.length)}`, import.meta.url);
	check(link, existsSync(built), `missing dist${link}`);
	check(
		link,
		existsSync(built) && existsSync(source) && readFileSync(built).equals(readFileSync(source)),
		'differs from its src/assets/photos original',
	);
}

// --- RSS ---
const feedFile = new URL('feed.xml', DIST);
check('/feed.xml', existsSync(feedFile), 'missing dist/feed.xml');
if (existsSync(feedFile)) {
	const feed = readFileSync(feedFile, 'utf8');
	check('/feed.xml', /^<\?xml[^>]*>\s*<rss\b[\s\S]*<\/rss>\s*$/.test(feed), 'not an <rss> document');
	const items = [...feed.matchAll(/<item>([\s\S]*?)<\/item>/g)].map((m) => ({
		link: m[1].match(/<link>([^<]+)<\/link>/)?.[1],
		guid: m[1].match(/<guid\b[^>]*>([^<]+)<\/guid>/)?.[1],
	}));
	check(
		'/feed.xml',
		items.every((i) => i.guid === i.link),
		'item <guid> differs from <link>',
	);
	const links = items.map((i) => i.link).sort();
	const expected = Object.values(POSTS)
		.map((slug) => `${SITE}/posts/${slug}`)
		.sort();
	check('/feed.xml', JSON.stringify(links) === JSON.stringify(expected), `item links are ${JSON.stringify(links)}`);
}

if (failures.length) {
	console.error(`✗ ${failures.length} of ${checks} checks failed:\n`);
	for (const f of failures) console.error(`  ${f}`);
	process.exit(1);
}
console.log(`✓ All ${checks} checks passed`);
