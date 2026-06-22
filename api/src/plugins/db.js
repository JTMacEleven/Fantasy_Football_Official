import fp from "fastify-plugin";
import sql from "mssql";
import { buildPoolConfig, loadDbEnv } from "../config.js";

/** @type {import('mssql').ConnectionPool | null} */
let pool = null;

async function connectPool(fastify) {
  const cfg = loadDbEnv();
  pool = new sql.ConnectionPool(buildPoolConfig(cfg));
  await pool.connect();
  fastify.decorate("db", pool, { overwrite: true });
  fastify.log.info(`Connected to MSSQL: ${cfg.database}`);
  return pool;
}

async function dbPlugin(fastify) {
  fastify.decorate("sql", sql);
  fastify.decorate("db", null);

  try {
    await connectPool(fastify);
  } catch (err) {
    fastify.log.error({ err }, "MSSQL connection failed at startup — API will still run");
    console.error("[db] MSSQL connection failed:", err?.message || err);
  }

  fastify.addHook("onClose", async () => {
    if (pool) {
      await pool.close();
      pool = null;
    }
  });
}

export default fp(dbPlugin, { name: "db" });
