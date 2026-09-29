// Downloads the Satoshi variable font from Fontshare before dev/build.
//
// Satoshi is licensed under the ITF Free Font License, which allows
// self-hosting on our own site but forbids redistributing the font file
// through a public repository. So the file is gitignored and fetched here
// (runs automatically as part of `npm run dev` and `npm run build`).

import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const CSS_URL = "https://api.fontshare.com/v2/css?f[]=satoshi@1&display=swap";
const OUT_FILE = join(
  dirname(fileURLToPath(import.meta.url)),
  "../src/app/fonts/Satoshi-Variable.woff2",
);

if (existsSync(OUT_FILE)) {
  process.exit(0);
}

const css = await fetchOk(CSS_URL).then((res) => res.text());
const match = css.match(/url\(['"]?([^'")]+\.woff2)['"]?\)/);
if (!match) {
  throw new Error("fetch-fonts: no woff2 URL found in the Fontshare CSS response");
}

const fontUrl = match[1].startsWith("//") ? `https:${match[1]}` : match[1];
const font = Buffer.from(await fetchOk(fontUrl).then((res) => res.arrayBuffer()));

await mkdir(dirname(OUT_FILE), { recursive: true });
await writeFile(OUT_FILE, font);
console.log(`fetch-fonts: saved Satoshi (${font.length} bytes)`);

async function fetchOk(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`fetch-fonts: ${res.status} ${res.statusText} for ${url}`);
  }
  return res;
}
