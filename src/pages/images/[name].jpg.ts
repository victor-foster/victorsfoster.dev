// Publishes each photo in src/assets/photos, unmodified, at /images/<name>.jpg: the full-size originals the
// photos page captions link to (URLs kept from the Next.js site). The page itself shows optimized copies via
// astro:assets, which only processes images under src/, so this keeps one source file per photo instead of a
// second copy in public/.
// https://docs.astro.build/en/guides/endpoints/#static-file-endpoints
import type { APIRoute, GetStaticPaths } from 'astro';
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

// Builds and the dev server run from the project root
const PHOTOS_DIR = join(process.cwd(), 'src/assets/photos');

export const getStaticPaths = (async () => {
	const files = await readdir(PHOTOS_DIR);
	return files
		.filter((file) => file.endsWith('.jpg'))
		.map((file) => ({ params: { name: file.slice(0, -'.jpg'.length) } }));
}) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ params }) =>
	new Response(await readFile(join(PHOTOS_DIR, `${params.name}.jpg`)), {
		headers: { 'Content-Type': 'image/jpeg' },
	});
