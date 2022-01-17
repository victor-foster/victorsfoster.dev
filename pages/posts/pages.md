---
title: Hello world.
date: 2022-1-17
description: How I setup my developer blog.
tag: web development
author: Victor Foster
---

# How I setup my developer blog

This post will walk through the how I am publishing blog posts on this website.

Some of my criteria for the tools I chose for this blog:

- Ability to author blog posts in Markdown
- Ability to run React & Typescript code samples directly from the browser
- Full control over authoring CSS
- Static generation in order have faster performance, more security, SEO and portability

Since we're currently using [Next.js](https://nextjs.org/) at my work this seemed like a good opportunity to double-down on learning the framework and understand how it can be stretched in different ways. This is already an incredibly easy framework to get started with considering their excellent documentation and [learning site](https://nextjs.org/learn/basics/create-nextjs-app) but I had yet to use it for a blog. Since I was also wanting to be able to write blog posts in Markdown this is where I discovered [Nextra](https://nextra.vercel.app). Nextra allows for writing in Markdown or with react components using either `.md`, `.mdx`, `.ts`, or `.tsx`. This allow for a lot of flexibility when authoring blog posts.

I also wanted to be able to control my CSS authoring output for my end-users using things such as [autoprefixer](https://github.com/postcss/autoprefixer), which will generate the vendor prefixes for me based on the browser list I set. Luckily [Next.js makes this super easy](https://nextjs.org/docs/advanced-features/customizing-postcss-config#default-behavior) as this feature is built into the framework.

While I find authoring in Next.js to be a great developer experience I could see myself recreating my blog in the future with tools like [11ty](https://www.11ty.dev/), [Svelte](https://svelte.dev/) or [something](https://www.rust-lang.org/) [different](https://webassembly.org/) just to experiment with different technology. If I do, I'll be sure to provide an update!

## Summary

We've discussed how I setup my blog using Next.js and Nextra

- **Static Generation:** The HTML is generated at **build time** from my markdown files when a commit is deployed to production.
- **Autoprefixer:** The CSS is also generated at **build time** to include the appropriate vendor prefixes that match my [browserlist](https://browserslist.dev/).
- **React & Typescript ready:** If I so choose, I can highlight and run **Typescript** code examples from this browser to include with code examples.
