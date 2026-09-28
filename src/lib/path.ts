/**
 * The page's public path, without the `.html` that `build.format: 'file'` adds to `Astro.url.pathname`
 * during builds (https://docs.astro.build/en/reference/configuration-reference/#buildformat).
 * `/index.html` → `/`, `/posts.html` → `/posts`, `/tags/web%20development.html` → `/tags/web%20development`.
 */
export function pagePath(url: URL): string {
	const path = url.pathname.replace(/\.html$/, '').replace(/\/index$/, '/');
	return path === '' ? '/' : path;
}
