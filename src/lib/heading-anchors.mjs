// Sätteri hast plugin reproducing nextra-theme-blog's section permalinks: each h2–h6 with an id gets a
// trailing <a class="subheading-anchor"> that shows "#" on hover (styles in src/styles/nextra.css).
// Plugin shape and ctx API: https://satteri.bruits.org/docs/plugin-api/
export const headingAnchors = {
	name: 'heading-anchors',
	element: [
		{
			filter: ['h2', 'h3', 'h4', 'h5', 'h6'],
			visit(node, ctx) {
				const id = node.properties?.id;
				if (!id) return;
				// Nextra marked headings not-prose so prose link styles skip the anchor
				ctx.setProperty(node, 'className', [...(node.properties.className ?? []), 'not-prose']);
				ctx.appendChild(node, {
					type: 'element',
					tagName: 'a',
					properties: { href: `#${id}`, className: ['subheading-anchor'], ariaLabel: 'Permalink for this section' },
					children: [],
				});
			},
		},
	],
};
