/**
 * Apply SQL migrations to AfroAngelFantasyFootball database.
 * Usage: node db/migrate.js | node db/migrate.js --status
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import sql from "mssql";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.join(__dirname, "..");
const MIGRATIONS_DIR = path.join(__dirname, "migrations");
const DEFAULT_DATABASE = "AfroAngelFantasyFootball";

const envFile = process.argv.includes("--production")
  ? ".env.production"
  : ".env";

for (const base of [ROOT_DIR, path.join(ROOT_DIR, "api")]) {
  dotenv.config({ path: path.join(base, envFile) });
}

function loadDbConfig() {
  const server = process.env.MSSQL_SERVER?.trim();
  const user = process.env.MSSQL_USER?.trim();
  const password = process.env.MSSQL_PASSWORD ?? "";
  const database = process.env.MSSQL_DATABASE?.trim() || DEFAULT_DATABASE;

  if (!server || !user) {
    throw new Error("MSSQL_SERVER and MSSQL_USER must be set in .env");
  }

  return { server, user, password, database };
}

function buildPoolConfig(cfg, database) {
  return {
    user: cfg.user,
    password: cfg.password,
    server: cfg.server,
    database: database || cfg.database || DEFAULT_DATABASE,
    connectionTimeout: 15000,
    requestTimeout: 120000,
    options: {
      encrypt: true,
      trustServerCertificate: true,
    },
  };
}

async function ensureDatabaseExists(poolConfigMaster, dbName) {
  const pool = new sql.ConnectionPool(poolConfigMaster);
  await pool.connect();
  try {
    const esc = dbName.replace(/'/g, "''");
    const bracket = `[${dbName.replace(/\]/g, "]]")}]`;
    await pool.request().query(
      `IF NOT EXISTS (SELECT 1 FROM sys.databases WHERE name = N'${esc}')
        CREATE DATABASE ${bracket}`
    );
  } finally {
    await pool.close();
  }
}

async function ensureMigrationsTable(pool) {
  await pool.request().query(`
    IF NOT EXISTS (
      SELECT 1 FROM sys.tables
      WHERE name = 'schema_migrations' AND schema_id = SCHEMA_ID('dbo')
    )
    CREATE TABLE dbo.schema_migrations (
      version    VARCHAR(32) NOT NULL,
      name       VARCHAR(200) NOT NULL,
      applied_at DATETIME2 NOT NULL CONSTRAINT DF_schema_migrations_applied_at DEFAULT (SYSUTCDATETIME()),
      CONSTRAINT PK_schema_migrations PRIMARY KEY (version)
    );
  `);
}

function listMigrationFiles() {
  return fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql"))
    .sort();
}

function parseVersion(filename) {
  const match = /^(\d+)_(.+)\.sql$/.exec(filename);
  if (!match) throw new Error(`Invalid migration filename: ${filename}`);
  return { version: match[1], name: match[2] };
}

function splitSqlBatches(sqlText) {
  return sqlText
    .split(/^\s*GO\s*$/gim)
    .map((batch) => batch.trim())
    .filter((batch) => batch.length > 0);
}

async function getAppliedVersions(pool) {
  const result = await pool.request().query(
    "SELECT version, name, applied_at FROM dbo.schema_migrations ORDER BY version"
  );
  return result.recordset;
}

async function applyMigration(pool, filename) {
  const { version, name } = parseVersion(filename);
  const sqlText = fs.readFileSync(path.join(MIGRATIONS_DIR, filename), "utf8");
  const batches = splitSqlBatches(sqlText);
  const transaction = new sql.Transaction(pool);
  await transaction.begin();
  try {
    for (const batch of batches) {
      await new sql.Request(transaction).query(batch);
    }
    const insert = new sql.Request(transaction);
    insert.input("version", sql.VarChar(32), version);
    insert.input("name", sql.NVarChar(200), name);
    await insert.query(
      "INSERT INTO dbo.schema_migrations (version, name) VALUES (@version, @name)"
    );
    await transaction.commit();
    console.log(`Applied ${filename}`);
  } catch (err) {
    try {
      await transaction.rollback();
    } catch {
      /* ignore */
    }
    throw new Error(`Migration ${filename} failed: ${err.message}`);
  }
}

async function main() {
  const statusOnly = process.argv.includes("--status");
  const cfg = loadDbConfig();
  await ensureDatabaseExists(buildPoolConfig(cfg, "master"), cfg.database);

  const pool = new sql.ConnectionPool(buildPoolConfig(cfg, cfg.database));
  await pool.connect();
  try {
    await ensureMigrationsTable(pool);
    if (statusOnly) {
      const applied = await getAppliedVersions(pool);
      const appliedSet = new Set(applied.map((r) => r.version));
      console.log("Applied:", applied.length ? applied.map((r) => r.version).join(", ") : "(none)");
      const pending = listMigrationFiles().filter((f) => !appliedSet.has(parseVersion(f).version));
      console.log("Pending:", pending.length ? pending.join(", ") : "(none)");
      return;
    }

    const appliedSet = new Set((await getAppliedVersions(pool)).map((r) => r.version));
    let count = 0;
    for (const filename of listMigrationFiles()) {
      if (appliedSet.has(parseVersion(filename).version)) continue;
      await applyMigration(pool, filename);
      count += 1;
    }
    console.log(count === 0 ? "Database is up to date." : `Applied ${count} migration(s).`);
  } finally {
    await pool.close();
  }
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
