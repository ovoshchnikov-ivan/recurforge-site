/* Eleventy writes into _site without emptying it first, so a file that used to
   be generated — a draft that was published under a different slug, a tag page
   that fell below three articles — would sit there for ever. Every build starts
   from an empty directory instead. */

import fs from "node:fs";
import path from "node:path";

const OUT = path.join(path.resolve(import.meta.dirname, ".."), "_site");
fs.rmSync(OUT, { recursive: true, force: true });
console.log("Cleaned _site.");
