# Tasks: Next.js + Nextra → Astro

Plan: [`plan.md`](plan.md) · Spec: [`SPEC.md`](../SPEC.md)

---

## Phase 1: Foundation

### T1: Capture live baseline and write the route check (red)

**Description:** Save the live site as the parity reference, and encode the spec's route and metadata table as a script that will fail until Astro produces those routes.

**Acceptance criteria:**
- [x] Screenshots are taken with a one-off `npx playwright screenshot --channel chrome --full-page --viewport-size=<w>,900 --color-scheme=<light|dark> <url> <out>.png`, wrapped in `scripts/screenshot.sh <base-url> <out-dir>` so the same command re-shoots `localhost:4321` for later comparisons. Playwright is not added to `package.json`
- [x] `tasks/baseline/` (gitignored) holds screenshots of `/`, `/photos`, `/posts`, `/posts/css-custom-properties-…` (has code blocks), and `/tags/web%20development`, each at 375px and 1280px in both light and dark (20 images); it also holds each page's rendered HTML and the live compiled CSS
- [x] `scripts/check-routes.mjs` checks `dist/` against the spec: every route file exists; for each page it checks `lang="en"`, the exact `<title>`, meta description, og:*/twitter:* tags, a canonical on `https://www.victorfoster.dev` with no trailing slash, post dates in the form `Mon Jan 17 2022`, and that `feed.xml` has 3 items with absolute www links
- [x] Running it now fails with a clear list of what's missing (there's no `dist/` yet)

**Verification:**
- [x] `node scripts/check-routes.mjs` exits non-zero and lists the missing routes
- [x] Manual check: open the baseline screenshots; all 20 are present and show the correct theme

**Dependencies:** None
**Files:** `scripts/check-routes.mjs`, `scripts/screenshot.sh`, `.gitignore`, `tasks/baseline/**` (untracked)

**Result:** 20 screenshots, 7 HTML pages, feed and live CSS saved. The script, validated against the live HTML, gives 204 checks and 46 failures, every one a known live defect. It exits 1 with no `dist/`.
**Scope:** S

### T2: Swap the toolchain

**Description:** Remove Next/Nextra/React and their config, then scaffold Astro with MDX, the spec's URL config, and a branch-scoped `vercel.json`. The goal is for a placeholder page to build.

**Acceptance criteria:**
- [ ] `package.json` has no `next*`, `nextra*`, `react*` or `@next/*` packages; it has `astro`, `@astrojs/mdx`, `@astrojs/check`, `typescript`, `sass` and `sanitize.css`; the scripts are `dev`/`build`/`preview`/`verify`; `yarn.lock` is replaced by `package-lock.json`
- [ ] `astro.config.mjs` sets `site: 'https://www.victorfoster.dev'`, `trailingSlash: 'never'`, `build.format: 'file'` and the mdx integration; `tsconfig.json` extends `astro/tsconfigs/strict`
- [ ] `vercel.json` has `framework: "astro"`, `buildCommand`, `outputDirectory: "dist"`, `cleanUrls: true` and `trailingSlash: false`
- [ ] Deleted: `next.config.js`, `next-env.d.ts`, `theme.config.jsx`, `pages/_app.tsx`, `pages/_document.tsx`, `yarn.lock`, and the `analyze` script. ESLint and Prettier are left alone until T2b. Content `.mdx` files stay where they are until their own tasks

**Verification:**
- [ ] `npm run build` succeeds (`astro check` 0 errors) and writes `dist/index.html`
- [ ] `npm run dev` serves the placeholder at `http://localhost:4321/`

**Dependencies:** T1
**Files:** `package.json`, `package-lock.json`, `yarn.lock` (deleted), `astro.config.mjs`, `tsconfig.json`, `vercel.json`, `.gitignore`, plus the deletions above
**Scope:** M (mostly deletions and config)

### T2b: Lint and format tooling

**Description:** Replace the Next ESLint config with ESLint 9 + `eslint-plugin-astro`, and upgrade to Prettier 3 + `prettier-plugin-astro`, keeping the current formatting rules.

**Acceptance criteria:**
- [ ] `eslint.config.mjs` (flat config) uses `eslint-plugin-astro` recommended + `eslint-config-prettier`, and keeps `prefer-const: error`; `.eslintrc` is deleted; `npm run lint` runs `eslint .`
- [ ] Prettier 3 + `prettier-plugin-astro`; `.prettierrc` keeps its current options and adds the plugin and an `*.astro` parser override; `npm run format` runs `prettier --write .`
- [ ] The broken `fix-code`/`fix-styles` scripts (which point at a `src/` that never existed) are removed. If `stylelint-prettier`/`prettier-stylelint` conflict with Prettier 3 as peer dependencies, **stop and ask**; don't silently drop stylelint

