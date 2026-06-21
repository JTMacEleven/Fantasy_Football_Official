import {
  createUser,
  findUserById,
  findUserByLogin,
  normalizeEmail,
  normalizeLogin,
  signToken,
  toPublicUser,
  updateLastLogin,
  userIsActive,
  usernameFromEmail,
  validatePassword,
  verifyPassword,
  getUserIdFromRequest,
} from "../services/authService.js";

/**
 * @param {import('fastify').FastifyInstance} fastify
 */
export default async function authRoutes(fastify) {
  fastify.post("/api/auth/login", async (request, reply) => {
    const login = normalizeLogin(request.body?.email ?? request.body?.username);
    const password = String(request.body?.password ?? "");
    const rememberMe = Boolean(request.body?.rememberMe);

    if (!login || !password) {
      return reply.code(400).send({ error: "Email and password are required." });
    }

    const user = await findUserByLogin(fastify.db, login);
    if (!user || !userIsActive(user)) {
      return reply.code(401).send({ error: "Invalid email or password." });
    }

    if (!verifyPassword(password, user.password_hash)) {
      return reply.code(401).send({ error: "Invalid email or password." });
    }

    await updateLastLogin(fastify.db, user.id);
    const refreshed = await findUserById(fastify.db, user.id);
    const token = signToken(user, rememberMe);
    return {
      token,
      user: toPublicUser(refreshed ?? user),
    };
  });

  fastify.post("/api/auth/signup", async (request, reply) => {
    const email = normalizeEmail(request.body?.email);
    const password = String(request.body?.password ?? "");
    const confirmPassword = String(request.body?.confirmPassword ?? "");
    const displayName = normalizeLogin(request.body?.displayName) || undefined;

    if (!email || !password || !confirmPassword) {
      return reply.code(400).send({ error: "Email, password, and confirm password are required." });
    }

    if (password !== confirmPassword) {
      return reply.code(400).send({ error: "Passwords do not match." });
    }

    const passwordCheck = validatePassword(password);
    if (!passwordCheck.ok) {
      return reply.code(400).send({ error: passwordCheck.message });
    }

    let username = usernameFromEmail(email);
    let suffix = 0;
    while (true) {
      const candidate = suffix === 0 ? username : `${username}${suffix}`;
      const existing = await findUserByLogin(fastify.db, candidate);
      if (!existing) {
        username = candidate;
        break;
      }
      suffix += 1;
      if (suffix > 99) {
        return reply.code(409).send({ error: "Could not create a unique username." });
      }
    }

    try {
      const user = await createUser(fastify.db, {
        email,
        username,
        password,
        displayName,
      });
      const token = signToken(user, true);
      return reply.code(201).send({
        token,
        user: toPublicUser(user),
      });
    } catch (err) {
      if (err && typeof err === "object" && "number" in err && err.number === 2627) {
        return reply.code(409).send({ error: "An account with this email already exists." });
      }
      throw err;
    }
  });

  fastify.get("/api/auth/me", async (request, reply) => {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return reply.code(401).send({ error: "Unauthorized" });
    }

    const user = await findUserById(fastify.db, userId);
    if (!user || !userIsActive(user)) {
      return reply.code(401).send({ error: "Unauthorized" });
    }

    return { user: toPublicUser(user) };
  });
}
