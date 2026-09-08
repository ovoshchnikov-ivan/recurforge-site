/* `npm run list` — what an admin dashboard would have shown, as a table. */

import { collectArticles } from "./validate.mjs";

const articles = collectArticles().sort(
  (a, b) => new Date(b.data.date || 0) - new Date(a.data.date || 0)
);

if (!articles.length) {
  console.log("No articles yet. Add one under content/case-studies/ or content/guides/.");
  process.exit(0);
}

const rows = articles.map((a) => ({
  slug: a.data.slug || "—",
  category: a.data.category || "—",
  date: a.data.date ? new Date(a.data.date).toISOString().slice(0, 10) : "—",
  status: a.isDraft ? "draft" : "published",
  tags: (a.data.tags || []).join(" "),
}));

const columns = ["slug", "category", "date", "status", "tags"];
const width = Object.fromEntries(
  columns.map((c) => [c, Math.max(c.length, ...rows.map((r) => String(r[c]).length))])
);
const line = (cells) => columns.map((c, i) => String(cells[i]).padEnd(width[c])).join("  ");

console.log(line(columns.map((c) => c.toUpperCase())));
console.log(columns.map((c) => "─".repeat(width[c])).join("  "));
for (const row of rows) console.log(line(columns.map((c) => row[c])));

const published = rows.filter((r) => r.status === "published").length;
console.log(`\n${published} published, ${rows.length - published} draft.`);
