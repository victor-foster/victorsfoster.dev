# Spec: Migrate victorfoster.dev from Next.js + Nextra to Astro

Status: **Approved 2026-09-27**. Branch: `next-to-astro`.

## Objective

Rebuild the personal site in Astro as a **straight port**. Readers and search engines should notice no change: the content, URLs, metadata and look all stay the same. The one visible difference is that three pieces that are broken today get fixed. The Next.js/Nextra stack is removed entirely.

Why: Nextra's blog theme hides most of the markup and styling, which makes the site hard to change, and Next.js adds a React runtime to what is a static content site. Astro renders MDX to static HTML and sends no JS by default, apart from the small scripts listed below.

Out of scope, each to be done separately later if wanted: redesign, new pages or features, a sitemap, publishing `draft/`, search, and **moving off Vercel**. Hosting moves only after this migration ships; the output stays adapter-free so that move is easy.

### Current behavior to preserve

These were checked against production on 2026-09-27.

| Route | Source | Notes |
|---|---|---|
| `/` | `pages/index.mdx` | "About" page. `<title>About</title>` |
| `/photos` | `pages/photos.mdx` | 4 photos with figcaptions linking to `/images/*.jpg` |
| `/posts` | `pages/posts/index.mdx` | Post list, newest first: title link, description, date |
| `/posts/<slug>` | `pages/posts/*.mdx` | 3 posts. Slugs are case-sensitive (`how-I-setup-my-developer-blog`) |
| `/tags/<tag>` | `pages/tags/[tag].mdx` | `<title>Tagged Posts</title>`, heading `Posts Tagged with “<tag>”`. The tag is raw and URL-encoded (`/tags/web%20development`). Live pages render **client-side** (empty static HTML, canonical `…/tags/[tag]`); the Astro version pre-renders them, which fixes both |
| `/feed.xml` | `scripts/gen-rss.mjs` | RSS 2.0, one item per post |
| `/images/*`, `/favicon.ico` | `public/` | Static files served at the same paths |

