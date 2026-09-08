/* Eleventy config for recurforge.com.

   The one rule that matters: the homepage and every asset that predates this
   build step are PASSTHROUGH COPIES. `templateFormats` below deliberately does
   not contain "html", so Eleventy cannot treat index.html as a template even by
   accident — it can only copy the bytes. build/verify-homepage.mjs then proves
   it after every build. */

import fs from "node:fs";
import path from "node:path";
import { validate } from "./build/validate.mjs";
import { imageSize } from "./build/image-size.mjs";

const ROOT = path.resolve(import.meta.dirname);
const readJson = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), "utf8"));

const SITE = readJson("site/_data/site.json");
const CATEGORIES = readJson("site/_data/categories.json");
const TAG_LABELS = readJson("site/_data/tagVocabulary.json");

const isServe = process.env.ELEVENTY_RUN_MODE === "serve";

const byDateDesc = (a, b) => new Date(b.data.date) - new Date(a.data.date);

/* Width and height on every local image, so the article does not reflow while
   the picture loads. */
const sizeAttrs = (src) => {
  if (!src.startsWith("/")) return "";
  const size = imageSize(path.join(ROOT, src));
  return size ? ` width="${size.width}" height="${size.height}"` : "";
};

export default function (eleventyConfig) {
  /* Validation is part of the build, not a separate step someone forgets to
     run. Throwing here stops the build before anything reaches _site. */
  eleventyConfig.on("eleventy.before", () => {
    validate({ throwOnError: true });
  });

  /* ── Files that existed before the build step, copied byte for byte ─────── */
  for (const file of [
    "index.html",
    "og.png",
    "robots.txt",
    "favicon.ico",
    "favicon.svg",
    "apple-touch-icon.png",
    "icon-192.png",
    "icon-512.png",
    "site.webmanifest",
    "ui-chat.webp",
    "ui-chat-dark.webp",
    "ui-analytics.webp",
    "ui-analytics-dark.webp",
    "_redirects",
  ]) {
    eleventyConfig.addPassthroughCopy(file);
  }
  eleventyConfig.addPassthroughCopy("assets");

  /* ── Collections ───────────────────────────────────────────────────────── */
  const publishedPosts = (collectionApi) =>
    collectionApi
      .getFilteredByGlob("content/**/*.md")
      .filter((item) => item.data.category && item.data.slug)
      .sort(byDateDesc);

  eleventyConfig.addCollection("posts", publishedPosts);

  /* One entry per category page, pagination pre-chunked here so that adding a
     third category means adding a data entry, not a new template. */
  eleventyConfig.addCollection("categoryPages", (collectionApi) => {
    const posts = publishedPosts(collectionApi);
    const pages = [];
    for (const category of CATEGORIES) {
      const inCategory = posts.filter((p) => p.data.category === category.slug);
      const size = SITE.postsPerPage;
      const total = Math.max(1, Math.ceil(inCategory.length / size));
      for (let i = 0; i < total; i++) {
        pages.push({
          category,
          posts: inCategory.slice(i * size, (i + 1) * size),
          number: i + 1,
          total,
          href: i === 0 ? `/blog/${category.slug}/` : `/blog/${category.slug}/page/${i + 1}/`,
          prev: i === 0 ? null : i === 1 ? `/blog/${category.slug}/` : `/blog/${category.slug}/page/${i}/`,
          next: i + 1 < total ? `/blog/${category.slug}/page/${i + 2}/` : null,
        });
      }
    }
    return pages;
  });

  /* A tag gets its own page only once three articles carry it. Below that it
     stays a label on the article: one link on a page is thin content. */
  eleventyConfig.addCollection("tagPages", (collectionApi) => {
    const posts = publishedPosts(collectionApi);
    const counts = new Map();
    for (const post of posts)
      for (const tag of post.data.tags || []) counts.set(tag, [...(counts.get(tag) || []), post]);
    return [...counts.entries()]
      .filter(([, list]) => list.length >= SITE.tagPageThreshold)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([tag, list]) => ({
        tag,
        label: TAG_LABELS[tag] || tag,
        posts: list,
        href: `/blog/tag/${tag}/`,
      }));
  });

  /* ── Filters ───────────────────────────────────────────────────────────── */
  eleventyConfig.addFilter("readingTime", (html) => {
    const words = String(html || "").replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.round(words / 200));
  });

  eleventyConfig.addFilter("limit", (list, n) => (list || []).slice(0, n));

  eleventyConfig.addFilter("isoDate", (value) => new Date(value).toISOString().slice(0, 10));

  eleventyConfig.addFilter("rfc822", (value) => new Date(value).toUTCString());

  eleventyConfig.addFilter("humanDate", (value) =>
    new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })
  );

  eleventyConfig.addFilter("categoryTitle", (slug) => (CATEGORIES.find((c) => c.slug === slug) || {}).title || slug);

  eleventyConfig.addFilter("tagLabel", (tag) => TAG_LABELS[tag] || tag);

  eleventyConfig.addFilter("absolute", (url) => `${SITE.url}${url}`);

  /* Feed readers render the article somewhere else entirely, so root-relative
     links and images have to be made absolute on the way out. */
  eleventyConfig.addFilter("absoluteUrls", (html) =>
    String(html || "")
      .replace(/(<a[^>]+href=")\//g, `$1${SITE.url}/`)
      .replace(/(<img[^>]+src=")\//g, `$1${SITE.url}/`)
  );

  eleventyConfig.addFilter("xml", (value) =>
    String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
  );

  /* Related: same category first, then anything sharing a tag. */
  eleventyConfig.addFilter("related", (posts, current) => {
    const isSelf = (p) => p.data.slug === current.slug;
    const sameCategory = posts.filter((p) => !isSelf(p) && p.data.category === current.category);
    const sharedTags = posts.filter(
      (p) => !isSelf(p) && (p.data.tags || []).some((t) => (current.tags || []).includes(t))
    );
    const out = [];
    for (const post of [...sameCategory, ...sharedTags]) {
      if (out.length === 3) break;
      if (!out.some((p) => p.data.slug === post.data.slug)) out.push(post);
    }
    return out;
  });

  /* ── Transforms (rendered blog pages only — passthrough files never see
        a transform, so the homepage is untouched by construction) ─────────── */
  eleventyConfig.addTransform("blogProse", function (content) {
    const out = this.page.outputPath;
    if (typeof out !== "string" || !out.includes(`${path.sep}blog${path.sep}`) || !out.endsWith(".html")) return content;
    return content
      /* Markdown images with a title become a figure with a caption. */
      .replace(
        /<p><img src="([^"]*)" alt="([^"]*)" title="([^"]+)"[^>]*><\/p>/g,
        (_m, src, alt, caption) =>
          `<figure><img src="${src}" alt="${alt}"${sizeAttrs(src)} loading="lazy" decoding="async"><figcaption>${caption}</figcaption></figure>`
      )
      .replace(
        /<img src="([^"]*)" alt="([^"]*)"(?![^>]*\bwidth=)([^>]*)>/g,
        (_m, src, alt, rest) => `<img src="${src}" alt="${alt}"${sizeAttrs(src)} loading="lazy" decoding="async"${rest}>`
      )
      /* Tables scroll inside their own container instead of widening the page. */
      .replace(/<table>/g, '<div class="table-scroll"><table>')
      .replace(/<\/table>/g, "</table></div>");
  });

  eleventyConfig.setServerOptions({ port: 8080 });

  if (isServe) console.log("Drafts are visible in this local preview and excluded from `npm run build`.");
}

export const config = {
  templateFormats: ["njk", "md"],
  markdownTemplateEngine: "njk",
  htmlTemplateEngine: "njk",
  dir: {
    input: ".",
    output: "_site",
    includes: "site/_includes",
    data: "site/_data",
  },
};
