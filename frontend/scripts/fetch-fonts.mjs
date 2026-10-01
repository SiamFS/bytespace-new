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
// woff2 files start with the signature "wOF2" — don't save an HTML error page as a font.
if (font.subarray(0, 4).toString("latin1") !== "wOF2") {
  throw new Error(`fetch-fonts: ${fontUrl} did not return a woff2 file`);
}

await mkdir(dirname(OUT_FILE), { recursive: true });
await writeFile(OUT_FILE, font);
console.log(`fetch-fonts: saved Satoshi (${font.length} bytes)`);

/**
 * Every build (Vercel, CI) depends on this download, so one network blip must not fail a
 * deploy: 3 attempts, 15s timeout each, 1s → 3s backoff between them.
 */
async function fetchOk(url, attempts = 3) {
  for (let attempt = 1; ; attempt++) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(15_000) });
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      return res;
    } catch (error) {
      if (attempt >= attempts) {
        throw new Error(`fetch-fonts: ${url} failed after ${attempts} attempts: ${error.message}`);
      }
      const wait = 1000 * 3 ** (attempt - 1);
      console.warn(`fetch-fonts: attempt ${attempt} failed (${error.message}), retrying in ${wait / 1000}s`);
      await new Promise((resolve) => setTimeout(resolve, wait));
    }
  }
}
