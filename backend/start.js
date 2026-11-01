import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load backend root .env if present
dotenv.config({ path: path.join(__dirname, ".env") });

console.log("==================================================");
console.log(" Starting The ONE Multi-Agent AI Platform Backend ");
console.log("==================================================");

const services = [
  {
    name: "AUTH",
    cwd: path.join(__dirname, "services", "auth"),
    script: "index.js",
    env: {
      PORT: process.env.AUTH_PORT || "8001",
    },
  },
  {
    name: "CHAT",
    cwd: path.join(__dirname, "services", "chat"),
    script: "index.js",
    env: {
      PORT: process.env.CHAT_PORT || "8002",
    },
  },
  {
    name: "AGENT",
    cwd: path.join(__dirname, "services", "agent"),
    script: "index.js",
    env: {
      PORT: process.env.AGENT_PORT || "8003",
      CHAT_SERVICE: process.env.CHAT_SERVICE || "http://127.0.0.1:8002",
      AUTH_SERVICE: process.env.AUTH_SERVICE || "http://127.0.0.1:8001",
    },
  },
  {
    name: "BILLING",
    cwd: path.join(__dirname, "services", "billing"),
    script: "index.js",
    env: {
      PORT: process.env.BILLING_PORT || "8004",
      AUTH_SERVICE: process.env.AUTH_SERVICE || "http://127.0.0.1:8001",
    },
  },
  {
    name: "GATEWAY",
    cwd: path.join(__dirname, "gateway"),
    script: "index.js",
    env: {
      PORT: process.env.PORT || "8000",
      AUTH_SERVICE: process.env.AUTH_SERVICE || "http://127.0.0.1:8001",
      CHAT_SERVICE: process.env.CHAT_SERVICE || "http://127.0.0.1:8002",
      AGENT_SERVICE: process.env.AGENT_SERVICE || "http://127.0.0.1:8003",
      BILLING_SERVICE: process.env.BILLING_SERVICE || "http://127.0.0.1:8004",
    },
  },
];

const processes = [];

function pipeLogs(proc, name) {
  proc.stdout.on("data", (data) => {
    const lines = data.toString().trim().split("\n");
    for (const line of lines) {
      if (line.trim()) console.log(`[${name}] ${line}`);
    }
  });

  proc.stderr.on("data", (data) => {
    const lines = data.toString().trim().split("\n");
    for (const line of lines) {
      if (line.trim()) console.error(`[${name} ERROR] ${line}`);
    }
  });
}

function startService(svc) {
  const env = { ...process.env, ...svc.env };
  const child = spawn("node", [svc.script], {
    cwd: svc.cwd,
    env,
    stdio: ["pipe", "pipe", "pipe"],
  });

  pipeLogs(child, svc.name);

  child.on("exit", (code, signal) => {
    console.warn(`[${svc.name}] Process exited (code: ${code}, signal: ${signal})`);
  });

  processes.push(child);
  return child;
}

// Start microservices first, then Gateway
async function startAll() {
  for (const svc of services) {
    if (svc.name !== "GATEWAY") {
      startService(svc);
    }
  }

  setTimeout(() => {
    const gatewaySvc = services.find((s) => s.name === "GATEWAY");
    if (gatewaySvc) {
      startService(gatewaySvc);
    }
  }, 1500);
}

startAll();

function shutdown() {
  console.log("\nReceived shutdown signal. Stopping all backend services...");
  for (const proc of processes) {
    if (!proc.killed) {
      proc.kill("SIGTERM");
    }
  }
  setTimeout(() => process.exit(0), 1000);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
