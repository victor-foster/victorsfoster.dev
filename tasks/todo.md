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
- [x] `package.json` has no `next*`, `nextra*`, `react*` or `@next/*` packages; it has `astro`, `@astrojs/mdx`, `@astrojs/check`, `typescript`, `sass` and `sanitize.css`; the scripts are `dev`/`build`/`preview`/`verify`; `yarn.lock` is replaced by `package-lock.json`
- [x] `astro.config.mjs` sets `site: 'https://www.victorfoster.dev'`, `trailingSlash: 'never'`, `build.format: 'file'` and the mdx integration; `tsconfig.json` extends `astro/tsconfigs/strict`
- [x] `vercel.json` has `framework: "astro"`, `buildCommand`, `outputDirectory: "dist"`, `cleanUrls: true` and `trailingSlash: false`
- [x] Deleted: `next.config.js`, `next-env.d.ts`, `theme.config.jsx`, `pages/_app.tsx`, `pages/_document.tsx`, `yarn.lock`, and the `analyze` script. ESLint and Prettier are left alone until T2b. Content `.mdx` files stay where they are until their own tasks

**Verification:**
- [x] `npm run build` succeeds (`astro check` 0 errors) and writes `dist/index.html`
- [x] `npm run dev` serves the placeholder at `http://localhost:4321/`

**Dependencies:** T1
**Files:** `package.json`, `package-lock.json`, `yarn.lock` (deleted), `astro.config.mjs`, `tsconfig.json`, `vercel.json`, `.gitignore`, plus the deletions above
**Scope:** M (mostly deletions and config)

