import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envCandidates = [
  path.join(__dirname, "..", "..", ".env"), // repo root (full deploy)
  path.join(__dirname, "..", ".env"), // api/.env (api-only deploy)
];
for (const envPath of envCandidates) {
  dotenv.config({ path: envPath });
}
dotenv.config(); // fallback: process.cwd()/.env (Plesk app root)

/**
 * iisnode on Windows sets PORT to a named pipe (e.g. \\.\pipe\...), not a number.
 * Coercing with Number() yields NaN and crashes listen(). Pass pipe paths through as-is.
 */
export function resolveListenOptions() {
  const raw = String(process.env.PORT ?? process.env.API_PORT ?? "3010").trim();

  if (raw.includes("pipe")) {
    console.error("[config] Using iisnode pipe:", raw);
    return { port: raw };
  }

  const port = Number(raw);
  if (!Number.isFinite(port)) {
    console.error("[config] Invalid PORT — falling back to 3010:", raw);
    return { port: 3010, host: "0.0.0.0" };
  }

  return { port, host: "0.0.0.0" };
}

/** @deprecated use resolveListenOptions() */
export const API_PORT = resolveListenOptions().port;
export const JWT_SECRET =
  process.env.JWT_SECRET?.trim() || "dev-jwt-secret-change-me";
export const DEFAULT_DATABASE =
  process.env.MSSQL_DATABASE?.trim() || "AfroAngelFantasyFootball";

const defaultOrigins = [
  "http://localhost:8081",
  "http://127.0.0.1:8081",
  "http://localhost:19006",
  "http://127.0.0.1:19006",
];

const envOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((v) => v.trim())
  .filter(Boolean);

export const ALLOWED_ORIGINS = new Set(
  envOrigins.length ? envOrigins : defaultOrigins
);

export function buildPoolConfig(cfg) {
  const database =
    (cfg.database && String(cfg.database).trim()) || DEFAULT_DATABASE;
  return {
    user: cfg.user,
    password: cfg.password,
    server: cfg.server.trim(),
    database,
    connectionTimeout: 15000,
    requestTimeout: 30000,
    options: {
      encrypt: true,
      trustServerCertificate: true,
    },
  };
}

export function loadDbEnv() {
  const server = process.env.MSSQL_SERVER?.trim();
  const user = process.env.MSSQL_USER?.trim();
  const password = process.env.MSSQL_PASSWORD ?? "";
  const database = DEFAULT_DATABASE;
  if (!server || !user) {
    throw new Error("MSSQL_SERVER and MSSQL_USER must be set in .env");
  }
  return { server, user, password, database };
}
