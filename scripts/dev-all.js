#!/usr/bin/env node

const { spawn } = require("child_process");
const http = require("http");
const net = require("net");
const httpProxy = require("http-proxy");

const requestedProxyPort = Number(process.env.PROXY_PORT || 3000);
let proxyPort = requestedProxyPort;
const landingPort = 3100;

const routeTargets = {
  "/ball-x-pit": "http://127.0.0.1:3001",
  "/icarus": "http://127.0.0.1:3002",
  "/kingdom-come-deliverance-ii": "http://127.0.0.1:3003",
  "/blue-prince": "http://127.0.0.1:3004",
  "/factorio": "http://127.0.0.1:3005",
  "/satisfactory": "http://127.0.0.1:3006",
  "/widget-inc": "http://127.0.0.1:3007",
};

const processes = [];
let shuttingDown = false;

const requiredAppPorts = [
  landingPort,
  3001,
  3002,
  3003,
  3004,
  3005,
  3006,
  3007,
];

function isPortAvailable(port) {
  return new Promise((resolve) => {
    const tester = net
      .createServer()
      .once("error", () => resolve(false))
      .once("listening", () => {
        tester.close(() => resolve(true));
      })
      .listen(port);
  });
}

async function getUnavailablePorts(ports) {
  const checks = await Promise.all(ports.map((port) => isPortAvailable(port)));
  return ports.filter((_, index) => !checks[index]);
}

function startWorkspace(name, command, args) {
  const child = spawn(command, args, {
    shell: true,
    stdio: "inherit",
    env: process.env,
  });

  processes.push({ name, child });

  child.on("exit", (code, signal) => {
    if (shuttingDown) {
      return;
    }

    const reason = signal ? `signal ${signal}` : `exit code ${code}`;
    console.error(
      `\n[dev-all] ${name} stopped (${reason}). Shutting down all services...`,
    );
    shutdown(code || 1);
  });
}

function getTargetForPath(urlPath) {
  const pathOnly = (urlPath || "/").split("?")[0];
  const match = Object.keys(routeTargets)
    .sort((a, b) => b.length - a.length)
    .find((prefix) => pathOnly === prefix || pathOnly.startsWith(`${prefix}/`));

  return match ? routeTargets[match] : `http://127.0.0.1:${landingPort}`;
}

function shutdown(exitCode = 0) {
  if (shuttingDown) {
    return;
  }
  shuttingDown = true;

  proxyServer.close(() => {
    process.exit(exitCode);
  });

  for (const { child } of processes) {
    if (!child.killed) {
      child.kill("SIGTERM");
    }
  }

  setTimeout(() => {
    for (const { child } of processes) {
      if (!child.killed) {
        child.kill("SIGKILL");
      }
    }
  }, 2000);
}

const proxy = httpProxy.createProxyServer({
  ws: true,
  changeOrigin: true,
});

proxy.on("error", (error, req, res) => {
  const target = getTargetForPath(req?.url || "/");
  const message = `[dev-all] Proxy error for ${req?.url || "unknown route"} -> ${target}: ${error.message}`;
  console.error(message);

  if (res && !res.headersSent) {
    res.writeHead(502, { "Content-Type": "text/plain" });
    res.end(
      "Proxy target is unavailable. Ensure project dev servers are running.\n",
    );
  }
});

const proxyServer = http.createServer((req, res) => {
  const target = getTargetForPath(req.url || "/");
  proxy.web(req, res, { target });
});

let proxyPortAttempts = 0;
const maxProxyPortAttempts = 10;

proxyServer.on("error", (error) => {
  if (error.code === "EADDRINUSE" && proxyPortAttempts < maxProxyPortAttempts) {
    proxyPortAttempts += 1;
    proxyPort += 1;
    console.warn(
      `[dev-all] Port ${proxyPort - 1} is in use. Retrying proxy on http://localhost:${proxyPort}...`,
    );
    proxyServer.listen(proxyPort);
    return;
  }

  console.error(`[dev-all] Failed to start proxy: ${error.message}`);
  shutdown(1);
});

proxyServer.on("upgrade", (req, socket, head) => {
  const target = getTargetForPath(req.url || "/");
  proxy.ws(req, socket, head, { target });
});

async function bootstrap() {
  const unavailablePorts = await getUnavailablePorts(requiredAppPorts);

  if (unavailablePorts.length > 0) {
    console.error(
      "[dev-all] Cannot start because required app ports are already in use:",
    );
    unavailablePorts.forEach((port) => {
      console.error(`[dev-all]   - ${port}`);
    });
    console.error(
      "[dev-all] Stop existing dev servers and run `npm run dev:all` again.",
    );
    process.exit(1);
  }

  proxyServer.listen(proxyPort, () => {
    console.log(`[dev-all] Proxy listening at http://localhost:${proxyPort}`);
    console.log(
      `[dev-all] Landing page target: http://localhost:${landingPort}`,
    );
    Object.entries(routeTargets).forEach(([route, target]) => {
      console.log(`[dev-all] ${route} -> ${target}`);
    });
    console.log("[dev-all] Press Ctrl+C to stop all services.\n");
  });

  startWorkspace("landing-page", "npm", [
    "run",
    "dev",
    "-w",
    "landing-page",
    "--",
    "--port",
    String(landingPort),
  ]);
  startWorkspace("ball-x-pit", "npm", [
    "run",
    "dev",
    "-w",
    "projects/ball-x-pit",
  ]);
  startWorkspace("icarus", "npm", ["run", "dev", "-w", "projects/icarus"]);
  startWorkspace("kingdom-come-deliverance-ii", "npm", [
    "run",
    "dev",
    "-w",
    "projects/kingdom-come-deliverance-ii",
  ]);
  startWorkspace("blue-prince", "npm", [
    "run",
    "dev",
    "-w",
    "projects/blue-prince",
  ]);
  startWorkspace("factorio", "npm", ["run", "dev", "-w", "projects/factorio"]);
  startWorkspace("satisfactory", "npm", [
    "run",
    "dev",
    "-w",
    "projects/satisfactory",
  ]);
  startWorkspace("widget-inc", "npm", [
    "run",
    "dev",
    "-w",
    "projects/widget-inc",
  ]);
}

bootstrap().catch((error) => {
  console.error(`[dev-all] Failed to bootstrap: ${error.message}`);
  shutdown(1);
});

process.on("SIGINT", () => {
  console.log("\n[dev-all] SIGINT received. Stopping all services...");
  shutdown(0);
});

process.on("SIGTERM", () => {
  console.log("\n[dev-all] SIGTERM received. Stopping all services...");
  shutdown(0);
});
