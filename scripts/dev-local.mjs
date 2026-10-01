#!/usr/bin/env node
// Run the app without Docker:  node scripts/dev-local.mjs
//   - checks Node, installs packages (backend + frontend) if needed
//   - creates backend/.env from .env.example on first run
//   - checks PostgreSQL is reachable (your own install, or a free Neon database — see README)
//   - applies database migrations, then starts the API (:4000) and the website (:3000) together
// Redis is optional: if it isn't reachable, rate limits are kept in memory (fine for one machine).
// Options: --no-open (don't open the browser). Stop with Ctrl+C.
// Only Node built-ins — no install needed at the repo root.
import { spawn, spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { copyFileSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { connect } from "node:net";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const backend = join(root, "backend");
const frontend = join(root, "frontend");
const SITE = "http://localhost:3000";
const isWindows = process.platform === "win32";

const log = (message) => console.log(`\x1b[36m[bytespace]\x1b[0m ${message}`);
const fail = (message) => {
  console.error(`\x1b[31m[bytespace]\x1b[0m ${message}`);
  process.exit(1);
};

// ---- Node version (Next 16 needs >= 20.9, Prisma 7 needs ^22.12) ----
const [major, minor] = process.versions.node.split(".").map(Number);
if (major < 22 || (major === 22 && minor < 12)) fail(`Node 22.12+ is required (you have ${process.versions.node}). https://nodejs.org`);

const npm = (cwd, npmArgs, extraEnv) => {
  const result = spawnSync("npm", npmArgs, { cwd, stdio: "inherit", shell: isWindows, env: { ...process.env, ...extraEnv } });
  return result.status === 0;
};

// ---- packages ----
for (const [name, dir] of [["backend", backend], ["frontend", frontend]]) {
  if (!existsSync(join(dir, "node_modules"))) {
    log(`Installing ${name} packages…`);
    if (!npm(dir, ["ci"])) fail(`npm ci failed in ${name}/.`);
  }
}

// ---- backend/.env ----
const envPath = join(backend, ".env");
if (!existsSync(envPath)) {
  copyFileSync(join(backend, ".env.example"), envPath);
  const text = readFileSync(envPath, "utf8")
    .replace(/^JWT_SECRET=.*$/m, `JWT_SECRET=${randomBytes(32).toString("base64")}`)
    .replace(/^NODE_ENV=.*$/m, "NODE_ENV=development");
  writeFileSync(envPath, text);
  log("Created backend/.env (with a new random JWT_SECRET).");
}

/** Minimal .env parser: KEY=value lines, # comments, optional quotes. */
const env = {};
for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
  const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
  if (match) env[match[1]] = match[2].replace(/^(['"])(.*)\1$/, "$2");
}

const reachable = (url) =>
  new Promise((resolve) => {
    let host;
    let port;
    try {
      const parsed = new URL(url);
      host = parsed.hostname;
      port = Number(parsed.port) || (parsed.protocol.startsWith("postgres") ? 5432 : 6379);
    } catch {
      resolve(false);
      return;
    }
    const socket = connect({ host, port, timeout: 3000 });
    socket.on("connect", () => {
      socket.destroy();
      resolve(true);
    });
    socket.on("timeout", () => {
      socket.destroy();
      resolve(false);
    });
    socket.on("error", () => resolve(false));
  });

// ---- PostgreSQL (required) ----
if (!env.DATABASE_URL || !(await reachable(env.DATABASE_URL))) {
  fail(
    [
      `Can't reach PostgreSQL at ${env.DATABASE_URL ?? "(DATABASE_URL not set)"}.`,
      "Set DATABASE_URL in backend/.env to a database you can use, either:",
      "  • a free Neon database (https://neon.tech → Connection string), or",
      "  • a local PostgreSQL install, e.g. postgresql://postgres:<password>@localhost:5432/bytespace",
      "  • or the Docker database (the default URL): start Docker Desktop, then `docker compose up -d postgres redis`",
      "Then run this again. (Or everything in Docker: node scripts/docker-up.mjs)",
    ].join("\n"),
  );
}

// ---- Redis (optional) ----
const runEnv = { ...process.env, ...env, NODE_ENV: "development" };
if (env.REDIS_URL && !(await reachable(env.REDIS_URL))) {
  log(`Redis isn't reachable at ${env.REDIS_URL} — using in-memory rate limits for this run.`);
  delete runEnv.REDIS_URL;
}

// ---- ports free? (the Docker containers or another copy of the app may be using them) ----
const busy = [];
for (const [port, what] of [[3000, "the website"], [4000, "the API"]]) {
  if (await reachable(`http://localhost:${port}`)) busy.push(`  • port ${port} (${what})`);
}
if (busy.length) {
  fail(
    [
      "These ports are already in use:",
      ...busy,
      "Is the app already running? Stop it first — Docker: node scripts/docker-up.mjs --down (or docker compose stop",
      "frontend backend); another terminal: Ctrl+C. Then run this again.",
    ].join("\n"),
  );
}

// ---- migrations ----
log("Applying database migrations…");
const migrate = spawnSync("npx", ["prisma", "migrate", "deploy"], { cwd: backend, stdio: "inherit", shell: isWindows, env: runEnv });
if (migrate.status !== 0) fail("Migrations failed — check DATABASE_URL in backend/.env.");

// ---- start both ----
const children = [];
const start = (name, color, cwd, command, commandArgs, childEnv) => {
  // stdin "ignore": `tsx watch` waits on an open stdin pipe and the API would never start.
  const child = spawn(command, commandArgs, { cwd, shell: isWindows, env: childEnv, stdio: ["ignore", "pipe", "pipe"] });
  const prefix = `\x1b[${color}m[${name}]\x1b[0m `;
  const pipe = (stream, out) =>
    stream.on("data", (chunk) => out.write(chunk.toString().replace(/^(?=.)/gm, prefix)));
  pipe(child.stdout, process.stdout);
  pipe(child.stderr, process.stderr);
  child.on("exit", (code) => {
    if (!stopping) {
      console.error(`${prefix}stopped (exit ${code}). Stopping everything.`);
      stopAll(code ?? 1);
    }
  });
  children.push(child);
};

let stopping = false;
function stopAll(code = 0) {
  stopping = true;
  for (const child of children) {
    if (child.exitCode !== null) continue;
    // Windows: kill the whole tree (npm → node), otherwise the dev servers keep running.
    if (isWindows) spawnSync("taskkill", ["/pid", String(child.pid), "/T", "/F"], { stdio: "ignore" });
    else child.kill("SIGTERM");
  }
  process.exit(code);
}
process.on("SIGINT", () => stopAll(0));
process.on("SIGTERM", () => stopAll(0));

log("Starting the API (http://localhost:4000) and the website (http://localhost:3000)… Ctrl+C stops both.");
// tsx directly (not `npm run dev`, which re-reads .env) so the environment above is used as is.
start("api", "35", backend, "npx", ["tsx", "watch", "src/server.ts"], runEnv);
start("web", "32", frontend, "npm", ["run", "dev"], { ...process.env, API_URL: "http://localhost:4000" });

// Open the browser once the website answers.
if (!process.argv.includes("--no-open")) {
  const deadline = Date.now() + 120_000;
  while (Date.now() < deadline && !stopping) {
    try {
      const response = await fetch(SITE);
      if (response.ok) {
        log(`Ready: ${SITE}`);
        const [command, commandArgs] = isWindows ? ["cmd", ["/c", "start", "", SITE]] : process.platform === "darwin" ? ["open", [SITE]] : ["xdg-open", [SITE]];
        spawn(command, commandArgs, { detached: true, stdio: "ignore" }).on("error", () => {}).unref();
        break;
      }
    } catch {
      // not up yet
    }
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
}
