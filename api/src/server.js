import Fastify from "fastify";
import cors from "@fastify/cors";
import { ALLOWED_ORIGINS, resolveListenOptions } from "./config.js";
import dbPlugin from "./plugins/db.js";
import authRoutes from "./routes/auth.js";
import profileRoutes from "./routes/profile.js";

const fastify = Fastify({ logger: true });

await fastify.register(cors, {
  origin: process.env.NODE_ENV === "production"
    ? (origin, cb) => {
        if (!origin || ALLOWED_ORIGINS.has(origin)) {
          cb(null, true);
          return;
        }
        cb(null, false);
      }
    : true,
  credentials: true,
});

fastify.get("/api/health", async () => ({
  ok: true,
  db: fastify.db ? "connected" : "disconnected",
}));

await fastify.register(dbPlugin);
await fastify.register(authRoutes);
await fastify.register(profileRoutes);

try {
  const listenOpts = resolveListenOptions();
  await fastify.listen(listenOpts);
  fastify.log.info({ listenOpts }, "API listening");
  console.error("[api] listening:", JSON.stringify(listenOpts));
} catch (err) {
  fastify.log.error(err);
  console.error("[api] listen failed:", err?.message || err);
  process.exit(1);
}
