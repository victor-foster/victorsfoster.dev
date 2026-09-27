// Sätteri hast plugin reproducing Nextra's Markdown links: external `[text](https://…)` links open in a
// new tab and say so to screen readers. Hand-written <a> tags in MDX are JSX nodes, not `element`s, so they
// keep their own attributes, as they did on Nextra.
// Plugin shape and ctx API: https://satteri.bruits.org/docs/plugin-api/
const OWN_HOSTS = new Set(['victorfoster.dev', 'www.victorfoster.dev']);

const isExternal = (href) => {
	if (typeof href !== 'string' || !/^https?:\/\//.test(href)) return false;
	return !OWN_HOSTS.has(new URL(href).hostname);
};

export const externalLinks = {
	name: 'external-links',
	element: [
		{
			filter: ['a'],
			visit(node, ctx) {
				if (!isExternal(node.properties?.href) || node.properties?.target) return;
				ctx.setProperty(node, 'target', '_blank');
				ctx.setProperty(node, 'rel', ['noreferrer']);
				ctx.appendChild(node, {
					type: 'element',
					tagName: 'span',
					properties: { className: ['sr-only'] },
					children: [{ type: 'text', value: ' (opens in a new tab)' }],
				});
			},
		},
	],
};
