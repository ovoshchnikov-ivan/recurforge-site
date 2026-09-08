# The blog

Articles are markdown files. There is no CMS and no database: adding an article
means adding a file and pushing it.

## Add an article

1. Create `content/case-studies/<slug>.md` or `content/guides/<slug>.md`.
   The folder must match the `category` field.
2. Fill in the front matter (below). Every required field is required —
   the build fails, loudly, if one is missing.
3. `npm start` and read it at <http://localhost:8080/blog/>.
4. `npm run build` — this also draws the preview image into
   `assets/blog/og/<slug>.png`. Commit that PNG together with the article.
5. Push. Render rebuilds and deploys.

Working on something unfinished: put it in `content/_drafts/` or set
`draft: true`. Drafts appear in `npm start` and are absent from the built site,
the sitemap and the feed.

## Commands

| Command | What it does |
|---|---|
| `npm start` | Local preview at <http://localhost:8080>, reloads on save, shows drafts |
| `npm run build` | Full build into `_site/` — what Render runs |
| `npm run check` | Front matter validation on its own |
| `npm run list` | Table of every article: slug, category, date, status, tags |
| `npm run og` | Draw missing preview images (`-- --force` redraws all) |
| `npm run verify` | Confirm the built homepage is byte-identical to `index.html` |

## Front matter

```yaml
---
title: "Involuntary churn was half the problem"   # required, max 65 characters
slug: "involuntary-churn-was-half-the-problem"    # required, lowercase latin, no dates
category: case-studies                            # required, case-studies | guides
description: "..."                                # required, 120–158 characters
keyword: "involuntary churn"                      # required, one per article
tags: [churn, subscriptions, automation]          # required, from the vocabulary
date: 2026-08-12                                  # required
updated: 2026-09-02                               # optional
draft: false                                      # optional, default false
og_image: ""                                      # optional, empty = generate one
---
```

`description` is used in three places — the meta description, the Open Graph
description, and the card in every listing — so that they cannot drift apart.

The build **fails** when a required field is missing, a tag is not in the
vocabulary, `description` is outside 120–158 characters, `title` is over 65
characters, the folder disagrees with `category`, or two articles share a slug.
Warnings (keyword missing from the title or description) are printed and do not
stop the build.

## Three rules that are not negotiable

**A published article never changes category.** The category is part of the
address. If one truly has to move, the old address gets a 301 in the same commit
that moves the file — add the rule to `_redirects` and enter it in the Render
dashboard under Settings → Redirects and Rewrites. Render does not read the
file itself; it is the written record of what should exist there.

**A tag gets its own page only at three articles.** Below that the tag still
appears on the article, as plain text with no link, and it stays out of the
sitemap. A page holding one link is thin content, and enough of them drag down
how the whole section is judged.

**One keyword per article.** It belongs in `title`, in the H1, in the slug, in
`description`, and in the first paragraph — and after that only where it falls
naturally. Never rewrite a working sentence to fit it in: text where the keyword
shows is worse than text where it does not. Other words from the list are other
articles, not extra mentions in this one. Keep the list in
[`content/keywords.md`](../content/keywords.md).

## Adding a category or a tag

A category is an entry in `site/_data/categories.json` — slug, title, one
paragraph of description. Nothing else needs changing; the listing pages,
sitemap and navigation follow.

A tag is an entry in `site/_data/tagVocabulary.json`. The vocabulary is closed
on purpose: tags invented while writing become forty tags within a year.

## How the build is put together

Eleventy, markdown in, plain HTML out, no framework. Two things are worth
knowing:

- **`index.html` is never rendered.** `templateFormats` in
  `eleventy.config.mjs` does not include `html`, so the homepage can only be
  copied byte for byte. `build/verify-homepage.mjs` then compares the built copy
  against the source and against a recorded checksum, and fails the build if
  either differs. If you change the homepage on purpose, re-record it with
  `npm run verify -- --update` and commit `build/index.html.sha256`.
- **Preview images are committed, not regenerated.** `build/og.mjs` skips any
  `assets/blog/og/<slug>.png` that already exists, so a deploy never redraws
  what is already there.

## Render settings

Build command `npm ci && npm run build`, publish directory `_site`. Node is
pinned by `.node-version`.

**Taking a page down needs one extra step.** Render goes on serving a file that
an earlier deploy published, even after a later deploy stops producing it — so
setting an article to `draft: true`, deleting it, or letting a tag fall back
below three articles removes it from the sitemap and the feed while the old URL
still answers 200. To finish the job: Render dashboard → the service → Manual
Deploy → **Clear build cache & deploy**. Then check the URL actually returns 404
before calling it unpublished. Publishing and editing need none of this.
