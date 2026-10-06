/* Preview cards for articles, 1200x630, in the same design as the existing
   og.png: ink background, mark and wordmark on top, a rust rule under them,
   the article title set large, recurforge.com at the bottom.

   Written to assets/blog/og/<slug>.png and committed with the article, so a
   deploy never regenerates what already exists. Delete the file to redraw it.

   Fonts come from the @fontsource packages in node_modules and are decompressed
   from woff2 to ttf on the fly — resvg only reads ttf/otf, and this keeps the
   repository free of font binaries. */

import fs from "node:fs";
import path from "node:path";
import { Resvg } from "@resvg/resvg-js";
import { decompress } from "wawoff2";
import * as fontkit from "fontkit";
import { collectArticles } from "./validate.mjs";

const ROOT = path.resolve(import.meta.dirname, "..");
const OUT_DIR = path.join(ROOT, "assets", "blog", "og");
const CACHE = path.join(ROOT, "node_modules", ".cache", "recurforge-fonts");

const W = 1200;
const H = 630;
const MARGIN = 92;
const TEXT_WIDTH = 600;

const INK = "#14161A";
const TEXT = "#E7E6E3";
const ACCENT = "#E5A171";
const RULE = "#A8481A";
const MUTED = "#8E9096";
const EDGE = "#262A2F";
/* Одна тональність, від тьмяного до яскравого: більше значення — світліше.
   Найтьмяніший крок ще відрізняється від фону, інакше нижні когорти зникають. */
const RAMP = ["#7A3F20", "#96552F", "#B26F42", "#C98C60", "#DCAC84", "#EFC9AB"];
const EMPTY = "#1A1D23";

/* Когортна таблиця: кожен наступний рядок коротший, бо молодша когорта прожила
   менше місяців. Це та сама форма, що на екрані аналітики продукту, і вона ж
   пояснює, про що взагалі цей блог. */
const COHORTS = [
  [100, 68, 47, 41, 38, 36],
  [100, 71, 51, 44, 41],
  [100, 69, 48, 42],
  [100, 73, 55],
  [100, 76],
  [100],
];
const COLS = 6;
const CELL_W = 49;
const CELL_H = 36;
const CELL_GAP = 8;
const GRID_X = W - MARGIN - (COLS * CELL_W + (COLS - 1) * CELL_GAP);
const GRID_Y = Math.round((H - (COHORTS.length * CELL_H + (COHORTS.length - 1) * CELL_GAP)) / 2);

/* 30–100 на шість сходинок. Ділення на рівні двадцятки збивало б усе
   в дві сходинки, і карта читалася б як суцільна пляма. */
const bucket = (v) => Math.max(0, Math.min(5, Math.round(((v - 30) / 70) * 5)));

function cohortGrid() {
  const cells = [];
  COHORTS.forEach((row, r) => {
    const y = GRID_Y + r * (CELL_H + CELL_GAP);
    for (let c = 0; c < COLS; c += 1) {
      const x = GRID_X + c * (CELL_W + CELL_GAP);
      const fill = c < row.length ? RAMP[bucket(row[c])] : EMPTY;
      cells.push(`<rect x="${x}" y="${y}" width="${CELL_W}" height="${CELL_H}" rx="6" fill="${fill}"/>`);
    }
  });
  return cells.join("\n    ");
}

const FONTS = {
  chivoBold: "@fontsource/chivo/files/chivo-latin-800-normal.woff2",
  chivoRegular: "@fontsource/chivo/files/chivo-latin-400-normal.woff2",
  mono: "@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-400-normal.woff2",
};

async function ttfPath(key) {
  fs.mkdirSync(CACHE, { recursive: true });
  const out = path.join(CACHE, `${key}.ttf`);
  if (!fs.existsSync(out)) {
    const src = path.join(ROOT, "node_modules", FONTS[key]);
    fs.writeFileSync(out, Buffer.from(await decompress(fs.readFileSync(src))));
  }
  return out;
}

const escapeXml = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/* Real advance widths from the font file, so a title that does not fit is
   detected rather than guessed at. */