**Result:** Astro 7.3.5, @astrojs/mdx 8.0.2, @astrojs/check 0.9.10, TypeScript 6 (`@astrojs/check` peer range is `^5 || ^6`, so not TS 7). Also added `engines.node: ">=22.12.0"` (Astro's requirement); Vercel docs say `engines` overrides the project's Node setting, so the branch builds on Node 24.x without touching the dashboard. npm 11 blocked install scripts for esbuild, @parcel/watcher and fsevents; they're left unapproved because the build doesn't need them. `astro check`: 0 errors and 2 hints, both in files outside this task's scope (`postcss.config.js`, `scripts/gen-rss.mjs`, which T9 removes).
**Astro 7 notes for later tasks:** Markdown now defaults to the Sätteri pipeline. It has its own plugin API (`satteri({ hastPlugins, mdastPlugins })`, `defineHastPlugin` from `satteri`); rehype/remark plugins only run with `@astrojs/markdown-remark` + `unified()`. T6b uses a Sätteri hast plugin. `compressHTML` now defaults to `'jsx'` whitespace rules (watch inline spacing in T6).

### T2b: Lint and format tooling

**Description:** Replace the Next ESLint config with ESLint 10 + `eslint-plugin-astro`, and upgrade to Prettier 3 + `prettier-plugin-astro`, keeping the current formatting rules.

**Acceptance criteria:**
- [x] `eslint.config.mjs` (flat config) uses `eslint-plugin-astro` recommended + `eslint-config-prettier`, and keeps `prefer-const: error`; `.eslintrc` is deleted; `npm run lint` runs `eslint .`
- [x] Prettier 3 + `prettier-plugin-astro`; `.prettierrc` keeps its current options and adds the plugin and an `*.astro` parser override; `npm run format` runs `prettier --write .`
- [x] The broken `fix-code`/`fix-styles` scripts (which point at a `src/` that never existed) are removed. If `stylelint-prettier`/`prettier-stylelint` conflict with Prettier 3 as peer dependencies, **stop and ask**; don't silently drop stylelint

**Verification:**
- [x] `npm run lint` exits 0 on the placeholder page
- [x] `npm run format -- --check` exits 0 on `.astro` files; `npm ls prettier` shows no peer dependency errors

**Dependencies:** T2
**Files:** `eslint.config.mjs`, `.eslintrc` (deleted), `.prettierrc`, `package.json`, `package-lock.json`
**Scope:** S

**Result:** ESLint 10.11 + eslint-plugin-astro 3.2 + typescript-eslint 8.70 + eslint-config-prettier 10 (`/flat`); Prettier 3.9 + prettier-plugin-astro 1.1. A negative test (a `let` in `.astro` TypeScript frontmatter) fails lint as expected. No stylelint peer conflict. Removed `prettier-stylelint`: it was used only by the deleted `fix-styles` script and was the source of all 29 `npm audit` findings (18 high); the audit now shows 0. `npm run format` was **not** run repo-wide, to avoid reformatting content; only files written in this task were formatted.
**Noticed, not touching:** `.stylelintrc` only extends `stylelint-prettier/recommended`; `stylelint-config-prettier` and `stylelint-config-sass-guidelines` look unused, and there's no stylelint script. A candidate for a later cleanup.

### T3: BaseLayout, Head, nav, and the About page

**Description:** A working first page. Port `_document`/`_app`/`theme.config` Head into Astro components, and move the About content to `src/pages/index.mdx`.

**Acceptance criteria:**
- [x] `BaseLayout.astro` renders `lang="en"`, Google Fonts, `sanitize.css` + `main.scss` (moved to `src/styles/`, content unchanged), the RSS alternate link, `<Head>`, nav (About/Photos/Posts/RSS), and the footer
- [x] `Head.astro` ports every tag from `theme.config.jsx` with the same fallbacks; the canonical and og:url come from `Astro.site` + pathname
- [x] `/` renders the About content with `<title>About</title>`

**Verification:**
- [x] `npm run build && npm run verify`: every check for `/` passes; the other routes still fail
- [x] Manual check: `/` in dev shows all content and links working (the styling pass is T4)

**Dependencies:** T2b
**Files:** `src/layouts/BaseLayout.astro`, `src/components/Head.astro`, `src/components/Nav.astro`, `src/pages/index.mdx` (git mv), `src/styles/main.scss` (git mv)
**Scope:** M

**Result:** `/` passes all 24 of its checks. Nav, `<h1>` and structure match the live markup. Deviations and additions:
- The dead `# Victor Foster` line was deleted from the About MDX (Victor's decision).
- Class names are `page`, `page-header` and `site-nav`, not `prose` or `nav-line`, because `main.scss` has never-applied rules for those names.
- Added `@astrojs/markdown-satteri` as an explicit dependency (already installed through MDX) to set `smartPunctuation: false`. Astro 7 turned `I'm` into `I’m` and would turn `--primary-hue` into a dash.
- `src/lib/path.ts` strips the `.html` that `build.format: 'file'` puts in `Astro.url.pathname`; Head (canonical) and Nav (current page) use it.
- The nav renders as "PhotosPostsAbout" until T4 adds the flex gap (Astro 7's `compressHTML: 'jsx'` removes the whitespace between elements).

## Checkpoint A: Foundation

**Code review (2026-09-27; independent reviewer agent + author pass):** no Critical findings. Fixed: `.ts` files weren't linted (Required); the checker's internal-link and external-link checks missed attribute order and an unescaped URL, post pages lacked an `<h1>` check, and the feed wasn't checked for shape or guids; `.env`/`.env.*` weren't ignored; `??` → `||` for empty descriptions (parity with the old theme); screenshot.sh strips a trailing `/` and documents shooting the preview, not dev. Declined: pinning `engines.node` to `24.x` (Astro's own range is `>=22.12.0` and Vercel only offers LTS majors, and pinning would warn on local Node 26). Deferred: Vercel serving `tags/web development.html` (T13 curl loop); dead `"main"` field, unused stylelint configs, stylelint already failing on SCSS on `main` (out of scope; noted).

**Browser check (2026-09-27, isolated Chrome through Playwright; the DevTools MCP isn't configured):** About page: 0 console errors or warnings, 0 failed requests, 0 JS; the accessibility tree matches live apart from the toggle (T5) and "(opens in a new tab)" labels (T6b), and gains a `navigation` landmark with `aria-current`. **Found CLS 0.366** (live 0.019), caused by Google Fonts swapping in after first paint. **Fixed** with the Astro Fonts API (self-hosted, preloaded, metric-matched fallbacks; Open Sans 400 only, as in production): CLS 0 in 3 of 3 runs, FCP about 45 ms, LCP 36 ms, and no third-party requests.
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
- [x] `src/content.config.ts` defines the schema from the spec (`date` coerced, `tag` normalized to `string[]`); frontmatter dates are normalized to `YYYY-MM-DD`
- [x] Posts moved with `git mv` to `src/content/posts/`, keeping filenames; the unused `next/image` import is removed from the web-unleashed post; no wording changes
- [x] `PostLayout.astro` renders the header like the live site: author, `<time datetime>` formatted in UTC as `Mon Jan 17 2022`, `•`, tag pills linking to `/tags/<encoded tag>`, and "Back" → `/posts` (T5 adds the theme toggle next to "Back")
- [x] The dead first `# …` heading is deleted from each post (Victor's decision in T3)

**Verification:**
- [x] `npm run build && npm run verify`: all 3 post routes pass, including the date text
- [x] Manual check: the web-unleashed post (2 tags) matches the baseline header

**Dependencies:** T3 (order change: content before T4/T5)
**Files:** `src/content.config.ts`, `src/content/posts/*.mdx` (git mv), `src/pages/posts/[slug].astro`, `src/layouts/PostLayout.astro`
**Scope:** M

**Result:** 3 posts at their exact production URLs. The collection's default id lowercases (`how-i-setup-…`), so `generateId` keeps the filename as-is. Every post check passes (title, `<h1>`, meta, canonical, `datetime` identical to production, UTC date text, author only when set, tag links) except the external-link checks, which are T6b. Content edits are limited to date normalization, the dead first heading, and the unused `next/image` import. `BaseLayout` gained a named `header` slot that falls back to the nav (https://docs.astro.build/en/basics/astro-components/#fallback-content). Code blocks currently use Shiki's default `github-dark` theme (T7).

### T6b: External link handling

**Description:** Reproduce Nextra's automatic treatment of external Markdown links on every MDX page, with no new dependency.

**Acceptance criteria:**
- [x] A local Sätteri hast plugin (`defineHastPlugin`, `element` visitor filtered to `a`) adds `target="_blank" rel="noreferrer"` and `<span class="sr-only"> (opens in a new tab)</span>` to `http(s)` links whose host isn't `victorfoster.dev`; internal links and hand-written `<a>` tags that already set a `target` are left alone
- [x] `.sr-only` is defined in `base.scss`

**Verification:**
- [x] `npm run verify` asserts that the post's `https://nextjs.org/` link has the target, rel and sr-only span, and that `/posts` links do not
- [x] Manual check: with VoiceOver on the About page, the GitHub link is announced with "opens in a new tab"

**Dependencies:** T3 (can be done any time after T3)
**Files:** `src/lib/external-links.mjs`, `astro.config.mjs`, `src/styles/base.scss`, `src/layouts/BaseLayout.astro`
**Scope:** S

**Result:** plain plugin object (no `satteri` import needed) wired via `satteri({ hastPlugins })`. It runs on MDX pages and collection entries alike. Output is identical to production: `target="_blank" rel="noreferrer"` plus `<span class="sr-only"> (opens in a new tab)</span>`. Hand-written `<a>` tags (the mailto link, CSS Wizardry) are MDX JSX nodes, so they're untouched, as on Nextra. `.sr-only` starts `src/styles/base.scss` (T4 extends it). Checked in the browser: accessible names include the label, the span is clipped to 1px, and CLS is 0. The VoiceOver check is replaced by the accessibility-tree check.

### T7: Code highlighting

**Description:** Shiki with light and dark themes, following the site theme through `html.dark`.

**Acceptance criteria:**
- [x] Highlighting is configured the documented Astro 7 way (check first: `shikiConfig` vs Sätteri's `satteriHighlightPlugin`), with `{ light, dark }` themes; CSS switches to the dark variables under `html.dark`
- [ ] Code blocks are readable in both themes (light ✅; dark checked in T5, when `html.dark` exists) and match the baseline block styling (background, radius, padding, font size)

**Verification:**
- [ ] Manual check: the CSS custom properties post in both themes vs `tasks/baseline/post-*`
- [x] `npm run build` is clean

**Dependencies:** T6
**Files:** `astro.config.mjs`, `src/styles/base.scss`
**Scope:** XS

**Result:** production used Shiki's `css-variables` theme with Nextra's palette (`--shiki-*` on `:root`/`.dark`). `markdown.shikiConfig: { theme: 'css-variables' }` still applies under Sätteri, and Astro emits `--astro-code-*` variables, so Nextra's exact hex values are mapped into `base.scss` (light on `:root`, dark on `html.dark`) with the same block box (1rem padding, 0.75rem radius, 0.875rem/1.25rem monospace, tinted background via `--astro-code-background`, so no `!important` against the inline style). Light-mode screenshots at 1280 and 375 match the baseline colors.
**Process note:** Astro 7's `astro preview` runs as a background daemon; stop it with `npx astro preview stop`, not `pkill`. A stale `astro dev` from T2 was found holding port 4321 and killed.

## Checkpoint C1: Posts
- [ ] `npm run lint && npm run build && npm run verify` pass for `/` and all 3 posts
- [ ] Post pages (header, prose, code blocks, external links) match the baseline in both themes; `scripts/screenshot.sh` diffs are reviewed with Victor

### T8: Posts index and tag pages

**Description:** The post list at `/posts` and one page per tag, sharing a single list component.

**Acceptance criteria:**
- [x] `PostList.astro` shows the posts newest first, each with a title link, description, date and "Read More →", matching the baseline
- [x] `/posts` renders under `<title>Posts</title>`
- [x] `tags/[tag].astro` generates one page per distinct tag, using the raw tag as the param (`/tags/web%20development`, `/tags/web%20performance`); the heading is `Posts Tagged with “<tag>”`

**Verification:**
- [x] `npm run verify`: the posts and tag routes pass; `/tags/web%20development` lists 3 posts and `/tags/web%20performance` lists 1
- [ ] Manual check vs `tasks/baseline/posts-*` and `tags-*` (after T4 styling, given the order change)

**Dependencies:** T6
**Files:** `src/components/PostList.astro`, `src/pages/posts/index.astro`, `src/pages/tags/[tag].astro`, delete `pages/posts/index.mdx` and `pages/tags/[tag].mdx`
**Scope:** S

**Result:** `/posts`, `/tags/web%20development` (3 posts) and `/tags/web%20performance` (1 post) pass all checks, newest first. `BaseLayout` gained an optional `heading` prop (tag pages: `<title>Tagged Posts</title>` with a different `<h1>`). Tag pages are now pre-rendered; on the live site they were rendered in the browser. The Web Unleashed description is shown, as decided in the spec. The old `pages/posts/index.mdx` and `pages/tags/[tag].mdx` were removed.

### T9: RSS feed

**Description:** Replace the pre-build script with an Astro endpoint.

**Acceptance criteria:**
- [x] `src/pages/feed.xml.ts` uses `@astrojs/rss` with the title "Victor Foster", absolute `https://www.victorfoster.dev/posts/<slug>` links, date, description, categories (tags) and author
- [x] Removed: `scripts/gen-rss.mjs`, `rss`, `gray-matter`, and the `public/feed.xml` ignore line

**Verification:**
- [x] `npm run verify`: the feed check passes (3 items, absolute links)
- [x] `dist/feed.xml` parses as XML (Python ElementTree); the W3C validator paste was skipped, since the parse plus the checker's shape, guid and link checks cover it

**Dependencies:** T6
**Files:** `src/pages/feed.xml.ts`, `package.json`, `.gitignore`, delete `scripts/gen-rss.mjs`
**Scope:** S

**Result:** `@astrojs/rss` with `trailingSlash: false` (its default adds slashes; confirmed in the RSS recipe). Links and guids are absolute www URLs with no slash (the capital-I slug is preserved). `rss()`'s `author` field is typed as an email, so the author name stays in `<dc:creator>` (through `xmlns` + item `customData`), as in the old feed, and the old feed's `<atom:link rel="self">` is kept. Channel title and description stay "Victor Foster". Removing `gen-rss.mjs` also cleared one of the 2 `astro check` hints.

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
