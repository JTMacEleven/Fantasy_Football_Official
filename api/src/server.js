import Fastify from "fastify";
import cors from "@fastify/cors";
import { ALLOWED_ORIGINS, API_PORT } from "./config.js";
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

await fastify.register(dbPlugin);
await fastify.register(authRoutes);
await fastify.register(profileRoutes);

fastify.get("/api/health", async () => ({ ok: true }));

try {
  await fastify.listen({ port: API_PORT, host: "0.0.0.0" });
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
