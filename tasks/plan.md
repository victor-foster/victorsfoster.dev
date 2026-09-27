# Implementation Plan: Next.js + Nextra → Astro

Spec: [`SPEC.md`](../SPEC.md) (approved 2026-09-27). Task checklist: [`tasks/todo.md`](todo.md).

## Overview

Replace the Next.js/Nextra site with a static Astro site on the `next-to-astro` branch. Production (`main` on Vercel) serves the old site until the final merge. Build one page type at a time; each is checked against a baseline of the live site captured at the start, plus a route and metadata check script written before any Astro code.

## Architecture Decisions

- **Replace in place, no coexistence.** Next is removed from the branch in Task 2 instead of running both frameworks side by side. Running both would mean two tsconfigs, two sets of dev scripts, and `pages/` vs `src/pages` confusion. The live site and git history serve as the reference.
- **Vercel settings live in `vercel.json`, not the dashboard.** `framework`, `buildCommand` and `outputDirectory` are set per branch, so preview builds use Astro while `main` production keeps building Next. Changing the dashboard's Framework Preset would break production immediately.
- **Baseline captured first.** Screenshots of the live site and its rendered HTML and CSS go in `tasks/baseline/` (gitignored). Nextra's styles are Tailwind Typography (`nx-prose`), so `base.scss` is rebuilt from the live compiled CSS rather than from memory.
- **Reproducible screenshots.** `scripts/screenshot.sh` wraps a one-off `npx playwright screenshot --channel chrome` (uses installed Chrome, not added to `package.json`), so the baseline and every later comparison use the same viewport, color scheme and full-page settings.
- **Verification script before implementation.** `scripts/check-routes.mjs` encodes the spec's route and metadata table and fails until the routes exist. It is the test suite for this migration.
- **Keep the `next-themes` contract.** The same inline no-flash script and the same localStorage key `theme` (`light`/`dark`/`system`), so returning visitors keep their choice. The toggle becomes a real `<button>` rather than Nextra's `<span role="button">`. It looks the same, and it's accessible.
- **Dates render in UTC.** Frontmatter dates are midnight UTC. Formatting in local time on a Pacific-time machine would show the day before (for example `Sun Jan 16`), so dates are formatted with `timeZone: 'UTC'`, matching today's `Mon Jan 17 2022`.
- **External links:** a small local Sätteri `defineHastPlugin` (Astro 7's Markdown pipeline; rehype plugins don't run on it) reproduces Nextra's `target="_blank" rel="noreferrer"` plus the sr-only "(opens in a new tab)" label. This avoids adding a dependency.
- **OG image** is rendered once from `scripts/og-image.html` with headless Chrome (already installed), so no image dependencies are needed. The source HTML is committed so the image can be regenerated.

## Dependency Graph

```
T1 baseline + check script
 └─ T2 toolchain swap (Astro builds a placeholder)
     └─ T2b lint/format tooling
     └─ T3 BaseLayout + Head + About page
         ├─ T4 base styles (visual parity)
         ├─ T5 dark mode
         └─ T6 posts collection + post pages ── T7 code highlighting
                 ├─ T8 posts index + tag pages
                 └─ T9 RSS feed
         ├─ T6b external links
         ├─ T10 photos page
         ├─ T11 default OG image
         └─ T12 GA4
T13 preview deploy (needs all) ── T14 production cutover
```

T6b, T10, T11 and T12 depend only on T3/T4 and can be done in any order. T7, T8 and T9 need T6.

## Task List

> **Order change (2026-09-27, Victor):** Phase 3 (Content) runs before Phase 2 (Look and feel). Content tasks depend on T3, not T5; T5 adds the theme toggle to the post header afterwards. Checkpoint B's visual review moves after T5 as before.

### Phase 1: Foundation
- [x] T1: Capture live baseline and write `check-routes.mjs` (fails)
- [x] T2: Swap toolchain: remove Next, scaffold Astro, add `vercel.json`
- [x] T2b: ESLint 10 + eslint-plugin-astro, Prettier 3 + prettier-plugin-astro
- [x] T3: BaseLayout, Head (meta), nav, and the About page

### Checkpoint A: Foundation
- [ ] `npm run lint`, `build` and `verify` are clean for `/`

### Phase 2: Look and feel
- [ ] T4: Rebuild Nextra base styles for parity (`base.scss`)
- [ ] T5: Dark mode: no-flash script, toggle, persistence

### Checkpoint B: About page is at parity
- [ ] About page matches the baseline at 375/1280 × light/dark. **Victor reviews.**

### Phase 3: Content
- [x] T6: Posts collection, post layout, and post pages
- [x] T6b: External link handling (local Sätteri hast plugin)
- [x] T7: Code highlighting (verify Sätteri's highlight plugin; dual themes)

### Checkpoint C1: Posts
- [ ] `/` and all 3 posts pass `verify` and match the baseline. **Victor reviews.**

- [ ] T8: Posts index and tag pages
- [ ] T9: RSS feed via `@astrojs/rss`
- [ ] T10: Photos page

### Checkpoint C: All routes
- [ ] `verify` passes for every route and the feed; all page types match the baseline. **Victor reviews.**

### Phase 4: Fixes and ship
- [ ] T11: Default OG image
- [ ] T12: GA4 (production only, driven by an env var)
- [ ] T13: Vercel preview deploy and URL checks against it
- [ ] T14: Production cutover (merge to `main`) and post-launch checks

### Checkpoint D: Launched
- [ ] Every spec Success Criterion is checked off

## Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Visual parity drifts (Nextra's Tailwind styles are implicit) | High | Baseline screenshots and live CSS captured in T1; T4 rebuilds from the compiled CSS; review at Checkpoints B and C |
| Changing Vercel dashboard settings breaks production mid-migration | High | Framework and build settings live in the branch's `vercel.json`; the dashboard is untouched until after the merge |
| Dates shift one day because of timezones | Medium | UTC formatting, plus an assertion in `check-routes.mjs` on the rendered date text |
| RSS item GUIDs change (relative → absolute URLs), so feed readers re-show old posts once | Low | Accepted: only 3 posts, and absolute links fix feeds that are currently broken |
| Filenames with spaces (`tags/web development.html`) behave differently on Vercel | Medium | T13 checks with curl on the preview; fallback is slugified tags plus redirects |
| Theme flash, or the stored preference is ignored | Medium | Reuse the next-themes script contract; check manually in T5 with each OS setting |
| Rollback needed after launch | Medium | Vercel Instant Rollback to the last Next deployment, with no DNS changes involved |

## Decisions (2026-09-27)

- Package manager: **npm** (yarn isn't installed; Vercel detects `package-lock.json`)
- ESLint: **ESLint 10 + `eslint-plugin-astro`** (T2b; the plugin's 3.x release requires ESLint ≥10)
- Prettier: **Prettier 3 + `prettier-plugin-astro`** (T2b). No stylelint conflict: `stylelint-prettier@2` accepts `prettier >=2`

- GA4 measurement ID: `G-W1DDP3CRYE`. It goes in the Vercel env var, not in the code; Google's pasted snippet is rebuilt as `Analytics.astro` in T12

## Notes

- The planning skill's `references/definition-of-done.md` doesn't exist on this machine; the spec's Success Criteria act as the Definition of Done.

## Open Questions

- None blocking. Cookie consent is deferred (see spec)
