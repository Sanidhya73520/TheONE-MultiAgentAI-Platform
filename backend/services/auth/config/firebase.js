import { cert, initializeApp, getApps } from "firebase-admin/app";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let serviceAccount = null;

// 1. Try reading from FIREBASE_SERVICE_ACCOUNT env var (JSON string or base64)
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT.trim();
    if (raw.startsWith("{")) {
      serviceAccount = JSON.parse(raw);
    } else {
      const decoded = Buffer.from(raw, "base64").toString("utf-8");
      serviceAccount = JSON.parse(decoded);
    }
  } catch (err) {
    console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT environment variable:", err.message);
  }
}

// 2. Fallback to local file if available
if (!serviceAccount) {
  const filePath = path.resolve(__dirname, "../serviceAccountKey.json");
  if (fs.existsSync(filePath)) {
    try {
      serviceAccount = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    } catch (err) {
      console.error("Failed to read serviceAccountKey.json:", err.message);
    }
  }
}

if (!serviceAccount) {
  console.warn("WARNING: Firebase service account credentials not found. Provide FIREBASE_SERVICE_ACCOUNT env var or add serviceAccountKey.json.");
}

export const app = getApps().length > 0
  ? getApps()[0]
  : initializeApp(serviceAccount ? { credential: cert(serviceAccount) } : {});