function measurer(fontFile) {
  const font = fontkit.openSync(fontFile);
  return (text, size) => (font.layout(text).advanceWidth / font.unitsPerEm) * size;
}

function wrap(words, size, measure, maxWidth) {
  const lines = [];
  let line = "";
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (measure(candidate, size) <= maxWidth || !line) line = candidate;
    else {
      lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/* Чотири рядки — межа. Не влазить — зменшуємо кегль, а не ламаємо картку. */
function fitTitle(title, measure) {
  const words = String(title).split(/\s+/).filter(Boolean);
  for (const size of [54, 48, 42, 37, 33]) {
    const lines = wrap(words, size, measure, TEXT_WIDTH);
    if (lines.length <= 4) return { size, lines };
  }
  return { size: 33, lines: wrap(words, 33, measure, TEXT_WIDTH).slice(0, 4) };
}

function svgFor(title, measure) {
  const { size, lines } = fitTitle(title, measure);
  const lineHeight = Math.round(size * 1.28);
  const firstBaseline = 268 + Math.round(size * 0.78);

  const titleLines = lines
    .map(
      (line, i) =>
        `<text x="${MARGIN}" y="${firstBaseline + i * lineHeight}" font-family="Chivo" font-weight="400" font-size="${size}" fill="${TEXT}">${escapeXml(line)}</text>`
    )
    .join("\n    ");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    <rect width="${W}" height="${H}" fill="${INK}"/>
    <rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" fill="none" stroke="${EDGE}"/>

    ${cohortGrid()}

    <g transform="translate(${MARGIN}, 96) scale(1.18)">
      <mask id="linkcut" maskUnits="userSpaceOnUse" x="0" y="0" width="64" height="64">
        <rect width="64" height="64" fill="#fff"/>
        <rect x="25" y="10" width="30" height="30" rx="11" fill="none" stroke="#000" stroke-width="11"/>
      </mask>
      <rect x="9" y="24" width="30" height="30" rx="11" fill="none" stroke="${TEXT}" stroke-width="5" mask="url(#linkcut)"/>
      <rect x="25" y="10" width="30" height="30" rx="11" fill="none" stroke="${ACCENT}" stroke-width="5"/>
    </g>

    <text x="205" y="162" font-family="Chivo" font-weight="800" font-size="76" letter-spacing="-2.6" fill="${TEXT}">Recur<tspan fill="${ACCENT}">Forge</tspan></text>

    <rect x="${MARGIN}" y="209" width="102" height="2" fill="${RULE}"/>

    ${titleLines}

    <text x="${MARGIN}" y="537" font-family="IBM Plex Mono" font-weight="400" font-size="20" fill="${MUTED}">recurforge.com</text>
  </svg>`;
}

export async function generateOgImages({ force = false, log = console.log } = {}) {
  const articles = collectArticles().filter((a) => !a.isDraft && a.data.slug && !a.data.og_image);
  if (!articles.length) return [];

  const files = {
    chivoBold: await ttfPath("chivoBold"),
    chivoRegular: await ttfPath("chivoRegular"),
    mono: await ttfPath("mono"),
  };
  const measure = measurer(files.chivoRegular);
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const written = [];
  for (const article of articles) {
    const target = path.join(OUT_DIR, `${article.data.slug}.png`);
    if (fs.existsSync(target) && !force) continue;

    const png = new Resvg(svgFor(article.data.title, measure), {
      font: { loadSystemFonts: false, fontFiles: Object.values(files), defaultFontFamily: "Chivo" },
      fitTo: { mode: "width", value: W },
    })
      .render()
      .asPng();

    fs.writeFileSync(target, png);
    written.push(path.relative(ROOT, target));
    log(`  og  wrote ${path.relative(ROOT, target)} (${png.length} bytes)`);
  }
  return written;
}

if (import.meta.filename === process.argv[1]) {
  const written = await generateOgImages({ force: process.argv.includes("--force") });
  console.log(written.length ? `Generated ${written.length} preview image(s).` : "Preview images already up to date.");
}
