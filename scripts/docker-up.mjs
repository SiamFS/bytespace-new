#!/usr/bin/env node
// One command for the whole app in Docker:  node scripts/docker-up.mjs
//   1. starts Docker Desktop if the Docker engine isn't running (Windows / macOS; Linux: the service)
//   2. builds and starts Postgres, Redis, the API and the website (docker compose up --build --wait)
//   3. opens http://localhost:3000
// Options: --no-open (don't open the browser), --down (stop everything).
// Only Node built-ins — no install needed at the repo root.
import { spawn, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const args = new Set(process.argv.slice(2));
const SITE = "http://localhost:3000";

const log = (message) => console.log(`\x1b[36m[bytespace]\x1b[0m ${message}`);
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

if (spawnSync("docker", ["--version"], { stdio: "ignore" }).status !== 0) {
  fail("Docker isn't installed. Get Docker Desktop: https://www.docker.com/products/docker-desktop/ — or run without Docker: node scripts/dev-local.mjs");
}

if (args.has("--down")) {
  process.exit(await run("docker", ["compose", "down"]));
}

if (!engineRunning()) {
  log("Docker isn't running — starting Docker Desktop…");
  if (!startDockerDesktop()) fail("Couldn't start Docker Desktop. Start it yourself, then run this again.");
  const deadline = Date.now() + 180_000;
  while (!engineRunning()) {
    if (Date.now() > deadline) fail("Docker didn't start within 3 minutes. Open Docker Desktop, wait until it says \"running\", then run this again.");
    await sleep(3000);
  }
  log("Docker is running.");
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