**Verification:**
- [ ] `npm run lint` exits 0 on the placeholder page
- [ ] `npm run format -- --check` exits 0 on `.astro` files; `npm ls prettier` shows no peer dependency errors

**Dependencies:** T2
**Files:** `eslint.config.mjs`, `.eslintrc` (deleted), `.prettierrc`, `package.json`, `package-lock.json`
**Scope:** S

### T3: BaseLayout, Head, nav, and the About page

**Description:** A working first page. Port `_document`/`_app`/`theme.config` Head into Astro components, and move the About content to `src/pages/index.mdx`.

**Acceptance criteria:**
- [ ] `BaseLayout.astro` renders `lang="en"`, Google Fonts, `sanitize.css` + `main.scss` (moved to `src/styles/`, content unchanged), the RSS alternate link, `<Head>`, nav (About/Photos/Posts/RSS), and the footer
- [ ] `Head.astro` ports every tag from `theme.config.jsx` with the same fallbacks; the canonical and og:url come from `Astro.site` + pathname
- [ ] `/` renders the About content with `<title>About</title>`

**Verification:**
- [ ] `npm run build && npm run verify`: every check for `/` passes; the other routes still fail
- [ ] Manual check: `/` in dev shows all content and links working (the styling pass is T4)

**Dependencies:** T2b
**Files:** `src/layouts/BaseLayout.astro`, `src/components/Head.astro`, `src/components/Nav.astro`, `src/pages/index.mdx` (git mv), `src/styles/main.scss` (git mv)
**Scope:** M

## Checkpoint A: Foundation
- [ ] `npm run lint`, `build` and `verify` are clean for `/`
- [ ] Commit, and let Victor look at the diff before starting the styling work

---

## Phase 2: Look and feel

### T4: Rebuild Nextra base styles for parity

**Description:** Rebuild the layout, nav and typography that Nextra's Tailwind classes provided, working from the baseline CSS.

**Acceptance criteria:**
- [ ] `src/styles/base.scss` provides the container width, nav, prose (headings, lists, links, `code`, `hr`, blockquote) and post meta pill styles in the current `.scss` style, with custom properties from `main.scss` where they exist
- [ ] `main.scss` loads after `base.scss`, so the existing overrides still apply
- [ ] The About page matches the baseline at 375 and 1280 in light mode

**Verification:**
- [ ] `npm run build` is clean
- [ ] Manual check: `scripts/screenshot.sh http://localhost:4321 tasks/current` and compare with `tasks/baseline/about-{375,1280}-light.png`

**Dependencies:** T3
**Files:** `src/styles/base.scss`, `src/layouts/BaseLayout.astro`
**Scope:** S

### T5: Dark mode

**Description:** Match next-themes: follow the OS setting by default, keep the visitor's choice under localStorage `theme`, and show no flash of the wrong theme.

**Acceptance criteria:**
- [ ] An inline `<head>` script (`is:inline`) applies `html.dark`/`light` plus `color-scheme` before first paint, using the same logic as the live next-themes script
- [ ] `ThemeToggle.astro` is a `<button aria-label="Toggle Dark Mode">` with the same sun icon; clicking it switches the theme and stores `light`/`dark`
- [ ] Nav placement matches the live site (on post pages it sits next to "Back"; T6 places it there)

**Verification:**
- [ ] Manual check, OS light and OS dark: hard reload shows no flash; the toggle works; the choice survives a reload; a visitor with `localStorage.theme='dark'` from the old site gets dark mode
- [ ] About page dark mode matches `tasks/baseline/about-*-dark.png`

**Dependencies:** T4
**Files:** `src/components/ThemeToggle.astro`, `src/layouts/BaseLayout.astro`
**Scope:** S

## Checkpoint B: About page at parity
- [ ] About page at 375/1280 × light/dark matches the baseline. **Victor signs off.**

---

## Phase 3: Content

### T6: Posts collection and post pages

**Description:** Move the 3 posts into a typed content collection and render them at their unchanged slugs with a post header.

