import express from "express";
import dotenv from "dotenv";
import proxy from "express-http-proxy";
import cors from "cors";
import cookieParser from "cookie-parser";
import protect from "./middleware/auth.middleware.js";
import getCurrentUser from "./controllers/user.controller.js";
import { proxyWithHeader } from "./utils/proxyWithHeader.js";
import morgan from "morgan";

dotenv.config();

const port = process.env.PORT || 8000;
const app = express();

// Trust reverse proxy for HTTPS cookies & forwarded headers on Render
app.set("trust proxy", 1);

const frontendUrl = process.env.FRONTEND_URL?.replace(/\/$/, "");
const allowedOrigins = [
  frontendUrl,
  "http://localhost:5173",
  "http://localhost:3000",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser requests (e.g. server-to-server, health check, curl)
      if (!origin) return callback(null, true);

      const cleanOrigin = origin.replace(/\/$/, "");
      const isAllowed =
        allowedOrigins.includes(cleanOrigin) ||
        cleanOrigin.startsWith("http://localhost") ||
        cleanOrigin.endsWith(".vercel.app");

      if (isAllowed) {
        callback(null, true);
      } else {
        // Echo back origin to allow cross-origin access with credentials
        callback(null, true);
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie", "x-user-id"],
    exposedHeaders: ["Set-Cookie"],
  })
);

app.use(morgan("dev"));
app.use(cookieParser());

const authService = process.env.AUTH_SERVICE || "http://127.0.0.1:8001";
const chatService = process.env.CHAT_SERVICE || "http://127.0.0.1:8002";
const agentService = process.env.AGENT_SERVICE || "http://127.0.0.1:8003";
const billingService = process.env.BILLING_SERVICE || "http://127.0.0.1:8004";

app.use("/api/auth", proxy(authService, { timeout: 60000 }));
app.use("/api/chat", protect, proxyWithHeader(chatService, { timeout: 60000 }));
app.use("/api/agent", protect, proxyWithHeader(agentService, { timeout: 180000 }));
app.use("/api/billing", protect, proxyWithHeader(billingService, { timeout: 60000 }));
app.get("/api/me", protect, getCurrentUser);

app.get(["/", "/health"], (req, res) => {
  res.status(200).json({
    status: "healthy",
    message: "Gateway is running - The ONE Multi-Agent AI Platform",
    timestamp: new Date().toISOString(),
  });
});

app.listen(port, () => {
  console.log(`Gateway Started at ${port}`);
});