- **URL shape:** no trailing slash. `/posts/` currently 308-redirects to `/posts`.
- **Title:** `<title>` is the frontmatter `title` with no suffix.
- **Page heading:** the `<h1>` is the frontmatter `title`. Nextra drops the MDX file's own first `# heading`: About shows "About", not "Victor Foster", and the CSS post shows its title, not "From Hue to You…". Decision (2026-09-27): delete those dead `# …` lines from the MDX files instead of dropping them at build time; the rendered output is unchanged.
- **Head on every page:** `lang="en"`; og:type/url/title/description/site_name/image(+width, height, alt); twitter:card/title/description/image/alt; canonical; RSS `<link rel="alternate">`; Google Fonts (Open Sans, Vollkorn 400/600).
- **Description fallback:** `description || summary || 'Victor Foster - UI Engineer'`.
- **Nav:** Photos, Posts, About, in that order, followed by the theme toggle and placed below the `<h1>`. The current page is plain text rather than a link. There's no RSS link in the nav (only the `<link rel="alternate">` in the head). Post pages show "Back" → `/posts` instead of the nav.
- **Post header:** `<author>, ` (only if frontmatter has `author`), `<time>` as `Mon Jan 17 2022`, `•`, tag pills; right side: "Back" and the toggle.
- **Post list** (`/posts`, tag pages): `<h3>` title link, description + "Read More →", date. Live omits the description for the Web Unleashed post even though it has one (a Nextra quirk); the port **shows it**, which is consistent with the other posts.
- **Theme:** light and dark. Dark mode is applied with `html.dark`, follows the OS setting by default, has a toggle, and the visitor's choice persists.
- **Styles:** `styles/main.scss` is carried over unchanged. Its `.prose`, `.prose a` and `.nav-line .nav-link` rules match no live markup (Nextra's classes are `nx-*`), so they have never applied; the port avoids those class names to keep parity.
- **Punctuation:** straight quotes and `--` as typed. Astro 7's Sätteri turns smart punctuation on by default, so it is disabled. Nextra's own base styles (prose, layout, nav) have to be rebuilt to match.

### Defects fixed during the migration

1. **Analytics.** `UA-29309617-1` has collected nothing since Universal Analytics shut down in 2023. Replace it with GA4.
2. **Default share image.** `/og-image.png` returns a 404 in production, so pages without their own image share a broken image. Add a 1200×630 `public/og-image.png`: name and "UI Engineer" on the site gradient, for Victor to approve or replace. Per-post images are out of scope.
3. **Canonical host.** Canonicals point to `https://victorfoster.dev/…`, which 308-redirects to `www.`. Set `site: 'https://www.victorfoster.dev'` so every canonical and og:url uses `www.`.
4. **Meta description.** The live site emits only `og:description`. Add `<meta name="description">` with the same value.
5. **Photos.** All 4 images use `priority` (eager loading). Only the first image should load eagerly; the rest should be lazy.

## Tech Stack

- Astro (latest stable, version pinned when scaffolded) with static output
- `@astrojs/mdx` for the MDX content
- `@astrojs/rss` for `/feed.xml`, replacing `scripts/gen-rss.mjs`, `rss` and `gray-matter`
- Shiki (built into Astro) with dual light/dark themes for code blocks, replacing `prismjs` and `prism-react-renderer`
- `sass`, which Astro supports without a plugin, and `sanitize.css`
- TypeScript (strict) and `astro check` (dev dependencies `@astrojs/check`, `typescript`)
- Package manager: npm (`package-lock.json`, replacing `yarn.lock`; yarn isn't installed and Node 26 no longer ships corepack)
- Lint and format: ESLint 10 (flat config) + `eslint-plugin-astro` (requires ESLint ≥10) + `typescript-eslint` (the plugin docs require it for TypeScript in `.astro`) + `eslint-config-prettier`; Prettier 3 + `prettier-plugin-astro`

### Hosting and URLs

Stay on **Vercel (Hobby plan)**, which is free for personal, non-commercial sites. The domain's DNS is already on Vercel (`ns1/ns2.vercel-dns.com`), and Vercel auto-detects Astro, so the host, DNS and the `www.` redirect don't change. The only switch is the framework. Output is plain static files with no Vercel adapter, so the site can move to any static host later.

To keep today's URL shape exactly, use the pairing Astro's docs recommend:

```js
// astro.config.mjs
site: 'https://www.victorfoster.dev',
trailingSlash: 'never',
build: { format: 'file' }, // dist/posts.html, dist/tags/web development.html
```

```json
// vercel.json
{ "cleanUrls": true, "trailingSlash": false }
```

Result: `/posts` serves `posts.html`. `/posts/` and `/posts.html` both 308-redirect to `/posts`, which matches production today. Everything else uses Astro's defaults. Tag routes use the raw tag as the param, the same pattern as Astro's own blog tutorial, which keeps `/tags/web%20development`.

**Removed:** `next`, `nextra`, `nextra-theme-blog`, `next-compose-plugins`, `react`, `react-dom`, `react-embed` (unused), `@next/bundle-analyzer`, `eslint-config-next`, `.eslintrc` (replaced by `eslint.config.mjs`), `yarn.lock`, `prettier-stylelint` (abandoned; the source of all 29 `npm audit` findings), `@types/gtag.js`, `next.config.js`, `next-env.d.ts`, `theme.config.jsx`, `pages/`.

## Commands

```
Install:    npm install
Dev:        npm run dev       # astro dev
Build:      npm run build     # astro check && astro build
Preview:    npm run preview   # astro preview (serves dist/)
Verify:     npm run verify    # node scripts/check-routes.mjs (runs against dist/)
Lint:       npm run lint      # eslint .
Format:     npm run format    # prettier --write .
```

## Project Structure

```
src/
  content.config.ts        → posts collection + schema
  content/posts/*.mdx      → the 3 posts (filenames = slugs, unchanged)
  layouts/BaseLayout.astro → <html>, <head> (SEO/OG/fonts/RSS/GA4), nav, footer, theme script
  layouts/PostLayout.astro → post header (date, tags) + prose wrapper
  components/Head.astro    → meta tags (port of theme.config.jsx Head)
  components/Nav.astro
  components/ThemeToggle.astro
  components/PostList.astro→ used by /posts and /tags/[tag]
  pages/index.mdx          → About
  pages/photos.mdx
  pages/posts/index.astro
  pages/posts/[slug].astro
  pages/tags/[tag].astro
  pages/feed.xml.ts
  styles/main.scss         → moved from styles/, content unchanged
  styles/base.scss         → rebuilt Nextra base styles (layout, nav, prose)
public/                    → unchanged (favicon, images) + new og-image.png
astro.config.mjs           → site, trailingSlash, build.format, integrations, Shiki themes
vercel.json                → cleanUrls + trailingSlash
scripts/check-routes.mjs   → post-build verification
draft/                     → unchanged, not built
```

## Code Style

Follow the existing `.prettierrc`: tabs, single quotes, 120 columns, trailing commas. `.editorconfig` says spaces, but the existing files use tabs, so Prettier's setting wins.

```astro
---
import { getCollection } from 'astro:content';
import BaseLayout from '../../layouts/BaseLayout.astro';
import PostList from '../../components/PostList.astro';

const posts = (await getCollection('posts')).sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
---

<BaseLayout title='Posts'>
	<h1>Posts</h1>
	<PostList posts={posts} />
</BaseLayout>
```

- Components are PascalCase `.astro` files. Routes stay lowercase to match the current URLs.
- No UI framework (React etc.). Any client JS is inline `<script>` and only for the theme toggle and GA4.
- Frontmatter schema: `title`, `date` (normalize to `YYYY-MM-DD`), `description?`, `tag` (string or array → normalized to `string[]`), `author?`, `image?`.

## Testing Strategy

This is a static content site, so verification is build-time checks plus visual comparison. No unit-test framework.

1. **Types and content:** `astro check` passes with 0 errors. The collection schema rejects bad frontmatter at build time.
2. **Route and metadata parity:** `scripts/check-routes.mjs` runs over `dist/` and asserts that:
   - every route in the table above exists (including `/tags/web%20development` and `/tags/web%20performance`)
   - each HTML page has `lang="en"`, the expected `<title>`, a meta description, all og:/twitter: tags and a canonical on the correct host with no trailing slash
   - `/feed.xml` parses and has 3 items with the correct absolute links
3. **Visual parity:** screenshots of the old and new site at 375px and 1280px, in light and dark mode, for each page type (About, Photos, Posts, a post with a code block, a tag page).
4. **Theme behavior:** in a browser, confirm there's no flash of the wrong theme on load in either OS mode, the toggle works, and the choice survives a reload.
5. **Deploy preview:** on a Vercel preview deployment, confirm that old URLs, including trailing-slash variants and `/posts/`, resolve with a 200 or a single redirect to the canonical URL.

## Boundaries

- **Always:** run `npm run lint && npm run build && npm run verify` before every commit. Keep post filenames/slugs and `public/` paths unchanged. Keep the wording of the content unchanged.
- **Ask first:** adding any dependency not listed above; changing wording or visuals beyond parity; changing Vercel project settings, DNS or domains; anything that touches `main`.
- **Never:** hard-code the GA4 ID. It isn't secret, since it's public in the page source, but reading it from `PUBLIC_GA_MEASUREMENT_ID`, set for the Vercel **Production** environment only, keeps preview and dev traffic out of the reports. Also never commit secrets, publish `draft/`, or push or merge without approval.

## Success Criteria

- [ ] `npm run build` succeeds with no Next/Nextra/React dependencies in `package.json`
- [ ] `npm run verify` passes: all routes, metadata, and feed checks
- [ ] Every production URL listed above resolves on a Vercel preview (200, or one 308 to the canonical URL)
- [ ] Canonicals and og:url use `https://www.victorfoster.dev` with no trailing slash
- [ ] `/og-image.png` returns a 200 and every page without its own image has og:image pointing to it
- [ ] Visual parity signed off by Victor for all page types × 2 widths × 2 themes
- [ ] Dark mode: OS default, toggle, persistence, and no flash of the wrong theme
- [ ] GA4 fires a page_view in production builds only, and only when `PUBLIC_GA_MEASUREMENT_ID` is set
- [ ] Code blocks are highlighted in both themes
- [ ] Photos: first image eager, the rest `loading="lazy"`, all with `width`/`height` (no layout shift)
- [ ] Pages ship no JS other than the theme script and GA4

## Decisions (2026-09-27)

- Host: stay on Vercel Hobby, static output with no adapter (see Hosting and URLs)
- Canonical host: `www.victorfoster.dev`
- Default share image: add `public/og-image.png`
- Tag URLs: unchanged. Otherwise use Astro defaults, except `trailingSlash`/`build.format`, which are needed to keep URLs unchanged
- Analytics: GA4, measurement ID `G-W1DDP3CRYE`, set as `PUBLIC_GA_MEASUREMENT_ID` in Vercel Production

## Open Questions

1. **Cookie consent:** GA4 sets cookies. Is a consent banner needed for EU visitors? Currently out of scope; if yes, it's a separate task.
