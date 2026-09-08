/* Data that every article gets for free: its URL, its preview image, and the
   JSON-LD that has to stay in step with the front matter. Kept in one place so
   an article file only ever carries the fields a human writes. */

const isServe = process.env.ELEVENTY_RUN_MODE === "serve";

export default {
  layout: "article.njk",
  draft: false,
  eleventyComputed: {
    /* Drafts render in the local preview and are absent from the build. */
    permalink: (data) => {
      if (data.draft && !isServe) return false;
      if (!data.category || !data.slug) return false;
      return `/blog/${data.category}/${data.slug}/index.html`;
    },
    eleventyExcludeFromCollections: (data) => Boolean(data.draft && !isServe),

    ogImage: (data) => data.og_image || `/assets/blog/og/${data.slug}.png`,

    author: (data) => data.authors[data.site.defaultAuthor],

    lastmod: (data) => data.updated || data.date,

    structuredData: (data) => {
      const url = `${data.site.url}/blog/${data.category}/${data.slug}/`;
      const image = `${data.site.url}${data.og_image || `/assets/blog/og/${data.slug}.png`}`;
      const author = data.authors[data.site.defaultAuthor];
      const category = data.categories.find((c) => c.slug === data.category) || {};
      const iso = (v) => new Date(v).toISOString().slice(0, 10);

      return [
        {
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: data.title,
          description: data.description,
          datePublished: iso(data.date),
          dateModified: iso(data.updated || data.date),
          author: {
            "@type": "Person",
            name: author.name,
            url: author.linkedin,
            sameAs: [author.linkedin],
          },
          publisher: {
            "@type": "Organization",
            name: data.site.name,
            url: `${data.site.url}/`,
          },
          image: [image],
          mainEntityOfPage: { "@type": "WebPage", "@id": url },
          keywords: (data.tags || []).join(", "),
        },
        {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: data.site.name, item: `${data.site.url}/` },
            { "@type": "ListItem", position: 2, name: "Blog", item: `${data.site.url}/blog/` },
            { "@type": "ListItem", position: 3, name: category.title, item: `${data.site.url}/blog/${data.category}/` },
            { "@type": "ListItem", position: 4, name: data.title, item: url },
          ],
        },
      ];
    },
  },
};
