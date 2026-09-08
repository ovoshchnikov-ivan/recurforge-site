/* Front-matter validation. Runs before every build (and on every rebuild in
   watch mode) via eleventy.config.mjs, and on its own via `npm run check`.

   Published articles must be complete: a missing description or a tag invented
   on the fly is a hard build failure, not a warning. Drafts get warnings only —
   a half-written draft must never block publishing a finished article. */

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const ROOT = path.resolve(import.meta.dirname, "..");
const CONTENT = path.join(ROOT, "content");

const readJson = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), "utf8"));

const CATEGORIES = readJson("site/_data/categories.json").map((c) => c.slug);
const TAGS = Object.keys(readJson("site/_data/tagVocabulary.json"));

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const TITLE_MAX = 65;
const DESC_MIN = 120;
const DESC_MAX = 158;

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (entry.isFile() && entry.name.endsWith(".md")) out.push(full);
  }
  return out;
}

export function collectArticles() {
  if (!fs.existsSync(CONTENT)) return [];
  return walk(CONTENT)
    .filter((f) => path.basename(f) !== "keywords.md")
    .map((file) => {
      const rel = path.relative(ROOT, file);
      const { data, content } = matter(fs.readFileSync(file, "utf8"));
      const folder = path.basename(path.dirname(file));
      return { file, rel, data, content, folder, isDraft: folder === "_drafts" || data.draft === true };
    });
}

function checkOne(article, seenSlugs) {
  const { data, rel, folder, isDraft } = article;
  const problems = [];
  const warn = [];
  const need = (field) => {
    problems.push(`${rel}: front matter is missing required field \`${field}\``);
  };

  if (!data.title) need("title");
  else if (String(data.title).length > TITLE_MAX)
    problems.push(`${rel}: \`title\` is ${String(data.title).length} characters, the limit is ${TITLE_MAX}`);

  if (!data.slug) need("slug");
  else if (!SLUG_RE.test(String(data.slug)))
    problems.push(`${rel}: \`slug\` "${data.slug}" must be lowercase latin words joined by single hyphens`);
  else {
    const previous = seenSlugs.get(data.slug);
    if (previous) problems.push(`${rel}: \`slug\` "${data.slug}" is already used by ${previous}`);
    else seenSlugs.set(data.slug, rel);
  }

  if (!data.category) need("category");
  else if (!CATEGORIES.includes(data.category))
    problems.push(`${rel}: \`category\` "${data.category}" is not one of: ${CATEGORIES.join(", ")}`);
  else if (!isDraft && folder !== data.category)
    problems.push(`${rel}: \`category\` is "${data.category}" but the file sits in content/${folder}/`);

  if (!data.description) need("description");
  else {
    const n = String(data.description).length;
    if (n < DESC_MIN || n > DESC_MAX)
      problems.push(`${rel}: \`description\` is ${n} characters, it must be between ${DESC_MIN} and ${DESC_MAX}`);
  }

  if (!data.keyword) need("keyword");

  if (!data.tags) need("tags");
  else if (!Array.isArray(data.tags) || data.tags.length === 0)
    problems.push(`${rel}: \`tags\` must be a non-empty list`);
  else
    for (const tag of data.tags)
      if (!TAGS.includes(tag))
        problems.push(`${rel}: tag "${tag}" is not in the vocabulary (site/_data/tagVocabulary.json). Add it there first, on purpose.`);

  if (!data.date) need("date");
  else if (Number.isNaN(new Date(data.date).getTime()))
    problems.push(`${rel}: \`date\` "${data.date}" is not a valid date`);

  if (data.updated && Number.isNaN(new Date(data.updated).getTime()))
    problems.push(`${rel}: \`updated\` "${data.updated}" is not a valid date`);

  if (data.draft !== undefined && typeof data.draft !== "boolean")
    problems.push(`${rel}: \`draft\` must be true or false`);

  /* Editorial rules from section 8 of the spec. Worth saying out loud, not
     worth blocking a deploy over. */
  if (data.keyword && data.title && !String(data.title).toLowerCase().includes(String(data.keyword).toLowerCase()))
    warn.push(`${rel}: keyword "${data.keyword}" does not appear in the title`);
  if (data.keyword && data.description && !String(data.description).toLowerCase().includes(String(data.keyword).toLowerCase()))
    warn.push(`${rel}: keyword "${data.keyword}" does not appear in the description`);

  return { problems, warn };
}

export function validate({ throwOnError = true } = {}) {
  const articles = collectArticles();
  const seenSlugs = new Map();
  const errors = [];
  const warnings = [];

  for (const article of articles) {
    const { problems, warn } = checkOne(article, seenSlugs);
    /* A draft is allowed to be incomplete: it is not published yet. */
    if (article.isDraft) warnings.push(...problems.map((p) => `${p} (draft)`), ...warn);
    else {
      errors.push(...problems);
      warnings.push(...warn);
    }
  }

  for (const w of warnings) console.warn(`  warning  ${w}`);

  if (errors.length) {
    const message =
      `Blog front matter is invalid — ${errors.length} problem(s):\n` +
      errors.map((e) => `  - ${e}`).join("\n") +
      `\n\nFix the markdown files above. Nothing was written to _site.`;
    if (throwOnError) throw new Error(message);
    console.error(message);
  }
  return { articles, errors, warnings };
}

if (import.meta.filename === process.argv[1]) {
  try {
    const { articles, errors } = validate({ throwOnError: false });
    if (errors.length) process.exit(1);
    console.log(`Front matter OK — ${articles.length} file(s) checked.`);
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
}
