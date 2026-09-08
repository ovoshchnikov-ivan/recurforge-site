/* The homepage is already indexed by Google and must survive the arrival of a
   build step untouched. Two checks, both fatal:

   1. _site/index.html is byte-for-byte identical to the source index.html.
      It should be — the build copies the file and never renders it — but a
      passthrough rule can be lost in a config edit, and this is the tripwire.
   2. The source index.html still matches the checksum recorded when the build
      step was introduced, so an accidental edit is caught too.

   If the homepage was changed on purpose, re-record it:  npm run verify -- --update */

import fs from "node:fs";
import crypto from "node:crypto";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const SOURCE = path.join(ROOT, "index.html");
const BUILT = path.join(ROOT, "_site", "index.html");
const RECORD = path.join(ROOT, "build", "index.html.sha256");

const sha256 = (buf) => crypto.createHash("sha256").update(buf).digest("hex");

const source = fs.readFileSync(SOURCE);
const sourceHash = sha256(source);

if (process.argv.includes("--update")) {
  fs.writeFileSync(RECORD, `${sourceHash}  index.html\n`);
  console.log(`Recorded new homepage checksum: ${sourceHash}`);
  process.exit(0);
}

const fail = (message) => {
  console.error(`\nHOMEPAGE CHECK FAILED\n${message}\n`);
  process.exit(1);
};

if (!fs.existsSync(RECORD)) fail(`No checksum on record at build/index.html.sha256. Run: npm run verify -- --update`);

const recorded = fs.readFileSync(RECORD, "utf8").trim().split(/\s+/)[0];
if (recorded !== sourceHash)
  fail(
    `The source index.html has changed since the checksum was recorded.\n` +
      `  recorded: ${recorded}\n  now:      ${sourceHash}\n` +
      `If that was on purpose, re-record it with:  npm run verify -- --update`
  );

if (!fs.existsSync(BUILT)) fail(`_site/index.html does not exist — the build did not copy the homepage.`);

const built = fs.readFileSync(BUILT);
if (!source.equals(built)) {
  const at = (() => {
    const n = Math.min(source.length, built.length);
    for (let i = 0; i < n; i++) if (source[i] !== built[i]) return i;
    return n;
  })();
  fail(
    `_site/index.html differs from index.html.\n` +
      `  source: ${source.length} bytes, sha256 ${sourceHash}\n` +
      `  built:  ${built.length} bytes, sha256 ${sha256(built)}\n` +
      `  first differing byte at offset ${at}\n` +
      `The build must copy the homepage, never render it. Fix the config, not the page.`
  );
}

console.log(`Homepage identical: ${source.length} bytes, sha256 ${sourceHash}`);
