import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "..", "..", ".env") });

export const API_PORT = Number(process.env.API_PORT) || 3010;
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
