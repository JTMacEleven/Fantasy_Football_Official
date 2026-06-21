import fp from "fastify-plugin";
import sql from "mssql";
import { buildPoolConfig, loadDbEnv } from "../config.js";

/** @type {import('mssql').ConnectionPool | null} */
let pool = null;

async function dbPlugin(fastify) {
  const cfg = loadDbEnv();
  pool = new sql.ConnectionPool(buildPoolConfig(cfg));
  await pool.connect();
  fastify.log.info(`Connected to MSSQL: ${cfg.database}`);

  fastify.decorate("sql", sql);
  fastify.decorate("db", pool);

  fastify.addHook("onClose", async () => {
    if (pool) {
      await pool.close();
      pool = null;
    }
  });
}

export default fp(dbPlugin, { name: "db" });