**Acceptance criteria:**
- [ ] `src/content.config.ts` defines the schema from the spec (`date` coerced, `tag` normalized to `string[]`); frontmatter dates are normalized to `YYYY-MM-DD`
- [ ] Posts moved with `git mv` to `src/content/posts/`, keeping filenames; the unused `next/image` import is removed from the web-unleashed post; no wording changes
- [ ] `PostLayout.astro` renders the header like the live site: author, `<time datetime>` formatted in UTC as `Mon Jan 17 2022`, `•`, tag pills linking to `/tags/<encoded tag>`, "Back" → `/posts`, and the theme toggle

**Verification:**
- [ ] `npm run build && npm run verify`: all 3 post routes pass, including the date text
- [ ] Manual check: the web-unleashed post (2 tags) matches the baseline header

**Dependencies:** T5
**Files:** `src/content.config.ts`, `src/content/posts/*.mdx` (git mv), `src/pages/posts/[slug].astro`, `src/layouts/PostLayout.astro`
**Scope:** M

### T6b: External link handling

**Description:** Reproduce Nextra's automatic treatment of external Markdown links on every MDX page, with no new dependency.

**Acceptance criteria:**
- [ ] A local rehype plugin (~15 lines) adds `target="_blank" rel="noreferrer"` and `<span class="sr-only"> (opens in a new tab)</span>` to `http(s)` links whose host isn't `victorfoster.dev`; internal links and hand-written `<a>` tags that already set a `target` are left alone
- [ ] `.sr-only` is defined in `base.scss`

**Verification:**
- [ ] `npm run verify` asserts that the post's `https://nextjs.org/` link has the target, rel and sr-only span, and that `/posts` links do not
- [ ] Manual check: with VoiceOver on the About page, the GitHub link is announced with "opens in a new tab"

**Dependencies:** T3 (can be done any time after T3)
**Files:** `src/lib/rehype-external-links.mjs`, `astro.config.mjs`, `src/styles/base.scss`, `scripts/check-routes.mjs`
**Scope:** S

### T7: Code highlighting

**Description:** Shiki with light and dark themes, following the site theme through `html.dark`.

**Acceptance criteria:**
- [ ] `markdown.shikiConfig.themes` has `{ light, dark }`; CSS switches to the dark variables under `html.dark`
- [ ] Code blocks are readable in both themes and match the baseline block styling (background, radius, padding, font size)

**Verification:**
- [ ] Manual check: the CSS custom properties post in both themes vs `tasks/baseline/post-*`
- [ ] `npm run build` is clean

**Dependencies:** T6
**Files:** `astro.config.mjs`, `src/styles/base.scss`
**Scope:** XS

## Checkpoint C1: Posts
- [ ] `npm run lint && npm run build && npm run verify` pass for `/` and all 3 posts
- [ ] Post pages (header, prose, code blocks, external links) match the baseline in both themes; `scripts/screenshot.sh` diffs are reviewed with Victor

### T8: Posts index and tag pages

**Description:** The post list at `/posts` and one page per tag, sharing a single list component.

**Acceptance criteria:**
- [ ] `PostList.astro` shows the posts newest first, each with a title link, description, date and "Read More →", matching the baseline
- [ ] `/posts` renders under `<title>Posts</title>`
- [ ] `tags/[tag].astro` generates one page per distinct tag, using the raw tag as the param (`/tags/web%20development`, `/tags/web%20performance`); the heading is `Posts Tagged with “<tag>”`

**Verification:**
- [ ] `npm run verify`: the posts and tag routes pass; `/tags/web%20development` lists 3 posts and `/tags/web%20performance` lists 1
- [ ] Manual check vs `tasks/baseline/posts-*` and `tags-*`

**Dependencies:** T6
**Files:** `src/components/PostList.astro`, `src/pages/posts/index.astro`, `src/pages/tags/[tag].astro`, delete `pages/posts/index.mdx` and `pages/tags/[tag].mdx`
**Scope:** S

### T9: RSS feed

**Description:** Replace the pre-build script with an Astro endpoint.

**Acceptance criteria:**
- [ ] `src/pages/feed.xml.ts` uses `@astrojs/rss` with the title "Victor Foster", absolute `https://www.victorfoster.dev/posts/<slug>` links, date, description, categories (tags) and author
- [ ] Removed: `scripts/gen-rss.mjs`, `rss`, `gray-matter`, and the `public/feed.xml` ignore line

**Verification:**
- [ ] `npm run verify`: the feed check passes (3 items, absolute links)
- [ ] Manual check: `dist/feed.xml` validates at validator.w3.org/feed (paste the contents)

**Dependencies:** T6
**Files:** `src/pages/feed.xml.ts`, `package.json`, `.gitignore`, delete `scripts/gen-rss.mjs`
**Scope:** S

