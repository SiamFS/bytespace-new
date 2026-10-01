#!/usr/bin/env node
// One command for the whole app in Docker:  node scripts/docker-up.mjs
//   1. starts Docker Desktop if the Docker engine isn't running (Windows / macOS; Linux: the service)
//   2. builds and starts Postgres, Redis, the API and the website (docker compose up --build --wait)
//   3. opens http://localhost:3000
// If Docker isn't installed or won't start, it explains why and runs the local setup instead
// (scripts/dev-local.mjs — no Docker, needs PostgreSQL).
// Options: --no-open (don't open the browser), --down (stop everything), --no-fallback (never run the local setup).
// Only Node built-ins — no install needed at the repo root.
import { spawn, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { connect } from "node:net";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const args = new Set(process.argv.slice(2));
const SITE = "http://localhost:3000";

const log = (message) => console.log(`\x1b[36m[bytespace]\x1b[0m ${message}`);
const warn = (message) => console.error(`\x1b[33m[bytespace]\x1b[0m ${message}`);
const fail = (message) => {
  console.error(`\x1b[31m[bytespace]\x1b[0m ${message}`);
  process.exit(1);
};
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** Runs a command with live output; resolves with its exit code. */
const run = (command, commandArgs) =>
  new Promise((resolve) => {
    const child = spawn(command, commandArgs, { cwd: root, stdio: "inherit" });
    child.on("close", resolve);
    child.on("error", () => resolve(1));
  });

/**
 * Docker can't be used: say why, then run the local setup instead (unless --no-fallback).
 * The local setup checks PostgreSQL itself and explains what to set if it can't reach it.
 */
async function withoutDocker(reason) {
  warn(reason.join("\n"));
  if (args.has("--no-fallback")) process.exit(1);
  console.log("");
  log("Starting the local setup instead (no Docker): node scripts/dev-local.mjs");
  const localArgs = [join(root, "scripts", "dev-local.mjs"), ...(args.has("--no-open") ? ["--no-open"] : [])];
  process.exit(await run(process.execPath, localArgs));
}

const engineRunning = () => spawnSync("docker", ["info"], { stdio: "ignore" }).status === 0;

function startDockerDesktop() {
  if (process.platform === "win32") {
    const exe = join(process.env.ProgramFiles ?? "C:\\Program Files", "Docker", "Docker", "Docker Desktop.exe");
    if (!existsSync(exe)) return false;
    spawn(exe, [], { detached: true, stdio: "ignore" }).unref();
    return true;
  }
  if (process.platform === "darwin") return spawnSync("open", ["-a", "Docker"]).status === 0;
  // Linux: Docker Desktop's user service, or the plain Docker engine.
  return (
    spawnSync("systemctl", ["--user", "start", "docker-desktop"]).status === 0 ||
    spawnSync("sudo", ["systemctl", "start", "docker"], { stdio: "inherit" }).status === 0
  );
}

function openBrowser(url) {
  const [command, commandArgs] =
    process.platform === "win32" ? ["cmd", ["/c", "start", "", url]] : process.platform === "darwin" ? ["open", [url]] : ["xdg-open", [url]];
  spawn(command, commandArgs, { detached: true, stdio: "ignore" }).on("error", () => {}).unref();
}

/** True if something already accepts connections on the port (IPv4 or IPv6 localhost). */
const portInUse = (port) =>
  Promise.all(
    ["127.0.0.1", "::1"].map(
      (host) =>
        new Promise((resolve) => {
          const socket = connect({ host, port, timeout: 1000 });
          socket.on("connect", () => {
            socket.destroy();
            resolve(true);
          });
          socket.on("timeout", () => {
            socket.destroy();
            resolve(false);
          });
          socket.on("error", () => resolve(false));
        }),
    ),
  ).then((results) => results.some(Boolean));

const containerRunning = (name) =>
  spawnSync("docker", ["ps", "--filter", `name=^${name}$`, "--format", "{{.Names}}"], { encoding: "utf8" }).stdout?.trim() === name;

// ---- Docker installed? ----
if (spawnSync("docker", ["--version"], { stdio: "ignore" }).status !== 0) {
  await withoutDocker([
    "Docker Desktop isn't installed (the `docker` command wasn't found).",
    "To use Docker (recommended):",
    "  1. Install Docker Desktop: https://www.docker.com/products/docker-desktop/",
    "     (Windows: let the installer turn on WSL 2, then restart if it asks.)",
    "  2. Open Docker Desktop once and accept its terms.",
    "  3. Open a new terminal and run again: node scripts/docker-up.mjs",
  ]);
}

if (args.has("--down")) {
  process.exit(await run("docker", ["compose", "down"]));
}

// ---- Docker running? Start Docker Desktop if not ----
if (!engineRunning()) {
  log("Docker isn't running — starting Docker Desktop…");
  if (!startDockerDesktop()) {
    await withoutDocker([
      "Docker is installed, but Docker Desktop couldn't be started automatically.",
      "To use Docker: open Docker Desktop, wait until it shows \"Engine running\", then run: node scripts/docker-up.mjs",
    ]);
  }
  const deadline = Date.now() + 180_000;
  while (!engineRunning()) {
    if (Date.now() > deadline) {
      await withoutDocker([
        "Docker Desktop didn't finish starting within 3 minutes.",
        "To use Docker: open it, wait until it shows \"Engine running\" (the first start can be slow), then run: node scripts/docker-up.mjs",
      ]);
    }
    await sleep(3000);
  }
  log("Docker is running.");
}

// ---- Ports free? (another copy of the app — e.g. dev-local.mjs or `npm run dev` — may be using them) ----
const ports = [
  [3000, "bytespace-frontend", "the website"],
  [4000, "bytespace-backend", "the API"],
  [5433, "bytespace-postgres", "PostgreSQL"],
  [6380, "bytespace-redis", "Redis"],
];
const blocked = [];
for (const [port, container, what] of ports) {
  if ((await portInUse(port)) && !containerRunning(container)) blocked.push(`  • port ${port} (${what})`);
}
if (blocked.length) {
  fail(
    [
      "These ports are already used by another program:",
      ...blocked,
      "Is the app already running without Docker (node scripts/dev-local.mjs or npm run dev)? Stop it with Ctrl+C,",
      "then run: node scripts/docker-up.mjs",
    ].join("\n"),
  );
}

if (!existsSync(join(root, "backend", ".env"))) {
  log("No backend/.env — fine: Docker supplies the database settings. (Add GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET there for Google sign-in.)");
}

log("Building and starting Postgres, Redis, the API and the website (first run takes a few minutes)…");
const code = await run("docker", ["compose", "up", "--build", "--wait", "--wait-timeout", "300"]);
if (code !== 0) fail("Something didn't start. See the output above, or: docker compose logs");

log(`Ready: ${SITE}  (API: http://localhost:4000/api/health)`);
log("Stop with: node scripts/docker-up.mjs --down   (or docker compose down)");
if (!args.has("--no-open")) openBrowser(SITE);
