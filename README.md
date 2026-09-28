# Welcome to my personal website

Please visit my site here: [https://www.victorfoster.dev/](https://www.victorfoster.dev/)

## Development

Built with [Astro](https://astro.build) as a static site (Node 22.12+).

```sh
npm install
npm run dev       # http://localhost:4321
npm run build     # astro check && astro build → dist/
npm run preview   # serve dist/ locally (stop with: npx astro preview stop)
npm run verify    # after a build: check every route, meta tag and the RSS feed in dist/
npm run lint
npm run format
```

- Pages: `src/pages/` (About is `index.mdx`, Photos is `photos.mdx`)
- Posts: `src/content/posts/*.mdx`. The filename is the URL (`/posts/<filename>`); frontmatter has `title`, `date` (YYYY-MM-DD), `description`, `tag`, `author`
- Styles: `src/styles/main.scss`; `nextra.css` is vendored and generated (don't edit), and `base.scss` holds the layout
- Analytics: GA4 loads only in production builds when `PUBLIC_GA_MEASUREMENT_ID` is set (Vercel Production env)

See [`SPEC.md`](SPEC.md) for the migration from Next.js/Nextra and [`tasks/`](tasks/) for the plan.