### T10: Photos page

**Description:** Port the photos page without `next/image`, loading only the first photo eagerly.

**Acceptance criteria:**
- [ ] `src/pages/photos.mdx` uses plain `<img>` with the real intrinsic `width`/`height` (checked with `sips`); the first photo is `loading="eager"` and the other 3 are `loading="lazy" decoding="async"`
- [ ] Captions and links to `/images/*.jpg` are unchanged; `public/images` is untouched

**Verification:**
- [ ] `npm run verify`: `/photos` passes
- [ ] Manual check vs baseline; the DevTools network panel shows images 2–4 load only on scroll; no layout shift

**Dependencies:** T4
**Files:** `src/pages/photos.mdx` (git mv), `src/styles/base.scss` (if the figure styles need it)
**Scope:** XS

## Checkpoint C: All routes
- [ ] `npm run build && npm run verify` pass with every route green and no `pages/` directory left
- [ ] Every page type at 375/1280 × light/dark matches the baseline. **Victor signs off.**

---

## Phase 4: Fixes and ship

### T11: Default OG image

**Description:** A 1200×630 default share image in the site's style.

**Acceptance criteria:**
- [ ] `scripts/og-image.html` (committed) renders the name and "UI Engineer" in Vollkorn/Open Sans on the site gradient; `public/og-image.png` is produced with headless Chrome at 1200×630
- [ ] Pages without their own image point og:image/twitter:image at `https://www.victorfoster.dev/og-image.png`

**Verification:**
- [ ] `sips -g pixelWidth -g pixelHeight public/og-image.png` → 1200×630
- [ ] `npm run verify`: the og:image check passes
- [ ] Manual check: **Victor approves the image**

**Dependencies:** T3
**Files:** `scripts/og-image.html`, `public/og-image.png`, `src/components/Head.astro`
**Scope:** S

### T12: GA4

**Description:** Load gtag only in production builds and only when the measurement ID is set.

**Acceptance criteria:**
- [ ] `Analytics.astro` renders the GA4 snippet only if `import.meta.env.PROD && import.meta.env.PUBLIC_GA_MEASUREMENT_ID`
- [ ] No UA ID remains anywhere (`grep -r UA-29309617` finds nothing)

**Verification:**
- [ ] `npm run build` without the env var → no `googletagmanager` in `dist/`
- [ ] `PUBLIC_GA_MEASUREMENT_ID=G-TEST npm run build` → the tag with `G-TEST` is in every page
- [ ] `npm run dev` → no tag

**Dependencies:** T3
**Files:** `src/components/Analytics.astro`, `src/layouts/BaseLayout.astro`, `src/env.d.ts`
**Scope:** XS

### T13: Vercel preview deploy

**Description:** Deploy the branch as a Vercel preview and check the URL behavior on Vercel itself. **Ask before pushing.**

**Acceptance criteria:**
- [ ] The preview build uses the Astro settings from `vercel.json`, and the production deployment is untouched
- [ ] On the preview URL: every spec route returns 200; `/posts/`, `/posts.html` and `/tags/web%20development/` each 308 to the path with no slash or extension; `/feed.xml` and `/og-image.png` return 200
- [ ] README updated with the new commands

**Verification:**
- [ ] A curl loop over the route list against the preview URL (if Vercel preview protection blocks curl, Victor runs it or shares a bypass token)
- [ ] Lighthouse on the preview shows no regressions against the live site in Performance and Accessibility

**Dependencies:** Checkpoint C, T6b, T11, T12
**Files:** `README.md`
**Scope:** XS

### T14: Production cutover

**Description:** Merge to `main`, confirm production, and set up analytics. **Every step needs Victor's approval.**

**Acceptance criteria:**
- [ ] `PUBLIC_GA_MEASUREMENT_ID=G-W1DDP3CRYE` is set in Vercel for the Production environment only (Victor does this; see the plan)
- [ ] Merged to `main` (via PR); the production deployment is green
- [ ] The T13 curl loop passes against `https://www.victorfoster.dev`
- [ ] GA4 Realtime shows a visit; a share preview (e.g. opengraph.xyz) shows the correct title, description and image
- [ ] Rollback is documented: Vercel → Deployments → last Next deployment → Instant Rollback

**Verification:** all of the above, recorded in the PR

**Dependencies:** T13
**Scope:** XS

## Checkpoint D: Launched
- [ ] Every Success Criterion in `SPEC.md` is checked
